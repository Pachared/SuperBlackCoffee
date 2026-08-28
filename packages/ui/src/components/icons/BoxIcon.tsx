import { useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

type BoxIconProps = { animate?: boolean; size?: number };

// Source: https://lucide-animated.com/icons/box
const boxVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.3, opacity: { duration: 0.1 } },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { duration: 0.4, opacity: { duration: 0.1 } },
  },
};

export function BoxIcon({ animate = false, size = 22 }: BoxIconProps) {
  const controls = useAnimation();
  useEffect(() => {
    void controls.start(animate ? 'animate' : 'normal');
  }, [animate, controls]);
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
      aria-hidden="true"
    >
      <motion.path
        initial={false}
        animate={controls}
        variants={boxVariants}
        d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
      />
      <motion.path
        initial={false}
        animate={controls}
        variants={boxVariants}
        d="m3.3 7 8.7 5 8.7-5"
      />
      <motion.path
        initial={false}
        animate={controls}
        variants={boxVariants}
        d="M12 22V12"
      />
    </svg>
  );
}
