import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { useRM } from "@/lib/motion";

interface FloatingCTAProps {
  label: string;
  onClick: () => void;
  triggerOffset?: number;
}

export function FloatingCTA({ label, onClick, triggerOffset = 600 }: FloatingCTAProps) {
  const rm = useRM();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > triggerOffset);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [triggerOffset]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={rm(false, { y: 100, opacity: 0 })}
          animate={{ y: 0, opacity: 1 }}
          exit={rm({ opacity: 0 }, { y: 100, opacity: 0 })}
          transition={{ duration: rm(0, 0.3) }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <Button
            onClick={onClick}
            className="rounded-full px-6 py-3 text-body gradient-primary text-primary-foreground glow-orange shadow-2xl gap-2"
          >
            <Zap className="w-4 h-4" />
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
