export default function Header() {
  return (
    <header className="content-header">
      <div>
        <h1>Overview</h1>
        <p className="content-subtitle">Tuesday, 12 March — 4 environments running</p>
      </div>
      <div className="header-actions">
        <label className="visually-hidden" htmlFor="search-projects">
          Search projects
        </label>
        <input
          id="search-projects"
          type="search"
          className="search-input"
          placeholder="Search projects..."
        />
        <button type="button" className="btn btn-primary">
          New project
        </button>
        <div className="avatar" aria-hidden="true">
          IL
        </div>
      </div>
    </header>
  );
}
