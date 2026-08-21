import type { PeriodKey, SegmentFilterKey } from '../lib/types';
import { PERIODS, SEGMENT_FILTERS } from '../lib/finance';

const PERIOD_LABELS: Record<PeriodKey, string> = {
  'full-year': 'Full Year',
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
};

const SEGMENT_LABELS: Record<SegmentFilterKey, string> = {
  all: 'All',
  enterprise: 'Enterprise',
  'mid-market': 'Mid-Market',
  smb: 'SMB',
};

interface FiltersProps {
  period: PeriodKey;
  segment: SegmentFilterKey;
  onPeriodChange: (period: PeriodKey) => void;
  onSegmentChange: (segment: SegmentFilterKey) => void;
}

export function Filters({ period, segment, onPeriodChange, onSegmentChange }: FiltersProps) {
  return (
    <form className="filters" aria-label="Dashboard filters">
      <fieldset className="filter-group" data-testid="filter-period">
        <legend>Period</legend>
        <div className="filter-buttons">
          {PERIODS.map((key) => (
            <button
              key={key}
              type="button"
              data-period={key}
              aria-pressed={period === key}
              onClick={() => onPeriodChange(key)}
            >
              {PERIOD_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group" data-testid="filter-segment">
        <legend>Segment</legend>
        <div className="filter-buttons">
          {SEGMENT_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              data-segment={key}
              aria-pressed={segment === key}
              onClick={() => onSegmentChange(key)}
            >
              {SEGMENT_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
