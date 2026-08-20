import { PRICING_PLANS } from '../data/content';
import { CheckIcon } from './icons';

export function Pricing() {
  return (
    <section id="pricing" data-testid="pricing" className="pricing section">
      <div className="section__heading">
        <p className="eyebrow">Planos</p>
        <h2>Escolha como você quer começar</h2>
        <p className="section__lede">
          Todos os planos incluem a luminária completa. A diferença está no que você monta em volta
          dela.
        </p>
      </div>

      <ul className="pricing__grid">
        {PRICING_PLANS.map((plan) => (
          <li
            key={plan.id}
            data-testid="pricing-plan"
            className={`pricing-card${plan.recommended ? ' is-recommended' : ''}`}
          >
            {plan.recommended && <span className="pricing-card__badge">Mais escolhido</span>}
            <h3>{plan.name}</h3>
            <p className="pricing-card__description">{plan.description}</p>
            <p className="pricing-card__price">
              <span className="pricing-card__price-value">{plan.price}</span>
              <span className="pricing-card__price-period">{plan.period}</span>
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
              href="#hero"
              className={`btn btn--large ${plan.recommended ? 'btn--primary' : 'btn--ghost'}`}
            >
              {plan.cta}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
