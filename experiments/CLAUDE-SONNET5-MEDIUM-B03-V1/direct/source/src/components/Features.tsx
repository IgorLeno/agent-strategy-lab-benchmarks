import { features } from '../data/content';
import { featureIcons } from './Icons';

export default function Features() {
  return (
    <section id="features" data-testid="features" className="features">
      <div className="section-heading">
        <p className="eyebrow">Features</p>
        <h2>Everything a desk light was missing.</h2>
        <p className="section-lead">
          LUMA bundles the kind of engineering usually reserved for studio lighting
          rigs into a single object that fits next to your keyboard.
        </p>
      </div>
      <ul className="features__grid">
        {features.map((feature) => {
          const Icon = featureIcons[feature.icon];
          return (
            <li key={feature.id} className="feature-card">
              <span className="feature-card__icon">
                <Icon />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
