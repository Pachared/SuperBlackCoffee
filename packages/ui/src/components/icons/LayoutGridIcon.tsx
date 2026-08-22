import { useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

type LayoutGridIconProps = { animate?: boolean; size?: number };

// Adapted from the official Lucide Animated registry: @lucide-animated/layout-grid.
const rectOne: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateX: [0, 11, 11, 0],
    transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] },
  },
};
const rectTwo: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateY: [0, 11, 11, 0],
    transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] },
  },
};
const rectThree: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateX: [0, -11, -11, 0],
    transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] },
  },
};
const rectFour: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateY: [0, -11, -11, 0],
    transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] },
  },
};

export function LayoutGridIcon({
  animate = false,
  size = 22,
}: LayoutGridIconProps) {
  const controls = useAnimation();

  useEffect(() => {
    void controls.start(animate ? 'animate' : 'normal');
  }, [animate, controls]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      aria-hidden="true"
    >
      <motion.rect
        initial={false}
        animate={controls}
        variants={rectOne}
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <motion.rect
        initial={false}
        animate={controls}
        variants={rectTwo}
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <motion.rect
        initial={false}
        animate={controls}
        variants={rectThree}
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
      <motion.rect
        initial={false}
        animate={controls}
        variants={rectFour}
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
    </svg>
  );
}
