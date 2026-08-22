import { useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

type ReceiptIconProps = { animate?: boolean; size?: number };

// Source: https://lucide-animated.com/icons/receipt
const amountVariants: Variants = {
  normal: { opacity: 1, pathLength: 1, transition: { duration: 0.4, opacity: { duration: 0.1 } } },
  animate: { opacity: [0, 1], pathLength: [0, 1], transition: { duration: 0.6, opacity: { duration: 0.1 } } },
};
const stemVariants: Variants = {
  normal: { opacity: 1, pathLength: 1, pathOffset: 0, transition: { delay: 0.3, duration: 0.3, opacity: { duration: 0.1, delay: 0.3 } } },
  animate: { opacity: [0, 1], pathLength: [0, 1], pathOffset: [1, 0], transition: { delay: 0.5, duration: 0.4, opacity: { duration: 0.1, delay: 0.5 } } },
};

export function ReceiptIcon({ animate = false, size = 22 }: ReceiptIconProps) {
  const controls = useAnimation();
  useEffect(() => { void controls.start(animate ? 'animate' : 'normal'); }, [animate, controls]);
  return (
    <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} aria-hidden="true">
      <motion.path initial={false} animate={controls} variants={stemVariants} d="M12 17V7" />
      <motion.path initial={false} animate={controls} variants={amountVariants} d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
      <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
    </svg>
  );
}
