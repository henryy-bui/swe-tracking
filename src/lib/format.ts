/* Small formatting and value helpers with no DOM dependency. */

export const uid = (): string => Math.random().toString(36).slice(2, 8) + Date.now().toString(36);

export const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

export const pct = (a: number, b: number): number => (b ? Math.round((a / b) * 100) : 0);

/* 90 -> "1.5h", 30 -> "0.5h", 120 -> "2h" */
export const fmtHours = (minutes: number): string => `${Math.round((minutes / 60) * 10) / 10}h`;

/* 90 -> "1h 30m", 45 -> "45m" */
export const fmtDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const fmtKB = (bytes: number): string => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

export const plural = (n: number, one: string, many?: string): string => `${n} ${n === 1 ? one : many ?? one + 's'}`;
