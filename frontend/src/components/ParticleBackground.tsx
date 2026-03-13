import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface ParticleBackgroundProps {
  count?: number;
  className?: string;
}

export function ParticleBackground({ count = 20, className = "" }: ParticleBackgroundProps) {
  const reduced = useReducedMotion();

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 8,
      duration: Math.random() * 8 + 10,
      opacity: Math.random() * 0.3 + 0.1,
    })),
    [count]
  );

  if (reduced) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? "hsl(var(--primary))"
              : "hsl(var(--accent))",
            opacity: p.opacity,
          }}
          animate={{
            y: [800, -100],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
