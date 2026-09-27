import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PROJECTS, type ProjectId } from '@/data/roadmap';
import { addDays, isValidISODate, today } from '@/lib/date';
import { uid } from '@/lib/format';
import { customKey, milestoneIndex } from '@/lib/keys';

/* ---------- Persisted data types ---------- */

export interface TaskMark {
  done: boolean;
  at: string; // completion date, YYYY-MM-DD
}

export type LogTag = 'study' | 'dsa' | 'project' | 'reading';
export const LOG_TAGS: LogTag[] = ['study', 'dsa', 'project', 'reading'];

export interface LogEntry {
  id: string;
  date: string;
  minutes: number;
  week?: number;
  tag: LogTag;
  note: string;
  createdAt: string;
}

export type Priority = 'low' | 'medium' | 'high';
export const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export interface FollowUp {
  id: string;
  title: string;
  note: string;
  due?: string;
  week?: number;
  priority: Priority;
  done: boolean;
  createdAt: string;
  doneAt?: string;
}

export type ResourceStatus = 'not-started' | 'in-progress' | 'done';
export interface ResourceMark {
  status: ResourceStatus;
  progress: number; // 0-100
  note: string;
}

export type ProjectStatus = 'not-started' | 'in-progress' | 'done';
export interface ProjectMilestone {
  id: string;
  title: string;
  done: boolean;
  custom: boolean;
}
export interface ProjectMark {
  status: ProjectStatus;
  repo: string;
  note: string;
  milestones: ProjectMilestone[];
}

export interface CustomTask {
  id: string;
  title: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export interface Problem {
  id: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  topic: string;
  week?: number;
  status: 'todo' | 'solved';
  solvedAt?: string;
  reviewCount: number;
  nextReview?: string; // spaced-repetition due date
  note: string;
  createdAt: string;
}

/* Days until the next review after each successful review: 1, 3, 7, 14, 30, then 30 again. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export interface Retro {
  rating: number; // 1-5, 0 = unset
  wentWell: string;
  improve: string;
  plan?: string; // intention for the following week, shown on that week's page and on Today
  at: string;
}

export interface AppData {
  version: number;
  updatedAt: string | null; // ISO timestamp of the last local change; drives cloud sync
  startDate: string | null;
  weeklyTargetHours: number;
  tasks: Record<string, TaskMark>;
  customTasks: Record<string, CustomTask[]>; // by week
  weekNotes: Record<string, string>;
  weekStatus: Record<string, 'skipped'>;
  retros: Record<string, Retro>; // by week
  logs: LogEntry[];
  followUps: FollowUp[];
  problems: Problem[];
  resources: Record<string, Partial<ResourceMark>>;
  projects: Record<string, Partial<ProjectMark>>;
}

export const STORAGE_KEY = 'swe-tracking:v1';
export const DATA_VERSION = 2; // v2: resource status 'todo' became 'not-started'

export const defaultData = (): AppData => ({
  version: DATA_VERSION,
  updatedAt: null,
  startDate: null,
  weeklyTargetHours: 10,
  tasks: {},
  customTasks: {},
  weekNotes: {},
  weekStatus: {},
  retros: {},
  logs: [],
  followUps: [],
  problems: [],
  resources: {},
  projects: {},
});

const DATA_KEYS = Object.keys(defaultData()) as (keyof AppData)[];

export const pickData = (s: AppData): AppData => {
  const out: Record<string, unknown> = {};
  for (const k of DATA_KEYS) out[k] = s[k];
  return out as unknown as AppData;
};

/* Brings any older document (persisted, imported, or from the cloud) up to the current shape. */
export const migrateData = (input: Partial<AppData>): AppData => {
  const d: AppData = { ...defaultData(), ...input, version: DATA_VERSION };
  const resources: AppData['resources'] = {};
  for (const [id, r] of Object.entries(d.resources ?? {})) {
    const status = (r.status as string | undefined) === 'todo' ? 'not-started' : r.status;
    resources[id] = { ...r, status };
  }
  d.resources = resources;
  return d;
};

/* Loose validation of an imported document. Returns an error message or null. */
export const validateImport = (obj: unknown): string | null => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return 'File is not a JSON object.';
  const o = obj as Record<string, unknown>;
  if (typeof o.version === 'number' && o.version > DATA_VERSION) {
    return `File version ${o.version} is newer than this app (version ${DATA_VERSION}).`;
  }
  if (o.startDate !== undefined && o.startDate !== null && !isValidISODate(o.startDate)) return 'startDate is not a valid date.';
  for (const k of ['logs', 'followUps', 'problems'] as const) {
    if (o[k] !== undefined && !Array.isArray(o[k])) return `Field "${k}" must be an array.`;
  }
  for (const k of ['tasks', 'customTasks', 'weekNotes', 'weekStatus', 'retros', 'resources', 'projects'] as const) {
    if (o[k] !== undefined && (typeof o[k] !== 'object' || o[k] === null || Array.isArray(o[k]))) return `Field "${k}" must be an object.`;
  }
  const known = DATA_KEYS.some((k) => k in o && k !== 'version' && k !== 'updatedAt');
  if (!known) return 'File does not look like a SWE Tracker export.';
  return null;
};

