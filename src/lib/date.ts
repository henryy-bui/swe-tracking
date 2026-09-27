/* ISO date (YYYY-MM-DD) helpers. All dates are local-time calendar days; display uses en-GB. */

const pad = (n: number) => String(n).padStart(2, '0');
const LOCALE = 'en-GB';

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

export const isValidISODate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseDate(s).getTime());

/* ---- Display formats (one name per shape, so pages never pass Intl options ad hoc) ---- */

type D = string | null | undefined;

/* "4 Oct" */
export const fmtDate = (s: D): string => (s ? parseDate(s).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }) : '');

/* "4 October 2026" */
export const fmtDateFull = (s: D): string => (s ? parseDate(s).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' }) : '');

/* "Sun, 4 Oct 2026" */
export const fmtDateLong = (s: D): string =>
  s ? parseDate(s).toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';

/* "Sunday, 4 October 2026" */
export const fmtDateWeekday = (s: D): string =>
  s ? parseDate(s).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

/* "4 Oct 2026, 14:05" from an ISO timestamp */
export const fmtDateTime = (iso: D): string =>
  iso ? new Date(iso).toLocaleString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

/* "4 Oct – 10 Oct" (or with years when `long`) */
export const fmtRange = (range: { start: string; end: string } | null | undefined, long = false): string => {
  if (!range) return '';
  const f = long ? fmtDateLong : fmtDate;
  return `${f(range.start)} – ${f(range.end)}`;
};

export const relDay = (s: string): string => {
  const n = diffDays(today(), s);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
};
