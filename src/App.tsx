import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { currentWeek, overallProgress, overdueFollowUps, openFollowUps } from '@/lib/derive';
import { phaseOfWeek, TOTAL_WEEKS } from '@/data/roadmap';
import { pct } from '@/lib/date';
import { ProgressBar, Toast } from '@/components/ui';
import { SyncIndicator } from '@/components/CloudSync';

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/weeks', label: 'Weekly checklist' },
  { to: '/log', label: 'Study log' },
  { to: '/followups', label: 'Follow-ups' },
  { to: '/projects', label: 'Side projects' },
  { to: '/resources', label: 'Resources' },
  { to: '/settings', label: 'Settings' },
];

export default function App() {
  const data = useStore();
  const overdue = overdueFollowUps(data).length;
  const open = openFollowUps(data).length;
  const cw = currentWeek(data);
  const overall = overallProgress(data);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h1>SWE Roadmap</h1>
          <div className="small">Frontend → Go, Systems & AI</div>
        </div>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span>{n.label}</span>
              {n.to === '/followups' && (overdue > 0 || open > 0) && (
                <span className={`badge${overdue > 0 ? ' critical' : ''}`} title={overdue > 0 ? `${overdue} overdue` : `${open} open`}>
                  {overdue > 0 ? overdue : open}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          {cw ? (
            <div>
              <strong>Week {cw}</strong> of {TOTAL_WEEKS} · Phase {phaseOfWeek(cw).id}
            </div>
          ) : (
            <div>Start date not set</div>
          )}
          <div className="row between" style={{ marginTop: 6 }}>
            <span>Overall</span>
            <span className="tabular">{pct(overall.done, overall.total)}%</span>
          </div>
          <div style={{ marginTop: 4 }}>
            <ProgressBar done={overall.done} total={overall.total} thin label="Overall progress" />
          </div>
          <div style={{ marginTop: 10 }}>
            <SyncIndicator />
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
