import { useState, type CSSProperties } from 'react';
import { dayMoments } from '../data/content';
import Lamp from './Lamp';

export default function DayCycle() {
  const [activeId, setActiveId] = useState(dayMoments[0].id);
  const active = dayMoments.find((moment) => moment.id === activeId) ?? dayMoments[0];

  return (
    <section id="day-cycle" data-testid="day-cycle" className="day-cycle">
      <div className="section-heading">
        <p className="eyebrow">Day cycle</p>
        <h2>One lamp, four moods, zero effort.</h2>
        <p className="section-lead">
          LUMA reads the clock so you don’t have to. Pick a moment below to preview how
          color temperature, brightness and ambient glow shift across a typical day.
        </p>
      </div>

      <div
        className="day-cycle__options"
        role="group"
        aria-label="Select a moment of the day"
      >
        {dayMoments.map((moment) => {
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
              <span className="day-cycle__option-label">{moment.label}</span>
              <span className="day-cycle__option-time">{moment.time}</span>
            </button>
          );
        })}
      </div>

      <div className="day-cycle__display">
        <div
          className="day-cycle__stage"
          data-testid="day-cycle-stage"
          data-moment={active.id}
          style={
            {
              '--stage-from': active.colorFrom,
              '--stage-to': active.colorTo,
              '--stage-glow': active.glow,
            } as CSSProperties
          }
        >
          <Lamp
            gradientId={`day-cycle-${active.id}`}
            colorFrom={active.colorFrom}
            colorTo={active.colorTo}
            glow={active.glow}
            className="day-cycle__lamp"
          />
          <span className="day-cycle__kelvin">{active.kelvin}</span>
        </div>
        <div className="day-cycle__text">
          <h3>{active.headline}</h3>
          <p>{active.description}</p>
        </div>
      </div>
    </section>
  );
}