/* ---------- Actions ---------- */

export interface Actions {
  setStartDate: (d: string | null) => void;
  setWeeklyTarget: (hours: number) => void;

  setTask: (key: string, done: boolean) => void;
  setWeekTasks: (week: number, keys: string[], done: boolean) => void;
  setWeekNote: (week: number, text: string) => void;
  toggleSkipWeek: (week: number) => void;
  addCustomTask: (week: number, title: string) => void;
  deleteCustomTask: (week: number, id: string) => void;
  setRetro: (week: number, patch: Partial<Omit<Retro, 'at'>>) => void;

  addProblem: (p: Omit<Problem, 'id' | 'createdAt' | 'status' | 'reviewCount'>) => void;
  addProblems: (list: Omit<Problem, 'id' | 'createdAt' | 'status' | 'reviewCount'>[]) => void;

  /* Put back something that was just deleted (Undo). */
  restoreLog: (entry: LogEntry) => void;
  restoreFollowUp: (f: FollowUp) => void;
  restoreProblem: (p: Problem) => void;
  restoreCustomTask: (week: number, task: CustomTask, mark?: TaskMark) => void;
  restoreMilestone: (projectId: ProjectId, m: ProjectMilestone) => void;
  updateProblem: (id: string, patch: Partial<Omit<Problem, 'id'>>) => void;
  deleteProblem: (id: string) => void;
  markProblemSolved: (id: string) => void;
  markProblemReviewed: (id: string) => void;
  resetProblem: (id: string) => void;

  addLog: (entry: Omit<LogEntry, 'id' | 'createdAt'>) => void;
  deleteLog: (id: string) => void;

  addFollowUp: (f: Omit<FollowUp, 'id' | 'createdAt' | 'done' | 'doneAt'>) => void;
  updateFollowUp: (id: string, patch: Partial<Omit<FollowUp, 'id'>>) => void;
  toggleFollowUp: (id: string) => void;
  snoozeFollowUp: (id: string, days: number) => void;
  deleteFollowUp: (id: string) => void;

  setResource: (id: string, patch: Partial<ResourceMark>) => void;

  setProject: (id: ProjectId, patch: Partial<Omit<ProjectMark, 'milestones'>>) => void;
  toggleMilestone: (projectId: ProjectId, milestoneId: string) => void;
  addMilestone: (projectId: ProjectId, title: string) => void;
  deleteMilestone: (projectId: ProjectId, milestoneId: string) => void;

  importData: (data: Partial<AppData>) => void;
  resetData: () => void;

  /* Replace local data with a document from the cloud. Keeps its timestamp so it is not pushed back. */
  applyRemote: (data: Partial<AppData>, updatedAt: string) => void;
}

export type StoreState = AppData & Actions;

type Partial_ = Partial<StoreState> | ((s: StoreState) => Partial<StoreState>);

