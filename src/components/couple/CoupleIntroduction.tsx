import Container from '@mui/material/Container';
import { wedding } from '../../data/wedding';
import { Flourish } from '../shared/Ornaments';
import { Reveal } from '../shared/Reveal';
import { Photo } from '../shared/Photo';

export default function CoupleIntroduction() {
  return (
    <section id="families" className="section family-section" aria-labelledby="families-title">
      <Container maxWidth="md">
        <Reveal>
          {/* <p className="eyebrow">Two hearts · Two families · One forever</p> */}
          <h2 id="families-title">With love & blessings</h2>
          <p className="section-intro">Together with the blessings of our families,<br />we joyfully invite you to celebrate our wedding.</p>
        </Reveal>
        <div className="couple-grid">
          <Reveal className="person">
            <div className="portrait"><Photo name="arpita" alt={`${wedding.bride.name}, the bride`} /></div>
            <p className="eyebrow">The bride</p><h3>{wedding.bride.name}</h3>
            <p className="parent-label">Daughter of</p>
            <p>{wedding.bride.parents[1]}<br /><span className="gold">&</span><br />{wedding.bride.parents[0]}</p>
          </Reveal>
          <div className="couple-amp" aria-hidden="true">&</div>
          <Reveal className="person">
            <div className="portrait"><Photo name="swagat" alt={`${wedding.groom.name}, the groom`} /></div>
            <p className="eyebrow">The groom</p><h3>{wedding.groom.name}</h3>
            <p className="parent-label">Son of</p>
            <p>{wedding.groom.parents[1]}<br /><span className="gold">&</span><br />{wedding.groom.parents[0]}</p>
          </Reveal>
        </div>
        <Flourish />
      </Container>
    </section>
  );
}
