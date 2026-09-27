import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { TOTAL_WEEKS, weekDef } from '@/data/roadmap';
import { currentWeek, dueProblems, minutesInRange, minutesThisWeek, openFollowUps, planStatus, sortFollowUps, streak, weekProgress, weekRange } from '@/lib/derive';
import { diffDays, fmtDateWeekday, fmtRange, today } from '@/lib/date';
import { fmtHours, pct, plural } from '@/lib/format';
import { TERMS } from '@/lib/labels';
import { EmptyState, MoreLink, PageHead, StatTile, Vi, toast } from '@/components/ui';
import { TaskChecklist } from '@/components/TaskChecklist';
import { LogSessionForm } from '@/components/LogSessionForm';
import { FollowUpRow } from '@/components/FollowUpRow';
import { FocusTimer } from '@/components/FocusTimer';
import { RefreshCw } from '@/components/icons';

/* The daily entry point: what to do now, what is due, and how today is going. */
export default function Today() {
  const data = useStore();
  const markProblemReviewed = useStore((s) => s.markProblemReviewed);
  const t = today();
  const status = planStatus(data);
  const cw = currentWeek(data);
  const week = cw ?? 1;
  const wp = weekProgress(data, week);
  const range = weekRange(data, week);
  const plan = week > 1 ? data.retros[String(week - 1)]?.plan : undefined;
  const due = sortFollowUps(openFollowUps(data)).filter((f) => f.due && f.due <= t);
  const reviews = dueProblems(data);
  const todayMin = minutesInRange(data, t, t);
  const weekMin = minutesThisWeek(data);
  const targetMin = data.weeklyTargetHours * 60;
  const days = streak(data);

  return (
    <>
      <PageHead title="Today" subtitle={fmtDateWeekday(t)} />
      <div className="stack">
        {status === 'unset' && (
          <div className="banner">
            <div className="grow">
              <strong>No start date yet.</strong>
              <div className="small">Today shows week 1 until you pick the day week 1 begins.</div>
            </div>
            <Link to="/settings" className="btn primary">
              Set start date
            </Link>
          </div>
        )}

        <div className="grid-tiles">
          <StatTile label="Logged today" value={fmtHours(todayMin)} sub={todayMin > 0 ? 'Keep going' : 'Nothing yet today'} />
          <StatTile label="This calendar week" value={fmtHours(weekMin)} sub={targetMin > 0 ? `${pct(weekMin, targetMin)}% of ${data.weeklyTargetHours}h target` : 'No target set'} />
          <StatTile label="Streak" value={plural(days, 'day')} sub={days > 0 ? 'Days in a row with activity' : 'Tick a task or log a session'} />
          <StatTile label={cw ? `Week ${cw} of ${TOTAL_WEEKS}` : 'Week 1 preview'} value={`${wp.done}/${wp.total}`} sub={range ? `Day ${diffDays(range.start, t) + 1} of 7 · ${fmtRange(range)}` : `${TERMS.tasks} done`} />
        </div>

        <div className="grid-2">
          <div className="stack">
            <div className="card">
              <div className="card-head">
                <h2>
                  Week {week} · <Vi>{weekDef(week).topic}</Vi>
                </h2>
                <MoreLink to={`/weeks/${week}`} ariaLabel={`Open week ${week}`}>
                  Open week
                </MoreLink>
              </div>
              {plan && (
                <div className="callout section-xs-b">
                  <div className="callout-title">Your plan for this week</div>
                  <div className="small">{plan}</div>
                </div>
              )}
              <TaskChecklist week={week} onlyOpen />
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Log a session</h2>
                <span className="small ink-2">or use the timer</span>
              </div>
              <div className="today-timer">
                <FocusTimer />
              </div>
              <LogSessionForm week={cw ?? undefined} />
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="card-head">
                <h2>Due today</h2>
                <MoreLink to="/followups">All follow-ups</MoreLink>
              </div>
              {due.length === 0 ? (
                <EmptyState>No follow-ups due today.</EmptyState>
              ) : (
                <ul className="list">
                  {due.map((f) => (
                    <FollowUpRow key={f.id} f={f} showWeek />
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <div className="card-head">
                <h2>DSA reviews due</h2>
                <MoreLink to="/dsa">All problems</MoreLink>
              </div>
              {reviews.length === 0 ? (
                <EmptyState>No reviews due. Solved problems come back after 1, 3, 7, 14, and 30 days.</EmptyState>
              ) : (
                <ul className="list">
                  {reviews.map((p) => (
                    <li key={p.id}>
                      <div className="body">
                        <div className="title">
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noreferrer">
                              {p.title}
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          ) : (
                            p.title
                          )}
                        </div>
                        <div className="meta">
                          {p.topic && <span>{p.topic}</span>}
                          <span>reviewed {p.reviewCount}×</span>
                        </div>
                      </div>
                      <div className="actions">
                        <button
                          className="btn sm primary"
                          onClick={() => {
                            markProblemReviewed(p.id);
                            toast(`Reviewed "${p.title}".`);
                          }}
                          aria-label={`Mark ${p.title} reviewed`}
                        >
                          <RefreshCw size={13} /> Mark reviewed
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
