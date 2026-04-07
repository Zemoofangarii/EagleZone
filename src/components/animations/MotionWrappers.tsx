import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// ── Fade + slide up (hero text, section headers) ──
interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  y?: number;
}

export function FadeUp({ children, delay = 0, duration = 0.6, className, y = 30 }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Fade in on scroll (viewport trigger) ──
interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

const directionMap = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 60, y: 0 },
  right: { x: -60, y: 0 },
};

export function FadeInView({
  children,
  delay = 0,
  duration = 0.7,
  className,
  direction = "up",
  distance,
}: FadeInViewProps) {
  const dir = directionMap[direction];
  const x = distance ? (dir.x > 0 ? distance : dir.x < 0 ? -distance : 0) : dir.x;
  const y = distance ? (dir.y > 0 ? distance : dir.y < 0 ? -distance : 0) : dir.y;

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger container + child (product grids, feature lists) ──
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

// ── Scale on hover (cards, buttons) ──
export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.3 } },
  whileTap: { scale: 0.97 },
};

// ── Magnetic hover effect (premium micro-interaction) ──
interface MagneticProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function Magnetic({ children, className, intensity = 0.3 }: MagneticProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// ── Count-up animation for numbers (cart badge, prices) ──
export const popIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ── Smooth image reveal ──
export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
  },
};

// ── Page transition wrapper ──
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
