import { quota } from '../data';

export default function QuotaPanel() {
  return (
    <section className="panel quota-panel" data-testid="quota" aria-labelledby="quota-heading">
      <h2 id="quota-heading">Quota</h2>
      <ul className="quota-list">
        {quota.map((item) => (
          <li className="quota-item" key={item.label}>
            <div className="quota-row">
              <span>{item.label}</span>
              <span>{item.usedLabel}</span>
            </div>
            <div
              className="quota-track"
              role="progressbar"
              aria-label={item.label}
              aria-valuenow={Math.round(item.percent)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="quota-fill" style={{ width: `${item.percent}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
