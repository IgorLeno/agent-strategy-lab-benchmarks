import { statCards } from '../data';

export default function StatCards() {
  return (
    <div className="stat-grid">
      {statCards.map((card) => (
        <div className="stat-card" data-testid="stat-card" key={card.id}>
          <p className="stat-label">{card.label}</p>
          <p className="stat-value">{card.value}</p>
          <p className={card.direction === 'up' ? 'stat-delta stat-delta--up' : 'stat-delta stat-delta--down'}>
            <span aria-hidden="true">{card.direction === 'up' ? '▲' : '▼'}</span> {card.delta}
          </p>
        </div>
      ))}
    </div>
  );
}
