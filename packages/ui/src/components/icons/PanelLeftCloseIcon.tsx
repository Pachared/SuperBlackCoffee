import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';

export interface PanelLeftCloseIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
export const PanelLeftCloseIcon = forwardRef<
  PanelLeftCloseIconHandle,
  HTMLAttributes<HTMLDivElement> & { size?: number }
>(({ onMouseEnter, onMouseLeave, size = 24, ...props }, ref) => {
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
  const variants = { normal: { x: 0 }, animate: { x: [0, -1.5, 0] } };
  return (
    <div
      {...props}
      onMouseEnter={enter}
      onMouseLeave={leave}
      style={{ display: 'flex', lineHeight: 0, ...props.style }}
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
        <rect height="18" rx="2" width="18" x="3" y="3" />
        <path d="M9 3v18" />
        <motion.path
          animate={controls}
          d="m16 15-3-3 3-3"
          transition={{ times: [0, 0.4, 1], duration: 0.5 }}
          variants={variants}
        />
      </svg>
    </div>
  );
});
PanelLeftCloseIcon.displayName = 'PanelLeftCloseIcon';
