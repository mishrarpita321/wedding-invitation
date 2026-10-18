import IconButton from '@mui/material/IconButton';

export interface MusicToggleProps {
  playing: boolean;
  unavailable: boolean;
  onToggle: () => void;
}

export default function MusicToggle({ playing, unavailable, onToggle }: MusicToggleProps) {
  const label = unavailable ? 'Music unavailable' : playing ? 'Mute wedding music' : 'Play wedding music';
  return (
    <IconButton className="music-button" onClick={onToggle} disabled={unavailable}
      aria-label={label} aria-pressed={playing} title={label}>
      <span aria-hidden="true" className={playing ? 'music-playing' : ''}>{playing ? '♫' : '♪'}</span>
      {!playing && <span aria-hidden="true" className="music-slash" />}
    </IconButton>
  );
}
