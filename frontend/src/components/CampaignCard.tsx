import { Link } from "react-router-dom";
import { Clock, Users, ArrowUpRight, Bitcoin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Campaign } from "@/data/mockData";
import { BitSparkProgress } from "./BitSparkProgress";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  campaign: Campaign;
}

type ImageStatus = "loading" | "loaded" | "error";

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const imgRef = useRef<HTMLImageElement>(null);
  const [hovered, setHovered] = useState(false);
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");

  useEffect(() => {
    setImageStatus("loading");
    if (imgRef.current) {
      imgRef.current.style.transform = "scale(1) translate(0, 0)";
    }
  }, [campaign.imageUrl]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (imageStatus === "error" || !imgRef.current) return;
    const rect = imgRef.current.parentElement!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * -10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    imgRef.current.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (imgRef.current) imgRef.current.style.transform = "scale(1) translate(0, 0)";
    setHovered(false);
  };

  return (
    <Link to={`/campaign/${campaign.id}`} className="group block">
      <div
        className={cn(
          "glass-card rounded-xl overflow-hidden card-hover relative transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-1",
          hovered && "border-primary/30"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative h-40 overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 shimmer pointer-events-none transition-opacity duration-500",
              imageStatus === "loading" ? "opacity-100" : "opacity-0"
            )}
          />

          {imageStatus !== "error" && (
            <img
              ref={imgRef}
              src={campaign.imageUrl}
              alt={campaign.title}
              onLoad={() => setImageStatus("loaded")}
              onError={() => setImageStatus("error")}
              className={cn(
                "w-full h-full object-cover transition-[transform,opacity] duration-300",
                imageStatus === "loaded" ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 pointer-events-none transition-opacity duration-500",
              imageStatus === "error" ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted" />
            <div className="absolute inset-0 bg-grid-pattern opacity-40" />
            <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="absolute inset-x-10 bottom-5 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/10">
                <Bitcoin className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-body-sm font-semibold text-foreground">Image unavailable</p>
                <p className="text-caption text-muted-foreground">{campaign.category} campaign preview</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          
          {/* View overlay */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0"
          )}>
            <span className="flex items-center gap-1.5 text-body-sm font-medium text-primary-foreground bg-primary/90 px-4 py-2 rounded-full shadow-lg">
              View Project <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <span className="absolute top-3 left-3 px-3 py-1 text-caption rounded-full bg-primary/90 text-primary-foreground font-semibold shadow-md">
            {campaign.category}
          </span>
          {campaign.status === "funded" && (
            <span className="absolute top-3 right-3 px-3 py-1 text-caption rounded-full bg-green-500/90 text-primary-foreground shadow-md">
              ✓ Funded
            </span>
          )}
          {campaign.status === "active" && campaign.daysLeft <= 3 && campaign.daysLeft > 0 && (
            <span className="absolute top-3 right-3 px-3 py-1 text-caption rounded-full bg-amber-500/90 text-primary-foreground shadow-md">
              ⏰ Ending Soon
            </span>
          )}
          {(campaign.status === "failed" || (campaign.status !== "funded" && campaign.daysLeft === 0)) && (
            <span className="absolute top-3 right-3 px-3 py-1 text-caption rounded-full bg-muted-foreground/60 text-primary-foreground shadow-md">
              Ended
            </span>
          )}
        </div>

        <div className="p-4 space-y-2.5">
          <h3 className="text-heading-3 line-clamp-2 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full shrink-0 ring-1 ring-border/50"
              style={{ background: `hsl(${campaign.creatorAddress.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 70%, 50%)` }}
            />
            <span className="text-caption text-muted-foreground truncate">{campaign.creator}</span>
          </div>
          <p className="text-body-sm text-muted-foreground line-clamp-2">
            {campaign.shortDescription}
          </p>

          <BitSparkProgress value={progress} />

          <div className="flex items-center justify-between text-body-sm">
            <div>
              <span className="font-mono-display font-semibold text-primary">
                {campaign.raised.toFixed(2)} BTC
              </span>
              <span className="text-muted-foreground ml-1">
                / {campaign.goal} BTC
              </span>
            </div>
            <span className="text-muted-foreground font-mono-display">{Math.round(progress)}%</span>
          </div>

          <div className="flex items-center justify-between text-caption text-muted-foreground pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{campaign.backers} backers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : "Ended"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

