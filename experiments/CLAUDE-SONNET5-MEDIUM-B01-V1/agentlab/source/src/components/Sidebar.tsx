import { accountNav, workspaceNav } from '../data';

export default function Sidebar() {
  return (
    <aside className="sidebar" data-testid="sidebar" aria-label="Primary">
      <div className="sidebar-logo">
        <span className="logo-mark" aria-hidden="true">
          N
        </span>
        <span className="logo-text">Nimbus</span>
      </div>

      <nav className="sidebar-nav" aria-label="Workspace">
        <p className="nav-heading">Workspace</p>
        <ul>
          {workspaceNav.map((item) => (
            <li key={item.label}>
              <a href="#" className={item.active ? 'nav-link nav-link--active' : 'nav-link'} aria-current={item.active ? 'page' : undefined}>
                <span className="nav-dot" aria-hidden="true" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="nav-heading">Account</p>
        <ul>
          {accountNav.map((item) => (
            <li key={item.label}>
              <a href="#" className="nav-link">
                <span className="nav-dot" aria-hidden="true" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="plan-card">
        <p>You are on the Starter plan. Upgrade for unlimited environments.</p>
        <button type="button" className="upgrade-button">
          Upgrade plan
        </button>
      </div>
    </aside>
  );
}
