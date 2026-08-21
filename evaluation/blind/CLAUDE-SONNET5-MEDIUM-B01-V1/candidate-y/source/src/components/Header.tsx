export default function Header() {
  return (
    <header className="content-header">
      <div>
        <h1>Overview</h1>
        <p className="content-subtitle">Tuesday, 12 March — 4 environments running</p>
      </div>
      <div className="content-header-actions">
        <label className="search-field">
          <span className="visually-hidden">Search projects</span>
          <input type="search" placeholder="Search projects..." />
        </label>
        <button type="button" className="primary-button">
          New project
        </button>
        <span className="avatar" aria-hidden="true">
          IL
        </span>
      </div>
    </header>
  );
}
