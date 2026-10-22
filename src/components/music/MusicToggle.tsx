import IconButton from '@mui/material/IconButton';
import { motion, useReducedMotion } from 'framer-motion';
import { pressFeedback } from '../../utils/press';

const MotionIconButton = motion.create(IconButton);

export interface MusicToggleProps {
  playing: boolean;
  unavailable: boolean;
  onToggle: () => void;
}

export default function MusicToggle({ playing, unavailable, onToggle }: MusicToggleProps) {
  const reduced = useReducedMotion();
  const label = unavailable ? 'Music unavailable' : playing ? 'Mute wedding music' : 'Play wedding music';
  return (
    <MotionIconButton className="music-button" onClick={onToggle} disabled={unavailable}
      whileTap={unavailable ? undefined : pressFeedback(reduced, 0.96)}
      transition={{ type: 'tween', duration: reduced ? 0 : 0.14, ease: 'easeOut' }}
      aria-label={label} aria-pressed={playing} title={label}>
      <span aria-hidden="true" className={playing ? 'music-playing' : ''}>{playing ? '♫' : '♪'}</span>
      {!playing && <span aria-hidden="true" className="music-slash" />}
    </MotionIconButton>
  );
}
