import { specGroups } from '../data/content';

export default function Specs() {
  return (
    <section id="specs" data-testid="specs" className="specs">
      <div className="section-heading">
        <p className="eyebrow">Specs</p>
        <h2>The numbers, if you want them.</h2>
        <p className="section-lead">
          Every LUMA ships with the same optical engine and sensor suite — here’s
          exactly what’s inside.
        </p>
      </div>
      <div className="specs__grid">
        {specGroups.map((group) => (
          <div className="specs__group" key={group.title}>
            <h3>{group.title}</h3>
            <dl>
              {group.items.map((item) => (
                <div className="specs__row" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
