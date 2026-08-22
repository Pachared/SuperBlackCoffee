import { useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

type CoffeeIconProps = {
  animate?: boolean;
  size?: number;
};

// Source: https://lucide-animated.com/icons/coffee
const steamVariants: Variants = {
  normal: { y: 0, opacity: 1 },
  animate: (index: number) => ({
    y: -3,
    opacity: [0, 1, 0],
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 1.5,
      ease: 'easeInOut',
      delay: 0.2 * index,
    },
  }),
};

export function CoffeeIcon({ animate = false, size = 22 }: CoffeeIconProps) {
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
      style={{ overflow: 'visible' }}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <motion.path
        initial={false}
        animate={controls}
        custom={0.2}
        d="M10 2v2"
        variants={steamVariants}
      />
      <motion.path
        initial={false}
        animate={controls}
        custom={0.4}
        d="M14 2v2"
        variants={steamVariants}
      />
      <motion.path
        initial={false}
        animate={controls}
        custom={0}
        d="M6 2v2"
        variants={steamVariants}
      />
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
    </svg>
  );
}
