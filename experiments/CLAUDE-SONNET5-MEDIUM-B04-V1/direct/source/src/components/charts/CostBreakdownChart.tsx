import type { MonthlyPoint } from '../../lib/types';
import { formatMonth, formatMoneyCompact } from '../../lib/format';

const WIDTH = 640;
const HEIGHT = 260;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 56 };
const BAR_GAP = 2;
const SERIES: { key: 'cogs' | 'opex' | 'ebitda'; label: string; color: string }[] = [
  { key: 'cogs', label: 'COGS', color: 'var(--series-1)' },
  { key: 'opex', label: 'OpEx', color: 'var(--series-2)' },
  { key: 'ebitda', label: 'EBITDA', color: 'var(--series-3)' },
];

interface CostBreakdownChartProps {
  data: MonthlyPoint[];
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const values = data.flatMap((point) => [point.cogs, point.opex, point.ebitda]);
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const zeroY = MARGIN.top + innerHeight - ((0 - minValue) / (maxValue - minValue || 1)) * innerHeight;
  const yFor = (value: number) =>
    MARGIN.top + innerHeight - ((value - minValue) / (maxValue - minValue || 1)) * innerHeight;

  const groupWidth = innerWidth / data.length;
  const barWidth = Math.min(20, (groupWidth - BAR_GAP * (SERIES.length + 1)) / SERIES.length);

  const summary = data
    .map((p) => `${p.month}: COGS ${formatMoneyCompact(p.cogs)}, OpEx ${formatMoneyCompact(p.opex)}, EBITDA ${formatMoneyCompact(p.ebitda)}`)
    .join('; ');

  return (
    <div>
      <div className="chart-scroll">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label={`Cost and profitability breakdown by month. ${summary}`}
        >
          <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={zeroY} y2={zeroY} stroke="var(--baseline)" strokeWidth={1} />
          <text x={MARGIN.left - 8} y={zeroY} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--text-muted)">
            {formatMoneyCompact(0)}
          </text>
          <text x={MARGIN.left - 8} y={MARGIN.top} textAnchor="end" dominantBaseline="hanging" fontSize={10} fill="var(--text-muted)">
            {formatMoneyCompact(maxValue)}
          </text>
          {minValue < 0 && (
            <text x={MARGIN.left - 8} y={MARGIN.top + innerHeight} textAnchor="end" dominantBaseline="auto" fontSize={10} fill="var(--text-muted)">
              {formatMoneyCompact(minValue)}
            </text>
          )}

          {data.map((point, groupIndex) => {
            const groupX = MARGIN.left + groupIndex * groupWidth;
            return (
              <g key={point.month}>
                {SERIES.map((series, seriesIndex) => {
                  const value = point[series.key];
                  const barX = groupX + BAR_GAP + seriesIndex * (barWidth + BAR_GAP);
                  const barY = value >= 0 ? yFor(value) : zeroY;
                  const barHeight = Math.abs(yFor(value) - zeroY);
                  return (
                    <rect
                      key={series.key}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={Math.max(barHeight, 0.5)}
                      fill={series.color}
                      rx={2}
                    />
                  );
                })}
                <text x={groupX + groupWidth / 2} y={HEIGHT - 8} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
                  {formatMonth(point.month)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="chart-legend">
        {SERIES.map((series) => (
          <span className="chart-legend-item" key={series.key}>
            <span className="chart-legend-swatch" style={{ background: series.color }} />
            {series.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Cost and profitability breakdown by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>COGS</th>
            <th>OpEx</th>
            <th>EBITDA</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.month}>
              <td>{point.month}</td>
              <td>{formatMoneyCompact(point.cogs)}</td>
              <td>{formatMoneyCompact(point.opex)}</td>
              <td>{formatMoneyCompact(point.ebitda)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
