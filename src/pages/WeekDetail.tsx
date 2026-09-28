import { useId, useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useStore, type AppData, type WeekFlag } from '@/store/useStore';
import { TOTAL_WEEKS, phaseOfWeek, projectById, resourceById, weekDef } from '@/data/roadmap';
import { seedCandidates, seedProblems, seedState } from '@/lib/dsaSeed';
import { currentWeek, sessionsForWeek, sortFollowUps, taskItems, weekProgress, weekRange, weekStatus } from '@/lib/derive';
import { fmtDate, fmtRange } from '@/lib/date';
import { fmtHours, plural } from '@/lib/format';
import { RATING_LABEL, TERMS } from '@/lib/labels';
import { useDraft } from '@/lib/useDraft';
import { rovingKey } from '@/lib/useA11y';
import { downloadText } from '@/lib/download';
import { weekSummaryMarkdown } from '@/lib/report';
import { deleteLogWithUndo } from '@/lib/undo';
import { EmptyState, MilestoneBadge, MoreLink, PageHead, ProgressBar, Stars, StatusPill, Vi, toast } from '@/components/ui';
import { TaskChecklist } from '@/components/TaskChecklist';
import { LogSessionForm } from '@/components/LogSessionForm';
import { FollowUpForm } from '@/components/FollowUpForm';
import { FollowUpRow } from '@/components/FollowUpRow';
import { SessionRow } from '@/components/SessionRow';
import { Check, ChevronLeft, ChevronRight, Circle, CircleDot, Copy, Download, Star } from '@/components/icons';

export default function WeekDetail() {
  const { n } = useParams();
  const week = Number(n);
  if (!Number.isInteger(week) || week < 1 || week > TOTAL_WEEKS) return <Navigate to="/weeks" replace />;
  return <WeekBody key={week} week={week} />;
}

function WeekBody({ week }: { week: number }) {
  const data = useStore();
  const def = weekDef(week);
  const phase = phaseOfWeek(week);
  const cw = currentWeek(data);

  return (
    <>
      <PageHead
        title={`Week ${week}: ${def.topic}`}
        subtitle={
          <>
            Phase {phase.id} · {phase.title}
            {data.startDate && ` · ${fmtRange(weekRange(data, week))}`}
            {cw === week && ' · this week'}
          </>
        }
      >
        <WeekNav week={week} />
      </PageHead>

      <div className="grid-2">
        <div className="stack">
          <WeekChecklistCard data={data} week={week} />
          <WeekDsaCard data={data} week={week} />
          <WeekNotesCard data={data} week={week} />
          <WeekRetroCard data={data} week={week} />
        </div>
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Log time</h2>
              <MoreLink to="/log">Study log</MoreLink>
            </div>
            <LogSessionForm week={week} />
          </div>
          <WeekFollowUpsCard data={data} week={week} />
          <WeekSessionsCard data={data} week={week} />
          <WeekSummaryCard data={data} week={week} />
        </div>
      </div>
    </>
  );
}

function WeekNav({ week }: { week: number }) {
  return (
    <nav className="week-nav" aria-label="Week navigation">
      <Link to="/weeks" className="btn ghost">
        All weeks
      </Link>
      {week > 1 ? (
        <Link to={`/weeks/${week - 1}`} className="btn" aria-label={`Previous week, week ${week - 1}`}>
          <ChevronLeft size={16} /> Week {week - 1}
        </Link>
      ) : (
        <span className="btn" aria-disabled="true">
          First week
        </span>
      )}
      {week < TOTAL_WEEKS ? (
        <Link to={`/weeks/${week + 1}`} className="btn" aria-label={`Next week, week ${week + 1}`}>
          Week {week + 1} <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="btn" aria-disabled="true">
          Last week
        </span>
      )}
    </nav>
  );
}

