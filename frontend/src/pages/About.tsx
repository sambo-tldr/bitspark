import { Layout } from "@/components/Layout";
import { Zap, Shield, Globe, Code, Users, ArrowRight, TrendingUp, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParticleBackground } from "@/components/ParticleBackground";
import { platformStats } from "@/data/mockData";
import { useRM } from "@/lib/motion";

const values = [
  { icon: Shield, title: "Trustless & Transparent", desc: "Every transaction is recorded on the Bitcoin blockchain. No hidden fees, no intermediaries." },
  { icon: Globe, title: "Borderless Funding", desc: "Anyone, anywhere can create or back a campaign. Bitcoin knows no borders." },
  { icon: Code, title: "Open Source", desc: "Our smart contracts are fully open source and auditable by anyone." },
  { icon: Users, title: "Community Governed", desc: "Platform decisions are made by the community through on-chain governance." },
];

const protocolSteps = [
  { label: "Wallet", desc: "Connect & contribute" },
  { label: "Smart Contract", desc: "Funds held securely" },
  { label: "Creator", desc: "Released on milestone" },
];

export default function About() {
  const rm = useRM();

  return (
    <Layout>
      <section className="py-14">
        <div className="container max-w-5xl">
          <motion.div initial={rm(false, { opacity: 0, y: 20 })} animate={{ opacity: 1, y: 0 }} transition={{ duration: rm(0, 0.5) }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-caption text-primary mb-6">
              <Zap className="w-3.5 h-3.5" /> About BitSpark
            </span>
            <h1 className="text-display-xl gradient-text mb-6">Funding Innovation with Bitcoin</h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              BitSpark is the premier Bitcoin-native crowdfunding platform built on Stacks. We're creating a world where great ideas can find funding without gatekeepers.
            </p>
          </motion.div>

          {/* Stats counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {[
              { value: platformStats.totalRaised, suffix: "+", label: "BTC Raised", decimals: 1, icon: TrendingUp },
              { value: platformStats.projectsFunded, suffix: "+", label: "Projects Funded", decimals: 0, icon: Rocket },
              { value: platformStats.activeBackers, suffix: "", label: "Active Backers", decimals: 0, icon: Users },
              { value: platformStats.activeCampaigns, suffix: "", label: "Live Campaigns", decimals: 0, icon: Zap },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={rm(false, { opacity: 0, y: 20 })}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: rm(0, i * 0.1), duration: rm(0, 0.5) }}
                className="glass-card rounded-xl p-6 text-center group card-hover"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-3" />
                <p className="text-heading-1 font-mono-display gradient-text">
                  <AnimatedCounter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} duration={2} />
                </p>
                <p className="text-caption text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Values with tilt */}
          <div className="grid sm:grid-cols-2 gap-6 mb-14">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={rm(false, { opacity: 0, y: 20 })}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: rm(0, i * 0.1), duration: rm(0, 0.5) }}
              >
                <TiltCard tiltAmount={6} className="h-full">
                  <div className="glass-card rounded-xl p-6 card-hover h-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px gradient-primary" />
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <v.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-heading-3 mb-2">{v.title}</h3>
                    <p className="text-body-sm text-muted-foreground">{v.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {/* Protocol flow */}
          <motion.div
            initial={rm(false, { opacity: 0, y: 20 })}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: rm(0, 0.5) }}
            className="glass-card rounded-2xl p-8 md:p-10 mb-14 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px gradient-primary" />
            <h2 className="text-heading-1 text-center mb-8">How the Protocol Works</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
              {protocolSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-2">
                      <span className="text-heading-3 text-primary-foreground font-bold">{i + 1}</span>
                    </div>
                    <p className="text-heading-3">{step.label}</p>
                    <p className="text-caption text-muted-foreground">{step.desc}</p>
                  </div>
                  {i < protocolSteps.length - 1 && (
                    <div className="hidden md:block w-16 h-px bg-gradient-to-r from-primary to-accent mx-2" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Social proof + CTA */}
          <div className="glass-card rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
            <ParticleBackground count={10} className="opacity-20" />
            <div className="relative z-10">
              {/* Avatar stack */}
              <div className="flex justify-center mb-4">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-caption font-bold border-2 border-background"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-caption text-muted-foreground mb-6">Trusted by {platformStats.activeBackers.toLocaleString()}+ backers</p>
              
              <h2 className="text-heading-1 mb-4">Ready to Build the Future?</h2>
              <p className="text-body text-muted-foreground mb-6">Join thousands of creators and backers on the most transparent crowdfunding platform ever built.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="rounded-full px-8 gradient-primary text-primary-foreground btn-press">
                  <Link to="/explore">Explore Projects <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 btn-press">
                  <Link to="/create">Start a Campaign</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
