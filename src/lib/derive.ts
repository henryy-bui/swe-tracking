/* Read-only computations over roadmap + persisted data. */
import { PHASES, PROJECTS, TOTAL_WEEKS, phaseById, projectById, weekDef, type ProjectId } from '@/data/roadmap';
import type { AppData, FollowUp, Problem, ProjectMark, ProjectMilestone, ResourceMark } from '@/store/useStore';
import { addDays, clamp, diffDays, today, weekStart } from '@/lib/date';

export type WeekStatus = 'done' | 'in-progress' | 'not-started' | 'skipped';

export interface TaskItem {
  key: string;
  label: string;
  kind: 'task' | 'dsa' | 'custom';
  customId?: string;
}

export const taskKey = (week: number, i: number) => `w${week}-${i}`;
export const dsaKey = (week: number) => `w${week}-dsa`;
export const customKey = (week: number, id: string) => `w${week}-c${id}`;

/* All checkable items of a week, in display order: roadmap tasks, DSA, then the user's own tasks. */
export const taskItems = (data: AppData, week: number): TaskItem[] => {
  const w = weekDef(week);
  const items: TaskItem[] = w.tasks.map((label, i) => ({ key: taskKey(week, i), label, kind: 'task' }));
  items.push({ key: dsaKey(week), label: w.dsa, kind: 'dsa' });
  for (const c of data.customTasks?.[String(week)] ?? []) items.push({ key: customKey(week, c.id), label: c.title, kind: 'custom', customId: c.id });
  return items;
};

export const isDone = (data: AppData, key: string): boolean => !!data.tasks[key]?.done;

export interface Progress {
  done: number;
  total: number;
}

export const weekProgress = (data: AppData, week: number): Progress => {
  const items = taskItems(data, week);
  return { done: items.filter((it) => isDone(data, it.key)).length, total: items.length };
};

export const weekStatus = (data: AppData, week: number): WeekStatus => {
  if (data.weekStatus[String(week)] === 'skipped') return 'skipped';
  const { done, total } = weekProgress(data, week);
  if (done === total) return 'done';
  if (done > 0) return 'in-progress';
  return 'not-started';
};

export interface PhaseProgress extends Progress {
  weeksDone: number;
  weeks: number;
}

export const phaseProgress = (data: AppData, phaseId: number): PhaseProgress => {
  const p = phaseById(phaseId);
  let done = 0, total = 0, weeksDone = 0;
  for (let w = p.weeks[0]; w <= p.weeks[1]; w++) {
    const wp = weekProgress(data, w);
    done += wp.done;
    total += wp.total;
    if (wp.done === wp.total) weeksDone++;
  }
  return { done, total, weeksDone, weeks: p.weeks[1] - p.weeks[0] + 1 };
};

export const overallProgress = (data: AppData): PhaseProgress => {
  let done = 0, total = 0, weeksDone = 0;
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const wp = weekProgress(data, w);
    done += wp.done;
    total += wp.total;
    if (wp.done === wp.total) weeksDone++;
  }
  return { done, total, weeksDone, weeks: TOTAL_WEEKS };
};

/* ---- Calendar mapping ---- */

export interface DateRange {
  start: string;
  end: string;
}

export const weekRange = (data: AppData, week: number): DateRange | null => {
  if (!data.startDate) return null;
  const start = addDays(data.startDate, (week - 1) * 7);
  return { start, end: addDays(start, 6) };
};

export const weekForDate = (data: AppData, date: string): number | null => {
  if (!data.startDate) return null;
  const days = diffDays(data.startDate, date);
  return clamp(Math.floor(days / 7) + 1, 1, TOTAL_WEEKS);
};

export const currentWeek = (data: AppData): number | null => weekForDate(data, today());

export type PlanStatus = 'unset' | 'upcoming' | 'active' | 'finished';

export const planStatus = (data: AppData): PlanStatus => {
  if (!data.startDate) return 'unset';
  const days = diffDays(data.startDate, today());
  if (days < 0) return 'upcoming';
  if (days >= TOTAL_WEEKS * 7) return 'finished';
  return 'active';
};

/* Items expected done by today at a linear pace. Null when the plan is not active. */
export const expectedDone = (data: AppData): number | null => {
  if (planStatus(data) !== 'active') return null;
  const days = diffDays(data.startDate as string, today());
  const cw = Math.floor(days / 7) + 1;
  const frac = ((days % 7) + 1) / 7;
  let expected = 0;
  for (let w = 1; w < cw; w++) expected += weekProgress(data, w).total;
  expected += weekProgress(data, cw).total * frac;
  return Math.round(expected);
};

export type Pace = { kind: 'ahead' | 'behind' | 'on-track'; delta: number } | null;

export const pace = (data: AppData): Pace => {
  const expected = expectedDone(data);
  if (expected === null) return null;
  const delta = overallProgress(data).done - expected;
  if (Math.abs(delta) <= 1) return { kind: 'on-track', delta };
  return { kind: delta > 0 ? 'ahead' : 'behind', delta };
};

