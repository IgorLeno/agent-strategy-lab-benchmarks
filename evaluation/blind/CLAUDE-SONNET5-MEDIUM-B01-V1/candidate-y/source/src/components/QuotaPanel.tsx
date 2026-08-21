import { quota } from '../data';

export default function QuotaPanel() {
  return (
    <section className="panel quota-panel" data-testid="quota" aria-label="Quota">
      <h2>Quota</h2>
      <ul className="quota-list">
        {quota.map((item) => (
          <li key={item.label}>
            <div className="quota-row">
              <span>{item.label}</span>
              <span>
                {item.used} / {item.total}
              </span>
            </div>
            <div className="quota-bar" role="progressbar" aria-label={item.label} aria-valuenow={item.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="quota-bar-fill" style={{ width: `${item.percent}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
