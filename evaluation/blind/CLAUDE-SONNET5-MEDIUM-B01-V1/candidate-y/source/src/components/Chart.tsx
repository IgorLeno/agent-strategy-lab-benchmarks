import { useState } from 'react';
import { deploymentVolume } from '../data';

const ranges = ['7d', '30d', '90d'] as const;
type Range = (typeof ranges)[number];

export default function Chart() {
  const [range, setRange] = useState<Range>('7d');

  return (
    <section className="panel chart-panel" data-testid="chart" aria-label="Deployment volume">
      <div className="panel-header">
        <h2>Deployment volume</h2>
        <div className="range-toggle" role="group" aria-label="Time range">
          {ranges.map((value) => (
            <button
              key={value}
              type="button"
              className={value === range ? 'range-button range-button--active' : 'range-button'}
              aria-pressed={value === range}
              onClick={() => setRange(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="bar-chart">
        {deploymentVolume.map((point) => (
          <div className="bar-column" key={point.day}>
            <div className="bar" style={{ height: `${point.value}%` }} />
            <span className="bar-label">{point.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
