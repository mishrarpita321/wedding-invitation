import Container from '@mui/material/Container';
import { events, wedding } from '../../data/wedding';
import { getGoogleMapsUrl } from '../../utils/maps';
import { Reveal } from '../shared/Reveal';
import DetailIcon from '../shared/DetailIcon';

export default function VenueLocation() {
  const venues = events.filter(event => event.venue !== 'At our residence');
  return (
    <section className="section locations" aria-labelledby="locations-title">
      <Container maxWidth="md">
        <Reveal><p className="eyebrow">Meet us here</p><h2 id="locations-title">Places of celebration</h2></Reveal>
        <div className="location-grid">
          {venues.map(event => <Reveal className="location" key={event.id}>
            <DetailIcon kind="pin" /><p className="eyebrow">{event.title}</p>
            <h3>{event.venue}</h3><p>{event.address}</p>
            <a className="text-link" href={getGoogleMapsUrl(event.mapsQuery)} target="_blank" rel="noopener noreferrer"
              aria-label={`Get directions to ${event.venue}`}>Get Directions <span aria-hidden="true">↗</span></a>
          </Reveal>)}
        </div>
        <Reveal className="residence-location">
          <p className="eyebrow">Mehendi & Sangeet · Haldi</p><h3>At our residence</h3><p>{wedding.residence}</p>
          <a className="text-link" href={getGoogleMapsUrl(wedding.residence)} target="_blank" rel="noopener noreferrer"
            aria-label="Get directions to our residence">Get Directions <span aria-hidden="true">↗</span></a>
        </Reveal>
      </Container>
    </section>
  );
}
