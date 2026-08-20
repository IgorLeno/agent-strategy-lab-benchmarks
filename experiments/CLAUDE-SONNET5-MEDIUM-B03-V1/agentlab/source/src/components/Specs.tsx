import { SPECS } from '../data/content';

export function Specs() {
  return (
    <section id="specs" data-testid="specs" className="specs section">
      <div className="section__heading">
        <p className="eyebrow">Especificações</p>
        <h2>Feita com a precisão de um instrumento</h2>
        <p className="section__lede">
          Cada componente foi escolhido para durar e para desempenhar — sem exageros de marketing, só
          números que você pode verificar.
        </p>
      </div>

      <dl className="specs__grid">
        {SPECS.map((spec) => (
          <div className="specs__item" key={spec.label}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
