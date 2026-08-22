import type { HTMLAttributes, MouseEvent } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface MapPinPlusInsideIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type MapPinPlusInsideIconProps = HTMLAttributes<HTMLDivElement> & { size?: number };

// Source: https://lucide-animated.com/icons/map-pin-plus-inside
const pinVariants: Variants = {
  normal: { y: 0 },
  animate: { y: [0, -5, -3], transition: { duration: 0.5, times: [0, 0.6, 1] } },
};

const verticalBarVariants: Variants = {
  normal: { opacity: 1, pathLength: 1 },
  animate: { opacity: [0, 1], pathLength: [0, 1], transition: { delay: 0.3, duration: 0.2, opacity: { duration: 0.1, delay: 0.3 } } },
};

const horizontalBarVariants: Variants = {
  normal: { opacity: 1, pathLength: 1 },
  animate: { opacity: [0, 1], pathLength: [0, 1], transition: { delay: 0.6, duration: 0.2, opacity: { duration: 0.1, delay: 0.6 } } },
};

export const MapPinPlusInsideIcon = forwardRef<
  MapPinPlusInsideIconHandle,
  MapPinPlusInsideIconProps
>(({ onMouseEnter, onMouseLeave, size = 18, ...props }, ref) => {
  const controls = useAnimation();
  const controlled = useRef(false);

  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      controlled.current = true;
      void controls.start('animate');
    },
    stopAnimation: () => void controls.start('normal'),
  }));

  const handleMouseEnter = useCallback((event: MouseEvent<HTMLDivElement>) => {
    controlled.current ? onMouseEnter?.(event) : void controls.start('animate');
  }, [controls, onMouseEnter]);
  const handleMouseLeave = useCallback((event: MouseEvent<HTMLDivElement>) => {
    controlled.current ? onMouseLeave?.(event) : void controls.start('normal');
  }, [controls, onMouseLeave]);

  return (
    <div {...props} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <motion.svg animate={controls} fill="none" height={size} initial={false} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" variants={pinVariants} viewBox="0 0 24 24" width={size} aria-hidden="true">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <motion.path animate={controls} d="M12 7v6" initial={false} variants={horizontalBarVariants} />
        <motion.path animate={controls} d="M9 10h6" initial={false} variants={verticalBarVariants} />
      </motion.svg>
    </div>
  );
});

MapPinPlusInsideIcon.displayName = 'MapPinPlusInsideIcon';
