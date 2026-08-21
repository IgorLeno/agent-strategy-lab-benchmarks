import { useState } from 'react';
import { dayMoments } from '../data/dayCycle';

export function DayCycle() {
  const [activeId, setActiveId] = useState(dayMoments[0].id);
  const active = dayMoments.find((moment) => moment.id === activeId) ?? dayMoments[0];

  return (
    <section id="day-cycle" data-testid="day-cycle" className="day-cycle section">
      <div className="section__head">
        <p className="eyebrow">Ciclo do dia</p>
        <h2>Uma luz que muda porque você muda</h2>
        <p className="section__lede">
          A LUMA segue quatro momentos ao longo do dia. Escolha um abaixo e veja a temperatura de
          cor, o tom e a copy do produto mudarem juntos — é exatamente o que acontece automaticamente
          na sua mesa.
        </p>
      </div>

      <div className="day-cycle__layout">
        <div
          className="day-cycle__stage"
          data-testid="day-cycle-stage"
          style={{
            background: `linear-gradient(180deg, ${active.skyFrom} 0%, ${active.skyTo} 100%)`,
          }}
        >
          <svg viewBox="0 0 300 220" className="day-cycle__stage-svg" aria-hidden="true">
            <circle cx="150" cy={active.sunY} r="34" fill={active.glow} className="day-cycle__sun" />
            <rect x="40" y="150" width="220" height="10" rx="5" fill="#1c1730" opacity="0.35" />
            <rect x="140" y="90" width="20" height="70" rx="6" fill="#1c1730" opacity="0.55" />
            <path
              d="M96 90 C 96 60, 204 60, 204 90 L 184 118 C 184 96, 116 96, 116 118 Z"
              fill="#1c1730"
              opacity="0.55"
            />
            <ellipse cx="150" cy="92" rx="52" ry="24" fill={active.glow} opacity="0.85" />
          </svg>
          <div className="day-cycle__stage-meta">
            <span className="day-cycle__time">{active.time}</span>
            <span className="day-cycle__kelvin">{active.kelvin}</span>
          </div>
        </div>

        <div className="day-cycle__panel">
          <div className="day-cycle__options" role="group" aria-label="Escolha um momento do dia">
            {dayMoments.map((moment) => (
              <button
                key={moment.id}
                type="button"
                data-testid="day-cycle-option"
                className="day-cycle__option"
                aria-pressed={moment.id === activeId}
                onClick={() => setActiveId(moment.id)}
              >
                <span className="day-cycle__option-label">{moment.label}</span>
                <span className="day-cycle__option-time">{moment.time}</span>
              </button>
            ))}
          </div>

          <h3>{active.headline}</h3>
          <p>{active.description}</p>
        </div>
      </div>
    </section>
  );
}
