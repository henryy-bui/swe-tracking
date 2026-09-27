import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useTheme, applyTheme } from '@/store/theme';
import { useUi } from '@/store/ui';
import { currentWeek, dueProblems, overallProgress, overdueFollowUps, openFollowUps } from '@/lib/derive';
import { phaseOfWeek, TOTAL_WEEKS, weekDef } from '@/data/roadmap';
import { pct, plural } from '@/lib/format';
import { MOD_KEY } from '@/lib/platform';
import { useShortcuts } from '@/lib/useShortcuts';
import { useBodyTypingClass, useFocusTrap } from '@/lib/useA11y';
import { Arrow, ProgressBar, Toast } from '@/components/ui';
import { SyncIndicator } from '@/components/CloudSync';
import { FocusTimer } from '@/components/FocusTimer';
import { CommandPalette } from '@/components/CommandPalette';
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
  { to: '/milestones', label: 'Achievements', short: 'Achievements', icon: Trophy },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings },
];

const THEME_LABEL = { system: 'Auto', light: 'Light', dark: 'Dark' } as const;
const THEME_ICON = { system: Monitor, light: Sun, dark: Moon } as const;

function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const cycle = useTheme((s) => s.cycle);
  const Icon = THEME_ICON[theme];
  return (
    <button className="btn ghost icon" onClick={cycle} title={`Theme: ${THEME_LABEL[theme]}`} aria-label={`Theme: ${THEME_LABEL[theme]}. Activate to change.`}>
      <Icon size={18} />
    </button>
  );
}

/* Count badges with a spoken explanation; the number alone is hidden from screen readers. */
function NavBadge({ to }: { to: string }) {
  const overdue = useStore((s) => overdueFollowUps(s).length);
  const open = useStore((s) => openFollowUps(s).length);
  const reviews = useStore((s) => dueProblems(s).length);
  if (to === '/followups' && (overdue > 0 || open > 0)) {
    return (
      <>
        <span className={`badge${overdue > 0 ? ' critical' : ''}`} aria-hidden="true">
          {overdue > 0 ? overdue : open}
        </span>
        <span className="sr-only">, {overdue > 0 ? `${plural(overdue, 'overdue follow-up')}` : `${plural(open, 'open follow-up')}`}</span>
      </>
    );
  }
  if (to === '/dsa' && reviews > 0) {
    return (
      <>
        <span className="badge" aria-hidden="true">
          {reviews}
        </span>
        <span className="sr-only">, {plural(reviews, 'problem')} to review</span>
      </>
    );
  }
  return null;
}

function PlanSummary({ announceSync }: { announceSync?: boolean }) {
  const cw = useStore((s) => currentWeek(s));
  const done = useStore((s) => overallProgress(s).done);
  const total = useStore((s) => overallProgress(s).total);
  return (
    <>
      {cw ? (
        <div>
          <strong>Week {cw}</strong> of {TOTAL_WEEKS} · Phase {phaseOfWeek(cw).id}
        </div>
      ) : (
        <div>
          <Link to="/settings">Set a start date</Link>
        </div>
      )}
      <div className="row between section-xs">
        <span>Overall</span>
        <span className="tabular">{pct(done, total)}%</span>
      </div>
      <div className="section-xs">
        <ProgressBar done={done} total={total} thin label="Overall progress" valueText={`${pct(done, total)}%`} />
      </div>
      <div className="section-sm">
        <SyncIndicator announce={announceSync} />
      </div>
    </>
  );
}

