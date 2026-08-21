import { activity } from '../data';

export default function ActivityPanel() {
  return (
    <section className="panel activity-panel" data-testid="activity" aria-labelledby="activity-heading">
      <h2 id="activity-heading">Activity</h2>
      <ul className="activity-list">
        {activity.map((item) => (
          <li className="activity-item" key={item.time + item.initials}>
            <span className="activity-avatar" aria-hidden="true">
              {item.initials}
            </span>
            <div>
              <p className="activity-text">
                {item.segments.map((segment, index) =>
                  segment.strong ? (
                    <strong key={index}>{segment.text}</strong>
                  ) : (
                    <span key={index}>{segment.text}</span>
                  ),
                )}
              </p>
              <p className="activity-time">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
