import { wedding } from '../../data/wedding';
import { Lotus, Flourish } from '../shared/Ornaments';
import { Reveal } from '../shared/Reveal';
import { Photo } from '../shared/Photo';

export default function Footer() {
  return (
    <footer className="section closing">
      <div className="closing-photo"><Photo name="together" alt="Arpita and Swagat" /></div>
      <Reveal>
        <Lotus className="section-lotus" />
        <p className="eyebrow">The best part is having you there</p>
        <h2>We can’t wait to<br /><em>celebrate with you.</em></h2>
        <p>Your presence will make our<br />celebrations even more special.</p>
        <p className="closing-names">{wedding.bride.firstName} & {wedding.groom.firstName}</p>
        <p className="eyebrow">{wedding.compactDate}</p>
        <Flourish />
      </Reveal>
    </footer>
  );
}
