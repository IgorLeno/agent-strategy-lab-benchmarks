import { FEATURES } from '../data/content';
import { FeatureIcon } from './icons';

export function Features() {
  return (
    <section id="features" data-testid="features" className="features section">
      <div className="section__heading">
        <p className="eyebrow">Recursos</p>
        <h2>Quatro sistemas, uma luminária</h2>
        <p className="section__lede">
          Cada recurso da LUMA foi desenhado para funcionar sozinho e ainda melhor em conjunto com os
          outros três.
        </p>
      </div>

      <ul className="features__grid">
        {FEATURES.map((feature) => (
          <li key={feature.id} className="feature-card">
            <span className="feature-card__icon">
              <FeatureIcon icon={feature.icon} />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
