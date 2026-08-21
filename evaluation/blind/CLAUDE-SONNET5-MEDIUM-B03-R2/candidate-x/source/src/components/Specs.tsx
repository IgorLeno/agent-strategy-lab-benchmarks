import { specs } from '../data/specs';

export function Specs() {
  return (
    <section id="specs" data-testid="specs" className="specs section">
      <div className="section__head">
        <p className="eyebrow">Especificações</p>
        <h2>Os números, sem letra miúda</h2>
        <p className="section__lede">
          A LUMA é tão boa quanto os componentes por trás da cúpula. Aqui está exatamente o que
          você está comprando.
        </p>
      </div>
      <dl className="specs__grid">
        {specs.map((spec) => (
          <div key={spec.label} className="specs__row">
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
