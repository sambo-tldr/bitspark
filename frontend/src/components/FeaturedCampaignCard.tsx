import { Link } from "react-router-dom";
import { Clock, Users, ArrowRight, Bitcoin } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Campaign } from "@/data/mockData";
import { BitSparkProgress } from "./BitSparkProgress";
import { AnimatedCounter } from "./AnimatedCounter";
import { Button } from "./ui/button";
import { useRM } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface FeaturedCampaignCardProps {
  campaign: Campaign;
}

type ImageStatus = "loading" | "loaded" | "error";

export function FeaturedCampaignCard({ campaign }: FeaturedCampaignCardProps) {
  const rm = useRM();
  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");

  return (
    <Link to={`/campaign/${campaign.id}`} className="group block">
      <motion.div
        initial={rm(false, { opacity: 0, y: 30 })}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: rm(0, 0.5) }}
        className="glass-card rounded-2xl overflow-hidden card-hover border-gradient glow-orange relative"
      >
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
          <div className="relative h-56 md:h-full overflow-hidden">
            {/* Shimmer */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 shimmer pointer-events-none transition-opacity duration-500",
                imageStatus === "loading" ? "opacity-100" : "opacity-0"
              )}
            />

            {/* Image */}
            {imageStatus !== "error" && (
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                onLoad={() => setImageStatus("loaded")}
                onError={() => setImageStatus("error")}
                className={cn(
                  "w-full h-full object-cover ken-burns transition-opacity duration-500",
                  imageStatus === "loaded" ? "opacity-100" : "opacity-0"
                )}
              />
            )}

            {/* Branded fallback */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 pointer-events-none transition-opacity duration-500",
                imageStatus === "error" ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted" />
              <div className="absolute inset-0 bg-grid-pattern opacity-40" />
              <div className="absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="absolute inset-x-12 bottom-6 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/10">
                  <Bitcoin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-body font-semibold text-foreground">Image unavailable</p>
                  <p className="text-body-sm text-muted-foreground">{campaign.category} campaign preview</p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/80 hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent md:hidden" />
            
            {/* Live indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-caption font-bold text-foreground tracking-wider">LIVE</span>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-center space-y-4 relative z-20">
            <div>
              <span className="text-overline text-primary mb-2 block">{campaign.category} • Featured</span>
              <h2 className="text-heading-1 group-hover:text-primary transition-colors leading-tight">
                {campaign.title}
              </h2>
            </div>
            <p className="text-body text-muted-foreground line-clamp-3">
              {campaign.shortDescription}
            </p>

            <BitSparkProgress value={progress} size="md" showLabel showMilestones />

            <div className="flex items-center gap-6 text-body-sm">
              <div>
                <span className="font-mono-display text-heading-3 text-primary text-glow">
                  <AnimatedCounter value={campaign.raised} decimals={2} />
                </span>
                <span className="text-muted-foreground ml-1">/ {campaign.goal} BTC</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <AnimatedCounter value={campaign.backers} />
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{campaign.daysLeft}d</span>
              </div>
            </div>

            <Button className="w-fit gap-2 gradient-primary text-primary-foreground border-0 btn-press glow-orange">
              View Campaign <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
