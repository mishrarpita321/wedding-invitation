import { wedding } from '../../data/wedding';

interface EnvelopeProps {
  opening: boolean;
  onOpen: () => void;
}

export default function Envelope({ opening, onOpen }: EnvelopeProps) {
  return (
    <button className={`envelope ${opening ? 'is-open' : ''}`} onClick={onOpen}
      disabled={opening} aria-label={opening ? 'Opening your invitation' : `Open ${wedding.bride.firstName} and ${wedding.groom.firstName}’s wedding invitation`}>
      <span className="envelope-back" />
      <span className="invitation-card">
        <span className="card-monogram">A & S</span>
        <span>{wedding.bride.firstName}<br /><i>&</i><br />{wedding.groom.firstName}</span>
        <small>{wedding.compactDate}</small>
      </span>
      <span className="envelope-front" />
      <span className="envelope-flap" />
      <span className="wax-seal">A<span>&</span>S</span>
      <span aria-hidden="true" className="envelope-vine vine-left">❦</span>
      <span aria-hidden="true" className="envelope-vine vine-right">❦</span>
    </button>
  );
}
