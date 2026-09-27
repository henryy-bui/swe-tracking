/* Global search over roadmap content and the user's own data. Pure: build an index, then query it. */
import { PHASES, PROJECTS, RESOURCES, WEEKS } from '@/data/roadmap';
import type { AppData } from '@/store/useStore';
import { weekStatus } from '@/lib/derive';

export type SearchKind = 'page' | 'week' | 'task' | 'note' | 'followup' | 'problem' | 'project' | 'resource' | 'action';

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  to?: string; // route to navigate to
  action?: string; // action id handled by the caller
  keywords: string; // lowercased haystack
}

export const KIND_LABEL: Record<SearchKind, string> = {
  page: 'Pages',
  action: 'Actions',
  week: 'Weeks',
  task: 'Tasks',
  note: 'Notes',
  followup: 'Follow-ups',
  problem: 'DSA problems',
  project: 'Side projects',
  resource: 'Resources',
};

const KIND_ORDER: SearchKind[] = ['action', 'page', 'week', 'task', 'followup', 'problem', 'project', 'resource', 'note'];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const PAGES: { to: string; title: string; keywords: string }[] = [
  { to: '/', title: 'Overview', keywords: 'overview dashboard home' },
  { to: '/weeks', title: 'Weekly checklist', keywords: 'weeks checklist plan' },
  { to: '/log', title: 'Study log', keywords: 'log hours sessions time' },
  { to: '/followups', title: 'Follow-ups', keywords: 'follow up todo reminders questions' },
  { to: '/dsa', title: 'DSA problems', keywords: 'dsa leetcode neetcode problems algorithms' },
  { to: '/projects', title: 'Side projects', keywords: 'projects portfolio' },
  { to: '/resources', title: 'Resources', keywords: 'books courses reading boot.dev' },
  { to: '/milestones', title: 'Milestones', keywords: 'achievements badges streak' },
  { to: '/settings', title: 'Settings', keywords: 'settings sync export import theme' },
];

export const ACTIONS: { id: string; title: string; keywords: string }[] = [
  { id: 'timer', title: 'Start / stop focus timer', keywords: 'timer pomodoro focus start stop' },
  { id: 'theme', title: 'Switch theme', keywords: 'theme dark light mode' },
  { id: 'today', title: 'Go to the current week', keywords: 'today current week now' },
  { id: 'export', title: 'Export backup (JSON)', keywords: 'export backup download json' },
];

