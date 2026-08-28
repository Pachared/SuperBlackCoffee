import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';

export interface XIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export const XIcon = forwardRef<
  XIconHandle,
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
    normal: { opacity: 1, pathLength: 1 },
    animate: { opacity: [0, 1], pathLength: [0, 1] },
  };
  return (
    <div
      {...props}
      onMouseEnter={enter}
      onMouseLeave={leave}
      style={{
        display: 'flex',
        alignItems: 'center',
        lineHeight: 0,
        ...props.style,
      }}
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
      >
        <motion.path animate={controls} d="M18 6 6 18" variants={variants} />
        <motion.path
          animate={controls}
          d="m6 6 12 12"
          transition={{ delay: 0.2 }}
          variants={variants}
        />
      </svg>
    </div>
  );
});

XIcon.displayName = 'XIcon';
