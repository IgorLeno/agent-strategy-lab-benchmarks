import { pricingPlans } from '../data/content';

export default function Pricing() {
  return (
    <section id="pricing" data-testid="pricing" className="pricing">
      <div className="section-heading">
        <p className="eyebrow">Pricing</p>
        <h2>Pick your LUMA.</h2>
        <p className="section-lead">
          Every plan ships with the full adaptive-light engine. Studio adds ambient
          color and a heavier base; Care adds peace of mind.
        </p>
      </div>
      <ul className="pricing__grid">
        {pricingPlans.map((plan) => (
          <li
            key={plan.id}
            data-testid="pricing-plan"
            className={`pricing-card${plan.recommended ? ' pricing-card--recommended' : ''}`}
          >
            {plan.recommended ? (
              <span className="pricing-card__badge">Most popular</span>
            ) : null}
            <h3>{plan.name}</h3>
            <p className="pricing-card__price">
              <span className="pricing-card__amount">{plan.price}</span>
              <span className="pricing-card__billing">{plan.billing}</span>
            </p>
            <p className="pricing-card__description">{plan.description}</p>
            <ul className="pricing-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <a
              href="#hero"
              className={`button ${plan.recommended ? 'button--primary' : 'button--secondary'} pricing-card__cta`}
            >
              {plan.cta}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
