import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LOG_TAGS, useStore, type LogTag, type Priority } from '@/store/useStore';
import { TOTAL_WEEKS, phaseOfWeek, projectById, weekDef } from '@/data/roadmap';
import { currentWeek, isDone, isOverdue, minutesForRoadmapWeek, sortFollowUps, taskItems, weekProgress, weekRange, weekStatus } from '@/lib/derive';
import { fmtDate, fmtHours, relDay, today } from '@/lib/date';
import { EmptyState, PageHead, ProgressBar, StatusPill, toast } from '@/components/ui';

export default function WeekDetail() {
  const { n } = useParams();
  const week = Number(n);
  if (!Number.isInteger(week) || week < 1 || week > TOTAL_WEEKS) return <Navigate to="/weeks" replace />;
  return <WeekBody week={week} />;
}

function WeekBody({ week }: { week: number }) {
  const data = useStore();
  const { setTask, setWeekTasks, setWeekNote, toggleSkipWeek, addLog, addFollowUp, toggleFollowUp, deleteFollowUp, addCustomTask, deleteCustomTask, setRetro } =
    useStore();

  const def = weekDef(week);
  const phase = phaseOfWeek(week);
  const items = taskItems(data, week);
  const wp = weekProgress(data, week);
  const st = weekStatus(data, week);
  const range = weekRange(data, week);
  const cw = currentWeek(data);
  const minutes = minutesForRoadmapWeek(data, week);
  const followUps = sortFollowUps(data.followUps.filter((f) => f.week === week));

  const [note, setNote] = useState(data.weekNotes[String(week)] ?? '');
  useEffect(() => setNote(data.weekNotes[String(week)] ?? ''), [week, data.weekNotes]);

  const [logDate, setLogDate] = useState(today());
  const [logHours, setLogHours] = useState('1');
  const [logTag, setLogTag] = useState<LogTag>('study');
  const [logNote, setLogNote] = useState('');

  const [fuTitle, setFuTitle] = useState('');
  const [fuDue, setFuDue] = useState('');
  const [fuPriority, setFuPriority] = useState<Priority>('medium');

  const [newTask, setNewTask] = useState('');
  const retro = data.retros?.[String(week)];
  const [wentWell, setWentWell] = useState(retro?.wentWell ?? '');
  const [improve, setImprove] = useState(retro?.improve ?? '');
  useEffect(() => {
    setWentWell(retro?.wentWell ?? '');
    setImprove(retro?.improve ?? '');
  }, [week, retro?.wentWell, retro?.improve]);

  const submitTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addCustomTask(week, newTask.trim());
    setNewTask('');
  };

  const submitLog = (e: FormEvent) => {
    e.preventDefault();
    const mins = Math.round(Number(logHours) * 60);
    if (!logDate || !mins || mins <= 0) return;
    addLog({ date: logDate, minutes: mins, week, tag: logTag, note: logNote.trim() });
    setLogNote('');
    toast(`Logged ${fmtHours(mins)} to week ${week}`);
  };

  const submitFollowUp = (e: FormEvent) => {
    e.preventDefault();
    if (!fuTitle.trim()) return;
    addFollowUp({ title: fuTitle.trim(), note: '', due: fuDue || undefined, week, priority: fuPriority });
    setFuTitle('');
    setFuDue('');
    toast('Follow-up added');
  };

  const saveNote = () => {
    if ((data.weekNotes[String(week)] ?? '') !== note) {
      setWeekNote(week, note);
      toast('Notes saved');
    }
  };

  return (
    <>
      <PageHead
        title={`Week ${week}: ${def.topic}`}
        subtitle={
          <>
            Phase {phase.id} · {phase.title}
            {range && ` · ${fmtDate(range.start)} – ${fmtDate(range.end)}`}
            {cw === week && ' · current week'}
          </>
        }
      >
        <div className="week-nav">
          <Link to="/weeks" className="btn ghost">
            All weeks
          </Link>
          {week > 1 ? (
            <Link to={`/weeks/${week - 1}`} className="btn">
              ← Week {week - 1}
            </Link>
          ) : (
            <button className="btn" disabled>
              ← Week 0
            </button>
          )}
          {week < TOTAL_WEEKS ? (
            <Link to={`/weeks/${week + 1}`} className="btn">
              Week {week + 1} →
            </Link>
          ) : (
            <button className="btn" disabled>
              Week 37 →
            </button>
          )}
        </div>
      </PageHead>

      <div className="grid-2">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Checklist</h2>
              <span className="row">
                <StatusPill status={st} />
                <span className="small muted tabular">
                  {wp.done}/{wp.total}
                </span>
              </span>
            </div>
            <ProgressBar done={wp.done} total={wp.total} label={`${wp.done} of ${wp.total} done`} />
            {def.milestone && (
              <div style={{ marginTop: 10 }}>
                <span className="milestone-badge">
                  {def.milestone.kind === 'start' ? 'Start' : 'Finish'} side project {projectById(def.milestone.project).number}
                </span>{' '}
                <Link to="/projects" className="small">
                  {projectById(def.milestone.project).title} →
                </Link>
              </div>
            )}
            <ul className="checklist" style={{ marginTop: 10 }}>
              {items.map((it) => {
                const mark = data.tasks[it.key];
                const done = isDone(data, it.key);
                return (
                  <li key={it.key} className={done ? 'done' : ''}>
                    <label>
                      <input type="checkbox" checked={done} onChange={(e) => setTask(it.key, e.target.checked)} />
                      <span>
                        {it.kind === 'dsa' && <span className="kind-tag">DSA</span>}
                        {it.kind === 'custom' && <span className="kind-tag">Mine</span>}
                        {it.label}
                      </span>
                    </label>
                    {done && mark?.at && <span className="meta">{fmtDate(mark.at)}</span>}
                    {it.kind === 'custom' && it.customId && (
                      <button className="btn sm ghost" onClick={() => deleteCustomTask(week, it.customId!)} aria-label={`Delete task "${it.label}"`}>
                        ✕
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <form className="inline-add" onSubmit={submitTask}>
              <input type="text" className="input" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add your own task for this week…" aria-label="New task" />
              <button className="btn" type="submit">
                Add
              </button>
            </form>
            <div className="row" style={{ marginTop: 12 }}>
              {wp.done < wp.total ? (
                <button className="btn sm" onClick={() => setWeekTasks(week, items.map((i) => i.key), true)}>
                  Mark all done
                </button>
              ) : (
                <button className="btn sm" onClick={() => setWeekTasks(week, items.map((i) => i.key), false)}>
                  Clear all
                </button>
              )}
              <button className="btn sm ghost" onClick={() => toggleSkipWeek(week)}>
                {st === 'skipped' ? 'Unskip week' : 'Skip week'}
              </button>
              <span className="small faint" style={{ marginLeft: 'auto' }}>
                {minutes > 0 ? `${fmtHours(minutes)} logged` : 'No time logged'}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Notes</h2>
              <span className="hint">Saved when you leave the field</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              placeholder="Key takeaways, links, questions, what to revisit…"
              rows={7}
              aria-label={`Notes for week ${week}`}
            />
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Weekly retrospective</h2>
              {retro?.at && <span className="hint">Updated {fmtDate(retro.at)}</span>}
            </div>
            <div className="field">
              <span className="label">How did the week go?</span>
              <div className="rating" role="radiogroup" aria-label="Week rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={retro?.rating === n}
                    className={`star${(retro?.rating ?? 0) >= n ? ' on' : ''}`}
                    onClick={() => setRetro(week, { rating: retro?.rating === n ? 0 : n })}
                    aria-label={`${n} of 5`}
                  >
                    ★
                  </button>
                ))}
                <span className="small muted" style={{ marginLeft: 6 }}>
                  {['', 'Rough', 'Below par', 'Okay', 'Good', 'Excellent'][retro?.rating ?? 0]}
                </span>
              </div>
            </div>
            <div className="grid-2" style={{ marginTop: 10 }}>
              <div className="field">
                <label htmlFor="retro-well">What went well</label>
                <textarea
                  id="retro-well"
                  rows={3}
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  onBlur={() => wentWell !== (retro?.wentWell ?? '') && setRetro(week, { wentWell })}
                />
              </div>
              <div className="field">
                <label htmlFor="retro-improve">What to improve next week</label>
                <textarea
                  id="retro-improve"
                  rows={3}
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  onBlur={() => improve !== (retro?.improve ?? '') && setRetro(week, { improve })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Log time</h2>
              <Link to="/log" className="small">
                Study log →
              </Link>
            </div>
            <form onSubmit={submitLog} className="form-grid">
              <div className="field">
                <label htmlFor="wd-date">Date</label>
                <input id="wd-date" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="wd-hours">Hours</label>
                <input id="wd-hours" type="number" min="0.25" step="0.25" value={logHours} onChange={(e) => setLogHours(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="wd-tag">Type</label>
                <select id="wd-tag" value={logTag} onChange={(e) => setLogTag(e.target.value as LogTag)}>
                  {LOG_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field wide">
                <label htmlFor="wd-note">Note</label>
                <input id="wd-note" type="text" className="input" value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="What did you work on?" />
              </div>
              <div className="form-actions wide" style={{ marginTop: 0 }}>
                <button className="btn primary" type="submit">
                  Add session
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Follow-ups for this week</h2>
              <Link to="/followups" className="small">
                All →
              </Link>
            </div>
            <form onSubmit={submitFollowUp} className="form-grid">
              <div className="field wide">
                <label htmlFor="wd-fu">What needs following up?</label>
                <input id="wd-fu" type="text" className="input" value={fuTitle} onChange={(e) => setFuTitle(e.target.value)} placeholder="e.g. Re-read Fiber lane priorities" required />
              </div>
              <div className="field">
                <label htmlFor="wd-fu-due">Due</label>
                <input id="wd-fu-due" type="date" value={fuDue} onChange={(e) => setFuDue(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="wd-fu-pri">Priority</label>
                <select id="wd-fu-pri" value={fuPriority} onChange={(e) => setFuPriority(e.target.value as Priority)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-actions wide" style={{ marginTop: 0 }}>
                <button className="btn" type="submit">
                  Add follow-up
                </button>
              </div>
            </form>
            {followUps.length === 0 ? (
              <div className="hint" style={{ marginTop: 10 }}>
                Nothing linked to this week yet.
              </div>
            ) : (
              <ul className="list" style={{ marginTop: 10 }}>
                {followUps.map((f) => (
                  <li key={f.id} className={f.done ? 'done' : ''}>
                    <input type="checkbox" checked={f.done} onChange={() => toggleFollowUp(f.id)} aria-label={`Mark "${f.title}" ${f.done ? 'open' : 'done'}`} style={{ marginTop: 3 }} />
                    <div className="body">
                      <div className="title">{f.title}</div>
                      <div className="meta">
                        {f.due && <span className={isOverdue(f) ? 'pill overdue' : ''}>{isOverdue(f) ? '⚠ overdue · ' : 'due '}{relDay(f.due)}</span>}
                        <span>{f.priority}</span>
                      </div>
                    </div>
                    <div className="actions">
                      <button className="btn sm ghost" onClick={() => deleteFollowUp(f.id)} aria-label={`Delete "${f.title}"`}>
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.logs.filter((l) => l.week === week).length > 0 && (
            <div className="card">
              <div className="card-head">
                <h2>Sessions this week</h2>
                <span className="small muted">{fmtHours(minutes)}</span>
              </div>
              <ul className="list">
                {data.logs
                  .filter((l) => l.week === week)
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((l) => (
                    <li key={l.id}>
                      <div className="body">
                        <div className="title">
                          {fmtHours(l.minutes)} <span className="pill">{l.tag}</span>
                        </div>
                        <div className="meta">
                          <span>{fmtDate(l.date)}</span>
                          {l.note && <span>{l.note}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          {data.logs.filter((l) => l.week === week).length === 0 && <EmptyState>No sessions logged for this week yet.</EmptyState>}
        </div>
      </div>
    </>
  );
}
