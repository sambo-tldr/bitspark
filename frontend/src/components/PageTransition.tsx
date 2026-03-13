import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -8 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
}
