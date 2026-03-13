import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, BarChart3, Wallet, ArrowUpRight, RefreshCw, Eye, Sun, Moon, Sunrise } from "lucide-react";
import { motion } from "framer-motion";
import { useRM } from "@/lib/motion";
import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import { StatsCard } from "@/components/StatsCard";
import { AddressDisplay } from "@/components/AddressDisplay";
import { BitSparkProgress } from "@/components/BitSparkProgress";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ClaimFundsModal } from "@/components/modals/ClaimFundsModal";
import { RefundModal } from "@/components/modals/RefundModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/context/WalletContext";
import { campaigns } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  funded: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  claimed: "bg-accent/10 text-accent border-accent/20",
};

const statusBorders: Record<string, string> = {
  active: "status-active",
  funded: "status-funded",
  failed: "status-failed",
  claimed: "status-claimed",
};

const myCampaigns = campaigns.slice(0, 3);
const backedProjects = campaigns.slice(3, 6);

const activityTimeline = [
  { id: 1, action: "Received contribution", amount: "0.05 BTC", campaign: "Mesh Network", time: "2h ago" },
  { id: 2, action: "Campaign created", campaign: "Hardware Wallet", time: "1d ago" },
  { id: 3, action: "Backed project", amount: "0.1 BTC", campaign: "Bitcoin Education", time: "3d ago" },
  { id: 4, action: "Received contribution", amount: "0.25 BTC", campaign: "Mesh Network", time: "5d ago" },
  { id: 5, action: "Milestone reached", campaign: "Hardware Wallet", time: "1w ago" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sunrise };
  if (hour < 18) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

export default function Dashboard() {
  const rm = useRM();
  const { connected, setShowConnectModal } = useWallet();
  const [loading, setLoading] = useState(true);
  const [claimModal, setClaimModal] = useState<{ open: boolean; title: string; raised: number }>({ open: false, title: "", raised: 0 });
  const [refundModal, setRefundModal] = useState<{ open: boolean; title: string; amount: number }>({ open: false, title: "", amount: 0 });
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const greeting = getGreeting();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const requireWallet = (fn: () => void) => {
    if (!connected) { setShowWalletPrompt(true); return; }
    fn();
  };

  return (
    <Layout>
      <PageTransition>
        <section className="py-12">
          <div className="container relative">
            <div className="absolute -top-12 left-0 w-[500px] h-[250px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            {loading ? (
              <DashboardSkeleton />
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <div>
                    <p className="text-overline text-primary mb-1 flex items-center gap-1.5">
                      <greeting.icon className="w-3.5 h-3.5" /> Dashboard
                    </p>
                    <h1 className="text-display">{greeting.text}</h1>
                    <div className="flex items-center gap-3 mt-2">
                      {connected ? (
                        <>
                          <AddressDisplay address="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7" />
                          <span className="flex items-center gap-1.5 text-caption text-green-400">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            Connected
                          </span>
                        </>
                      ) : (
                        <Button onClick={() => setShowConnectModal(true)} variant="outline" size="sm" className="gap-2 btn-press">
                          <Wallet className="w-4 h-4" /> Connect Wallet
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="gap-2 gradient-primary text-primary-foreground btn-press">
                      <Link to="/create"><Plus className="w-4 h-4" /> New Campaign</Link>
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                  {[
                    { icon: BarChart3, label: "My Campaigns", value: "3" },
                    { icon: ArrowUpRight, label: "Total Raised", value: "5.07 BTC" },
                    { icon: Wallet, label: "Backed Projects", value: "7" },
                    { icon: ArrowUpRight, label: "Total Contributed", value: "1.35 BTC" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={rm(false, { opacity: 0, y: 20 })}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: rm(0, i * 0.1), duration: rm(0, 0.4), ease: "easeOut" }}
                    >
                      <StatsCard icon={stat.icon} label={stat.label} value={stat.value} />
                    </motion.div>
                  ))}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="campaigns">
                  <TabsList className="bg-secondary/50 mb-6">
                    <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
                    <TabsTrigger value="backed">Backed Projects</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="campaigns">
                    <div className="space-y-4">
                      {myCampaigns.map((c, i) => {
                        const progress = Math.min((c.raised / c.goal) * 100, 100);
                        return (
                          <motion.div key={c.id} initial={rm(false, { opacity: 0, y: 10 })} animate={{ opacity: 1, y: 0 }} transition={{ delay: rm(0, i * 0.05), duration: rm(0, 0.3) }} className={cn("glass rounded-xl p-5", statusBorders[c.status])}>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <img src={c.imageUrl} alt={c.title} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-heading-3 truncate">{c.title}</h3>
                                  <Badge variant="outline" className={cn("shrink-0 capitalize", statusColors[c.status])}>
                                    {c.status}
                                  </Badge>
                                </div>
                                <BitSparkProgress value={progress} />
                                <div className="flex items-center justify-between text-body-sm">
                                  <span className="font-mono-display text-primary">{c.raised.toFixed(2)} / {c.goal} BTC</span>
                                  <span className="text-muted-foreground">{c.backers} backers</span>
                                </div>
                              </div>
                              <div className="flex sm:flex-col gap-2 shrink-0">
                                <Button asChild variant="outline" size="sm" className="gap-1 btn-press">
                                  <Link to={`/campaign/${c.id}`}><Eye className="w-3 h-3" /> View</Link>
                                </Button>
                                {c.status === "funded" && (
                                  <Button
                                    size="sm"
                                    className="gap-1 gradient-primary text-primary-foreground btn-press"
                                    onClick={() => requireWallet(() => setClaimModal({ open: true, title: c.title, raised: c.raised }))}
                                  >
                                    <Wallet className="w-3 h-3" /> Withdraw
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="backed">
                    <div className="space-y-4">
                      {backedProjects.map((c, i) => (
                        <motion.div key={c.id} initial={rm(false, { opacity: 0, y: 10 })} animate={{ opacity: 1, y: 0 }} transition={{ delay: rm(0, i * 0.05), duration: rm(0, 0.3) }} className="glass rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center">
                          <img src={c.imageUrl} alt={c.title} className="w-full sm:w-24 h-20 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-heading-3 truncate">{c.title}</h3>
                            <p className="text-body-sm text-muted-foreground">Contributed <span className="text-primary font-mono-display">0.15 BTC</span></p>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm" className="btn-press">
                              <Link to={`/campaign/${c.id}`}>View</Link>
                            </Button>
                            {c.status === "failed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive btn-press"
                                onClick={() => requireWallet(() => setRefundModal({ open: true, title: c.title, amount: 0.15 }))}
                              >
                                <RefreshCw className="w-3 h-3" /> Refund
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activity">
                    <div className="space-y-1">
                      {activityTimeline.map((item, i) => (
                        <motion.div key={item.id} initial={rm(false, { opacity: 0, x: -10 })} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: rm(0, i * 0.08), duration: rm(0, 0.3) }} className="flex gap-4 py-4 border-b border-border/30 last:border-0">
                          <div className="flex flex-col items-center">
                            <motion.div
                              className="w-2.5 h-2.5 rounded-full bg-primary mt-2"
                              initial={rm(false, { scale: 0 })}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={rm({ duration: 0 }, { delay: i * 0.08, type: "spring" })}
                            />
                            {i < activityTimeline.length - 1 && (
                              <motion.div
                                className="w-px flex-1 bg-primary/20 mt-1"
                                initial={rm(false, { scaleY: 0 })}
                                whileInView={{ scaleY: 1 }}
                                viewport={{ once: true }}
                                transition={rm({ duration: 0 }, { delay: i * 0.08 + 0.2, duration: 0.3 })}
                                style={{ transformOrigin: "top" }}
                              />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-body-sm">
                              {item.action}
                              {item.amount && <span className="text-primary font-mono-display ml-1">{item.amount}</span>}
                              {" "}<span className="text-muted-foreground">in</span>{" "}
                              <span className="font-medium">{item.campaign}</span>
                            </p>
                            <p className="text-caption text-muted-foreground mt-1">{item.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </section>
      </PageTransition>

      {/* Modals */}
      <ClaimFundsModal open={claimModal.open} onOpenChange={(v) => setClaimModal((s) => ({ ...s, open: v }))} campaignTitle={claimModal.title} raised={claimModal.raised} />
      <RefundModal open={refundModal.open} onOpenChange={(v) => setRefundModal((s) => ({ ...s, open: v }))} campaignTitle={refundModal.title} amount={refundModal.amount} />

      {/* Wallet Prompt */}
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
              Connect your wallet to access this feature.
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
