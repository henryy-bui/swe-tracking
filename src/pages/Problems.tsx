import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { REVIEW_INTERVALS, useStore, type Difficulty, type Problem } from '@/store/useStore';
import { weekDef } from '@/data/roadmap';
import { currentWeek, isReviewDue, problemStats } from '@/lib/derive';
import { addDays, fmtDate, relDay, today } from '@/lib/date';
import { plural } from '@/lib/format';
import { DIFFICULTY_LABEL } from '@/lib/labels';
import { deleteProblemWithUndo } from '@/lib/undo';
import { EmptyState, PageHead, StatTile, Tabs, Vi, WeekLink, toast } from '@/components/ui';
import { DifficultySelect, WeekSelect, dsaTopic } from '@/components/fields';
import { InlineNoteEditor } from '@/components/InlineNoteEditor';
import { RefreshCw, X } from '@/components/icons';

type Filter = 'due' | 'todo' | 'solved' | 'all';

const EMPTY: Record<Filter, string> = {
  due: 'No reviews due. Solve something new, or check the to-do list.',
  todo: 'Nothing left to solve. Add a problem above.',
  solved: 'Nothing solved yet. Use "Mark solved" on a problem when you finish it.',
  all: "No problems yet. Add one above, for example from this week's DSA topic.",
};

