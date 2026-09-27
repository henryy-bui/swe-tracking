import { useMemo, useState, type FormEvent } from 'react';
import { DIFFICULTIES, REVIEW_INTERVALS, useStore, type Difficulty, type Problem } from '@/store/useStore';
import { TOTAL_WEEKS, weekDef } from '@/data/roadmap';
import { currentWeek, isReviewDue, problemStats } from '@/lib/derive';
import { fmtDate, relDay, today } from '@/lib/date';
import { EmptyState, PageHead, StatTile, Tabs, WeekLink, toast } from '@/components/ui';

type Filter = 'due' | 'todo' | 'solved' | 'all';

const DIFF_CLASS: Record<Difficulty, string> = { easy: 'pill good', medium: 'pill warning', hard: 'pill critical' };

/* Suggest a topic from the roadmap's DSA entry for a week: "Two Pointers (3Sum, Two Sum II)" -> "Two Pointers". */
const topicFromWeek = (week: number) => weekDef(week).dsa.replace(/\s*\(.*$/, '').trim();

export default function Problems() {
  const data = useStore();
  const { addProblem, updateProblem, deleteProblem, markProblemSolved, markProblemReviewed, resetProblem } = useStore();
  const cw = currentWeek(data);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [week, setWeek] = useState<string>(cw ? String(cw) : '');
  const [topic, setTopic] = useState<string>(cw ? topicFromWeek(cw) : '');
  const [topicTouched, setTopicTouched] = useState(false);
  const [filter, setFilter] = useState<Filter>('due');
  const [editing, setEditing] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const stats = problemStats(data);

  const onWeekChange = (w: string) => {
    setWeek(w);
    if (!topicTouched) setTopic(w ? topicFromWeek(Number(w)) : '');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addProblem({ title: title.trim(), url: url.trim(), difficulty, topic: topic.trim(), week: week ? Number(week) : undefined, note: '' });
    setTitle('');
    setUrl('');
    toast('Problem added');
  };

  const list = useMemo(() => {
    const all = data.problems ?? [];
    const subset = all.filter((p) => {
      if (filter === 'due') return isReviewDue(p);
      if (filter === 'todo') return p.status === 'todo';
      if (filter === 'solved') return p.status === 'solved';
      return true;
    });
    return [...subset].sort((a, b) => {
      const da = isReviewDue(a) ? 0 : 1;
      const db = isReviewDue(b) ? 0 : 1;
      if (da !== db) return da - db;
      if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
      if (a.nextReview !== b.nextReview) return (a.nextReview ?? '9') < (b.nextReview ?? '9') ? -1 : 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }, [data.problems, filter]);

  const counts = {
    due: stats.due,
    todo: stats.total - stats.solved,
    solved: stats.solved,
    all: stats.total,
  };

  return (
    <>
      <PageHead
        title="DSA problems"
        subtitle={`Track problems from the weekly DSA track and NeetCode 150. Solved problems come back for review after ${REVIEW_INTERVALS.join(', ')} days.`}
      />

      <div className="grid-tiles">
        <StatTile label="Solved" value={stats.solved} sub={`of ${stats.total} tracked`} />
        <StatTile label="By difficulty" value={`${stats.easy} / ${stats.medium} / ${stats.hard}`} sub="easy / medium / hard" />
        <StatTile label="Due for review" value={stats.due} sub={stats.due > 0 ? 'Re-solve without looking at the answer' : 'Nothing due today'} />
        <StatTile label="This week's topic" value={cw ? topicFromWeek(cw) : '—'} sub={cw ? weekDef(cw).dsa : 'Set a start date'} />
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h2>Add problem</h2>
        </div>
        <form onSubmit={submit} className="form-grid">
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="pb-title">Title</label>
            <input id="pb-title" type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Trapping Rain Water" required />
          </div>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="pb-url">Link</label>
            <input id="pb-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://leetcode.com/problems/…" />
          </div>
          <div className="field">
            <label htmlFor="pb-diff">Difficulty</label>
            <select id="pb-diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pb-week">Week</label>
            <select id="pb-week" value={week} onChange={(e) => onWeekChange(e.target.value)}>
              <option value="">— none —</option>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w} · {topicFromWeek(w)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pb-topic">Topic</label>
            <input
              id="pb-topic"
              type="text"
              className="input"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setTopicTouched(true);
              }}
              placeholder="e.g. Two Pointers"
            />
          </div>
          <div className="form-actions" style={{ marginTop: 0 }}>
            <button className="btn primary" type="submit">
              Add
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'due', label: `Due for review (${counts.due})` },
            { id: 'todo', label: `To do (${counts.todo})` },
            { id: 'solved', label: `Solved (${counts.solved})` },
            { id: 'all', label: `All (${counts.all})` },
          ]}
        />
        {list.length === 0 ? (
          <EmptyState>
            {filter === 'due' ? 'No reviews due. Solve something new, or check the to-do list.' : 'No problems here yet.'}
          </EmptyState>
        ) : (
          <ul className="list">
            {list.map((p) => (
              <ProblemRow
                key={p.id}
                p={p}
                editing={editing === p.id}
                editNote={editNote}
                onEditNote={setEditNote}
                onStartEdit={() => {
                  setEditing(p.id);
                  setEditNote(p.note);
                }}
                onSaveEdit={() => {
                  updateProblem(p.id, { note: editNote.trim() });
                  setEditing(null);
                }}
                onCancelEdit={() => setEditing(null)}
                onSolved={() => {
                  markProblemSolved(p.id);
                  toast(`Solved. Review ${relDay(today())}? No, in ${REVIEW_INTERVALS[0]} day.`);
                }}
                onReviewed={() => {
                  markProblemReviewed(p.id);
                  toast('Reviewed. Next interval scheduled.');
                }}
                onReset={() => resetProblem(p.id)}
                onDelete={() => deleteProblem(p.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

interface RowProps {
  p: Problem;
  editing: boolean;
  editNote: string;
  onEditNote: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onSolved: () => void;
  onReviewed: () => void;
  onReset: () => void;
  onDelete: () => void;
}

function ProblemRow({ p, editing, editNote, onEditNote, onStartEdit, onSaveEdit, onCancelEdit, onSolved, onReviewed, onReset, onDelete }: RowProps) {
  const due = isReviewDue(p);
  return (
    <li className={p.status === 'solved' && !due ? 'done' : ''}>
      <div className="body">
        <div className="title">
          {p.url ? (
            <a href={p.url} target="_blank" rel="noreferrer">
              {p.title}
            </a>
          ) : (
            p.title
          )}{' '}
          <span className={DIFF_CLASS[p.difficulty]}>{p.difficulty}</span>
          {due && <span className="pill overdue">⟳ review due</span>}
        </div>
        <div className="meta">
          {p.topic && <span>{p.topic}</span>}
          {p.week && <WeekLink week={p.week} />}
          {p.status === 'solved' && p.solvedAt && <span>solved {fmtDate(p.solvedAt)}</span>}
          {p.status === 'solved' && p.nextReview && !due && <span>next review {relDay(p.nextReview)}</span>}
          {p.reviewCount > 0 && <span>{p.reviewCount}× reviewed</span>}
        </div>
        {editing ? (
          <div className="row" style={{ marginTop: 6 }}>
            <textarea className="grow" rows={2} value={editNote} onChange={(e) => onEditNote(e.target.value)} aria-label="Approach notes" placeholder="Approach, complexity, pitfalls…" />
            <button className="btn sm" onClick={onSaveEdit}>
              Save
            </button>
            <button className="btn sm ghost" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        ) : (
          p.note && <div className="note">{p.note}</div>
        )}
      </div>
      <div className="actions">
        {p.status === 'todo' && (
          <button className="btn sm" onClick={onSolved}>
            Solved
          </button>
        )}
        {due && (
          <button className="btn sm primary" onClick={onReviewed}>
            Reviewed
          </button>
        )}
        {p.status === 'solved' && !due && (
          <button className="btn sm ghost" onClick={onReset} title="Move back to to-do">
            Redo
          </button>
        )}
        <button className="btn sm ghost" onClick={onStartEdit} aria-label={`Edit notes for ${p.title}`}>
          Notes
        </button>
        <button className="btn sm ghost" onClick={onDelete} aria-label={`Delete ${p.title}`}>
          ✕
        </button>
      </div>
    </li>
  );
}
