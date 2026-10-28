import './section-florals.css';

/** Decorative artwork stays outside the reading and interaction order. */
export function SectionFlorals({ variant }: { variant: 'blessing' | 'couple' | 'footer' | 'envelope' | 'hero' }) {
  return (
    <div className={`section-florals section-florals--${variant}`} aria-hidden="true">
      {variant === 'blessing' ? <span className="floral-garland" /> : <>
        <span className="floral-corner floral-corner--first" />
        <span className="floral-corner floral-corner--last" />
      </>}
      {variant === 'couple' && <span className="floral-bottom" />}
    </div>
  );
}