export default function Problems() {
  const id = useId();
  const data = useStore();
  const { addProblem, addProblems, updateProblem, markProblemSolved, markProblemReviewed, resetProblem } = useStore();
  const [bulk, setBulk] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const cw = currentWeek(data);
  const stats = problemStats(data);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [week, setWeek] = useState<string>(cw ? String(cw) : '');
  const [topic, setTopic] = useState<string>(cw ? dsaTopic(cw) : '');
  const [topicTouched, setTopicTouched] = useState(false);
  const [filter, setFilter] = useState<Filter>(() => (stats.total === 0 ? 'all' : 'due'));
  const [editing, setEditing] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const onWeekChange = (w: string) => {
    setWeek(w);
    if (!topicTouched) setTopic(w ? dsaTopic(Number(w)) : '');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addProblem({ title: title.trim(), url: url.trim(), difficulty, topic: topic.trim(), week: week ? Number(week) : undefined, note: '' });
    setTitle('');
    setUrl('');
    toast('Problem added to your to-do list.');
    titleRef.current?.focus();
  };

  /* One problem per line: "Title", "Title | hard", or "Title | medium | https://…". */
  const parsedBulk = useMemo(() => parseBulk(bulk), [bulk]);
  const submitBulk = () => {
    if (parsedBulk.length === 0) return;
    addProblems(parsedBulk.map((p) => ({ ...p, topic: topic.trim(), week: week ? Number(week) : undefined, note: '' })));
    setBulk('');
    setBulkOpen(false);
    toast(`Added ${plural(parsedBulk.length, 'problem')} to your to-do list.`);
  };

  const list = useMemo(() => {
    const subset = data.problems.filter((p) => {
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

  const counts = { due: stats.due, todo: stats.total - stats.solved, solved: stats.solved, all: stats.total };

  return (
    <>
      <PageHead
        title="DSA problems"
        subtitle={`Problems from the weekly DSA track and NeetCode 150. Solved problems come back for review after ${REVIEW_INTERVALS.join(', ')} days, so they stick.`}
      />

      <div className="stack">
        <div className="grid-tiles">
          <StatTile label="Solved" value={stats.solved} sub={`of ${stats.total} tracked`} />
          <StatTile label="Solved by difficulty" value={`${stats.easy} · ${stats.medium} · ${stats.hard}`} sub="Easy · Medium · Hard" srValue={`${stats.easy} easy, ${stats.medium} medium, ${stats.hard} hard`} />
          <StatTile label="Due for review" value={stats.due} sub={stats.due > 0 ? 'Re-solve without looking at the answer' : 'Nothing due today'} />
          <StatTile
            label="This week's topic"
            value={cw ? <Vi>{dsaTopic(cw)}</Vi> : '—'}
            sub={cw ? <Vi>{weekDef(cw).dsa}</Vi> : <Link to="/settings">Set a start date</Link>}
          />
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Add a problem</h2>
          </div>
          <form onSubmit={submit} className="form-grid">
            <div className="field span-2">
              <label htmlFor={`${id}-title`}>Problem name</label>
              <input ref={titleRef} id={`${id}-title`} type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Trapping Rain Water" required />
            </div>
            <div className="field span-2">
              <label htmlFor={`${id}-url`}>Link</label>
              <input id={`${id}-url`} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://leetcode.com/problems/… (optional)" />
            </div>
            <div className="field">
              <label htmlFor={`${id}-diff`}>Difficulty</label>
              <DifficultySelect id={`${id}-diff`} value={difficulty} onChange={setDifficulty} />
            </div>
            <div className="field">
              <label htmlFor={`${id}-week`}>Roadmap week</label>
              <WeekSelect id={`${id}-week`} value={week} onChange={onWeekChange} labelOf={dsaTopic} />
            </div>
            <div className="field">
              <label htmlFor={`${id}-topic`}>Topic</label>
              <input
                id={`${id}-topic`}
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
            <div className="form-actions">
              <button className="btn primary" type="submit">
                Add problem
              </button>
            </div>
          </form>
          <div className="section-sm">
            <button className="btn ghost sm" onClick={() => setBulkOpen((v) => !v)} aria-expanded={bulkOpen} aria-controls={`${id}-bulk`}>
              {bulkOpen ? 'Hide bulk add' : 'Add several at once…'}
            </button>
          </div>
          {bulkOpen && (
            <div id={`${id}-bulk`} className="section-sm">
              <div className="field">
                <label htmlFor={`${id}-bulk-text`}>One problem per line</label>
                <textarea
                  id={`${id}-bulk-text`}
                  rows={5}
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                  placeholder={'Two Sum\nValid Anagram | easy\n3Sum | medium | https://leetcode.com/problems/3sum/'}
                  aria-describedby={`${id}-bulk-hint`}
                />
                <span id={`${id}-bulk-hint`} className="hint">
                  Optional after the title: difficulty (easy, medium, hard) and a link, separated by |. The week and topic above apply to all of them.
                </span>
              </div>
              <div className="form-actions section-xs">
                <button className="btn primary" onClick={submitBulk} disabled={parsedBulk.length === 0}>
                  Add {parsedBulk.length > 0 ? plural(parsedBulk.length, 'problem') : 'problems'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
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
            <EmptyState>{EMPTY[filter]}</EmptyState>
          ) : (
            <ul className="list">
              {list.map((p) => (
                <ProblemRow
                  key={p.id}
                  p={p}
                  editing={editing === p.id}
                  onStartEdit={() => setEditing(p.id)}
                  onSaveEdit={(v) => {
                    updateProblem(p.id, { note: v });
                    setEditing(null);
                    toast('Notes saved.');
                  }}
                  onCancelEdit={() => setEditing(null)}
                  onSolved={() => {
                    markProblemSolved(p.id);
                    toast(`Marked solved. First review ${relDay(addDays(today(), REVIEW_INTERVALS[0]))}.`);
                  }}
                  onReviewed={() => {
                    const days = REVIEW_INTERVALS[Math.min(p.reviewCount + 1, REVIEW_INTERVALS.length - 1)];
                    markProblemReviewed(p.id);
                    toast(`Reviewed. Next review in ${plural(days, 'day')}.`);
                  }}
                  onReset={() => {
                    resetProblem(p.id);
                    toast('Moved back to to-do.');
                  }}
                  onDelete={() => deleteProblemWithUndo(p)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export const parseBulk = (text: string): { title: string; difficulty: Difficulty; url: string }[] =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split('|').map((s) => s.trim());
      const title = parts[0];
      let difficulty: Difficulty = 'medium';
      let url = '';
      for (const p of parts.slice(1)) {
        const low = p.toLowerCase();
        if (low === 'easy' || low === 'medium' || low === 'hard') difficulty = low;
        else if (/^https?:\/\//i.test(p)) url = p;
      }
      return { title, difficulty, url };
    })
    .filter((p) => p.title.length > 0);

interface RowProps {
  p: Problem;
  editing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (v: string) => void;
  onCancelEdit: () => void;
  onSolved: () => void;
  onReviewed: () => void;
  onReset: () => void;
  onDelete: () => void;
}

function ProblemRow({ p, editing, onStartEdit, onSaveEdit, onCancelEdit, onSolved, onReviewed, onReset, onDelete }: RowProps) {
  const due = isReviewDue(p);
  return (
    <li className={p.status === 'solved' && !due ? 'done' : ''}>
      <div className="body">
        <div className="title">
          {p.url ? (
            <a href={p.url} target="_blank" rel="noreferrer">
              {p.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            p.title
          )}{' '}
          <span className="pill">{DIFFICULTY_LABEL[p.difficulty]}</span>
          {due && (
            <span className="pill overdue">
              <RefreshCw size={12} /> review due
            </span>
          )}
        </div>
        <div className="meta">
          {p.topic && <span>{p.topic}</span>}
          {p.week && <WeekLink week={p.week} />}
          {p.status === 'solved' && p.solvedAt && <span>solved {fmtDate(p.solvedAt)}</span>}
          {p.status === 'solved' && p.nextReview && !due && <span>next review {relDay(p.nextReview)}</span>}
          {p.reviewCount > 0 && <span>reviewed {p.reviewCount}×</span>}
        </div>
        {editing ? (
          <InlineNoteEditor value={p.note} label={`Notes for ${p.title}`} placeholder="Approach, complexity, pitfalls…" onSave={onSaveEdit} onCancel={onCancelEdit} />
        ) : (
          p.note && <div className="note">{p.note}</div>
        )}
      </div>
      <div className="actions">
        {p.status === 'todo' && (
          <button className="btn sm" onClick={onSolved} aria-label={`Mark ${p.title} solved`}>
            Mark solved
          </button>
        )}
        {due && (
          <button className="btn sm primary" onClick={onReviewed} aria-label={`Mark ${p.title} reviewed`}>
            Mark reviewed
          </button>
        )}
        {p.status === 'solved' && !due && (
          <button className="btn sm ghost" onClick={onReset} aria-label={`Move ${p.title} back to to-do`}>
            Move to to-do
          </button>
        )}
        {!editing && (
          <button className="btn sm ghost" onClick={onStartEdit} aria-label={`Edit notes for ${p.title}`}>
            Edit notes
          </button>
        )}
        <button className="btn sm ghost icon" onClick={onDelete} aria-label={`Delete ${p.title}`}>
          <X size={14} />
        </button>
      </div>
    </li>
  );
}
