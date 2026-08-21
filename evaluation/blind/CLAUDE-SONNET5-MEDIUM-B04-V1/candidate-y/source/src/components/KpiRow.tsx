import type { Kpis } from '../lib/finance';
import { formatCompactMoney, formatNumber, formatPercent, formatSignedCompactMoney } from '../lib/format';

interface KpiCardSpec {
  key: keyof Kpis;
  label: string;
  render: (kpis: Kpis) => string;
  tone?: (kpis: Kpis) => 'positive' | 'negative' | 'neutral';
  hint?: string;
}

const CARDS: KpiCardSpec[] = [
  { key: 'revenue', label: 'Revenue', render: (k) => formatCompactMoney(k.revenue) },
  {
    key: 'budget',
    label: 'Budget',
    render: (k) => formatCompactMoney(k.budget),
    hint: 'vs. actual',
  },
  {
    key: 'budget_variance',
    label: 'Budget variance',
    render: (k) => formatSignedCompactMoney(k.budget_variance),
    tone: (k) => (k.budget_variance > 0 ? 'positive' : k.budget_variance < 0 ? 'negative' : 'neutral'),
  },
  { key: 'cogs', label: 'COGS', render: (k) => formatCompactMoney(k.cogs) },
  { key: 'opex', label: 'OpEx', render: (k) => formatCompactMoney(k.opex) },
  {
    key: 'ebitda',
    label: 'EBITDA',
    render: (k) => `${formatCompactMoney(k.ebitda)} · ${formatPercent(k.revenue === 0 ? 0 : k.ebitda / k.revenue)} margin`,
    tone: (k) => (k.ebitda > 0 ? 'positive' : k.ebitda < 0 ? 'negative' : 'neutral'),
  },
  { key: 'cash', label: 'Cash', render: (k) => formatCompactMoney(k.cash), hint: 'company-level, not by segment' },
  { key: 'new_customers', label: 'New customers', render: (k) => formatNumber(k.new_customers) },
  {
    key: 'churn_rate',
    label: 'Churn rate',
    render: (k) => formatPercent(k.churn_rate, 2),
    tone: (k) => (k.churn_rate > 0.02 ? 'negative' : 'positive'),
  },
];

export default function KpiRow({ kpis }: { kpis: Kpis }) {
  return (
    <div className="kpi-row">
      {CARDS.map((card) => {
        const tone = card.tone?.(kpis) ?? 'neutral';
        return (
          <div
            key={card.key}
            className={`kpi-card kpi-card--${tone}`}
            data-testid="kpi"
            data-kpi={card.key}
            data-value={kpis[card.key]}
          >
            <span className="kpi-card__label">{card.label}</span>
            <span className="kpi-card__value">{card.render(kpis)}</span>
            {card.hint ? <span className="kpi-card__hint">{card.hint}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
