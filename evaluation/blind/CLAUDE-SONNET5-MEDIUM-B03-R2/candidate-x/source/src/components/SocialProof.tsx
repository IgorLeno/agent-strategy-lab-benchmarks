import { pressQuotes, provenStat, testimonials } from '../data/testimonials';

export function SocialProof() {
  return (
    <section id="social-proof" data-testid="social-proof" className="social-proof section">
      <div className="section__head">
        <p className="eyebrow">Depoimentos</p>
        <h2>Não é só a nossa opinião</h2>
        <p className="section__lede">
          Milhares de mesas já trocaram de luz. Aqui está o que mudou para quem já vive com a
          LUMA todos os dias.
        </p>
      </div>

      <div className="social-proof__stat">
        <span className="social-proof__stat-value">{provenStat.value}</span>
        <span className="social-proof__stat-label">{provenStat.label}</span>
      </div>

      <ul className="testimonials__grid">
        {testimonials.map((testimonial) => (
          <li key={testimonial.name} className="testimonial-card">
            <p className="testimonial-card__quote">&ldquo;{testimonial.quote}&rdquo;</p>
            <p className="testimonial-card__author">
              <span className="testimonial-card__name">{testimonial.name}</span>
              <span className="testimonial-card__role">{testimonial.role}</span>
            </p>
          </li>
        ))}
      </ul>

      <ul className="press__grid">
        {pressQuotes.map((press) => (
          <li key={press.outlet} className="press-card">
            <p>{press.quote}</p>
            <span>{press.outlet}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
