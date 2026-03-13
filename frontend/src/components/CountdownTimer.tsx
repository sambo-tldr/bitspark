import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CountdownTimerProps {
  daysLeft: number;
  className?: string;
}

function FlipDigit({ value, label, reduced }: { value: number; label: string; reduced: boolean }) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="glass rounded-lg px-3 py-2 min-w-[48px] text-center relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={reduced ? false : { y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 20, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            className="text-heading-2 font-mono-display text-foreground block"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-overline text-muted-foreground mt-1.5">{label}</span>
    </div>
  );
}

export function CountdownTimer({ daysLeft, className }: CountdownTimerProps) {
  const reduced = useReducedMotion();
  const [seconds, setSeconds] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s <= 0 ? 59 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const blocks = [
    { value: daysLeft, label: "Days" },
    { value: 14, label: "Hours" },
    { value: 32, label: "Min" },
    { value: seconds, label: "Sec" },
  ];

  return (
    <div className={cn("flex gap-2", className)}>
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center gap-2">
          <FlipDigit value={block.value} label={block.label} reduced={reduced} />
          {i < blocks.length - 1 && (
            <span className="text-heading-2 text-muted-foreground/50 mb-5 animate-pulse">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
