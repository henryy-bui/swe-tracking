/* Human-readable labels for every enumerated value. UI, reports, and search all read from here,
   so a term changes in one place. See the vocabulary table in DESIGN.md. */
import type { Difficulty, LogTag, Priority } from '@/store/useStore';

export type Status = 'not-started' | 'in-progress' | 'done' | 'skipped' | 'blocked';

export const STATUS_LABEL: Record<Status, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done',
  skipped: 'Skipped',
  blocked: 'Blocked',
};

export const LOG_TAG_LABEL: Record<LogTag, string> = {
  study: 'Study',
  dsa: 'DSA',
  project: 'Project',
  reading: 'Reading',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/* Index = rating 1-5; index 0 is "unset". */
export const RATING_LABEL = ['Not rated', 'Rough', 'Below par', 'Okay', 'Good', 'Excellent'];

/* Words used consistently across the app. */
export const TERMS = {
  task: 'task',
  tasks: 'tasks',
  session: 'session',
  sessions: 'sessions',
  yours: 'Yours', // tag on a task the user added
  roadmapWeek: 'Roadmap week',
  achievements: 'Achievements',
  requirement: 'Engineering requirements',
  deliverable: 'Deliverables',
  reading: 'Reading this week',
} as const;
