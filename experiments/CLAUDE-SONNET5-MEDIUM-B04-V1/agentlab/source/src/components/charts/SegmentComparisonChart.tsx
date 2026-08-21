import type { SegmentBreakdown, SegmentKey } from '../../lib/finance';
import { formatCompactMoney } from '../../lib/format';

const WIDTH = 320;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 40, left: 16 };

const SEGMENT_CLASS: Record<string, string> = {
  Enterprise: 'chart__bar--enterprise',
  'Mid-Market': 'chart__bar--mid-market',
  SMB: 'chart__bar--smb',
};

export default function SegmentComparisonChart({
  rows,
  activeSegment,
}: {
  rows: SegmentBreakdown[];
  activeSegment: SegmentKey;
}) {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(1, ...rows.map((r) => r.revenue)) * 1.15;
  const barWidth = innerWidth / rows.length - 24;

  const summary = rows.map((r) => `${r.segment} revenue ${formatCompactMoney(r.revenue)}`).join(', ');

  return (
    <figure className="chart" data-testid="chart" data-chart="segment-comparison">
      <figcaption className="chart__title">Revenue by Segment</figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Bar chart comparing revenue across segments. ${summary}.`}
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          x1={PADDING.left}
          y1={PADDING.top + innerHeight}
          x2={WIDTH - PADDING.right}
          y2={PADDING.top + innerHeight}
          className="chart__gridline"
        />
        {rows.map((row, i) => {
          const barHeight = (row.revenue / maxValue) * innerHeight;
          const x = PADDING.left + i * (innerWidth / rows.length) + 12;
          const y = PADDING.top + innerHeight - barHeight;
          const isActive = activeSegment === 'all' || slugFor(row.segment) === activeSegment;
          return (
            <g key={row.segment} opacity={isActive ? 1 : 0.35}>
              <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} className={`chart__bar ${SEGMENT_CLASS[row.segment]}`} rx={3} />
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="chart__value-label">
                {formatCompactMoney(row.revenue)}
              </text>
              <text x={x + barWidth / 2} y={HEIGHT - 20} textAnchor="middle" className="chart__axis-label">
                {row.segment}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="chart__sr-summary">{summary}.</p>
    </figure>
  );
}

function slugFor(segment: string): SegmentKey {
  if (segment === 'Enterprise') return 'enterprise';
  if (segment === 'Mid-Market') return 'mid-market';
  return 'smb';
}
