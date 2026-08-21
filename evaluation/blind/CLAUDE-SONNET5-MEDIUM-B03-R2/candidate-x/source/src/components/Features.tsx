import { features } from '../data/features';
import { FeatureIcon } from './icons';

export function Features() {
  return (
    <section id="features" data-testid="features" className="features section">
      <div className="section__head">
        <p className="eyebrow">Recursos</p>
        <h2>Construída em torno de como você realmente usa a mesa</h2>
        <p className="section__lede">
          Cada recurso da LUMA existe para resolver um problema específico de quem passa o dia
          entre reuniões, leitura e telas — não para preencher uma lista de especificações.
        </p>
      </div>
      <ul className="features__grid">
        {features.map((feature) => (
          <li key={feature.id} className="feature-card">
            <div className="feature-card__icon">
              <FeatureIcon icon={feature.icon} />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
