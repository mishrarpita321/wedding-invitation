import { wedding } from '../../data/wedding';
import { Flourish } from '../shared/Ornaments';
import { Photo } from '../shared/Photo';

export default function HeroSection() {
  return (
    <>
      {/* <header className="masthead">
        <span>THE WEDDING CELEBRATION</span><span>A <i>&</i> S</span><span>{wedding.compactDate}</span>
      </header> */}
      <section className="hero" aria-labelledby="couple-names">
        <div className="hero-copy">
          {/* <p className="eyebrow">With full hearts & open arms</p> */}
          <h1 id="couple-names">{wedding.bride.firstName}<span className="couple-amp">&</span>{wedding.groom.firstName}</h1>
          <Flourish />
          <p className="hero-date">{wedding.dateLabel}</p>
          <p className="eyebrow">{wedding.location}</p>
          <p className="hero-quote">A beautiful new chapter begins.</p>
          <a className="scroll-link" href="#celebrations">OUR CELEBRATION <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-photo">
          <Photo name="together" alt="Arpita and Swagat together" eager />
          {/* <span className="photo-caption">a love to last a lifetime</span> */}
        </div>
      </section>
    </>
  );
}
