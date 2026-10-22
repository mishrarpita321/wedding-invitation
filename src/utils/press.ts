import type { TargetAndTransition } from 'framer-motion';

// Keep press feedback fast, including inside controls with delayed entrance animations.
export function pressFeedback(reduced: boolean | null, scale = 0.98): TargetAndTransition {
  return {
    scale: reduced ? 1 : scale,
    y: reduced ? 0 : 1,
    boxShadow: 'var(--press-shadow)',
    backgroundColor: 'var(--press-background)',
    '--press-icon-shift': reduced ? 0 : 1,
    transition: { type: 'tween', duration: reduced ? 0 : 0.12, delay: 0, repeat: 0, ease: 'easeOut' },
  };
}
