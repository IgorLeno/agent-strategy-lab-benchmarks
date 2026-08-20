import { PRESS_QUOTES, QUANTIFIED_CLAIM, TESTIMONIALS } from '../data/content';

export function SocialProof() {
  return (
    <section id="social-proof" data-testid="social-proof" className="social-proof section">
      <div className="section__heading">
        <p className="eyebrow">Depoimentos</p>
        <h2>Não é só o design que convence</h2>
        <p className="section__lede">
          Mais de mil clientes trocaram sua luz de mesa pela LUMA. Isto é o que eles notam primeiro.
        </p>
      </div>

      <div className="social-proof__stat">
        <span className="social-proof__stat-value">{QUANTIFIED_CLAIM.value}</span>
        <p>{QUANTIFIED_CLAIM.description}</p>
      </div>

      <ul className="testimonials">
        {TESTIMONIALS.map((testimonial) => (
          <li className="testimonial-card" key={testimonial.name}>
            <p className="testimonial-card__quote">&ldquo;{testimonial.quote}&rdquo;</p>
            <p className="testimonial-card__attribution">
              <span className="testimonial-card__name">{testimonial.name}</span>
              <span className="testimonial-card__role">{testimonial.role}</span>
            </p>
          </li>
        ))}
      </ul>

      <ul className="press-quotes">
        {PRESS_QUOTES.map((press) => (
          <li key={press.outlet}>
            <p>{press.quote}</p>
            <span>{press.outlet}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
