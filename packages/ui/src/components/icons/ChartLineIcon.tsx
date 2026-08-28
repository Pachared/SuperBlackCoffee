import type { HTMLAttributes } from 'react';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

export interface ChartLineIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type ChartLineIconProps = HTMLAttributes<HTMLDivElement> & {
  animate?: boolean;
  size?: number;
};

// Source: https://lucide-animated.com/r/chart-line.json
const variants: Variants = {
  normal: { opacity: 1, pathLength: 1 },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { delay: 0.15, duration: 0.3, opacity: { delay: 0.1 } },
  },
};

export const ChartLineIcon = forwardRef<
  ChartLineIconHandle,
  ChartLineIconProps
>(({ animate = false, size = 22, style, ...props }, ref) => {
  const controls = useAnimation();
  useEffect(() => {
    void controls.start(animate ? 'animate' : 'normal');
  }, [animate, controls]);
  useImperativeHandle(
    ref,
    () => ({
      startAnimation: () => {
        void controls.start('animate');
      },
      stopAnimation: () => {
        void controls.start('normal');
      },
    }),
    [controls],
  );
  return (
    <div
      {...props}
      style={{ display: 'flex', alignItems: 'center', lineHeight: 0, ...style }}
    >
      <svg
        fill="none"
        height={size}
        width={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <motion.path
          animate={controls}
          d="m7 13 3-3 4 4 5-5"
          variants={variants}
        />
      </svg>
    </div>
  );
});

ChartLineIcon.displayName = 'ChartLineIcon';
