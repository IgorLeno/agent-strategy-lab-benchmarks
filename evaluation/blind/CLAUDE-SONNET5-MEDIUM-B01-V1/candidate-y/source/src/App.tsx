import ActivityPanel from './components/ActivityPanel';
import Chart from './components/Chart';
import Header from './components/Header';
import ProjectsTable from './components/ProjectsTable';
import QuotaPanel from './components/QuotaPanel';
import Sidebar from './components/Sidebar';
import StatCards from './components/StatCards';

export default function App() {
  return (
    <div className="app-shell" data-testid="app-shell">
      <Sidebar />
      <main className="content">
        <Header />
        <StatCards />
        <div className="content-grid">
          <div className="content-main">
            <Chart />
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
