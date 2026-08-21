import { specs } from '../content';

export default function Specs() {
  return (
    <section id="specs" data-testid="specs" className="specs" aria-labelledby="specs-heading">
      <div className="section-head">
        <p className="eyebrow">The details</p>
        <h2 id="specs-heading">Specifications</h2>
        <p className="section-lede">
          Precise engineering, laid out plainly — everything you need before you buy.
        </p>
      </div>
      <dl className="specs__grid">
        {specs.map((spec) => (
          <div className="specs__row" key={spec.label}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
