import { activity } from '../data';

export default function ActivityPanel() {
  return (
    <section className="panel activity-panel" data-testid="activity" aria-label="Activity">
      <h2>Activity</h2>
      <ul className="activity-list">
        {activity.map((entry) => (
          <li key={entry.time + entry.initials}>
            <span className="activity-avatar" aria-hidden="true">
              {entry.initials}
            </span>
            <div>
              <p className="activity-text">
                {entry.segments.map((segment, index) =>
                  segment.bold ? <strong key={index}>{segment.text}</strong> : <span key={index}>{segment.text}</span>,
                )}
              </p>
              <p className="activity-time">{entry.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
