import { domMax, LazyMotion, MotionConfig } from 'framer-motion';

// ----------------------------------------------------------------------

export type MotionLazyProps = {
  children: React.ReactNode;
};

// EOCR: MotionConfig reducedMotion="user" (AGENTS.md): framer-motion skips transform and layout
// animation when the user prefers reduced motion.
export function MotionLazy({ children }: MotionLazyProps) {
  return (
    <LazyMotion strict features={domMax}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
