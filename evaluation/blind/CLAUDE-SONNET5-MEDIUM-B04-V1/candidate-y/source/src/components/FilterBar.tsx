import { PERIODS, SEGMENTS } from '../lib/finance';
import type { PeriodKey, SegmentKey } from '../lib/finance';

interface FilterBarProps {
  period: PeriodKey;
  segment: SegmentKey;
  onPeriodChange: (period: PeriodKey) => void;
  onSegmentChange: (segment: SegmentKey) => void;
}

export default function FilterBar({ period, segment, onPeriodChange, onSegmentChange }: FilterBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Dashboard filters">
      <div className="filter-group" data-testid="filter-period" role="group" aria-label="Period">
        {PERIODS.map((option) => (
          <button
            key={option.key}
            type="button"
            data-period={option.key}
            aria-pressed={option.key === period}
            className={option.key === period ? 'filter-btn filter-btn--active' : 'filter-btn'}
            onClick={() => onPeriodChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="filter-group" data-testid="filter-segment" role="group" aria-label="Segment">
        {SEGMENTS.map((option) => (
          <button
            key={option.key}
            type="button"
            data-segment={option.key}
            aria-pressed={option.key === segment}
            className={option.key === segment ? 'filter-btn filter-btn--active' : 'filter-btn'}
            onClick={() => onSegmentChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
