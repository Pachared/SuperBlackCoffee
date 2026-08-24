import type { HTMLAttributes } from 'react';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

export interface ReceiptTextIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type ReceiptTextIconProps = HTMLAttributes<HTMLDivElement> & { animate?: boolean; size?: number };

// Source: https://lucide-animated.com/r/receipt-text.json
const containerVariants: Variants = {
  visible: { transition: { staggerChildren: .1, delayChildren: 0 } },
  hidden: { transition: { staggerChildren: .06, staggerDirection: -1 } },
};
const lineVariants: Variants = {
  visible: { opacity: 1, pathLength: 1, transition: { duration: .35, ease: 'linear' } },
  hidden: { opacity: 1, pathLength: 0, transition: { duration: .2, ease: 'linear' } },
};

export const ReceiptTextIcon = forwardRef<ReceiptTextIconHandle, ReceiptTextIconProps>(({ animate = false, size = 22, style, ...props }, ref) => {
  const controls = useAnimation();
  const replay = () => controls.start('hidden').then(() => controls.start('visible'));
  useEffect(() => { if (animate) void replay(); else void controls.start('visible'); }, [animate, controls]);
  useImperativeHandle(ref, () => ({ startAnimation: () => { void replay(); }, stopAnimation: () => { void controls.start('visible'); } }), [controls]);
  return <div {...props} style={{ display: 'flex', alignItems: 'center', lineHeight: 0, ...style }}><motion.svg fill="none" height={size} width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" /><motion.g animate={controls} initial="visible" variants={containerVariants}><motion.path d="M8 8H14" variants={lineVariants} /><motion.path d="M8 12H16" variants={lineVariants} /><motion.path d="M8 16H13" variants={lineVariants} /></motion.g></motion.svg></div>;
});

ReceiptTextIcon.displayName = 'ReceiptTextIcon';
