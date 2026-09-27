import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useTheme, applyTheme } from '@/store/theme';
import { currentWeek, dueProblems, overallProgress, overdueFollowUps, openFollowUps } from '@/lib/derive';
import { phaseOfWeek, TOTAL_WEEKS } from '@/data/roadmap';
import { pct } from '@/lib/date';
import { ProgressBar, Toast } from '@/components/ui';
import { SyncIndicator } from '@/components/CloudSync';
import { FocusTimer } from '@/components/FocusTimer';
import { BookOpen, Braces, Clock, Flag, FolderKanban, LayoutDashboard, ListChecks, Monitor, Moon, Settings, Sun, type IconProps } from '@/components/icons';

type IconComponent = (props: IconProps) => JSX.Element;

const NAV: { to: string; label: string; icon: IconComponent; end?: boolean }[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/weeks', label: 'Weekly checklist', icon: ListChecks },
  { to: '/log', label: 'Study log', icon: Clock },
  { to: '/followups', label: 'Follow-ups', icon: Flag },
  { to: '/dsa', label: 'DSA problems', icon: Braces },
  { to: '/projects', label: 'Side projects', icon: FolderKanban },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const THEME_LABEL = { system: 'Auto', light: 'Light', dark: 'Dark' } as const;
const THEME_ICON = { system: Monitor, light: Sun, dark: Moon } as const;

export default function App() {
  const data = useStore();
  const { theme, cycle } = useTheme();
  useEffect(() => applyTheme(theme), [theme]);

  const overdue = overdueFollowUps(data).length;
  const open = openFollowUps(data).length;
  const reviews = dueProblems(data).length;
  const cw = currentWeek(data);
  const overall = overallProgress(data);
  const ThemeIcon = THEME_ICON[theme];

  const badgeFor = (to: string) => {
    if (to === '/followups' && (overdue > 0 || open > 0)) {
      return (
        <span className={`badge${overdue > 0 ? ' critical' : ''}`} title={overdue > 0 ? `${overdue} overdue` : `${open} open`}>
          {overdue > 0 ? overdue : open}
        </span>
      );
    }
    if (to === '/dsa' && reviews > 0) {
      return (
        <span className="badge" title={`${reviews} due for review`}>
          {reviews}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand row between">
          <div>
            <h1>SWE Roadmap</h1>
            <div className="small">Frontend → Go, Systems & AI</div>
          </div>
          <button className="btn ghost icon" onClick={cycle} title={`Theme: ${THEME_LABEL[theme]}`} aria-label={`Theme: ${THEME_LABEL[theme]}. Click to change.`}>
            <ThemeIcon size={18} />
          </button>
        </div>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon size={18} />
                <span>{n.label}</span>
                {badgeFor(n.to)}
              </NavLink>
            );
          })}
        </nav>
        <FocusTimer />
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
