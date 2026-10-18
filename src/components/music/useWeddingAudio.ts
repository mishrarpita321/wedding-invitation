import { useCallback, useRef, useState } from 'react';

// This hook owns the single audio instance across both parts of the experience.
export function useWeddingAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const play = useCallback(() => {
    if (!audioRef.current || unavailable) return;
    audioRef.current.volume = 0.4;
    void audioRef.current.play().catch(() => setPlaying(false));
  }, [unavailable]);

  const toggle = () => {
    if (playing) audioRef.current?.pause();
    else play();
  };

  return {
    audioRef, play, toggle, playing, unavailable,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onError: () => { setUnavailable(true); setPlaying(false); },
  };
}
