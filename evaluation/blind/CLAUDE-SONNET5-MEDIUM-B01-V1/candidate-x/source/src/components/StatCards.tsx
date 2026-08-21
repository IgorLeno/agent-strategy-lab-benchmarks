import { statCards } from '../data';

export default function StatCards() {
  return (
    <div className="stat-grid">
      {statCards.map((card) => (
        <div className="stat-card" data-testid="stat-card" key={card.label}>
          <p className="stat-label">{card.label}</p>
          <p className="stat-value">{card.value}</p>
          <p className={`stat-delta stat-delta-${card.direction}`}>
            <span aria-hidden="true">{card.direction === 'up' ? '▲' : '▼'}</span> {card.delta}
          </p>
        </div>
      ))}
    </div>
  );
}