/* ---- Study logs ---- */

export const minutesInRange = (data: AppData, from: string, to: string): number =>
  data.logs.filter((l) => l.date >= from && l.date <= to).reduce((s, l) => s + (Number(l.minutes) || 0), 0);

export interface WeekBucket extends DateRange {
  minutes: number;
  current: boolean;
}

/* Last n calendar weeks (Mon-Sun), oldest first, ending with the current week. */
export const minutesByCalendarWeek = (data: AppData, n: number): WeekBucket[] => {
  const thisMonday = weekStart(today());
  const out: WeekBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = addDays(thisMonday, -7 * i);
    const end = addDays(start, 6);
    out.push({ start, end, minutes: minutesInRange(data, start, end), current: i === 0 });
  }
  return out;
};

export const minutesThisWeek = (data: AppData): number => {
  const start = weekStart(today());
  return minutesInRange(data, start, addDays(start, 6));
};

export const minutesForRoadmapWeek = (data: AppData, week: number): number =>
  data.logs.filter((l) => l.week === week).reduce((s, l) => s + (Number(l.minutes) || 0), 0);

export const totalMinutes = (data: AppData): number => data.logs.reduce((s, l) => s + (Number(l.minutes) || 0), 0);

/* Dates with any activity: a log entry, a task completion, a closed follow-up, or a solved problem. */
export const activeDays = (data: AppData): Set<string> => {
  const set = new Set<string>();
  data.logs.forEach((l) => set.add(l.date));
  Object.values(data.tasks).forEach((t) => t.done && t.at && set.add(t.at));
  data.followUps.forEach((f) => f.doneAt && set.add(f.doneAt));
  (data.problems ?? []).forEach((p) => p.solvedAt && set.add(p.solvedAt));
  return set;
};

/* Minutes logged per day. */
export const minutesByDay = (data: AppData): Map<string, number> => {
  const map = new Map<string, number>();
  for (const l of data.logs) map.set(l.date, (map.get(l.date) ?? 0) + (Number(l.minutes) || 0));
  return map;
};

/* ---- DSA problems ---- */

export const isReviewDue = (p: Problem): boolean => p.status === 'solved' && !!p.nextReview && p.nextReview <= today();

export const dueProblems = (data: AppData): Problem[] => (data.problems ?? []).filter(isReviewDue);

export const problemStats = (data: AppData) => {
  const list = data.problems ?? [];
  const solved = list.filter((p) => p.status === 'solved');
  return {
    total: list.length,
    solved: solved.length,
    easy: solved.filter((p) => p.difficulty === 'easy').length,
    medium: solved.filter((p) => p.difficulty === 'medium').length,
    hard: solved.filter((p) => p.difficulty === 'hard').length,
    due: list.filter(isReviewDue).length,
  };
};

/* Consecutive active days ending today, or yesterday so the streak survives until the day ends. */
export const streak = (data: AppData): number => {
  const days = activeDays(data);
  let cursor = today();
  if (!days.has(cursor)) cursor = addDays(cursor, -1);
  let n = 0;
  while (days.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
};

/* ---- Follow-ups ---- */

export const isOverdue = (f: FollowUp): boolean => !f.done && !!f.due && f.due < today();

export const openFollowUps = (data: AppData): FollowUp[] => data.followUps.filter((f) => !f.done);
export const overdueFollowUps = (data: AppData): FollowUp[] => data.followUps.filter(isOverdue);

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export const sortFollowUps = (list: FollowUp[]): FollowUp[] =>
  [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done && b.done) return (b.doneAt ?? '') < (a.doneAt ?? '') ? -1 : 1;
    if (a.due !== b.due) {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due < b.due ? -1 : 1;
    }
    return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
  });

/* ---- Projects & resources ---- */

/* Merges saved project state with the roadmap's default milestones. */
export const projectState = (data: AppData, id: ProjectId): ProjectMark => {
  const def = projectById(id);
  const saved = data.projects[id] ?? {};
  const savedMs = saved.milestones ?? [];
  const base: ProjectMilestone[] = def.milestones.map((title, i) => {
    const found = savedMs.find((m) => m.id === `${id}-m${i}`);
    return { id: `${id}-m${i}`, title, done: !!found?.done, custom: false };
  });
  const custom = savedMs.filter((m) => m.custom);
  return {
    status: saved.status ?? 'not-started',
    repo: saved.repo ?? '',
    note: saved.note ?? '',
    milestones: [...base, ...custom],
  };
};

export const projectProgress = (data: AppData, id: ProjectId): Progress => {
  const ms = projectState(data, id).milestones;
  return { done: ms.filter((m) => m.done).length, total: ms.length };
};

export const resourceState = (data: AppData, id: string): ResourceMark => {
  const saved = data.resources[id] ?? {};
  return { status: saved.status ?? 'todo', progress: Number(saved.progress) || 0, note: saved.note ?? '' };
};

export { PHASES, PROJECTS, TOTAL_WEEKS };