function WeekChecklistCard({ data, week }: { data: AppData; week: number }) {
  const setWeekTasks = useStore((s) => s.setWeekTasks);
  const setWeekFlag = useStore((s) => s.setWeekFlag);
  const addCustomTask = useStore((s) => s.addCustomTask);
  const def = weekDef(week);
  const items = taskItems(data, week);
  const wp = weekProgress(data, week);
  const st = weekStatus(data, week);
  const minutes = sessionsForWeek(data, week).reduce((s, l) => s + l.minutes, 0);
  const [newTask, setNewTask] = useState('');

  const submitTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addCustomTask(week, newTask.trim());
    setNewTask('');
    toast('Task added to this week.');
  };

  const markAll = () => {
    setWeekTasks(week, items.map((i) => i.key), true);
    toast(`Week ${week} marked done.`);
  };
  const clearAll = () => {
    if (!window.confirm(`Untick all ${wp.total} ${TERMS.tasks} for week ${week}? Their completion dates will be lost.`)) return;
    setWeekTasks(week, items.map((i) => i.key), false);
    toast(`Week ${week} cleared.`);
  };
  const flag = data.weekStatus[String(week)];
  const setFlag = (next: WeekFlag | null) => {
    setWeekFlag(week, next);
    if (!next) toast(`Week ${week} resumed.`);
    else if (next === 'skipped') toast(`Week ${week} skipped. Skipped weeks don't count against your pace.`);
    else toast(`Week ${week} blocked. Note what is blocking it in a follow-up.`);
  };

  return (
    <div className="card">
      <div className="card-head">
        <h2>Checklist</h2>
        <span className="row">
          <StatusPill status={st} />
          <span className="small ink-2 tabular">
            {wp.done}/{wp.total}
          </span>
        </span>
      </div>
      <ProgressBar done={wp.done} total={wp.total} label="Week progress" valueText={`${wp.done} of ${wp.total} ${TERMS.tasks} done`} />
      {week > 1 && data.retros[String(week - 1)]?.plan && (
        <div className="callout section-sm">
          <div className="callout-title">Your plan for this week</div>
          <div className="small">{data.retros[String(week - 1)]!.plan}</div>
          <div className="hint">Written in last week's retrospective.</div>
        </div>
      )}
      {def.milestone && (
        <div className="section-sm">
          <MilestoneBadge milestone={def.milestone} />{' '}
          <MoreLink to="/projects">{projectById(def.milestone.project).title}</MoreLink>
        </div>
      )}
      <div className="reading section-sm">
        <span className="label">{TERMS.reading}</span>
        <div className="small">
          <Vi>{def.reading}</Vi>
        </div>
        {def.readingRefs && def.readingRefs.length > 0 && (
          <div className="row small section-xs">
            {def.readingRefs.map((id) => {
              const r = resourceById(id);
              return r ? (
                <Link key={id} to={`/resources#${id}`} className="pill">
                  {r.title}
                </Link>
              ) : null;
            })}
          </div>
        )}
      </div>
      <div className="section-sm">
        <TaskChecklist week={week} showDates deletable />
      </div>
      <form className="inline-add" onSubmit={submitTask}>
        <input type="text" className="input" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add your own task for this week…" aria-label="New task for this week" />
        <button className="btn" type="submit">
          Add
        </button>
      </form>
      <div className="row section-sm">
        {wp.done < wp.total ? (
          <button className="btn sm" onClick={markAll}>
            Mark all done
          </button>
        ) : (
          <button className="btn sm" onClick={clearAll}>
            Untick all
          </button>
        )}
        {flag ? (
          <button className="btn sm ghost" onClick={() => setFlag(null)}>
            Resume week
          </button>
        ) : (
          <>
            <button className="btn sm ghost" onClick={() => setFlag('skipped')} title="Skipped weeks don't count against your pace">
              Skip week
            </button>
            <button className="btn sm ghost" onClick={() => setFlag('blocked')} title="Mark the week as blocked; it stays in the plan but is flagged">
              Block week
            </button>
          </>
        )}
        <span className="small ink-3 push-end">{minutes > 0 ? `${fmtHours(minutes)} logged` : 'No time logged yet'}</span>
      </div>
    </div>
  );
}

