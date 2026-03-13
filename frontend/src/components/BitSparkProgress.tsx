import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface BitSparkProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  showMilestones?: boolean;
}

export function BitSparkProgress({ value, className, showLabel, size = "sm", showMilestones }: BitSparkProgressProps) {
  const [animated, setAnimated] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(value);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  const height = size === "sm" ? "h-2.5" : size === "md" ? "h-3.5" : "h-5";

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full bg-secondary/80 overflow-hidden relative", height)}>
        <div
          className="h-full rounded-full gradient-primary transition-all duration-1000 ease-out relative"
          style={{
            width: `${animated}%`,
            boxShadow: animated > 0 ? '0 0 12px hsl(25 95% 53% / 0.3), 0 0 4px hsl(25 95% 53% / 0.2)' : 'none',
          }}
        >
          {/* Glowing tip */}
          {animated > 0 && animated < 100 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary animate-pulse" 
              style={{ boxShadow: '0 0 10px hsl(25 95% 53% / 0.7), 0 0 20px hsl(25 95% 53% / 0.4)' }} 
            />
          )}
        </div>
        {/* Milestone markers */}
        {showMilestones && (
          <>
            {[25, 50, 75].map((m) => (
              <div
                key={m}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors",
                  animated >= m ? "bg-primary-foreground/80" : "bg-muted-foreground/40"
                )}
                style={{ left: `${m}%` }}
              />
            ))}
          </>
        )}
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1.5 text-caption text-muted-foreground">
          <span>{Math.round(animated)}% funded</span>
        </div>
      )}
    </div>
  );
}
