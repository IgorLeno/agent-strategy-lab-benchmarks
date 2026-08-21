import { pressQuote, quantifiedClaim, testimonials } from '../content';

export default function SocialProof() {
  return (
    <section
      id="social-proof"
      data-testid="social-proof"
      className="social-proof"
      aria-labelledby="social-proof-heading"
    >
      <div className="section-head">
        <p className="eyebrow">Trusted at the desk</p>
        <h2 id="social-proof-heading">What early users and reviewers say</h2>
        <p className="social-proof__claim">{quantifiedClaim}</p>
      </div>

      <div className="social-proof__grid">
        <figure className="press-quote">
          <blockquote>&ldquo;{pressQuote.quote}&rdquo;</blockquote>
          <figcaption>{pressQuote.publication}</figcaption>
        </figure>

        {testimonials.map((testimonial) => (
          <figure className="testimonial-card" key={testimonial.name}>
            <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
            <figcaption>
              <span className="testimonial-card__name">{testimonial.name}</span>
              <span className="testimonial-card__role">{testimonial.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
