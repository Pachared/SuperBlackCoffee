import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';

export interface LogoutIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export const LogoutIcon = forwardRef<
  LogoutIconHandle,
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
      if (controlled.current) onMouseEnter?.(event);
      else controls.start('animate');
    },
    [controls, onMouseEnter],
  );
  const leave = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (controlled.current) onMouseLeave?.(event);
      else controls.start('normal');
    },
    [controls, onMouseLeave],
  );
  const variants = {
    animate: { x: 2, translateX: [0, -3, 0], transition: { duration: 0.4 } },
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
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <motion.polyline
          animate={controls}
          points="16 17 21 12 16 7"
          variants={variants}
        />
        <motion.line
          animate={controls}
          variants={variants}
          x1="21"
          x2="9"
          y1="12"
          y2="12"
        />
      </svg>
    </div>
  );
});

LogoutIcon.displayName = 'LogoutIcon';