function Sidebar() {
  const openPalette = useUi((s) => s.openPalette);
  return (
    <aside className="sidebar">
      <div className="brand row between">
        <div>
          <p className="brand-name">SWE Roadmap</p>
          <div className="small ink-2">
            Frontend <Arrow /> Go, Systems &amp; AI
          </div>
        </div>
        <ThemeToggle />
      </div>
      <button className="search-btn" onClick={() => openPalette()} aria-label="Search" aria-keyshortcuts="Meta+K Control+K /">
        <Search size={16} />
        <span className="grow">Search…</span>
        <kbd className="kbd" aria-hidden="true">
          {MOD_KEY}
        </kbd>
        <kbd className="kbd" aria-hidden="true">
          K
        </kbd>
      </button>
      <nav className="nav" aria-label="Main">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} />
              <span>{n.label}</span>
              <NavBadge to={n.to} />
            </NavLink>
          );
        })}
      </nav>
      <FocusTimer />
      <div className="sidebar-foot">
        <PlanSummary announceSync />
      </div>
    </aside>
  );
}

function TopBar() {
  const openPalette = useUi((s) => s.openPalette);
  return (
    <header className="mobile-top">
      <span className="brand-title">SWE Roadmap</span>
      <span className="row top-actions">
        <FocusTimer compact />
        <button className="btn ghost icon" onClick={() => openPalette()} aria-label="Search">
          <Search size={18} />
        </button>
        <ThemeToggle />
      </span>
    </header>
  );
}

function TabBar({ onMore, moreActive, moreRef }: { onMore: () => void; moreActive: boolean; moreRef: React.RefObject<HTMLButtonElement> }) {
  const reviews = useStore((s) => dueProblems(s).length);
  return (
    <nav className="tabbar" aria-label="Main">
      {NAV.filter((n) => n.primary).map((n) => {
        const Icon = n.icon;
        return (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={22} />
            <span>{n.short}</span>
            <NavBadge to={n.to} />
          </NavLink>
        );
      })}
      <button ref={moreRef} type="button" className={moreActive ? 'active' : ''} onClick={onMore} aria-haspopup="dialog" aria-expanded={moreActive}>
        <Menu size={22} />
        <span>More</span>
        {reviews > 0 && (
          <>
            <span className="dot" aria-hidden="true" />
            <span className="sr-only">, {plural(reviews, 'problem')} to review</span>
          </>
        )}
      </button>
    </nav>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active: open, onClose, inertSelector: '.app > :not(.sheet):not(.sheet-backdrop)' });
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="more-title" ref={ref}>
        <div className="sheet-handle" aria-hidden="true" />
        <div className="row between sheet-title">
          <strong className="serif" id="more-title">
            More
          </strong>
          <button className="btn ghost icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {NAV.filter((n) => !n.primary).map((n) => {
          const Icon = n.icon;
          return (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `sheet-row${isActive ? ' active' : ''}`}>
              <Icon size={20} />
              <span>{n.label}</span>
              <NavBadge to={n.to} />
            </NavLink>
          );
        })}
        <FocusTimer />
        <div className="sheet-foot">
          <PlanSummary />
        </div>
      </div>
    </>
  );
}

/* Sets the document title and moves focus to the page heading after navigation. */
function useRouteAnnounce() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const m = location.pathname.match(/^\/weeks\/(\d+)$/);
    const page = m ? `Week ${m[1]}: ${weekDef(Number(m[1]))?.topic ?? ''}` : (NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ?? 'SWE Roadmap');
    document.title = `${page} · SWE Roadmap`;
    if (first.current) {
      first.current = false;
      return;
    }
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
}

export default function App() {
  const theme = useTheme((s) => s.theme);
  useEffect(() => applyTheme(theme), [theme]);
  useShortcuts();
  useBodyTypingClass();
  useRouteAnnounce();

  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setMoreOpen(false), [location.pathname]);

  const onSecondaryRoute = NAV.filter((n) => !n.primary).some((n) => location.pathname.startsWith(n.to));

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar />
      <TopBar />
      <main className="main" id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <TabBar onMore={() => setMoreOpen(true)} moreActive={onSecondaryRoute || moreOpen} moreRef={moreBtnRef} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <CommandPalette />
      <Toast />
    </div>
  );
}
