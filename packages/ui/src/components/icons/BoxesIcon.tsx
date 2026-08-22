import { useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'motion/react';

type BoxesIconProps = { animate?: boolean; size?: number };

// Source: https://lucide-animated.com/icons/boxes
const lowerLeftVariants: Variants = { normal: { translateX: 0, translateY: 0 }, animate: { translateX: -1.5, translateY: 1.5 } };
const lowerRightVariants: Variants = { normal: { translateX: 0, translateY: 0 }, animate: { translateX: 1.5, translateY: 1.5 } };
const topVariants: Variants = { normal: { translateX: 0, translateY: 0 }, animate: { translateX: 0, translateY: -1.5 } };

export function BoxesIcon({ animate = false, size = 22 }: BoxesIconProps) {
  const controls = useAnimation();
  useEffect(() => { void controls.start(animate ? 'animate' : 'normal'); }, [animate, controls]);
  return (
    <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ overflow: 'visible' }} viewBox="0 0 24 24" width={size} aria-hidden="true">
      <motion.path animate={controls} d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z m4.03 3.58 -4.74 -2.85 m4.74 2.85 5-3 m-5 3v5.17" initial={false} variants={lowerLeftVariants} />
      <motion.path animate={controls} d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z m5 3-5-3 m5 3 4.74-2.85 M17 16.5v5.17" initial={false} variants={lowerRightVariants} />
      <motion.path animate={controls} d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z M12 8 7.26 5.15 m4.74 2.85 4.74-2.85 M12 13.5V8" initial={false} variants={topVariants} />
    </svg>
  );
}
