import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { PHASES, PROJECTS, TOTAL_WEEKS, phaseOfWeek, weekDef } from '@/data/roadmap';
import {
  activeDays, currentWeek, dueProblems, expectedDone, isOverdue, minutesByCalendarWeek, minutesByDay, minutesThisWeek, openFollowUps, overallProgress,
  overdueFollowUps, pace, phaseProgress, planStatus, projectProgress, projectState, sortFollowUps, streak, taskItems, isDone, weekProgress, weekRange, weekStatus,
} from '@/lib/derive';
import { diffDays, fmtDate, fmtHours, pct, plural, relDay, today } from '@/lib/date';
import { EmptyState, PageHead, ProgressBar, ProgressLine, StatTile, StatusPill, WeekLink } from '@/components/ui';
import { WeeklyHoursChart } from '@/components/WeeklyHoursChart';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { toast } from '@/components/ui';

const PROJECT_STATUS_LABEL = { 'not-started': 'Not started', 'in-progress': 'In progress', done: 'Done' } as const;

export default function Overview() {
  const data = useStore();
  const setStartDate = useStore((s) => s.setStartDate);
  const setTask = useStore((s) => s.setTask);
  const [start, setStart] = useState(today());

  const status = planStatus(data);
  const cw = currentWeek(data);
  const overall = overallProgress(data);
  const thisWeekMin = minutesThisWeek(data);
  const targetMin = data.weeklyTargetHours * 60;
  const days = streak(data);
  const open = openFollowUps(data);
  const overdue = overdueFollowUps(data);
  const p = pace(data);
  const expected = expectedDone(data);
  const buckets = minutesByCalendarWeek(data, 12);
  const dueSoon = sortFollowUps(open).slice(0, 6);
  const reviewsDue = dueProblems(data).length;

  const submitStart = (e: FormEvent) => {
    e.preventDefault();
    if (!start) return;
    setStartDate(start);
    toast('Start date saved');
  };

  return (
    <>
      <PageHead title="Overview" subtitle={fmtDate(today(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      {status === 'unset' && (
        <div className="banner">
          <div className="grow">
            <strong>Set your start date</strong> to unlock the current week, on-track pace, and week dates.
          </div>
          <form onSubmit={submitStart}>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-label="Plan start date" required />
            <button className="btn primary" type="submit">
              Start plan
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="hero">
          <div>
            {status === 'active' && cw && (
              <>
                <div className="kicker">
                  Week {cw} of {TOTAL_WEEKS} · Phase {phaseOfWeek(cw).id}: {phaseOfWeek(cw).title}
                </div>
                <h2>{weekDef(cw).topic}</h2>
                <div className="sub">
                  {(() => {
                    const r = weekRange(data, cw)!;
                    const dayNo = diffDays(r.start, today()) + 1;
                    return `Day ${dayNo} of 7 · ${fmtDate(r.start)} – ${fmtDate(r.end)} · ${overall.weeksDone} weeks completed`;
                  })()}
                </div>
              </>
            )}
            {status === 'upcoming' && (
              <>
                <div className="kicker">Plan starts {relDay(data.startDate!)}</div>
                <h2>{weekDef(1).topic}</h2>
                <div className="sub">Week 1 begins on {fmtDate(data.startDate, { weekday: 'long', day: 'numeric', month: 'long' })}.</div>
              </>
            )}
            {status === 'finished' && (
              <>
                <div className="kicker">36 weeks elapsed</div>
                <h2>Plan window complete</h2>
                <div className="sub">
                  {overall.done} of {overall.total} items done. Keep ticking off what is left, or reset the start date in Settings.
                </div>
              </>
            )}
            {status === 'unset' && (
              <>
                <div className="kicker">36-week plan · 4 phases · {overall.total} items</div>
                <h2>Frontend → Senior Fullstack / Software Engineer</h2>
                <div className="sub">Golang backend, distributed systems, AWS, and AI-native work.</div>
              </>
            )}
          </div>
          {p && (
            <div className={`pace ${p.kind}`} title={`Expected about ${expected} items done by today at a linear pace.`}>
              <span className="glyph" aria-hidden="true">
                {p.kind === 'ahead' ? '▲' : p.kind === 'behind' ? '▼' : '●'}
              </span>
              {p.kind === 'on-track' && 'On track'}
              {p.kind === 'ahead' && `Ahead by ${plural(p.delta, 'item')}`}
              {p.kind === 'behind' && `Behind by ${plural(-p.delta, 'item')}`}
            </div>
          )}
        </div>
      </div>

      <div className="grid-tiles" style={{ marginTop: 14 }}>
        <StatTile label="Overall progress" value={`${pct(overall.done, overall.total)}%`} sub={`${overall.done} / ${overall.total} items · ${overall.weeksDone} / ${TOTAL_WEEKS} weeks`} />
        <StatTile
          label="Hours this week"
          value={fmtHours(thisWeekMin)}
          sub={targetMin > 0 ? `${pct(thisWeekMin, targetMin)}% of ${data.weeklyTargetHours}h target` : 'No weekly target set'}
        />
        <StatTile label="Streak" value={plural(days, 'day')} sub={days > 0 ? 'Consecutive days with activity' : 'Log time or tick a task today'} />
        <StatTile
          label="Follow-ups"
          value={open.length}
          sub={overdue.length > 0 ? <span className="pill overdue">⚠ {plural(overdue.length, 'overdue')}</span> : 'Nothing overdue'}
        />
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h2>Phases</h2>
          <Link to="/weeks" className="small">
            All weeks →
          </Link>
        </div>
        <div className="stack">
          {PHASES.map((ph) => {
            const pp = phaseProgress(data, ph.id);
            return (
              <ProgressLine
                key={ph.id}
                title={
                  <span>
                    <strong>Phase {ph.id}</strong> · {ph.title} <span className="faint small">(weeks {ph.weeks[0]}–{ph.weeks[1]})</span>
                  </span>
                }
                done={pp.done}
                total={pp.total}
                right={`${pp.weeksDone}/${pp.weeks} weeks · ${pct(pp.done, pp.total)}%`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head">
            <h2>{cw ? `This week · Week ${cw}` : 'Next up · Week 1'}</h2>
            <span className="row">
              <StatusPill status={weekStatus(data, cw ?? 1)} />
              <WeekLink week={cw ?? 1}>
                <span className="small">Open →</span>
              </WeekLink>
            </span>
          </div>
          <div className="small muted" style={{ marginBottom: 8 }}>
            {weekDef(cw ?? 1).topic}
          </div>
          <ul className="checklist">
            {taskItems(data, cw ?? 1).map((it) => {
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
                </li>
              );
            })}
          </ul>
          <div className="small faint" style={{ marginTop: 8 }}>
            {(() => {
              const wp = weekProgress(data, cw ?? 1);
              return `${wp.done} of ${wp.total} done`;
            })()}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Follow-ups</h2>
            <Link to="/followups" className="small">
              All follow-ups →
            </Link>
          </div>
          {reviewsDue > 0 && (
            <div className="row" style={{ marginBottom: 10 }}>
              <span className="pill accent">⟳ {plural(reviewsDue, 'DSA problem')} due for review</span>
              <Link to="/dsa" className="small">
                Review →
              </Link>
            </div>
          )}
          {dueSoon.length === 0 ? (
            <EmptyState>No open follow-ups. Add questions, blockers, or things to revisit.</EmptyState>
          ) : (
            <ul className="list">
              {dueSoon.map((f) => (
                <li key={f.id}>
                  <div className="body">
                    <div className="title">{f.title}</div>
                    <div className="meta">
                      {f.due && (
                        <span className={isOverdue(f) ? 'pill overdue' : ''}>
                          {isOverdue(f) ? '⚠ overdue · ' : 'due '}
                          {relDay(f.due)}
                        </span>
                      )}
                      {f.priority === 'high' && <span className="pill warning">High</span>}
                      {f.week && <WeekLink week={f.week} />}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h2>Activity · last 26 weeks</h2>
          <span className="small muted">Logged time, ticked tasks, closed follow-ups, solved problems</span>
        </div>
        <ActivityHeatmap minutesByDay={minutesByDay(data)} activeDays={activeDays(data)} />
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head">
            <h2>Study hours · last 12 weeks</h2>
            <Link to="/log" className="small">
              Study log →
            </Link>
          </div>
          {data.logs.length === 0 ? (
            <EmptyState>No sessions logged yet. Log time from the study log or any week page.</EmptyState>
          ) : (
            <WeeklyHoursChart buckets={buckets} targetMinutes={targetMin} />
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Side projects</h2>
            <Link to="/projects" className="small">
              Details →
            </Link>
          </div>
          <div className="stack">
            {PROJECTS.map((pr) => {
              const st = projectState(data, pr.id);
              const pp = projectProgress(data, pr.id);
              return (
                <ProgressLine
                  key={pr.id}
                  title={
                    <span>
                      <strong>{pr.number}.</strong> {pr.title}{' '}
                      <span className={`pill ${st.status === 'done' ? 'done' : st.status === 'in-progress' ? 'in-progress' : ''}`}>
                        {PROJECT_STATUS_LABEL[st.status]}
                      </span>
                    </span>
                  }
                  done={pp.done}
                  total={pp.total}
                  right={`weeks ${pr.weeks[0]}–${pr.weeks[1]} · ${pp.done}/${pp.total}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {status === 'active' && cw && cw < TOTAL_WEEKS && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head">
            <h2>Coming up</h2>
          </div>
          <div className="stack">
            {[cw + 1, cw + 2].filter((w) => w <= TOTAL_WEEKS).map((w) => {
              const r = weekRange(data, w)!;
              const wp = weekProgress(data, w);
              return (
                <div key={w} className="row between">
                  <span>
                    <WeekLink week={w}>
                      <strong>Week {w}</strong>
                    </WeekLink>{' '}
                    · {weekDef(w).topic}
                  </span>
                  <span className="small faint nowrap">
                    {fmtDate(r.start)} – {fmtDate(r.end)} · {wp.done}/{wp.total}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar done={cw} total={TOTAL_WEEKS} thin label="Weeks elapsed" />
          </div>
        </div>
      )}
    </>
  );
}
