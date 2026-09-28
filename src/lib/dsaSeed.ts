/* Turns the roadmap's named NeetCode problems into trackable Problem rows, without duplicates. */
import { TOTAL_WEEKS, weekDef } from '@/data/roadmap';
import { problemKey } from '@/data/dsa';
import { useStore, type AppData, type Problem } from '@/store/useStore';

export interface SeedCandidate {
  title: string;
  week: number;
  topic: string;
}

export type SeedState = 'missing' | 'todo' | 'solved';

/* The saved problem that matches a roadmap problem title within a week, if any. */
export const findSeeded = (data: AppData, week: number, title: string): Problem | undefined => {
  const key = problemKey(title);
  return data.problems.find((p) => p.week === week && problemKey(p.title) === key);
};

export const seedState = (data: AppData, week: number, title: string): SeedState => {
  const p = findSeeded(data, week, title);
  return p ? (p.status === 'solved' ? 'solved' : 'todo') : 'missing';
};

/* This week's roadmap problems that are not in the DSA list yet. */
export const seedCandidates = (data: AppData, week: number): SeedCandidate[] => {
  const def = weekDef(week);
  return def.dsa.problems.filter((title) => !findSeeded(data, week, title)).map((title) => ({ title, week, topic: def.dsa.pattern }));
};

export const allSeedCandidates = (data: AppData): SeedCandidate[] => {
  const out: SeedCandidate[] = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) out.push(...seedCandidates(data, w));
  return out;
};

/* Adds the candidates as to-do problems (medium by default; the sheet has no difficulty). Returns how many were added. */
export const seedProblems = (candidates: SeedCandidate[]): number => {
  if (candidates.length === 0) return 0;
  useStore.getState().addProblems(candidates.map((c) => ({ title: c.title, url: '', difficulty: 'medium' as const, topic: c.topic, week: c.week, note: '' })));
  return candidates.length;
};
