import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}

export function StatsCard({ icon: Icon, label, value, className }: StatsCardProps) {
  const numericMatch = value.match(/^([\d.]+)\s*(.*)$/);
  const numericValue = numericMatch ? parseFloat(numericMatch[1]) : null;
  const suffix = numericMatch ? ` ${numericMatch[2]}` : "";
  const decimals = numericMatch?.[1].includes(".") ? numericMatch[1].split(".")[1].length : 0;

  return (
    <div className={cn(
      "glass-card rounded-xl p-4 card-hover group relative overflow-hidden",
      className
    )}>
      {/* Top accent border */}
      <div className="absolute top-0 left-0 right-0 h-px gradient-primary" />
      
      {/* Subtle animated gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-overline text-muted-foreground mb-1">{label}</p>
          <p className="text-heading-2 font-mono-display gradient-text text-glow">
            {numericValue !== null ? (
              <AnimatedCounter value={numericValue} decimals={decimals} suffix={suffix.trimStart() ? suffix : ""} />
            ) : value}
          </p>
        </div>
      </div>
    </div>
  );
}