export const buildIndex = (data: AppData): SearchItem[] => {
  const items: SearchItem[] = [];
  for (const a of ACTIONS) items.push({ id: `action:${a.id}`, kind: 'action', title: a.title, action: a.id, keywords: norm(`${a.title} ${a.keywords}`) });
  for (const p of PAGES) items.push({ id: `page:${p.to}`, kind: 'page', title: p.title, to: p.to, keywords: norm(`${p.title} ${p.keywords}`) });

  for (const w of WEEKS) {
    const phase = PHASES.find((p) => p.id === w.phase)!;
    const st = weekStatus(data, w.week);
    items.push({
      id: `week:${w.week}`,
      kind: 'week',
      title: `Week ${w.week} · ${w.topic}`,
      subtitle: `Phase ${phase.id} · ${st.replace('-', ' ')}`,
      to: `/weeks/${w.week}`,
      keywords: norm(`week ${w.week} ${w.topic} ${w.dsa} phase ${phase.id} ${phase.title}`),
    });
    w.tasks.forEach((t, i) =>
      items.push({ id: `task:${w.week}:${i}`, kind: 'task', title: t, subtitle: `Week ${w.week} · ${w.topic}`, to: `/weeks/${w.week}`, keywords: norm(`${t} week ${w.week}`) }),
    );
    items.push({ id: `task:${w.week}:dsa`, kind: 'task', title: `DSA: ${w.dsa}`, subtitle: `Week ${w.week}`, to: `/weeks/${w.week}`, keywords: norm(`dsa ${w.dsa} week ${w.week}`) });
    for (const c of data.customTasks?.[String(w.week)] ?? []) {
      items.push({ id: `task:${w.week}:c${c.id}`, kind: 'task', title: c.title, subtitle: `Week ${w.week} · your task`, to: `/weeks/${w.week}`, keywords: norm(`${c.title} week ${w.week}`) });
    }
    const note = data.weekNotes[String(w.week)];
    if (note) items.push({ id: `note:${w.week}`, kind: 'note', title: note.slice(0, 90).replace(/\s+/g, ' '), subtitle: `Notes · Week ${w.week}`, to: `/weeks/${w.week}`, keywords: norm(note) });
    const retro = data.retros?.[String(w.week)];
    if (retro && (retro.wentWell || retro.improve)) {
      items.push({ id: `retro:${w.week}`, kind: 'note', title: `Retro: ${(retro.wentWell || retro.improve).slice(0, 80)}`, subtitle: `Retrospective · Week ${w.week}`, to: `/weeks/${w.week}`, keywords: norm(`${retro.wentWell} ${retro.improve} retro`) });
    }
  }

  for (const f of data.followUps) {
    items.push({
      id: `fu:${f.id}`,
      kind: 'followup',
      title: f.title,
      subtitle: `${f.done ? 'Done' : 'Open'}${f.due ? ` · due ${f.due}` : ''}${f.week ? ` · week ${f.week}` : ''}`,
      to: '/followups',
      keywords: norm(`${f.title} ${f.note} ${f.priority}`),
    });
  }
  for (const p of data.problems ?? []) {
    items.push({
      id: `pb:${p.id}`,
      kind: 'problem',
      title: p.title,
      subtitle: `${p.difficulty} · ${p.status}${p.topic ? ` · ${p.topic}` : ''}`,
      to: '/dsa',
      keywords: norm(`${p.title} ${p.topic} ${p.difficulty} ${p.note}`),
    });
  }
  for (const p of PROJECTS) {
    const saved = data.projects[p.id] ?? {};
    items.push({
      id: `proj:${p.id}`,
      kind: 'project',
      title: `${p.number}. ${p.title}`,
      subtitle: `${p.tag} · weeks ${p.weeks[0]}–${p.weeks[1]}`,
      to: '/projects',
      keywords: norm(`${p.title} ${p.tag} ${p.goal} ${p.requirements} ${p.milestones.join(' ')} ${saved.note ?? ''}`),
    });
  }
  for (const r of RESOURCES) {
    items.push({ id: `res:${r.id}`, kind: 'resource', title: r.title, subtitle: r.category, to: '/resources', keywords: norm(`${r.title} ${r.description} ${r.category} ${r.type}`) });
  }
  return items;
};

export interface SearchResult extends SearchItem {
  score: number;
}

/* Every query token must appear; earlier and title matches score higher. Empty query lists actions and pages. */
export const search = (index: SearchItem[], query: string, limit = 30): SearchResult[] => {
  const q = norm(query.trim());
  if (!q) return index.filter((i) => i.kind === 'action' || i.kind === 'page').map((i) => ({ ...i, score: 0 }));
  const tokens = q.split(/\s+/).filter(Boolean);
  const out: SearchResult[] = [];
  for (const item of index) {
    let score = 0;
    let ok = true;
    const title = norm(item.title);
    for (const t of tokens) {
      const inTitle = title.indexOf(t);
      const inAll = item.keywords.indexOf(t);
      if (inAll < 0 && inTitle < 0) {
        ok = false;
        break;
      }
      if (inTitle === 0) score += 30;
      else if (inTitle > 0) score += 20;
      else score += 8 - Math.min(6, inAll / 40);
    }
    if (!ok) continue;
    if (title === q) score += 50;
    score -= KIND_ORDER.indexOf(item.kind) * 0.5;
    out.push({ ...item, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
};

export const groupResults = (results: SearchResult[]): { kind: SearchKind; items: SearchResult[] }[] => {
  const map = new Map<SearchKind, SearchResult[]>();
  for (const r of results) {
    if (!map.has(r.kind)) map.set(r.kind, []);
    map.get(r.kind)!.push(r);
  }
  return KIND_ORDER.filter((k) => map.has(k)).map((kind) => ({ kind, items: map.get(kind)! }));
};
