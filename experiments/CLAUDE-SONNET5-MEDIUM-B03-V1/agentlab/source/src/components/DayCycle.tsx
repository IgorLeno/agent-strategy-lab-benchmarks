import { useState, type CSSProperties } from 'react';
import { DAY_STAGES } from '../data/content';

export function DayCycle() {
  const [stageId, setStageId] = useState(DAY_STAGES[0].id);
  const stage = DAY_STAGES.find((item) => item.id === stageId) ?? DAY_STAGES[0];

  return (
    <section id="day-cycle" data-testid="day-cycle" className="day-cycle section">
      <div className="section__heading">
        <p className="eyebrow">Ciclo do dia</p>
        <h2>Uma luz que muda porque o seu dia muda</h2>
        <p className="section__lede">
          Escolha um momento e veja LUMA recalcular temperatura, cor e intensidade em tempo real —
          exatamente o que acontece automaticamente na sua mesa, o dia inteiro.
        </p>
      </div>

      <div
        className="day-cycle__options"
        role="group"
        aria-label="Selecionar momento do dia"
      >
        {DAY_STAGES.map((option) => (
          <button
            key={option.id}
            type="button"
            data-testid="day-cycle-option"
            className={`day-cycle__option${option.id === stageId ? ' is-active' : ''}`}
            aria-pressed={option.id === stageId}
            onClick={() => setStageId(option.id)}
          >
            <span className="day-cycle__option-time">{option.time}</span>
            <span className="day-cycle__option-label">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="day-cycle__display">
        <div
          data-testid="day-cycle-stage"
          className={`day-cycle__stage day-cycle__stage--${stage.id}`}
          style={{ '--stage-glow': stage.glow } as CSSProperties}
        >
          <svg viewBox="0 0 200 160" aria-hidden="true" className="day-cycle__stage-art">
            <defs>
              <radialGradient id={`glow-${stage.id}`} cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor={stage.glow} stopOpacity="0.95" />
                <stop offset="100%" stopColor={stage.glow} stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="200" height="160" fill={`url(#glow-${stage.id})`} />
            <rect x="70" y="120" width="60" height="10" rx="5" fill="#1c1d22" />
            <rect x="94" y="70" width="12" height="54" rx="6" fill="#1c1d22" />
            <ellipse cx="100" cy="66" rx="46" ry="20" fill={stage.glow} />
            <ellipse cx="100" cy="66" rx="30" ry="11" fill="#fff6e8" opacity="0.85" />
          </svg>
          <div className="day-cycle__meter" aria-hidden="true">
            <div className="day-cycle__meter-row">
              <span>Quente</span>
              <div className="day-cycle__meter-track">
                <div className="day-cycle__meter-fill day-cycle__meter-fill--warm" style={{ width: `${stage.warm}%` }} />
              </div>
            </div>
            <div className="day-cycle__meter-row">
              <span>Frio</span>
              <div className="day-cycle__meter-track">
                <div className="day-cycle__meter-fill day-cycle__meter-fill--cool" style={{ width: `${stage.cool}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="day-cycle__copy">
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
        </div>
      </div>
    </section>
  );
}
