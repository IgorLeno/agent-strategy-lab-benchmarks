import { formatCompactMoney } from '../../lib/format';

const WIDTH = 320;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 40, left: 16 };

interface Bar {
  label: string;
  value: number;
  className: string;
}

export default function CostBreakdownChart({ cogs, opex, ebitda }: { cogs: number; opex: number; ebitda: number }) {
  const bars: Bar[] = [
    { label: 'COGS', value: cogs, className: 'chart__bar--cogs' },
    { label: 'OpEx', value: opex, className: 'chart__bar--opex' },
    { label: 'EBITDA', value: ebitda, className: 'chart__bar--ebitda' },
  ];

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(1, ...bars.map((b) => Math.abs(b.value))) * 1.15;
  const zeroY = PADDING.top + innerHeight;
  const barWidth = innerWidth / bars.length - 24;

  const summary = bars.map((b) => `${b.label} ${formatCompactMoney(b.value)}`).join(', ');

  return (
    <figure className="chart" data-testid="chart" data-chart="cost-breakdown">
      <figcaption className="chart__title">Cost &amp; Profitability</figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Bar chart of costs and profitability. ${summary}.`}
        preserveAspectRatio="xMidYMid meet"
      >
        <line x1={PADDING.left} y1={zeroY} x2={WIDTH - PADDING.right} y2={zeroY} className="chart__gridline" />
        {bars.map((bar, i) => {
          const barHeight = (Math.abs(bar.value) / maxValue) * innerHeight;
          const x = PADDING.left + i * (innerWidth / bars.length) + 12;
          const y = bar.value >= 0 ? zeroY - barHeight : zeroY;
          return (
            <g key={bar.label}>
              <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} className={`chart__bar ${bar.className}`} rx={3} />
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="chart__value-label">
                {formatCompactMoney(bar.value)}
              </text>
              <text x={x + barWidth / 2} y={HEIGHT - 20} textAnchor="middle" className="chart__axis-label">
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="chart__sr-summary">{summary}.</p>
    </figure>
  );
}
