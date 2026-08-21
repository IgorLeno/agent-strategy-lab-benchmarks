import { features } from '../content';
import { AppIcon, CableIcon, PaletteIcon, PresenceIcon, QuietIcon, SpectrumIcon } from './icons';

const ICONS = {
  spectrum: SpectrumIcon,
  presence: PresenceIcon,
  palette: PaletteIcon,
  app: AppIcon,
  quiet: QuietIcon,
  cable: CableIcon,
} as const;

export default function Features() {
  return (
    <section id="features" data-testid="features" className="features" aria-labelledby="features-heading">
      <div className="section-head">
        <p className="eyebrow">Under the shade</p>
        <h2 id="features-heading">Built for the way you actually sit at a desk</h2>
        <p className="section-lede">
          Every part of LUMA earns its place — no gimmick modes, no app you have to fight.
        </p>
      </div>
      <ul className="features__grid">
        {features.map((feature) => {
          const Icon = ICONS[feature.icon];
          return (
            <li key={feature.title} className="feature-card">
              <div className="feature-card__icon">
                <Icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