export const useStore = create<StoreState>()(
  persist(
    (rawSet) => {
      /* Every user-driven change stamps updatedAt, which the sync layer watches. */
      const set = (partial: Partial_) =>
        rawSet((s) => ({ ...(typeof partial === 'function' ? partial(s) : partial), updatedAt: new Date().toISOString() }));

      return {
        ...defaultData(),

        setStartDate: (startDate) => set({ startDate }),
        setWeeklyTarget: (weeklyTargetHours) => set({ weeklyTargetHours: Math.max(0, weeklyTargetHours) }),

        setTask: (key, done) =>
          set((s) => {
            const tasks = { ...s.tasks };
            if (done) tasks[key] = { done: true, at: today() };
            else delete tasks[key];
            return { tasks };
          }),

        setWeekTasks: (week, keys, done) =>
          set((s) => {
            const tasks = { ...s.tasks };
            for (const key of keys) {
              if (done) tasks[key] = tasks[key]?.done ? tasks[key] : { done: true, at: today() };
              else delete tasks[key];
            }
            const weekStatus = { ...s.weekStatus };
            if (done) delete weekStatus[String(week)];
            return { tasks, weekStatus };
          }),

        setWeekNote: (week, text) =>
          set((s) => {
            const weekNotes = { ...s.weekNotes };
            if (text.trim()) weekNotes[String(week)] = text;
            else delete weekNotes[String(week)];
            return { weekNotes };
          }),

        toggleSkipWeek: (week) =>
          set((s) => {
            const weekStatus = { ...s.weekStatus };
            const k = String(week);
            if (weekStatus[k] === 'skipped') delete weekStatus[k];
            else weekStatus[k] = 'skipped';
            return { weekStatus };
          }),

        addCustomTask: (week, title) =>
          set((s) => ({
            customTasks: { ...s.customTasks, [String(week)]: [...(s.customTasks[String(week)] ?? []), { id: uid(), title }] },
          })),
        deleteCustomTask: (week, id) =>
          set((s) => {
            const tasks = { ...s.tasks };
            delete tasks[customKey(week, id)];
            const list = (s.customTasks[String(week)] ?? []).filter((t) => t.id !== id);
            const customTasks = { ...s.customTasks };
            if (list.length) customTasks[String(week)] = list;
            else delete customTasks[String(week)];
            return { tasks, customTasks };
          }),
        setRetro: (week, patch) =>
          set((s) => {
            const prev = s.retros[String(week)] ?? { rating: 0, wentWell: '', improve: '', at: today() };
            return { retros: { ...s.retros, [String(week)]: { ...prev, ...patch, at: today() } } };
          }),

        addProblem: (p) =>
          set((s) => ({ problems: [{ ...p, id: uid(), status: 'todo', reviewCount: 0, createdAt: new Date().toISOString() }, ...s.problems] })),
        addProblems: (list) =>
          set((s) => ({
            problems: [...list.map((p, i) => ({ ...p, id: uid() + i.toString(36), status: 'todo' as const, reviewCount: 0, createdAt: new Date().toISOString() })), ...s.problems],
          })),

        restoreLog: (entry) => set((s) => ({ logs: [entry, ...s.logs.filter((l) => l.id !== entry.id)] })),
        restoreFollowUp: (f) => set((s) => ({ followUps: [f, ...s.followUps.filter((x) => x.id !== f.id)] })),
        restoreProblem: (p) => set((s) => ({ problems: [p, ...s.problems.filter((x) => x.id !== p.id)] })),
        restoreCustomTask: (week, task, mark) =>
          set((s) => {
            const list = [...(s.customTasks[String(week)] ?? []).filter((t) => t.id !== task.id), task];
            const tasks = { ...s.tasks };
            if (mark) tasks[customKey(week, task.id)] = mark;
            return { customTasks: { ...s.customTasks, [String(week)]: list }, tasks };
          }),
        restoreMilestone: (projectId, m) =>
          set((s) => {
            const saved = s.projects[projectId] ?? {};
            const list = [...(saved.milestones ?? []).filter((x) => x.id !== m.id), m];
            return { projects: { ...s.projects, [projectId]: { ...saved, milestones: list } } };
          }),
        updateProblem: (id, patch) => set((s) => ({ problems: s.problems.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
        deleteProblem: (id) => set((s) => ({ problems: s.problems.filter((p) => p.id !== id) })),
        markProblemSolved: (id) =>
          set((s) => ({
            problems: s.problems.map((p) =>
              p.id === id ? { ...p, status: 'solved', solvedAt: today(), reviewCount: 0, nextReview: addDays(today(), REVIEW_INTERVALS[0]) } : p,
            ),
          })),
        markProblemReviewed: (id) =>
          set((s) => ({
            problems: s.problems.map((p) => {
              if (p.id !== id) return p;
              const count = p.reviewCount + 1;
              const days = REVIEW_INTERVALS[Math.min(count, REVIEW_INTERVALS.length - 1)];
              return { ...p, reviewCount: count, nextReview: addDays(today(), days) };
            }),
          })),
        resetProblem: (id) =>
          set((s) => ({
            problems: s.problems.map((p) => (p.id === id ? { ...p, status: 'todo', solvedAt: undefined, reviewCount: 0, nextReview: undefined } : p)),
          })),

        addLog: (entry) => set((s) => ({ logs: [{ ...entry, id: uid(), createdAt: new Date().toISOString() }, ...s.logs] })),
        deleteLog: (id) => set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),

        addFollowUp: (f) =>
          set((s) => ({
            followUps: [{ ...f, id: uid(), done: false, createdAt: new Date().toISOString() }, ...s.followUps],
          })),
        updateFollowUp: (id, patch) => set((s) => ({ followUps: s.followUps.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
        toggleFollowUp: (id) =>
          set((s) => ({
            followUps: s.followUps.map((f) => (f.id === id ? { ...f, done: !f.done, doneAt: f.done ? undefined : today() } : f)),
          })),
        snoozeFollowUp: (id, days) =>
          set((s) => ({
            followUps: s.followUps.map((f) => {
              if (f.id !== id) return f;
              const base = f.due && f.due > today() ? f.due : today();
              return { ...f, due: addDays(base, days) };
            }),
          })),
        deleteFollowUp: (id) => set((s) => ({ followUps: s.followUps.filter((f) => f.id !== id) })),

        setResource: (id, patch) => set((s) => ({ resources: { ...s.resources, [id]: { ...(s.resources[id] ?? {}), ...patch } } })),

        setProject: (id, patch) => set((s) => ({ projects: { ...s.projects, [id]: { ...(s.projects[id] ?? {}), ...patch } } })),

        toggleMilestone: (projectId, milestoneId) =>
          set((s) => {
            const saved = s.projects[projectId] ?? {};
            const list = [...(saved.milestones ?? [])];
            const idx = list.findIndex((m) => m.id === milestoneId);
            if (idx >= 0) {
              list[idx] = { ...list[idx], done: !list[idx].done };
            } else {
              // Default milestone from the roadmap, first time it is touched.
              const def = PROJECTS.find((p) => p.id === projectId);
              const title = def?.milestones[milestoneIndex(projectId, milestoneId)] ?? milestoneId;
              list.push({ id: milestoneId, title, done: true, custom: false });
            }
            return { projects: { ...s.projects, [projectId]: { ...saved, milestones: list } } };
          }),

        addMilestone: (projectId, title) =>
          set((s) => {
            const saved = s.projects[projectId] ?? {};
            const list = [...(saved.milestones ?? []), { id: `${projectId}-c${uid()}`, title, done: false, custom: true }];
            return { projects: { ...s.projects, [projectId]: { ...saved, milestones: list } } };
          }),

        deleteMilestone: (projectId, milestoneId) =>
          set((s) => {
            const saved = s.projects[projectId] ?? {};
            const list = (saved.milestones ?? []).filter((m) => m.id !== milestoneId);
            return { projects: { ...s.projects, [projectId]: { ...saved, milestones: list } } };
          }),

        importData: (data) => set(pickData(migrateData(data))),
        resetData: () => set(defaultData()),

        applyRemote: (data, updatedAt) => rawSet({ ...pickData(migrateData(data)), updatedAt }),
      };
    },
    {
      name: STORAGE_KEY,
      version: DATA_VERSION,
      partialize: (s) => pickData(s),
      migrate: (persisted) => migrateData(persisted as Partial<AppData>),
    },
  ),
);

/* Serialised export of the current data. */
export const exportJSON = (): string => JSON.stringify(pickData(useStore.getState()), null, 2);