function WeekDsaCard({ data, week }: { data: AppData; week: number }) {
  const def = weekDef(week);
  const candidates = seedCandidates(data, week);
  if (def.dsa.problems.length === 0) return null;
  const add = () => {
    const n = seedProblems(candidates);
    toast(`${plural(n, 'problem')} added to DSA.`);
  };
  return (
    <div className="card">
      <div className="card-head">
        <h2>DSA this week</h2>
        <MoreLink to="/dsa">All problems</MoreLink>
      </div>
      <div className="small ink-2 section-xs-b">
        <Vi>{def.dsa.pattern}</Vi>
      </div>
      <ul className="list compact">
        {def.dsa.problems.map((title) => {
          const st = seedState(data, week, title);
          const Icon = st === 'solved' ? Check : st === 'todo' ? CircleDot : Circle;
          return (
            <li key={title} className={st === 'solved' ? 'done' : ''}>
              <div className="body">
                <div className="title row">
                  <Icon size={14} />
                  <span>{title}</span>
                  <span className="small ink-3">{st === 'solved' ? 'solved' : st === 'todo' ? 'in your list' : 'not added'}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="row section-sm">
        {candidates.length > 0 ? (
          <button className="btn sm" onClick={add}>
            Add {plural(candidates.length, 'problem')} to DSA
          </button>
        ) : (
          <span className="small ink-3">All of this week's problems are in your DSA list.</span>
        )}
      </div>
    </div>
  );
}

function WeekNotesCard({ data, week }: { data: AppData; week: number }) {
  const id = useId();
  const setWeekNote = useStore((s) => s.setWeekNote);
  const setWeekLink = useStore((s) => s.setWeekLink);
  const [note, setNote, commit] = useDraft(data.weekNotes[String(week)] ?? '', (v) => {
    setWeekNote(week, v);
    toast('Notes saved.');
  });
  const [link, setLink, commitLink] = useDraft(data.weekLinks[String(week)] ?? '', (v) => {
    setWeekLink(week, v);
    toast(v.trim() ? 'Link saved.' : 'Link removed.');
  });
  return (
    <div className="card">
      <div className="card-head">
        <h2>Notes</h2>
        <span className="hint">Saved when you leave the field</span>
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={commit} placeholder="Key takeaways, links, questions, what to revisit…" rows={7} aria-label={`Notes for week ${week}`} />
      <div className="field section-sm">
        <label htmlFor={`${id}-link`}>Code / LeetCode link</label>
        <input id={`${id}-link`} type="url" value={link} onChange={(e) => setLink(e.target.value)} onBlur={commitLink} placeholder="https://github.com/you/repo/tree/week-1" />
        {data.weekLinks[String(week)] && (
          <span className="hint">
            <a href={data.weekLinks[String(week)]} target="_blank" rel="noreferrer">
              Open link<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </span>
        )}
      </div>
    </div>
  );
}

function RatingInput({ value, onChange, labelId, descId }: { value: number; onChange: (n: number) => void; labelId: string; descId: string }) {
  const focusIdx = Math.max(0, (value || 1) - 1);
  const move = (i: number) => {
    onChange(i + 1);
    document.getElementById(`${labelId}-star-${i}`)?.focus();
  };
  return (
    <div className="rating" role="radiogroup" aria-labelledby={labelId} aria-describedby={descId}>
      {[1, 2, 3, 4, 5].map((n, i) => (
        <button
          key={n}
          id={`${labelId}-star-${i}`}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} of 5, ${RATING_LABEL[n]}`}
          tabIndex={i === focusIdx ? 0 : -1}
          className={`star${value >= n ? ' on' : ''}`}
          onClick={() => onChange(value === n ? 0 : n)}
          onKeyDown={(e) => rovingKey(e, i, 5, move)}
        >
          <Star size={22} filled={value >= n} />
        </button>
      ))}
    </div>
  );
}

function WeekRetroCard({ data, week }: { data: AppData; week: number }) {
  const id = useId();
  const setRetro = useStore((s) => s.setRetro);
  const retro = data.retros[String(week)];
  const [wentWell, setWentWell, commitWell] = useDraft(retro?.wentWell ?? '', (v) => {
    setRetro(week, { wentWell: v });
    toast('Retrospective saved.');
  });
  const [improve, setImprove, commitImprove] = useDraft(retro?.improve ?? '', (v) => {
    setRetro(week, { improve: v });
    toast('Retrospective saved.');
  });
  const [plan, setPlan, commitPlan] = useDraft(retro?.plan ?? '', (v) => {
    setRetro(week, { plan: v });
    toast(week < TOTAL_WEEKS ? `Plan saved. It shows on week ${week + 1} and on Today.` : 'Plan saved.');
  });
  const rating = retro?.rating ?? 0;
  return (
    <div className="card">
      <div className="card-head">
        <h2>Weekly retrospective</h2>
        {retro?.at && <span className="hint">Updated {fmtDate(retro.at)}</span>}
      </div>
      <div className="field">
        <span className="label" id={`${id}-rating-label`}>
          How did the week go?
        </span>
        <div className="row">
          <RatingInput value={rating} onChange={(n) => setRetro(week, { rating: n })} labelId={`${id}-rating-label`} descId={`${id}-rating-desc`} />
          <span className="small ink-2" id={`${id}-rating-desc`}>
            {RATING_LABEL[rating]}
          </span>
        </div>
      </div>
      <div className="grid-2 section-sm">
        <div className="field">
          <label htmlFor={`${id}-well`}>What went well</label>
          <textarea id={`${id}-well`} rows={3} value={wentWell} onChange={(e) => setWentWell(e.target.value)} onBlur={commitWell} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-improve`}>What to improve next week</label>
          <textarea id={`${id}-improve`} rows={3} value={improve} onChange={(e) => setImprove(e.target.value)} onBlur={commitImprove} />
        </div>
      </div>
      {week < TOTAL_WEEKS && (
        <div className="field section-sm">
          <label htmlFor={`${id}-plan`}>Plan for next week</label>
          <textarea
            id={`${id}-plan`}
            rows={2}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            onBlur={commitPlan}
            placeholder={`One or two intentions for week ${week + 1}. They show up at the top of that week and on Today.`}
          />
        </div>
      )}
    </div>
  );
}

function WeekFollowUpsCard({ data, week }: { data: AppData; week: number }) {
  const followUps = sortFollowUps(data.followUps.filter((f) => f.week === week));
  return (
    <div className="card">
      <div className="card-head">
        <h2>Follow-ups for this week</h2>
        <MoreLink to="/followups" ariaLabel="All follow-ups">
          All follow-ups
        </MoreLink>
      </div>
      <FollowUpForm week={week} />
      {followUps.length === 0 ? (
        <div className="hint section-sm">Nothing linked to this week yet.</div>
      ) : (
        <ul className="list section-sm">
          {followUps.map((f) => (
            <FollowUpRow key={f.id} f={f} compact />
          ))}
        </ul>
      )}
    </div>
  );
}

function WeekSessionsCard({ data, week }: { data: AppData; week: number }) {
  const sessions = sessionsForWeek(data, week);
  const minutes = sessions.reduce((s, l) => s + l.minutes, 0);
  return (
    <div className="card">
      <div className="card-head">
        <h2>Sessions this week</h2>
        <span className="small ink-2">{sessions.length ? `${fmtHours(minutes)} in ${plural(sessions.length, 'session')}` : ''}</span>
      </div>
      {sessions.length === 0 ? (
        <EmptyState>No sessions for this week yet. Use Log time above, or start the focus timer.</EmptyState>
      ) : (
        <ul className="list">
          {sessions.map((l) => (
            <SessionRow key={l.id} log={l} showDate onDelete={() => deleteLogWithUndo(l)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function WeekSummaryCard({ data, week }: { data: AppData; week: number }) {
  const wp = weekProgress(data, week);
  const sessions = sessionsForWeek(data, week);
  const minutes = sessions.reduce((s, l) => s + l.minutes, 0);
  const followUps = data.followUps.filter((f) => f.week === week);
  const solved = data.problems.filter((p) => p.week === week && p.status === 'solved').length;
  const rating = data.retros[String(week)]?.rating ?? 0;

  const copy = async () => {
    const md = weekSummaryMarkdown(data, week);
    try {
      await navigator.clipboard.writeText(md);
      toast('Week summary copied as Markdown.');
    } catch {
      downloadText(`week-${week}-summary.md`, md, 'text/markdown');
      toast('Clipboard unavailable, so the summary was downloaded instead.');
    }
  };

  return (
    <div className="card">
      <div className="card-head">
        <h2>Week summary</h2>
      </div>
      <dl className="kv">
        <dt>Tasks</dt>
        <dd>
          {wp.done} / {wp.total}
        </dd>
        <dt>Time</dt>
        <dd>
          {fmtHours(minutes)} in {plural(sessions.length, 'session')}
        </dd>
        <dt>Follow-ups</dt>
        <dd>
          {followUps.filter((f) => f.done).length} closed, {followUps.filter((f) => !f.done).length} open
        </dd>
        <dt>DSA</dt>
        <dd>{plural(solved, 'problem')} solved</dd>
        <dt>Rating</dt>
        <dd>{rating ? <Stars rating={rating} size={13} /> : '—'}</dd>
        {data.weekLinks[String(week)] && (
          <>
            <dt>Code</dt>
            <dd>
              <a href={data.weekLinks[String(week)]} target="_blank" rel="noreferrer">
                {data.weekLinks[String(week)].replace(/^https?:\/\//, '')}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </dd>
          </>
        )}
      </dl>
      <div className="row section-sm">
        <button className="btn" onClick={copy}>
          <Copy size={15} /> Copy as Markdown
        </button>
        <button className="btn ghost" onClick={() => downloadText(`week-${week}-summary.md`, weekSummaryMarkdown(data, week), 'text/markdown')}>
          <Download size={15} /> Download .md
        </button>
      </div>
    </div>
  );
}
