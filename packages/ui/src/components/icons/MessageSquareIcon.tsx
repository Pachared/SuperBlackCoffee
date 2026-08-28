import type { HTMLAttributes } from 'react';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

export interface MessageSquareIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
type MessageSquareIconProps = HTMLAttributes<HTMLDivElement> & {
  animate?: boolean;
  size?: number;
};

// Source: https://lucide-animated.com/r/message-square.json
const iconVariants: Variants = {
  normal: { scale: 1, rotate: 0 },
  animate: {
    scale: 1.05,
    rotate: [0, -7, 7, 0],
    transition: {
      rotate: { duration: 0.5, ease: 'easeInOut' },
      scale: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },
};

export const MessageSquareIcon = forwardRef<
  MessageSquareIconHandle,
  MessageSquareIconProps
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
      <motion.svg
        animate={controls}
        fill="none"
        height={size}
        width={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        variants={iconVariants}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </motion.svg>
    </div>
  );
});

MessageSquareIcon.displayName = 'MessageSquareIcon';
