import type { MonthlyPoint } from '../../lib/finance';
import { formatCompactMoney } from '../../lib/format';

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };

function monthLabel(month: string): string {
  const [, m] = month.split('-');
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1];
}

function buildPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

export default function RevenueBudgetChart({ points }: { points: MonthlyPoint[] }) {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(1, ...points.map((p) => Math.max(p.revenue, p.budget))) * 1.08;

  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const toXY = (index: number, value: number) => ({
    x: PADDING.left + stepX * index,
    y: PADDING.top + innerHeight - (value / maxValue) * innerHeight,
  });

  const revenuePoints = points.map((p, i) => toXY(i, p.revenue));
  const budgetPoints = points.map((p, i) => toXY(i, p.budget));

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const summary = `Revenue vs. budget across ${points.length} month${points.length === 1 ? '' : 's'}: revenue ranges from ${formatCompactMoney(
    Math.min(...points.map((p) => p.revenue)),
  )} to ${formatCompactMoney(Math.max(...points.map((p) => p.revenue)))}.`;

  return (
    <figure className="chart" data-testid="chart" data-chart="revenue-vs-budget">
      <figcaption className="chart__title">Revenue vs. Budget</figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Line chart comparing monthly revenue to budget. ${summary}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {gridLines.map((fraction) => {
          const y = PADDING.top + innerHeight * (1 - fraction);
          return (
            <g key={fraction}>
              <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} className="chart__gridline" />
              <text x={PADDING.left - 8} y={y} className="chart__axis-label" textAnchor="end" dominantBaseline="middle">
                {formatCompactMoney(maxValue * fraction)}
              </text>
            </g>
          );
        })}
        <path d={buildPath(budgetPoints)} className="chart__line chart__line--budget" fill="none" />
        <path d={buildPath(revenuePoints)} className="chart__line chart__line--revenue" fill="none" />
        {revenuePoints.map((p, i) => (
          <circle key={`r-${points[i].month}`} cx={p.x} cy={p.y} r={3} className="chart__dot chart__dot--revenue" />
        ))}
        {points.map((p, i) => (
          <text
            key={p.month}
            x={PADDING.left + stepX * i}
            y={HEIGHT - 6}
            className="chart__axis-label"
            textAnchor="middle"
          >
            {monthLabel(p.month)}
          </text>
        ))}
      </svg>
      <div className="chart__legend">
        <span className="chart__legend-item">
          <span className="chart__swatch chart__swatch--revenue" /> Revenue
        </span>
        <span className="chart__legend-item">
          <span className="chart__swatch chart__swatch--budget" /> Budget
        </span>
      </div>
      <p className="chart__sr-summary">{summary}</p>
    </figure>
  );
}
