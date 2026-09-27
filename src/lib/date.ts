/* ISO date (YYYY-MM-DD) helpers. All dates are local-time calendar days. */

const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = (): string => toISODate(new Date());

export const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number): string => {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

/* Whole days from `from` to `to` (positive when `to` is later). */
export const diffDays = (from: string, to: string): number =>
  Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);

/* Monday of the calendar week containing the date. */
export const weekStart = (s: string): string => {
  const d = parseDate(s);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return toISODate(d);
};

export const fmtDate = (s: string | undefined | null, opts?: Intl.DateTimeFormatOptions): string =>
  s ? parseDate(s).toLocaleDateString('en-GB', opts ?? { day: 'numeric', month: 'short' }) : '';

export const fmtDateLong = (s: string | undefined | null): string =>
  fmtDate(s, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const relDay = (s: string): string => {
  const n = diffDays(today(), s);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
};

export const isValidISODate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseDate(s).getTime());

/* ---- misc small helpers ---- */

export const uid = (): string => Math.random().toString(36).slice(2, 8) + Date.now().toString(36);

export const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

export const pct = (a: number, b: number): number => (b ? Math.round((a / b) * 100) : 0);

/* 90 -> "1.5h", 30 -> "0.5h", 120 -> "2h" */
export const fmtHours = (minutes: number): string => {
  const h = Math.round((minutes / 60) * 10) / 10;
  return `${h}h`;
};

export const plural = (n: number, one: string, many?: string): string => `${n} ${n === 1 ? one : many ?? one + 's'}`;

export const downloadText = (filename: string, text: string, type = 'application/json'): void => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
