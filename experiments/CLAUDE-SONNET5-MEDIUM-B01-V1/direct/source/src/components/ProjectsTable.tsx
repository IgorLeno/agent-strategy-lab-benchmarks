import { projects } from '../data';
import type { ProjectStatus } from '../data';

function statusClass(status: ProjectStatus) {
  switch (status) {
    case 'Live':
      return 'badge badge-live';
    case 'In review':
      return 'badge badge-review';
    case 'Paused':
      return 'badge badge-paused';
  }
}

export default function ProjectsTable() {
  return (
    <section className="panel table-panel" aria-labelledby="recent-projects-heading">
      <div className="panel-header">
        <h2 id="recent-projects-heading">Recent projects</h2>
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
                    <span className="project-initials" aria-hidden="true">
                      {project.initials}
                    </span>
                    {project.name}
                  </div>
                </td>
                <td>{project.owner}</td>
                <td>
                  <span className={statusClass(project.status)}>{project.status}</span>
                </td>
                <td className="updated-cell">{project.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
