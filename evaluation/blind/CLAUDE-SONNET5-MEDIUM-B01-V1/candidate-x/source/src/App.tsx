import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import DeploymentChart from './components/DeploymentChart';
import ProjectsTable from './components/ProjectsTable';
import ActivityPanel from './components/ActivityPanel';
import QuotaPanel from './components/QuotaPanel';

export default function App() {
  return (
    <div className="app-shell" data-testid="app-shell">
      <Sidebar />
      <main className="main-content">
        <Header />
        <StatCards />
        <div className="content-grid">
          <div className="content-main">
            <DeploymentChart />
            <ProjectsTable />
          </div>
          <div className="content-side">
            <ActivityPanel />
            <QuotaPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
