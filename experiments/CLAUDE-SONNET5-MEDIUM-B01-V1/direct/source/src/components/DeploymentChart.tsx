import { useState } from 'react';
import { deploymentVolume } from '../data';

const ranges = ['7d', '30d', '90d'] as const;

export default function DeploymentChart() {
  const [range, setRange] = useState<(typeof ranges)[number]>('7d');
  const max = Math.max(...deploymentVolume.map((point) => point.value));

  return (
    <section className="panel chart-panel" data-testid="chart" aria-label="Deployment volume">
      <div className="panel-header">
        <h2>Deployment volume</h2>
        <div className="range-toggle" role="group" aria-label="Chart range">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              className={r === range ? 'range-btn range-btn-active' : 'range-btn'}
              aria-pressed={r === range}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-bars">
        {deploymentVolume.map((point) => (
          <div className="chart-bar-col" key={point.label}>
            <div
              className="chart-bar"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
            <span className="chart-bar-label">{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
