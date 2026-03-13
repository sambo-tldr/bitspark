import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Users, Rocket, Cpu, Palette, Users as UsersIcon, Gamepad2, Microscope, Sparkles, Shield, RefreshCw, Eye, Bitcoin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { CampaignCard } from "@/components/CampaignCard";
import { FeaturedCampaignCard } from "@/components/FeaturedCampaignCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParticleBackground } from "@/components/ParticleBackground";
import { campaigns as mockCampaigns, categories, activityFeed } from "@/data/mockData";
import { useCampaigns, usePlatformStats, satsToBtc } from "@/hooks/useContracts";
import { useRM } from "@/lib/motion";

const categoryIcons: Record<string, React.ElementType> = {
  Cpu, Palette, Users: UsersIcon, Gamepad2, Microscope, Sparkles,
};

export default function Index() {
  const rm = useRM();
  const { data: onChainCampaigns } = useCampaigns();
  const { data: onChainStats } = usePlatformStats();

  // Use on-chain campaigns if available, fall back to mock
  const campaigns = onChainCampaigns && onChainCampaigns.length > 0 ? onChainCampaigns : mockCampaigns;
  const featuredCampaigns = campaigns.filter((c) => c.featured || c.raised > 0).slice(0, 1);
  const trendingCampaigns = campaigns.filter((c) => c.status === "active").slice(0, 6);

  const platformStats = onChainStats ? {
    totalRaised: satsToBtc(onChainStats.totalRaised),
    projectsFunded: onChainStats.successfulCampaigns,
    activeBackers: 0,
    activeCampaigns: onChainStats.totalCampaigns,
  } : { totalRaised: 0, projectsFunded: 0, activeBackers: 0, activeCampaigns: 0 };
  const heroWords = ["Spark", "Your", "Ideas", "with", "Bitcoin"];

  const staggerChildren = {
    hidden: {},
    visible: { transition: { staggerChildren: rm(0, 0.12) } },
  };

  const fadeUp = {
    hidden: rm({ opacity: 1, y: 0 }, { opacity: 0, y: 30 }),
    visible: { opacity: 1, y: 0, transition: { duration: rm(0, 0.6), ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  const wordReveal = {
    hidden: {},
    visible: { transition: { staggerChildren: rm(0, 0.08) } },
  };

  const wordFade = {
    hidden: rm({ opacity: 1, y: 0, filter: "blur(0px)" }, { opacity: 0, y: 20, filter: "blur(4px)" }),
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: rm(0, 0.5), ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <Layout>
      {/* ====== HERO ====== */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <ParticleBackground count={25} />
        {/* Radial gradient focus */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(25 95% 53% / 0.08) 0%, transparent 70%)' }} />
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[150px] pointer-events-none" />

        {/* Floating Bitcoin icon */}
        <motion.div
          className="absolute top-1/3 right-[10%] hidden lg:block opacity-[0.07]"
          animate={rm({}, { y: [0, -20, 0], rotate: [0, 10, 0] })}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Bitcoin className="w-28 h-28 text-primary" />
        </motion.div>

        <div className="container relative z-10 py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-caption text-primary mb-4 shadow-[0_0_20px_hsl(25_95%_53%/0.1)]">
                <Zap className="w-3.5 h-3.5" /> Powered by Bitcoin & Stacks
              </span>
            </motion.div>

            <motion.h1
              variants={wordReveal}
              className="text-display-xl leading-[1.05] flex flex-wrap justify-center gap-x-4"
            >
              {heroWords.map((word, i) => (
                <motion.span key={i} variants={wordFade} className="inline-block gradient-text">
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-body-lg text-muted-foreground max-w-xl mx-auto">
              The decentralized crowdfunding platform where bold ideas meet Bitcoin-native funding. Transparent, trustless, and built for the future.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8 gradient-primary text-primary-foreground border-0 glow-orange btn-press shimmer-sweep">
                <Link to="/explore">
                  Explore Projects <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-border/60 hover:border-primary/50 btn-press">
                <Link to="/create">Create Campaign</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={rm(false, { opacity: 0, y: 40 })}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rm(0, 0.8), duration: rm(0, 0.7), ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 glass-card rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto relative overflow-hidden"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px gradient-primary" />
            {[
              { label: "Total Raised", value: platformStats.totalRaised, suffix: " BTC", decimals: 1, icon: TrendingUp },
              { label: "Projects Funded", value: platformStats.projectsFunded, suffix: "+", decimals: 0, icon: Rocket },
              { label: "Active Backers", value: platformStats.activeBackers, suffix: "", decimals: 0, icon: Users },
              { label: "Active Campaigns", value: platformStats.activeCampaigns, suffix: "", decimals: 0, icon: Zap },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mx-auto mb-2 transition-colors">
                  <stat.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-heading-2 font-mono-display gradient-text text-glow">
                  <AnimatedCounter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} duration={2} />
                </p>
                <p className="text-caption text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== FEATURED CAMPAIGN ====== */}
      <section className="py-14 section-alt">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-overline text-primary mb-2">Trending Now</p>
              <h2 className="text-display">Featured Campaign</h2>
            </div>
          </div>
          {featuredCampaigns[0] && <FeaturedCampaignCard campaign={featuredCampaigns[0]} />}
        </div>
      </section>

      {/* ====== TRENDING CAMPAIGNS ====== */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-overline text-primary mb-2">Discover</p>
              <h2 className="text-display">Trending Campaigns</h2>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 gap-1 btn-press">
              <Link to="/explore">View All <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCampaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={rm(false, { opacity: 0, y: 30 })}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: rm(0, i * 0.1), duration: rm(0, 0.5), ease: [0.22, 1, 0.36, 1] }}
              >
                <CampaignCard campaign={campaign} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-14 section-alt">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-overline text-primary mb-2">Simple & Transparent</p>
            <h2 className="text-display">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Connect Wallet", desc: "Link your Stacks wallet (Leather or Xverse) to get started in seconds.", icon: Zap },
              { step: "02", title: "Back Projects", desc: "Discover campaigns you believe in and contribute Bitcoin directly.", icon: Rocket },
              { step: "03", title: "Change the World", desc: "Watch your contributions fuel innovation. Funds release on-chain.", icon: TrendingUp },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={rm(false, { opacity: 0, y: 30 })}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: rm(0, i * 0.15), duration: rm(0, 0.5) }}
                className="text-center glass-card rounded-xl p-6 relative group card-hover"
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full gradient-primary text-primary-foreground text-caption font-bold shadow-lg">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-heading-3 mb-2">{item.title}</h3>
                <p className="text-body-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CATEGORIES ====== */}
      <section className="py-14">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-overline text-primary mb-2">Browse</p>
            <h2 className="text-display">Explore Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.icon] || Sparkles;
              return (
                <motion.div
                  key={cat.id}
                  initial={rm(false, { opacity: 0, scale: 0.95 })}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: rm(0, i * 0.08) }}
                >
                  <Link
                    to={`/explore?category=${cat.id}`}
                    className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 card-hover block text-center group"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <h3 className="text-heading-3">{cat.name}</h3>
                    <p className="text-caption text-muted-foreground">{cat.count} projects</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== LIVE ACTIVITY ====== */}
      <section className="py-10 overflow-hidden section-alt" style={{ borderTop: '1px solid hsl(0 0% 18% / 0.5)', borderBottom: '1px solid hsl(0 0% 18% / 0.5)' }}>
        <div className="flex animate-ticker gap-8 whitespace-nowrap">
          {[...activityFeed, ...activityFeed].map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-2 text-body-sm text-muted-foreground shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-foreground">{item.user}</span>
              {item.type === "contribution" && (
                <span>contributed <span className="text-primary font-semibold">{item.amount} BTC</span> to</span>
              )}
              {item.type === "campaign_created" && <span>created</span>}
              {item.type === "milestone" && <span>hit a milestone in</span>}
              <span className="text-foreground font-medium">{item.campaign}</span>
              <span>• {item.timestamp}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl gradient-primary p-8 md:p-12 text-center relative overflow-hidden">
            <ParticleBackground count={15} className="opacity-30" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAyMGgyME0yMCAwdjIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
              <h2 className="text-display text-primary-foreground">Ready to Launch Your Project?</h2>
              <p className="text-body-lg text-primary-foreground/80">
                Join thousands of creators using Bitcoin-native crowdfunding. No middlemen, no hidden fees — just you and your backers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="rounded-full px-8 bg-background text-foreground hover:bg-background/90 btn-press shadow-xl">
                  <Link to="/create">Start Your Campaign</Link>
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-2">
                {[
                  { icon: Shield, label: "On-Chain Security" },
                  { icon: RefreshCw, label: "Automatic Refunds" },
                  { icon: Eye, label: "Full Transparency" },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-primary-foreground/70 text-body-sm">
                    <badge.icon className="w-4 h-4" />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
