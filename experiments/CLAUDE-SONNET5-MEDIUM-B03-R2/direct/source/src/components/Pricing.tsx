import { pricingPlans } from '../content';
import { CheckIcon } from './icons';

export default function Pricing() {
  return (
    <section id="pricing" data-testid="pricing" className="pricing" aria-labelledby="pricing-heading">
      <div className="section-head">
        <p className="eyebrow">Pre-order now</p>
        <h2 id="pricing-heading">Choose your setup</h2>
        <p className="section-lede">
          Every plan ships with the full circadian engine. The difference is how many
          desks — and how much control — you need.
        </p>
      </div>

      <ul className="pricing__grid">
        {pricingPlans.map((plan) => (
          <li
            key={plan.id}
            data-testid="pricing-plan"
            className={`pricing-card${plan.featured ? ' pricing-card--featured' : ''}`}
          >
            {plan.featured && <span className="pricing-card__badge">Most popular</span>}
            <h3>{plan.name}</h3>
            <p className="pricing-card__description">{plan.description}</p>
            <p className="pricing-card__price">
              <span className="pricing-card__amount">{plan.price}</span>
              <span className="pricing-card__cadence">{plan.cadence}</span>
            </p>
            <ul className="pricing-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <CheckIcon className="pricing-card__check" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              className={`button ${plan.featured ? 'button--primary' : 'button--secondary'} pricing-card__cta`}
              href="#faq"
            >
              {plan.cta}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
