import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useTheme, applyTheme } from '@/store/theme';
import { useUi } from '@/store/ui';
import { currentWeek, dueProblems, overallProgress, overdueFollowUps, openFollowUps } from '@/lib/derive';
import { phaseOfWeek, TOTAL_WEEKS } from '@/data/roadmap';
import { pct } from '@/lib/date';
import { useShortcuts } from '@/lib/useShortcuts';
import { ProgressBar, Toast } from '@/components/ui';
import { SyncIndicator } from '@/components/CloudSync';
import { FocusTimer } from '@/components/FocusTimer';
import { CommandPalette, MOD_KEY } from '@/components/CommandPalette';
import {
  BookOpen, Braces, Clock, Flag, FolderKanban, LayoutDashboard, ListChecks, Menu, Monitor, Moon, Search, Settings, Sun, Trophy, X, type IconProps,
} from '@/components/icons';

type IconComponent = (props: IconProps) => JSX.Element;

interface NavItem {
  to: string;
  label: string;
  short: string; // tab bar label
  icon: IconComponent;
  end?: boolean;
  primary?: boolean; // shown in the bottom tab bar
}

const NAV: NavItem[] = [
  { to: '/', label: 'Overview', short: 'Overview', icon: LayoutDashboard, end: true, primary: true },
  { to: '/weeks', label: 'Weekly checklist', short: 'Weeks', icon: ListChecks, primary: true },
  { to: '/log', label: 'Study log', short: 'Log', icon: Clock, primary: true },
  { to: '/followups', label: 'Follow-ups', short: 'Follow-ups', icon: Flag, primary: true },
  { to: '/dsa', label: 'DSA problems', short: 'DSA', icon: Braces },
  { to: '/projects', label: 'Side projects', short: 'Projects', icon: FolderKanban },
  { to: '/resources', label: 'Resources', short: 'Resources', icon: BookOpen },
  { to: '/milestones', label: 'Milestones', short: 'Milestones', icon: Trophy },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings },
];

const THEME_LABEL = { system: 'Auto', light: 'Light', dark: 'Dark' } as const;
const THEME_ICON = { system: Monitor, light: Sun, dark: Moon } as const;

function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const Icon = THEME_ICON[theme];
  return (
    <button className="btn ghost icon" onClick={cycle} title={`Theme: ${THEME_LABEL[theme]}`} aria-label={`Theme: ${THEME_LABEL[theme]}. Click to change.`}>
      <Icon size={18} />
    </button>
  );
}

function PlanSummary() {
  const data = useStore();
  const cw = currentWeek(data);
  const overall = overallProgress(data);
  return (
    <>
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
    </>
  );
}

export default function App() {
  const data = useStore();
  const theme = useTheme((s) => s.theme);
  const openPalette = useUi((s) => s.openPalette);
  useEffect(() => applyTheme(theme), [theme]);
  useShortcuts();

  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const firstRowRef = useRef<HTMLAnchorElement>(null);

  // The sheet closes on navigation, on Escape, and locks page scroll while open.
  useEffect(() => setMoreOpen(false), [location.pathname]);
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMoreOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstRowRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  // Mark the body while a text field has focus so the phone tab bar can get out of the keyboard's way.
  useEffect(() => {
    const isTextField = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      if (t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return true;
      if (t.tagName !== 'INPUT') return false;
      const type = (t as HTMLInputElement).type;
      return !['checkbox', 'radio', 'range', 'button', 'submit', 'file'].includes(type);
    };
    const onFocusIn = (e: FocusEvent) => isTextField(e.target) && document.body.classList.add('typing');
    const onFocusOut = () => document.body.classList.remove('typing');
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const overdue = overdueFollowUps(data).length;
  const open = openFollowUps(data).length;
  const reviews = dueProblems(data).length;

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

  const primary = NAV.filter((n) => n.primary);
  const secondary = NAV.filter((n) => !n.primary);
  const onSecondaryRoute = secondary.some((n) => location.pathname.startsWith(n.to));

  return (
    <div className="app">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="brand row between">
          <div>
            <h1>SWE Roadmap</h1>
            <div className="small">Frontend → Go, Systems & AI</div>
          </div>
          <ThemeToggle />
        </div>
        <button className="search-btn" onClick={() => openPalette()} aria-label="Search (Cmd K)">
          <Search size={16} />
          <span className="grow">Search…</span>
          <kbd className="kbd">{MOD_KEY}</kbd>
          <kbd className="kbd">K</kbd>
        </button>
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
          <PlanSummary />
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="mobile-top">
        <span className="brand-title">SWE Roadmap</span>
        <span className="row" style={{ gap: 4 }}>
          <FocusTimer compact />
          <button className="btn ghost icon" onClick={() => openPalette()} aria-label="Search">
            <Search size={18} />
          </button>
          <ThemeToggle />
        </span>
      </header>

      <main className="main">
        <Outlet />
      </main>

      {/* Phone bottom tabs */}
      <nav className="tabbar" aria-label="Main">
        {primary.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={22} />
              <span>{n.short}</span>
              {badgeFor(n.to)}
            </NavLink>
          );
        })}
        <button type="button" className={onSecondaryRoute || moreOpen ? 'active' : ''} onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen}>
          <Menu size={22} />
          <span>More</span>
          {reviews > 0 && <span className="dot" title={`${reviews} DSA reviews due`} />}
        </button>
      </nav>

      {moreOpen && (
        <>
          <div className="sheet-backdrop" onClick={() => setMoreOpen(false)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="More">
            <div className="sheet-handle" />
            <div className="row between" style={{ padding: '0 8px 6px' }}>
              <strong className="serif" style={{ fontSize: 18 }}>
                More
              </strong>
              <button className="btn ghost icon" onClick={() => setMoreOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {secondary.map((n, i) => {
              const Icon = n.icon;
              return (
                <NavLink key={n.to} to={n.to} ref={i === 0 ? firstRowRef : undefined} className={({ isActive }) => `sheet-row${isActive ? ' active' : ''}`}>
                  <Icon size={20} />
                  <span>{n.label}</span>
                  {badgeFor(n.to)}
                </NavLink>
              );
            })}
            <FocusTimer />
            <div className="sheet-foot">
              <PlanSummary />
            </div>
          </div>
        </>
      )}

      <CommandPalette />
      <Toast />
    </div>
  );
}
