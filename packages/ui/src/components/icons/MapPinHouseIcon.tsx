import { useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

type MapPinHouseIconProps = { animate?: boolean; size?: number };

// Source: https://lucide-animated.com/icons/map-pin-house
const pinVariants: Variants = {
  normal: { y: 0 },
  animate: {
    y: [0, -5, -3],
    transition: { duration: 0.5, times: [0, 0.6, 1] },
  },
};

const houseVariants: Variants = {
  normal: { opacity: 1, pathLength: 1 },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      delay: 0.3,
      duration: 0.3,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
};

export function MapPinHouseIcon({
  animate = false,
  size = 22,
}: MapPinHouseIconProps) {
  const controls = useAnimation();

  useEffect(() => {
    void controls.start(animate ? 'animate' : 'normal');
  }, [animate, controls]);

  return (
    <motion.svg
      animate={controls}
      fill="none"
      height={size}
      initial={false}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      variants={pinVariants}
      viewBox="0 0 24 24"
      width={size}
      aria-hidden="true"
    >
      <path d="M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2" />
      <circle cx="10" cy="10" r="3" />
      <motion.path
        animate={controls}
        d="M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z M18 22v-3"
        initial={false}
        variants={houseVariants}
      />
    </motion.svg>
  );
}
