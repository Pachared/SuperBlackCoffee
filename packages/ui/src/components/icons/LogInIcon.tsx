import type { HTMLAttributes, MouseEvent } from 'react';
import { motion, useAnimation } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface LogInIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export const LogInIcon = forwardRef<
  LogInIconHandle,
  HTMLAttributes<HTMLDivElement> & { size?: number }
>(({ onMouseEnter, onMouseLeave, size = 20, ...props }, ref) => {
  const controls = useAnimation();
  const controlled = useRef(false);
  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      controlled.current = true;
      controls.start('animate');
    },
    stopAnimation: () => controls.start('normal'),
  }));
  const enter = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      controlled.current ? onMouseEnter?.(event) : controls.start('animate');
    },
    [controls, onMouseEnter],
  );
  const leave = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      controlled.current ? onMouseLeave?.(event) : controls.start('normal');
    },
    [controls, onMouseLeave],
  );
  const variants = {
    animate: { x: -2, translateX: [0, 3, 0], transition: { duration: 0.4 } },
  };
  return (
    <div {...props} onMouseEnter={enter} onMouseLeave={leave}>
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
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <motion.polyline
          animate={controls}
          points="10 17 15 12 10 7"
          variants={variants}
        />
        <motion.line
          animate={controls}
          variants={variants}
          x1="3"
          x2="15"
          y1="12"
          y2="12"
        />
      </svg>
    </div>
  );
});
LogInIcon.displayName = 'LogInIcon';
