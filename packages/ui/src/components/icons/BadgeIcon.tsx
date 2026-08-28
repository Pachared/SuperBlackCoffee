import { useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

type BadgeIconProps = { animate?: boolean; size?: number };

// Lucide Animated does not publish a generic badge icon. This is its official
// Badge Percent icon, selected for the rewards menu: @lucide-animated/badge-percent.
const badgeVariants: Variants = {
  normal: {
    rotate: 0,
    transition: { type: 'spring', stiffness: 60, damping: 10, duration: 0.5 },
  },
  animate: {
    rotate: 180,
    transition: { delay: 0.1, type: 'spring', stiffness: 80, damping: 13 },
  },
};

export function BadgeIcon({ animate = false, size = 22 }: BadgeIconProps) {
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
        variants={badgeVariants}
        style={{ transformOrigin: '12px 12px' }}
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      />
      <path d="m15 9-6 6" />
      <path d="M9 9h.01" />
      <path d="M15 15h.01" />
    </svg>
  );
}
