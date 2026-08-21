import { projects, type ProjectStatus } from '../data';

function statusClass(status: ProjectStatus): string {
  switch (status) {
    case 'Live':
      return 'status-badge status-badge--live';
    case 'In review':
      return 'status-badge status-badge--review';
    case 'Paused':
      return 'status-badge status-badge--paused';
  }
}

export default function ProjectsTable() {
  return (
    <section className="panel projects-panel">
      <div className="panel-header">
        <h2>Recent projects</h2>
        <a href="#" className="view-all-link">
          View all
        </a>
      </div>
      <div className="table-scroll">
        <table data-testid="projects-table">
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Owner</th>
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.name}>
                <td>
                  <div className="project-cell">
                    <span className="project-avatar" aria-hidden="true">
                      {project.initials}
                    </span>
                    {project.name}
                  </div>
                </td>
                <td>{project.owner}</td>
                <td>
                  <span className={statusClass(project.status)}>{project.status}</span>
                </td>
                <td>{project.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
