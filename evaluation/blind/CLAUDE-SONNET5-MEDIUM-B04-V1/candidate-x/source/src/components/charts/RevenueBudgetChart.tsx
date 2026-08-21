import type { MonthlyPoint } from '../../lib/types';
import { formatMonth, formatMoneyCompact } from '../../lib/format';

const WIDTH = 640;
const HEIGHT = 260;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 56 };

interface RevenueBudgetChartProps {
  data: MonthlyPoint[];
}

function niceTicks(max: number, min: number, count = 4): number[] {
  if (max === min) return [min];
  const span = max - min;
  const step = span / count;
  return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

export function RevenueBudgetChart({ data }: RevenueBudgetChartProps) {
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const values = data.flatMap((point) => [point.revenue, point.budget]);
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const ticks = niceTicks(maxValue, minValue);

  const xFor = (index: number) =>
    data.length <= 1 ? MARGIN.left : MARGIN.left + (index / (data.length - 1)) * innerWidth;
  const yFor = (value: number) =>
    MARGIN.top + innerHeight - ((value - minValue) / (maxValue - minValue || 1)) * innerHeight;

  const revenuePath = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.revenue)}`).join(' ');
  const budgetPath = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.budget)}`).join(' ');

  const lastRevenue = data.at(-1)?.revenue ?? 0;
  const lastBudget = data.at(-1)?.budget ?? 0;

  const summary = `${data.length} months. Revenue ranges from ${formatMoneyCompact(
    Math.min(...data.map((p) => p.revenue)),
  )} to ${formatMoneyCompact(Math.max(...data.map((p) => p.revenue)))}; budget from ${formatMoneyCompact(
    Math.min(...data.map((p) => p.budget)),
  )} to ${formatMoneyCompact(Math.max(...data.map((p) => p.budget)))}.`;

  return (
    <div>
      <div className="chart-scroll">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label={`Revenue versus budget by month. ${summary}`}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="var(--gridline)"
                strokeWidth={1}
              />
              <text x={MARGIN.left - 8} y={yFor(tick)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--text-muted)">
                {formatMoneyCompact(tick)}
              </text>
            </g>
          ))}

          {data.map((point, i) => (
            <text
              key={point.month}
              x={xFor(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text-muted)"
            >
              {formatMonth(point.month)}
            </text>
          ))}

          <path d={budgetPath} fill="none" stroke="var(--series-2)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={revenuePath} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {data.map((point, i) => (
            <circle key={`b-${point.month}`} cx={xFor(i)} cy={yFor(point.budget)} r={3} fill="var(--series-2)" stroke="var(--surface-1)" strokeWidth={2} />
          ))}
          {data.map((point, i) => (
            <circle key={`r-${point.month}`} cx={xFor(i)} cy={yFor(point.revenue)} r={3} fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth={2} />
          ))}

          <text x={xFor(data.length - 1) + 6} y={yFor(lastRevenue)} fontSize={10} fill="var(--text-primary)" dominantBaseline="middle">
            {formatMoneyCompact(lastRevenue)}
          </text>
          <text x={xFor(data.length - 1) + 6} y={yFor(lastBudget)} fontSize={10} fill="var(--text-primary)" dominantBaseline="middle">
            {formatMoneyCompact(lastBudget)}
          </text>
        </svg>
      </div>
      <div className="chart-legend">
        <span className="chart-legend-item">
          <span className="chart-legend-swatch" style={{ background: 'var(--series-1)' }} />
          Revenue
        </span>
        <span className="chart-legend-item">
          <span className="chart-legend-swatch" style={{ background: 'var(--series-2)' }} />
          Budget
        </span>
      </div>
      <table className="sr-only">
        <caption>Revenue versus budget by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
            <th>Budget</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.month}>
              <td>{point.month}</td>
              <td>{formatMoneyCompact(point.revenue)}</td>
              <td>{formatMoneyCompact(point.budget)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
