import { motion } from "framer-motion";
import { Check } from "lucide-react";

const particles = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  return {
    x: Math.cos(angle) * (60 + Math.random() * 40),
    y: Math.sin(angle) * (60 + Math.random() * 40),
    size: 4 + Math.random() * 6,
    delay: Math.random() * 0.2,
    color: i % 2 === 0 ? "hsl(25 95% 53%)" : "hsl(43 96% 56%)",
  };
});

export function CelebrationEffect() {
  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Particle burst */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: "50%",
            top: "50%",
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
        />
      ))}

      {/* Checkmark circle */}
      <motion.div
        className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center glow-orange-strong"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Check className="w-12 h-12 text-primary-foreground" strokeWidth={3} />
        </motion.div>
      </motion.div>
    </div>
  );
}
