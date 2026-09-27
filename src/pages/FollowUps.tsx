import { useState, type FormEvent } from 'react';
import { useStore, type Priority } from '@/store/useStore';
import { TOTAL_WEEKS, weekDef } from '@/data/roadmap';
import { isOverdue, sortFollowUps, weekForDate } from '@/lib/derive';
import { fmtDate, relDay, today } from '@/lib/date';
import { EmptyState, PageHead, Tabs, WeekLink, toast } from '@/components/ui';
import { AlertTriangle, X } from '@/components/icons';

type Filter = 'open' | 'overdue' | 'done' | 'all';

const PRIORITY_PILL: Record<Priority, string> = { high: 'pill warning', medium: 'pill', low: 'pill' };

export default function FollowUps() {
  const data = useStore();
  const { addFollowUp, toggleFollowUp, snoozeFollowUp, deleteFollowUp, updateFollowUp } = useStore();

  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [week, setWeek] = useState<string>(() => String(weekForDate(data, today()) ?? ''));
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState<Filter>('open');
  const [editing, setEditing] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addFollowUp({ title: title.trim(), note: note.trim(), due: due || undefined, week: week ? Number(week) : undefined, priority });
    setTitle('');
    setNote('');
    setDue('');
    toast('Follow-up added');
  };

  const counts = {
    open: data.followUps.filter((f) => !f.done).length,
    overdue: data.followUps.filter(isOverdue).length,
    done: data.followUps.filter((f) => f.done).length,
    all: data.followUps.length,
  };

  const list = sortFollowUps(
    data.followUps.filter((f) => {
      if (filter === 'open') return !f.done;
      if (filter === 'overdue') return isOverdue(f);
      if (filter === 'done') return f.done;
      return true;
    }),
  );

  return (
    <>
      <PageHead title="Follow-ups" subtitle="Questions to answer, topics to revisit, blockers to clear. Give them a due date so they resurface." />

      <div className="card">
        <div className="card-head">
          <h2>New follow-up</h2>
        </div>
        <form onSubmit={submit} className="form-grid">
          <div className="field wide">
            <label htmlFor="fu-title">Title</label>
            <input id="fu-title" type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Why does escape analysis move this slice to the heap?" required />
          </div>
          <div className="field">
            <label htmlFor="fu-due">Due</label>
            <input id="fu-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="fu-priority">Priority</label>
            <select id="fu-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="fu-week">Linked week</label>
            <select id="fu-week" value={week} onChange={(e) => setWeek(e.target.value)}>
              <option value="">— none —</option>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w} · {weekDef(w).topic}
                </option>
              ))}
            </select>
          </div>
          <div className="field wide">
            <label htmlFor="fu-note">Details</label>
            <textarea id="fu-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context, links, what 'done' looks like…" />
          </div>
          <div className="form-actions wide" style={{ marginTop: 0 }}>
            <button className="btn primary" type="submit">
              Add follow-up
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'open', label: `Open (${counts.open})` },
            { id: 'overdue', label: `Overdue (${counts.overdue})` },
            { id: 'done', label: `Done (${counts.done})` },
            { id: 'all', label: `All (${counts.all})` },
          ]}
        />
        {list.length === 0 ? (
          <EmptyState>{filter === 'overdue' ? 'Nothing overdue. Nice.' : 'No follow-ups here.'}</EmptyState>
        ) : (
          <ul className="list">
            {list.map((f) => {
              const overdue = isOverdue(f);
              return (
                <li key={f.id} className={f.done ? 'done' : ''}>
                  <input type="checkbox" checked={f.done} onChange={() => toggleFollowUp(f.id)} aria-label={`Mark "${f.title}" ${f.done ? 'open' : 'done'}`} style={{ marginTop: 3 }} />
                  <div className="body">
                    <div className="title">{f.title}</div>
                    <div className="meta">
                      {f.due && (
                        <span className={overdue ? 'pill overdue' : ''} title={fmtDate(f.due, { day: 'numeric', month: 'long', year: 'numeric' })}>
                          {overdue ? (
                            <>
                              <AlertTriangle size={12} /> overdue ·{' '}
                            </>
                          ) : f.done ? (
                            'was due '
                          ) : (
                            'due '
                          )}
                          {relDay(f.due)}
                        </span>
                      )}
                      <span className={PRIORITY_PILL[f.priority]}>{f.priority}</span>
                      {f.week && <WeekLink week={f.week} />}
                      {f.done && f.doneAt && <span>done {fmtDate(f.doneAt)}</span>}
                    </div>
                    {editing === f.id ? (
                      <div className="row" style={{ marginTop: 6 }}>
                        <textarea className="grow" rows={2} value={editNote} onChange={(e) => setEditNote(e.target.value)} aria-label="Details" />
                        <button
                          className="btn sm"
                          onClick={() => {
                            updateFollowUp(f.id, { note: editNote.trim() });
                            setEditing(null);
                          }}
                        >
                          Save
                        </button>
                        <button className="btn sm ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      f.note && <div className="note">{f.note}</div>
                    )}
                  </div>
                  <div className="actions">
                    {!f.done && (
                      <button className="btn sm ghost" onClick={() => snoozeFollowUp(f.id, 7)} title="Push due date one week out">
                        +1w
                      </button>
                    )}
                    <button
                      className="btn sm ghost"
                      onClick={() => {
                        setEditing(f.id);
                        setEditNote(f.note);
                      }}
                      aria-label={`Edit details of "${f.title}"`}
                    >
                      Edit
                    </button>
                    <button className="btn sm ghost icon" onClick={() => deleteFollowUp(f.id)} aria-label={`Delete "${f.title}"`}>
                      <X size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
