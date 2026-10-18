import { useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';
import './petals.css';

export default function FlowerPetals() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const reduced = useReducedMotion();
  const petals = useMemo(() => {
    const colors = [theme.palette.primary.main, theme.palette.secondary.dark, '#a55268', '#b76e56', '#c77584'];
    return Array.from({ length: 16 }, (_, id) => ({
      id, left: Math.random() * 100, size: 6 + Math.random() * 6,
      duration: 17 + Math.random() * 12, delay: Math.random() * 13,
      sway: 18 + Math.random() * 38, rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [theme]);

  if (reduced) return null;
  return (
    <div className="flower-petals" aria-hidden="true">
      {petals.slice(0, mobile ? 9 : 16).map(petal => (
        <motion.span key={petal.id} className="flower-petal"
          style={{ left: `${petal.left}%`, width: petal.size, height: petal.size * 1.45, background: petal.color }}
          initial={{ opacity: 0, y: '-5vh' }}
          animate={{ y: ['-5vh', '108vh'], x: [0, petal.sway, -petal.sway / 2, petal.sway / 3, 0], rotate: [petal.rotation, petal.rotation + 360], opacity: [0, 0.38, 0.38, 0.24, 0] }}
          transition={{ duration: petal.duration, delay: petal.delay, repeat: Infinity, ease: 'linear' }} />
      ))}
    </div>
  );
}
