import { pressQuote, quantifiedClaim, testimonials } from '../data/content';

export default function SocialProof() {
  return (
    <section id="social-proof" data-testid="social-proof" className="social-proof">
      <div className="section-heading">
        <p className="eyebrow">Social proof</p>
        <h2>Desks that switched, and stayed switched.</h2>
      </div>

      <div className="social-proof__stat">
        <span className="social-proof__stat-value">{quantifiedClaim.value}</span>
        <span className="social-proof__stat-label">{quantifiedClaim.label}</span>
      </div>

      <ul className="social-proof__grid">
        {testimonials.map((testimonial) => (
          <li className="testimonial-card" key={testimonial.name}>
            <p className="testimonial-card__quote">“{testimonial.quote}”</p>
            <p className="testimonial-card__attribution">
              <span className="testimonial-card__name">{testimonial.name}</span>
              <span className="testimonial-card__role">{testimonial.role}</span>
            </p>
          </li>
        ))}
      </ul>

      <blockquote className="press-quote">
        <p>“{pressQuote.quote}”</p>
        <cite>— {pressQuote.source}</cite>
      </blockquote>
    </section>
  );
}
