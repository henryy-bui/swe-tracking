import { useEffect, useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { pct } from '@/lib/format';
import { relDay } from '@/lib/date';
import { STATUS_LABEL, PRIORITY_LABEL, type Status } from '@/lib/labels';
import { isOverdue } from '@/lib/derive';
import type { FollowUp, Priority } from '@/store/useStore';
import { useToastStore } from '@/store/toast';
import { AlertTriangle, Check, ChevronRight, Circle, CircleDot, Flag, Minus, Star } from '@/components/icons';
import { projectById, type WeekMilestone } from '@/data/roadmap';

export { toast } from '@/store/toast';

/* ---------- Toast (always-mounted live region so screen readers announce it) ---------- */
export function Toast() {
  const message = useToastStore((s) => s.message);
  const action = useToastStore((s) => s.action);
  const seq = useToastStore((s) => s.seq);
  const clear = useToastStore((s) => s.clear);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, action ? 7000 : 3200);
    return () => clearTimeout(t);
  }, [message, action, seq, clear]);
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {message && (
        <div className="toast" key={seq}>
          <span>{message}</span>
          {action && (
            <button
              className="toast-action"
              onClick={() => {
                action.onClick();
                clear();
              }}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Page header ---------- */
export function PageHead({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1 tabIndex={-1}>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

/* ---------- Progress ---------- */
interface BarProps {
  done: number;
  total: number;
  good?: boolean;
  thin?: boolean;
  label?: string;
  labelledBy?: string;
  valueText?: string;
  decorative?: boolean; // when the same value is already conveyed next to it
}

export function ProgressBar({ done, total, good, thin, label, labelledBy, valueText, decorative }: BarProps) {
  const p = pct(done, total);
  return (
    <div
      className={`bar${good || p === 100 ? ' good' : ''}${thin ? ' thin' : ''}`}
      role={decorative ? undefined : 'progressbar'}
      aria-hidden={decorative || undefined}
      aria-valuenow={decorative ? undefined : p}
      aria-valuemin={decorative ? undefined : 0}
      aria-valuemax={decorative ? undefined : 100}
      aria-valuetext={decorative ? undefined : (valueText ?? `${done} of ${total}`)}
      aria-label={decorative || labelledBy ? undefined : label}
      aria-labelledby={decorative ? undefined : labelledBy}
    >
      <span style={{ width: `${p}%` }} />
    </div>
  );
}

export function ProgressLine({ title, done, total, right, valueText }: { title: ReactNode; done: number; total: number; right?: ReactNode; valueText?: string }) {
  const id = useId();
  return (
    <div className="progress-line">
      <div id={id}>{title}</div>
      <div className="small ink-2 tabular">
        {right ?? (
          <>
            {done}/{total} · {pct(done, total)}%
          </>
        )}
      </div>
      <ProgressBar done={done} total={total} labelledBy={id} valueText={valueText} />
    </div>
  );
}

/* ---------- Stat tile ---------- */
export function StatTile({ label, value, sub, srValue }: { label: string; value: ReactNode; sub?: ReactNode; srValue?: string }) {
  return (
    <dl className="tile">
      <dt className="label">{label}</dt>
      <dd className="value">
        {srValue ? (
          <>
            <span aria-hidden="true">{value}</span>
            <span className="sr-only">{srValue}</span>
          </>
        ) : (
          value
        )}
      </dd>
      {sub && <dd className="sub">{sub}</dd>}
    </dl>
  );
}

/* ---------- Status pill (icon + text, never color alone) ---------- */
const STATUS_ICON = { done: Check, 'in-progress': CircleDot, 'not-started': Circle, skipped: Minus, blocked: AlertTriangle } as const;

export function StatusPill({ status }: { status: Status }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`pill ${status}`}>
      <Icon size={13} /> {STATUS_LABEL[status]}
    </span>
  );
}

/* ---------- Priority pill ---------- */
export function PriorityPill({ priority }: { priority: Priority }) {
  if (priority === 'high') {
    return (
      <span className="pill warning">
        <Flag size={12} /> {PRIORITY_LABEL.high} priority
      </span>
    );
  }
  return <span className="pill">{PRIORITY_LABEL[priority]} priority</span>;
}

/* ---------- Due / overdue label for a follow-up ---------- */
export function DueLabel({ followUp }: { followUp: FollowUp }) {
  if (!followUp.due) return null;
  if (isOverdue(followUp)) {
    return (
      <span className="pill overdue">
        <AlertTriangle size={12} /> overdue · {relDay(followUp.due)}
      </span>
    );
  }
  return <span>{followUp.done ? 'was due' : 'due'} {relDay(followUp.due)}</span>;
}

/* ---------- Stars ---------- */
export function Stars({ rating, size = 12, max = 5 }: { rating: number; size?: number; max?: number }) {
  if (rating <= 0) return null;
  return (
    <span className="stars" role="img" aria-label={`Rated ${rating} of ${max}`}>
      {Array.from({ length: rating }, (_, i) => (
        <Star key={i} size={size} filled />
      ))}
    </span>
  );
}

/* ---------- Milestone badge on a week ---------- */
export function MilestoneBadge({ milestone }: { milestone: WeekMilestone }) {
  const p = projectById(milestone.project);
  return (
    <span className="milestone-badge">
      {milestone.kind === 'start' ? 'Start' : 'Finish'} project {p.number}
    </span>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ children, to, linkText }: { children: ReactNode; to?: string; linkText?: string }) {
  return (
    <div className="empty">
      {children}
      {to && linkText && (
        <>
          {' '}
          <Link to={to}>{linkText}</Link>
        </>
      )}
    </div>
  );
}

/* ---------- Links ---------- */
export function WeekLink({ week, children }: { week: number; children?: ReactNode }) {
  return (
    <Link to={`/weeks/${week}`} aria-label={children ? undefined : `Week ${week}`}>
      {children ?? `Week ${week}`}
    </Link>
  );
}

/* A "More →" style link with an icon instead of a Unicode arrow. */
export function MoreLink({ to, children, ariaLabel }: { to: string; children: ReactNode; ariaLabel?: string }) {
  return (
    <Link to={to} className="more-link small" aria-label={ariaLabel}>
      {children} <ChevronRight size={14} />
    </Link>
  );
}

/* ---------- Filter group (not real tabs: no panels, so use pressed buttons) ---------- */
export function Tabs<T extends string>({ value, onChange, items, label = 'Filter' }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode }[]; label?: string }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" aria-pressed={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Arrow in prose ---------- */
export function Arrow() {
  return (
    <>
      <span aria-hidden="true">→</span>
      <span className="sr-only">to</span>
    </>
  );
}

/* Roadmap text is Vietnamese; mark it so screen readers switch voice. */
export function Vi({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span lang="vi" className={className}>
      {children}
    </span>
  );
}
