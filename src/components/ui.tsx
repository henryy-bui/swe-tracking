import { create } from 'zustand';
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { pct } from '@/lib/date';
import type { WeekStatus } from '@/lib/derive';
import { Check, Circle, CircleDot, Minus } from '@/components/icons';

/* ---------- Toast ---------- */
interface ToastState {
  message: string | null;
  show: (m: string) => void;
  clear: () => void;
}
const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  clear: () => set({ message: null }),
}));

export const toast = (message: string) => useToastStore.getState().show(message);

export function Toast() {
  const message = useToastStore((s) => s.message);
  const clear = useToastStore((s) => s.clear);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 2400);
    return () => clearTimeout(t);
  }, [message, clear]);
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

/* ---------- Page header ---------- */
export function PageHead({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

/* ---------- Progress ---------- */
export function ProgressBar({ done, total, good, thin, label }: { done: number; total: number; good?: boolean; thin?: boolean; label?: string }) {
  const p = pct(done, total);
  return (
    <div
      className={`bar${good || p === 100 ? ' good' : ''}${thin ? ' thin' : ''}`}
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${done} of ${total} done`}
    >
      <span style={{ width: `${p}%` }} />
    </div>
  );
}

export function ProgressLine({ title, done, total, right }: { title: ReactNode; done: number; total: number; right?: ReactNode }) {
  return (
    <div className="progress-line">
      <div>{title}</div>
      <div className="small muted tabular nowrap">
        {right ?? (
          <>
            {done}/{total} · {pct(done, total)}%
          </>
        )}
      </div>
      <ProgressBar done={done} total={total} />
    </div>
  );
}

/* ---------- Stat tile ---------- */
export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

/* ---------- Status pill ---------- */
const STATUS_LABEL: Record<WeekStatus, string> = {
  done: 'Done',
  'in-progress': 'In progress',
  'not-started': 'Not started',
  skipped: 'Skipped',
};
const STATUS_ICON = {
  done: Check,
  'in-progress': CircleDot,
  'not-started': Circle,
  skipped: Minus,
} as const;

export function StatusPill({ status }: { status: WeekStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`pill ${status}`}>
      <Icon size={13} /> {STATUS_LABEL[status]}
    </span>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

/* ---------- Week link ---------- */
export function WeekLink({ week, children }: { week: number; children?: ReactNode }) {
  return <Link to={`/weeks/${week}`}>{children ?? `Week ${week}`}</Link>;
}

/* ---------- Tabs ---------- */
export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode }[] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((it) => (
        <button key={it.id} role="tab" type="button" aria-selected={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}
