import type { HTMLAttributes } from 'react';
import { motion } from 'motion/react';

export function LoaderCircleIcon({
  size = 20,
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: number }) {
  return (
    <div {...props}>
      <svg
        fill="none"
        height={size}
        width={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <motion.path
          animate={{ rotate: 360 }}
          d="M21 12a9 9 0 1 1-6.219-8.56"
          style={{ transformOrigin: '12px 12px' }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 0.8,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}
