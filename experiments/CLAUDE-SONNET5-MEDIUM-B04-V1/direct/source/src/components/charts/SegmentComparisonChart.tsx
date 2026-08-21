import type { SegmentSummary } from '../../lib/types';
import { formatMoneyCompact, formatPercent } from '../../lib/format';

const WIDTH = 420;
const HEIGHT = 260;
const MARGIN = { top: 16, right: 16, bottom: 40, left: 56 };

const COLORS: Record<SegmentSummary['segment'], string> = {
  enterprise: 'var(--series-1)',
  'mid-market': 'var(--series-2)',
  smb: 'var(--series-3)',
  all: 'var(--series-1)',
};

interface SegmentComparisonChartProps {
  data: SegmentSummary[];
}

export function SegmentComparisonChart({ data }: SegmentComparisonChartProps) {
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const yFor = (value: number) => MARGIN.top + innerHeight - (value / (maxRevenue || 1)) * innerHeight;

  const slotWidth = innerWidth / data.length;
  const barWidth = Math.min(56, slotWidth - 16);

  const summary = data
    .map((d) => `${d.name}: revenue ${formatMoneyCompact(d.revenue)}, ${formatPercent(d.share)} of total`)
    .join('; ');

  return (
    <div>
      <div className="chart-scroll">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label={`Revenue by segment. ${summary}`}
        >
          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={MARGIN.top + innerHeight}
            y2={MARGIN.top + innerHeight}
            stroke="var(--baseline)"
            strokeWidth={1}
          />
          <text x={MARGIN.left - 8} y={MARGIN.top + innerHeight} textAnchor="end" dominantBaseline="auto" fontSize={10} fill="var(--text-muted)">
            {formatMoneyCompact(0)}
          </text>
          <text x={MARGIN.left - 8} y={MARGIN.top} textAnchor="end" dominantBaseline="hanging" fontSize={10} fill="var(--text-muted)">
            {formatMoneyCompact(maxRevenue)}
          </text>

          {data.map((segment, index) => {
            const slotX = MARGIN.left + index * slotWidth;
            const barX = slotX + (slotWidth - barWidth) / 2;
            const barY = yFor(segment.revenue);
            const barHeight = MARGIN.top + innerHeight - barY;
            return (
              <g key={segment.segment}>
                <rect x={barX} y={barY} width={barWidth} height={Math.max(barHeight, 0.5)} fill={COLORS[segment.segment]} rx={4} />
                <text x={barX + barWidth / 2} y={barY - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text-primary)">
                  {formatMoneyCompact(segment.revenue)}
                </text>
                <text x={slotX + slotWidth / 2} y={HEIGHT - 24} textAnchor="middle" fontSize={11} fill="var(--text-primary)">
                  {segment.name}
                </text>
                <text x={slotX + slotWidth / 2} y={HEIGHT - 10} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
                  {formatPercent(segment.share)} share
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <table className="sr-only">
        <caption>Revenue by segment</caption>
        <thead>
          <tr>
            <th>Segment</th>
            <th>Revenue</th>
            <th>Share of total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((segment) => (
            <tr key={segment.segment}>
              <td>{segment.name}</td>
              <td>{formatMoneyCompact(segment.revenue)}</td>
              <td>{formatPercent(segment.share)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
