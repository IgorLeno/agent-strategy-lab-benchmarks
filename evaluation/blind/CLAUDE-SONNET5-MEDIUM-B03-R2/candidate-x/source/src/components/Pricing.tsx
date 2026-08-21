import { pricingPlans } from '../data/pricing';

export function Pricing() {
  return (
    <section id="pricing" data-testid="pricing" className="pricing section">
      <div className="section__head">
        <p className="eyebrow">Preços</p>
        <h2>Escolha a sua LUMA</h2>
        <p className="section__lede">
          Três formas de trazer a LUMA para a sua mesa, do essencial à experiência completa com
          cuidado prioritário.
        </p>
      </div>
      <ul className="pricing__grid">
        {pricingPlans.map((plan) => (
          <li
            key={plan.id}
            data-testid="pricing-plan"
            className={plan.highlighted ? 'pricing-card pricing-card--highlighted' : 'pricing-card'}
          >
            {plan.highlighted ? <span className="pricing-card__badge">Mais escolhido</span> : null}
            <h3>{plan.name}</h3>
            <p className="pricing-card__price">
              {plan.price}
              <span className="pricing-card__cadence">{plan.cadence}</span>
            </p>
            <p className="pricing-card__description">{plan.description}</p>
            <ul className="pricing-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <a
              className={plan.highlighted ? 'button button--primary' : 'button button--secondary'}
              href="#pricing"
            >
              {plan.cta}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
