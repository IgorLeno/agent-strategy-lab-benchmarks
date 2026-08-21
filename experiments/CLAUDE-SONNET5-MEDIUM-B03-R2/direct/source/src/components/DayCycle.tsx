import { useState } from 'react';
import { dayMoments } from '../content';
import { EveningIcon, FocusIcon, NightIcon, SunIcon } from './icons';

const ICONS = {
  morning: SunIcon,
  focus: FocusIcon,
  evening: EveningIcon,
  night: NightIcon,
} as const;

export default function DayCycle() {
  const [activeId, setActiveId] = useState(dayMoments[0].id);
  const active = dayMoments.find((moment) => moment.id === activeId) ?? dayMoments[0];

  return (
    <section id="day-cycle" data-testid="day-cycle" className="day-cycle" aria-labelledby="day-cycle-heading">
      <div className="section-head">
        <p className="eyebrow">Follows your day</p>
        <h2 id="day-cycle-heading">One lamp, four moods</h2>
        <p className="section-lede">
          LUMA runs a default circadian curve out of the box. Pick a moment below to see
          how the light — and the reasoning behind it — changes.
        </p>
      </div>

      <div className="day-cycle__layout">
        <div className="day-cycle__options" role="group" aria-label="Time of day">
          {dayMoments.map((moment) => {
            const Icon = ICONS[moment.id];
            const isActive = moment.id === activeId;
            return (
              <button
                key={moment.id}
                type="button"
                data-testid="day-cycle-option"
                className="day-cycle__option"
                aria-pressed={isActive}
                data-active={isActive}
                onClick={() => setActiveId(moment.id)}
              >
                <Icon className="day-cycle__option-icon" />
                <span className="day-cycle__option-label">{moment.label}</span>
                <span className="day-cycle__option-time">{moment.time}</span>
              </button>
            );
          })}
        </div>

        <div
          data-testid="day-cycle-stage"
          className="day-cycle__stage"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${active.glow}55, transparent 70%)`,
          }}
        >
          <svg viewBox="0 0 320 320" className="day-cycle__stage-svg" aria-hidden="true">
            <defs>
              <radialGradient id={`stageGradient-${active.id}`} cx="50%" cy="42%" r="55%">
                <stop offset="0%" stopColor={active.colorFrom} />
                <stop offset="100%" stopColor={active.colorTo} />
              </radialGradient>
            </defs>
            <circle cx="160" cy="150" r="92" fill={`url(#stageGradient-${active.id})`} />
            <rect x="140" y="230" width="40" height="60" rx="8" fill="#232228" />
            <rect x="112" y="284" width="96" height="14" rx="7" fill="#111014" />
          </svg>
          <div className="day-cycle__stage-readout">
            <span className="day-cycle__kelvin">{active.kelvin}</span>
            <span className="day-cycle__time">{active.time}</span>
          </div>
        </div>

        <div className="day-cycle__copy">
          <h3>{active.headline}</h3>
          <p>{active.description}</p>
        </div>
      </div>
    </section>
  );
}
