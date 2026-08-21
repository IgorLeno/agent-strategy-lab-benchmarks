import type { Aggregate } from '../lib/types';
import { formatMoneyCompact, formatNumber, formatPercent, formatSignedMoneyCompact } from '../lib/format';

interface KpiDefinition {
  key: keyof Aggregate;
  label: string;
  value: (aggregate: Aggregate) => string;
  sub?: (aggregate: Aggregate) => { text: string; tone: 'positive' | 'negative' | 'neutral' } | null;
}

const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    key: 'revenue',
    label: 'Revenue',
    value: (a) => formatMoneyCompact(a.revenue),
  },
  {
    key: 'budget',
    label: 'Budget',
    value: (a) => formatMoneyCompact(a.budget),
    sub: (a) => ({
      text: `${formatSignedMoneyCompact(a.budget_variance)} vs actual`,
      tone: a.budget_variance >= 0 ? 'positive' : 'negative',
    }),
  },
  {
    key: 'budget_variance',
    label: 'Budget variance',
    value: (a) => formatSignedMoneyCompact(a.budget_variance),
    sub: (a) => ({
      text: a.budget_variance >= 0 ? 'Above budget' : 'Below budget',
      tone: a.budget_variance >= 0 ? 'positive' : 'negative',
    }),
  },
  {
    key: 'cogs',
    label: 'COGS',
    value: (a) => formatMoneyCompact(a.cogs),
  },
  {
    key: 'opex',
    label: 'OpEx',
    value: (a) => formatMoneyCompact(a.opex),
  },
  {
    key: 'ebitda',
    label: 'EBITDA',
    value: (a) => formatMoneyCompact(a.ebitda),
    sub: (a) => ({
      text: `${formatPercent(a.revenue === 0 ? 0 : a.ebitda / a.revenue)} margin`,
      tone: a.ebitda >= 0 ? 'positive' : 'negative',
    }),
  },
  {
    key: 'cash',
    label: 'Cash',
    value: (a) => formatMoneyCompact(a.cash),
    sub: () => ({ text: 'Company-wide, unaffected by segment filter', tone: 'neutral' }),
  },
  {
    key: 'new_customers',
    label: 'New customers',
    value: (a) => formatNumber(a.new_customers),
  },
  {
    key: 'churn_rate',
    label: 'Churn rate',
    value: (a) => formatPercent(a.churn_rate),
  },
];

interface KpiGridProps {
  aggregate: Aggregate;
}

export function KpiGrid({ aggregate }: KpiGridProps) {
  return (
    <section className="kpi-grid" aria-label="Key performance indicators">
      {KPI_DEFINITIONS.map((definition) => {
        const sub = definition.sub?.(aggregate) ?? null;
        return (
          <div
            key={definition.key}
            className="kpi-card"
            data-testid="kpi"
            data-kpi={definition.key}
            data-value={aggregate[definition.key]}
          >
            <span className="kpi-label">{definition.label}</span>
            <span className="kpi-value">{definition.value(aggregate)}</span>
            {sub ? <span className={`kpi-sub ${sub.tone}`}>{sub.text}</span> : null}
          </div>
        );
      })}
    </section>
  );
}
