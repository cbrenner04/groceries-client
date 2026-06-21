import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type React from 'react';

interface IPageTransitionProps {
  children: React.ReactNode;
  direction?: TPageTransitionDirection;
}

export type TPageTransitionDirection = 'forward' | 'back' | 'fade';

const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getVariants = (direction: TPageTransitionDirection): Variants => {
  const baseVariants = {
    initial: { opacity: 0.01 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (direction === 'forward') {
    return {
      initial: { opacity: 0.01, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    };
  }

  if (direction === 'back') {
    return {
      initial: { opacity: 0.01, x: -50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 50 },
    };
  }

  return baseVariants;
};

export const PageTransition: React.FC<IPageTransitionProps> = (props): React.JSX.Element => {
  const { children, direction = 'fade' } = props;
  const variants = getVariants(direction);
  // Only animate in production. In dev, React StrictMode double-mounts can interrupt the enter
  // animation and leave the whole page stuck at its initial { opacity: 0, x: 50 } state — a blank
  // page until reload. Matches BottomSheet's PROD-only animation gate.
  // Only animate in production: in dev, React StrictMode double-mounts can interrupt the enter
  // animation and leave the whole page stuck at its initial { opacity: 0, x: 50 } (blank until
  // reload). Mirrors BottomSheet's PROD-only animation gate. (The PROD=true branch is untestable
  // under Vitest where import.meta.env.PROD is always false.)
  const shouldAnimate = !prefersReducedMotion() && import.meta.env.PROD;

  return (
    <motion.div
      initial={shouldAnimate ? 'initial' : undefined}
      animate={shouldAnimate ? 'animate' : undefined}
      exit={shouldAnimate ? 'exit' : undefined}
      variants={shouldAnimate ? variants : undefined}
      transition={
        shouldAnimate
          ? {
              duration: 0.3,
              ease: 'easeInOut',
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
};
