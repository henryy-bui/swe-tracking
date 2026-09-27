/* Milestones derived from the data. Nothing is stored; they recompute on every render. */
import { PHASES, PROJECTS, TOTAL_WEEKS } from '@/data/roadmap';
import type { AppData } from '@/store/useStore';
import { activeDays, overallProgress, phaseProgress, projectState, streak, totalMinutes, weekProgress } from '@/lib/derive';
import { addDays, today } from '@/lib/date';

export type AchievementGroup = 'progress' | 'consistency' | 'hours' | 'dsa' | 'projects' | 'habits';

export interface Achievement {
  id: string;
  group: AchievementGroup;
  title: string;
  description: string;
  value: number; // current
  target: number;
  unlocked: boolean;
  progress: number; // 0..1
  detail: string; // "3 / 7 days"
}

export const GROUP_LABEL: Record<AchievementGroup, string> = {
  progress: 'Roadmap progress',
  consistency: 'Consistency',
  hours: 'Hours of practice',
  dsa: 'DSA',
  projects: 'Side projects',
  habits: 'Habits',
};

/* Longest run of consecutive active days ever, not just the current one. */
const bestStreak = (data: AppData): number => {
  const days = [...activeDays(data)].sort();
  let best = 0, run = 0, prev: string | null = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
};

const make = (a: Omit<Achievement, 'unlocked' | 'progress' | 'detail'> & { unit?: string; format?: (v: number) => string }): Achievement => {
  const fmt = a.format ?? ((v: number) => `${Math.round(v)}${a.unit ?? ''}`);
  const progress = Math.min(1, a.target > 0 ? a.value / a.target : 0);
  return { ...a, unlocked: a.value >= a.target, progress, detail: `${fmt(Math.min(a.value, a.target))} / ${fmt(a.target)}` };
};

export const achievements = (data: AppData): Achievement[] => {
  const overall = overallProgress(data);
  const hours = totalMinutes(data) / 60;
  const problems = data.problems ?? [];
  const solved = problems.filter((p) => p.status === 'solved').length;
  const reviews = problems.reduce((s, p) => s + p.reviewCount, 0);
  const hardSolved = problems.filter((p) => p.status === 'solved' && p.difficulty === 'hard').length;
  const retros = Object.values(data.retros ?? {}).filter((r) => r.rating > 0 || r.wentWell || r.improve).length;
  const closedFollowUps = data.followUps.filter((f) => f.done).length;
  const best = Math.max(bestStreak(data), streak(data));
  const sessions = data.logs.length;
  const longSessions = data.logs.filter((l) => l.minutes >= 120).length;
  const weeksWithTime = new Set(data.logs.map((l) => l.week).filter(Boolean)).size;
  const doneToday = Object.values(data.tasks).filter((t) => t.done && t.at === today()).length;

  const list: Achievement[] = [
    make({ id: 'first-task', group: 'progress', title: 'First step', description: 'Tick off your first item.', value: overall.done, target: 1 }),
    make({ id: 'week-1', group: 'progress', title: 'Week one down', description: 'Complete every item in week 1.', value: weeksDone(data, 1, 1), target: 1 }),
    ...PHASES.map((p) =>
      make({
        id: `phase-${p.id}`,
        group: 'progress',
        title: `Phase ${p.id} complete`,
        description: p.title,
        value: phaseProgress(data, p.id).weeksDone,
        target: p.weeks[1] - p.weeks[0] + 1,
        unit: ' wks',
      }),
    ),
    make({ id: 'halfway', group: 'progress', title: 'Halfway there', description: 'Complete half of all roadmap items.', value: overall.done, target: Math.ceil(overall.total / 2) }),
    make({ id: 'roadmap', group: 'progress', title: 'Roadmap complete', description: `All ${TOTAL_WEEKS} weeks done.`, value: overall.weeksDone, target: TOTAL_WEEKS, unit: ' wks' }),

    ...[3, 7, 14, 30, 60].map((n) =>
      make({ id: `streak-${n}`, group: 'consistency', title: `${n}-day streak`, description: `Be active ${n} days in a row.`, value: best, target: n, unit: ' d' }),
    ),
    make({ id: 'today-3', group: 'consistency', title: 'Productive day', description: 'Tick three items in one day.', value: doneToday, target: 3 }),

    ...[10, 50, 100, 250, 500].map((n) =>
      make({ id: `hours-${n}`, group: 'hours', title: `${n} hours`, description: `Log ${n} hours of study.`, value: hours, target: n, unit: 'h', format: (v) => `${Math.round(v * 10) / 10}h` }),
    ),
    make({ id: 'sessions-50', group: 'hours', title: 'Fifty sessions', description: 'Log 50 study sessions.', value: sessions, target: 50 }),
    make({ id: 'deep-work', group: 'hours', title: 'Deep work', description: 'Log a session of two hours or more.', value: longSessions, target: 1 }),
    make({ id: 'weeks-10', group: 'hours', title: 'Ten weeks of time', description: 'Log time against ten different roadmap weeks.', value: weeksWithTime, target: 10 }),

    ...[10, 50, 150].map((n) =>
      make({ id: `solved-${n}`, group: 'dsa', title: n === 150 ? 'NeetCode 150' : `${n} problems solved`, description: `Solve ${n} DSA problems.`, value: solved, target: n }),
    ),
    make({ id: 'hard-5', group: 'dsa', title: 'Hard mode', description: 'Solve five hard problems.', value: hardSolved, target: 5 }),
    make({ id: 'reviews-25', group: 'dsa', title: 'Spaced out', description: 'Complete 25 scheduled reviews.', value: reviews, target: 25 }),

    ...PROJECTS.map((p) =>
      make({
        id: `project-${p.id}`,
        group: 'projects',
        title: `Shipped: ${p.title}`,
        description: p.tag,
        value: projectState(data, p.id).status === 'done' ? 1 : projectState(data, p.id).milestones.filter((m) => m.done).length / Math.max(1, projectState(data, p.id).milestones.length),
        target: 1,
        format: (v) => `${Math.round(v * 100)}%`,
      }),
    ),

    make({ id: 'retro-4', group: 'habits', title: 'Reflective', description: 'Write four weekly retrospectives.', value: retros, target: 4 }),
    make({ id: 'retro-12', group: 'habits', title: 'Quarter of reflection', description: 'Write twelve weekly retrospectives.', value: retros, target: 12 }),
    make({ id: 'followups-10', group: 'habits', title: 'Follow-through', description: 'Close ten follow-ups.', value: closedFollowUps, target: 10 }),
  ];
  return list;
};

const weeksDone = (data: AppData, from: number, to: number): number => {
  let done = 0;
  for (let w = from; w <= to; w++) {
    const wp = weekProgress(data, w);
    if (wp.done === wp.total) done++;
  }
  return done;
};

export const unlockedCount = (list: Achievement[]) => list.filter((a) => a.unlocked).length;

/* The closest locked milestones, for the Overview card. */
export const nextUp = (list: Achievement[], n = 3): Achievement[] =>
  list
    .filter((a) => !a.unlocked && a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, n);
