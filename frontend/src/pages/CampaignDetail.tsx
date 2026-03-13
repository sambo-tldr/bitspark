import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, Shield, RefreshCw, Eye, Heart, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { useRM } from "@/lib/motion";
import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BitSparkProgress } from "@/components/BitSparkProgress";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AddressDisplay } from "@/components/AddressDisplay";
import { CampaignCard } from "@/components/CampaignCard";
import { FloatingCTA } from "@/components/FloatingCTA";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { CampaignDetailSkeleton } from "@/components/skeletons/CampaignDetailSkeleton";
import { ContributeModal } from "@/components/modals/ContributeModal";
import { useWallet } from "@/context/WalletContext";
import { campaigns, backersList } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { EmptyStateIllustration } from "@/components/EmptyStateIllustration";

// Generate avatar color from address hash
function addressToColor(address: string) {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 50%)`;
}

export default function CampaignDetail() {
  const rm = useRM();
  const { id } = useParams();
  const campaign = campaigns.find((c) => c.id === id);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showContribute, setShowContribute] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const { connected, setShowConnectModal } = useWallet();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (!campaign) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <EmptyStateIllustration variant="notFound" className="mb-4" />
          <h1 className="text-heading-1 mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">This campaign may have been removed or never existed.</p>
          <Button asChild><Link to="/explore">Browse Campaigns</Link></Button>
        </div>
      </Layout>
    );
  }

  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const similarCampaigns = campaigns.filter((c) => c.id !== campaign.id && c.category === campaign.category).slice(0, 3);
  const presetAmounts = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

  const handleBack = () => {
    if (!connected) {
      setShowWalletPrompt(true);
      return;
    }
    setShowContribute(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Campaign link copied to clipboard." });
  };

  return (
    <Layout>
      <PageTransition>
        <section className="py-8">
          <div className="container">
            <Link to="/explore" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-body-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Explore
            </Link>

            {loading ? (
              <CampaignDetailSkeleton />
            ) : (
              <>
                {/* Full-bleed hero image */}
                <motion.div
                  initial={rm(false, { opacity: 0, scale: 1.02 })}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: rm(0, 0.5) }}
                  className="relative rounded-2xl overflow-hidden mb-8"
                >
                  <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-[350px] md:h-[450px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <span className="text-overline text-primary mb-2 block">{campaign.category}</span>
                    <h1 className="text-display-lg text-foreground drop-shadow-lg">{campaign.title}</h1>
                    <p className="text-body-sm text-muted-foreground mt-1">by {campaign.creator}</p>
                  </div>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                  {/* Left Column */}
                  <div>
                    <Tabs defaultValue="about">
                      <TabsList className="bg-secondary/50 mb-6">
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="updates">Updates ({campaign.updates})</TabsTrigger>
                        <TabsTrigger value="backers">Backers ({campaign.backers})</TabsTrigger>
                        <TabsTrigger value="comments">Comments</TabsTrigger>
                      </TabsList>

                      <TabsContent value="about" className="space-y-6">
                        <div className="prose prose-invert max-w-none">
                          <h2 className="text-heading-2 mb-4">About This Project</h2>
                          {campaign.description.split("\n\n").map((p, i) => (
                            <p key={i} className="text-body text-muted-foreground leading-relaxed">{p}</p>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="updates">
                        <div className="glass rounded-xl p-8 text-center">
                          <p className="text-muted-foreground">No updates posted yet. Check back soon!</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="backers">
                        <div className="space-y-3">
                          {backersList.map((backer, i) => (
                            <motion.div key={i} initial={rm(false, { opacity: 0, y: 10 })} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: rm(0, i * 0.05), duration: rm(0, 0.3) }} className="glass rounded-xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-caption font-bold"
                                  style={{ backgroundColor: addressToColor(backer.address) }}
                                >
                                  {backer.address.slice(2, 4).toUpperCase()}
                                </div>
                                <AddressDisplay address={backer.address} />
                              </div>
                              <span className="font-mono-display text-primary font-semibold">{backer.amount} BTC</span>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="comments">
                        <div className="glass rounded-xl p-8 text-center">
                          <p className="text-muted-foreground">Comments coming soon!</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Right Column */}
                  <div className="lg:sticky lg:top-[96px] self-start space-y-6">
                    <div className="glass-strong rounded-2xl p-6 space-y-6 border-primary/10">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <span className="text-display font-mono-display gradient-text">
                              <AnimatedCounter value={campaign.raised} decimals={2} />
                            </span>
                            <span className="text-body text-muted-foreground ml-1">BTC</span>
                          </div>
                          <span className="text-body-sm text-muted-foreground">of {campaign.goal} BTC goal</span>
                        </div>
                        <BitSparkProgress value={progress} size="md" showMilestones />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="glass rounded-lg p-3">
                          <p className="text-heading-3 font-mono-display">{Math.round(progress)}%</p>
                          <p className="text-caption text-muted-foreground">Funded</p>
                        </div>
                        <div className="glass rounded-lg p-3">
                          <p className="text-heading-3 font-mono-display">
                            <AnimatedCounter value={campaign.backers} />
                          </p>
                          <p className="text-caption text-muted-foreground">Backers</p>
                        </div>
                        <div className="glass rounded-lg p-3">
                          <p className="text-heading-3 font-mono-display">{campaign.daysLeft}</p>
                          <p className="text-caption text-muted-foreground">Days Left</p>
                        </div>
                      </div>

                      {campaign.daysLeft > 0 && <CountdownTimer daysLeft={campaign.daysLeft} className="justify-center" />}

                      <div>
                        <p className="text-caption text-muted-foreground mb-3">Select contribution amount</p>
                        <div className="grid grid-cols-3 gap-2">
                          {presetAmounts.map((amount) => (
                            <button
                              key={amount}
                              onClick={() => setSelectedAmount(amount)}
                              className={`py-2 px-3 rounded-lg text-body-sm font-mono-display transition-all btn-press ${
                                selectedAmount === amount
                                  ? "gradient-primary text-primary-foreground glow-orange"
                                  : "bg-secondary text-foreground hover:bg-secondary/80"
                              }`}
                            >
                              {amount} BTC
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleBack} className="w-full py-4 text-body-lg gradient-primary text-primary-foreground rounded-xl glow-orange btn-press">
                        Back This Project
                      </Button>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 gap-2 btn-press"><Heart className="w-4 h-4" /> Save</Button>
                        <Button variant="outline" className="flex-1 gap-2 btn-press" onClick={handleShare}><Share2 className="w-4 h-4" /> Share</Button>
                        <Button
                          variant="outline"
                          className="gap-2 btn-press"
                          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${campaign.title}" on BitSpark!`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                        >
                          <Twitter className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-4 space-y-3">
                      {[
                        { icon: Shield, label: "On-Chain Security", desc: "Funds secured by smart contract" },
                        { icon: RefreshCw, label: "Automatic Refunds", desc: "Get refunded if goal isn't met" },
                        { icon: Eye, label: "Full Transparency", desc: "All transactions on-chain" },
                      ].map((badge) => (
                        <div key={badge.label} className="flex items-start gap-3">
                          <badge.icon className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-body-sm font-medium">{badge.label}</p>
                            <p className="text-caption text-muted-foreground">{badge.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {similarCampaigns.length > 0 && (
              <section className="mt-14">
                <h2 className="text-heading-1 mb-8">Similar Campaigns</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarCampaigns.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </PageTransition>

      {/* Floating CTA */}
      <FloatingCTA label="Back This Project" onClick={handleBack} />

      {/* Contribute Modal */}
      <ContributeModal open={showContribute} onOpenChange={setShowContribute} campaign={campaign} />

      {/* Wallet Not Connected Prompt */}
      <Dialog open={showWalletPrompt} onOpenChange={setShowWalletPrompt}>
        <DialogContent className="glass-strong border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-heading-2 text-center">Wallet Required</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <p className="text-body text-muted-foreground text-center">
              You need to connect a wallet before contributing to this campaign.
            </p>
            <Button
              onClick={() => { setShowWalletPrompt(false); setShowConnectModal(true); }}
              className="gradient-primary text-primary-foreground glow-orange gap-2 btn-press"
            >
              <Wallet className="w-4 h-4" /> Connect Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
