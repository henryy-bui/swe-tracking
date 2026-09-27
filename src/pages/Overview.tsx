import { useState, type FormEvent } from 'react';
import { useStore, type AppData } from '@/store/useStore';
import { PHASES, PROJECTS, TOTAL_WEEKS, phaseOfWeek, weekDef } from '@/data/roadmap';
import {
  activeDays, currentWeek, dueProblems, expectedDone, forecast, minutesByCalendarWeek, minutesByDay, minutesThisWeek, openFollowUps, overallProgress,
  overdueFollowUps, pace, phaseProgress, planStatus, projectProgress, projectState, sortFollowUps, streak, weekProgress, weekRange, weekStatus,
} from '@/lib/derive';
import { achievements, nextUp, unlockedCount } from '@/lib/achievements';
import { diffDays, fmtDateFull, fmtDateWeekday, fmtRange, relDay, today } from '@/lib/date';
import { fmtHours, pct, plural } from '@/lib/format';
import { TERMS } from '@/lib/labels';
import { Arrow, DueLabel, EmptyState, MoreLink, PageHead, PriorityPill, ProgressBar, ProgressLine, StatTile, StatusPill, Vi, WeekLink, toast } from '@/components/ui';
import { WeeklyHoursChart } from '@/components/WeeklyHoursChart';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { TaskChecklist } from '@/components/TaskChecklist';
import { AlertTriangle, RefreshCw, Target, TrendingDown, TrendingUp } from '@/components/icons';

export default function Overview() {
  const data = useStore();
  const status = planStatus(data);
  const cw = currentWeek(data);

  return (
    <>
      <PageHead title="Overview" subtitle={fmtDateWeekday(today())} />
      <div className="stack">
        {status === 'unset' && <StartDateBanner />}
        <HeroCard data={data} />
        <Tiles data={data} />
        <PhasesCard data={data} />
        <div className="grid-2">
          <ThisWeekCard data={data} />
          <FollowUpsDueCard data={data} />
        </div>
        <ActivityCard data={data} />
        <div className="grid-2">
          <HoursCard data={data} />
          <ProjectsSummaryCard data={data} />
        </div>
        <AchievementsNextCard data={data} />
        {status === 'active' && cw && cw < TOTAL_WEEKS && <ComingUpCard data={data} cw={cw} />}
      </div>
    </>
  );
}

function StartDateBanner() {
  const setStartDate = useStore((s) => s.setStartDate);
  const [start, setStart] = useState(today());
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!start) return;
    setStartDate(start);
    toast('Start date saved. Week dates and pace are now shown.');
  };
  return (
    <div className="banner">
      <div className="grow">
        <strong>Pick the day week 1 begins.</strong>
        <div className="small">You can tick tasks already; dates, the current week, and your pace appear once a start date is set.</div>
      </div>
      <form onSubmit={submit}>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-label="Start date of week 1" required />
        <button className="btn primary" type="submit">
          Set start date
        </button>
      </form>
    </div>
  );
}

function PaceBadge({ data }: { data: AppData }) {
  const p = pace(data);
  const expected = expectedDone(data);
  if (!p) return null;
  const Icon = p.kind === 'ahead' ? TrendingUp : p.kind === 'behind' ? TrendingDown : Target;
  const text = p.kind === 'on-track' ? 'On track' : p.kind === 'ahead' ? `${plural(p.delta, TERMS.task)} ahead` : `${plural(-p.delta, TERMS.task)} behind`;
  return (
    <div className={`pace ${p.kind}`} title={`If the plan were spread evenly, about ${expected} ${TERMS.tasks} would be done by today.`}>
      <Icon size={16} /> {text}
    </div>
  );
}

function ForecastLine({ data }: { data: AppData }) {
  const fc = forecast(data);
  if (!fc) return null;
  const rate = Math.round(fc.ratePerWeek);
  const tail = Math.abs(fc.deltaWeeks) < 0.5 ? 'right on plan.' : fc.deltaWeeks < 0 ? `${plural(Math.round(-fc.deltaWeeks), 'week')} early.` : `${plural(Math.round(fc.deltaWeeks), 'week')} late.`;
  return (
    <div className="sub small">
      At your current pace (about {plural(rate, TERMS.task)} a week) you'll finish around <strong>{fmtDateFull(fc.finishDate)}</strong>, {tail}
    </div>
  );
}

function HeroCard({ data }: { data: AppData }) {
  const status = planStatus(data);
  const cw = currentWeek(data);
  const overall = overallProgress(data);
  return (
    <div className="card">
      <div className="hero">
        <div>
          {status === 'active' && cw && (
            <>
              <div className="kicker">
                Week {cw} of {TOTAL_WEEKS} · Phase {phaseOfWeek(cw).id}: {phaseOfWeek(cw).title}
              </div>
              <h2>
                <Vi>{weekDef(cw).topic}</Vi>
              </h2>
              <div className="sub">
                Day {diffDays(weekRange(data, cw)!.start, today()) + 1} of 7 · {fmtRange(weekRange(data, cw))} · {overall.weeksDone} weeks completed
              </div>
              <ForecastLine data={data} />
            </>
          )}
          {status === 'upcoming' && (
            <>
              <div className="kicker">Plan starts {relDay(data.startDate!)}</div>
              <h2>
                <Vi>{weekDef(1).topic}</Vi>
              </h2>
              <div className="sub">Week 1 begins on {fmtDateWeekday(data.startDate)}.</div>
            </>
          )}
          {status === 'finished' && (
            <>
              <div className="kicker">All {TOTAL_WEEKS} weeks are behind you</div>
              <h2>Plan period finished</h2>
              <div className="sub">
                {overall.done} of {overall.total} {TERMS.tasks} done. Keep ticking off what's left, or move the start date in Settings to run it again.
              </div>
            </>
          )}
          {status === 'unset' && (
            <>
              <div className="kicker">
                {TOTAL_WEEKS}-week plan · {PHASES.length} phases · {overall.total} {TERMS.tasks}
              </div>
              <h2>
                Frontend <Arrow /> Senior Fullstack / Software Engineer
              </h2>
              <div className="sub">Golang backend, distributed systems, AWS, and AI-native work.</div>
            </>
          )}
        </div>
        <PaceBadge data={data} />
      </div>
    </div>
  );
}

function Tiles({ data }: { data: AppData }) {
  const overall = overallProgress(data);
  const thisWeekMin = minutesThisWeek(data);
  const targetMin = data.weeklyTargetHours * 60;
  const days = streak(data);
  const open = openFollowUps(data);
  const overdue = overdueFollowUps(data);
  return (
    <div className="grid-tiles">
      <StatTile label="Overall progress" value={`${pct(overall.done, overall.total)}%`} sub={`${overall.done} of ${overall.total} ${TERMS.tasks} · ${overall.weeksDone} of ${TOTAL_WEEKS} weeks`} />
      <StatTile
        label="Hours this calendar week"
        value={fmtHours(thisWeekMin)}
        sub={targetMin > 0 ? `Mon–Sun · ${pct(thisWeekMin, targetMin)}% of your ${data.weeklyTargetHours}h target` : 'Mon–Sun · no weekly target set'}
      />
      <StatTile label="Streak" value={plural(days, 'day')} sub={days > 0 ? 'Days in a row with activity' : 'Log a session or tick a task today'} />
      <StatTile
        label="Follow-ups open"
        value={open.length}
        sub={
          overdue.length > 0 ? (
            <span className="pill overdue">
              <AlertTriangle size={12} /> {plural(overdue.length, 'overdue')}
            </span>
          ) : (
            'Nothing overdue'
          )
        }
      />
    </div>
  );
}

function PhasesCard({ data }: { data: AppData }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Phases</h2>
        <MoreLink to="/weeks">All weeks</MoreLink>
      </div>
      <div className="stack">
        {PHASES.map((ph) => {
          const pp = phaseProgress(data, ph.id);
          return (
            <ProgressLine
              key={ph.id}
              title={
                <span>
                  <strong>Phase {ph.id}</strong> · {ph.title}{' '}
                  <span className="ink-3 small">
                    (weeks {ph.weeks[0]}–{ph.weeks[1]})
                  </span>
                </span>
              }
              done={pp.done}
              total={pp.total}
              right={`${pp.weeksDone}/${pp.weeks} weeks · ${pct(pp.done, pp.total)}%`}
              valueText={`${pp.done} of ${pp.total} ${TERMS.tasks}, ${pp.weeksDone} of ${pp.weeks} weeks`}
            />
          );
        })}
      </div>
    </div>
  );
}

function ThisWeekCard({ data }: { data: AppData }) {
  const cw = currentWeek(data);
  const week = cw ?? 1;
  const wp = weekProgress(data, week);
  return (
    <div className="card">
      <div className="card-head">
        <h2>{cw ? `This week · Week ${cw}` : 'Week 1 preview'}</h2>
        <span className="row">
          <StatusPill status={weekStatus(data, week)} />
          <MoreLink to={`/weeks/${week}`} ariaLabel={`Open week ${week}`}>
            Open
          </MoreLink>
        </span>
      </div>
      <div className="small ink-2 section-xs-b">
        <Vi>{weekDef(week).topic}</Vi>
      </div>
      <TaskChecklist week={week} />
      <div className="small ink-3 section-xs">
        {wp.done} of {wp.total} done
      </div>
    </div>
  );
}

function FollowUpsDueCard({ data }: { data: AppData }) {
  const dueSoon = sortFollowUps(openFollowUps(data)).slice(0, 6);
  const reviewsDue = dueProblems(data).length;
  return (
    <div className="card">
      <div className="card-head">
        <h2>Follow-ups</h2>
        <MoreLink to="/followups">All follow-ups</MoreLink>
      </div>
      {reviewsDue > 0 && (
        <div className="row section-xs-b">
          <span className="pill accent">
            <RefreshCw size={12} /> {plural(reviewsDue, 'DSA problem')} to review
          </span>
          <MoreLink to="/dsa" ariaLabel="Review due DSA problems">
            Review
          </MoreLink>
        </div>
      )}
      {dueSoon.length === 0 ? (
        <EmptyState to="/followups" linkText="Add one on the Follow-ups page.">
          Nothing to follow up. Capture questions, blockers, or things to revisit.
        </EmptyState>
      ) : (
        <ul className="list">
          {dueSoon.map((f) => (
            <li key={f.id}>
              <div className="body">
                <div className="title">{f.title}</div>
                <div className="meta">
                  <DueLabel followUp={f} />
                  {f.priority === 'high' && <PriorityPill priority="high" />}
                  {f.week && <WeekLink week={f.week} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActivityCard({ data }: { data: AppData }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Activity · last 26 weeks</h2>
        <span className="small ink-2">Days with logged time or ticks</span>
      </div>
      <ActivityHeatmap minutesByDay={minutesByDay(data)} activeDays={activeDays(data)} />
    </div>
  );
}

function HoursCard({ data }: { data: AppData }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Study hours · last 12 weeks</h2>
        <MoreLink to="/log">Study log</MoreLink>
      </div>
      {data.logs.length === 0 ? (
        <EmptyState to="/log" linkText="Log a session.">
          No sessions yet. Use the focus timer or log time by hand.
        </EmptyState>
      ) : (
        <WeeklyHoursChart buckets={minutesByCalendarWeek(data, 12)} targetMinutes={data.weeklyTargetHours * 60} />
      )}
    </div>
  );
}

function ProjectsSummaryCard({ data }: { data: AppData }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Side projects</h2>
        <MoreLink to="/projects" ariaLabel="Side project details">
          Details
        </MoreLink>
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
                  <strong>{pr.number}.</strong> {pr.title} <StatusPill status={st.status} />
                </span>
              }
              done={pp.done}
              total={pp.total}
              right={`weeks ${pr.weeks[0]}–${pr.weeks[1]} · ${pp.done}/${pp.total}`}
              valueText={`${pp.done} of ${pp.total} milestones`}
            />
          );
        })}
      </div>
    </div>
  );
}

function AchievementsNextCard({ data }: { data: AppData }) {
  const list = achievements(data);
  const next = nextUp(list, 3);
  return (
    <div className="card">
      <div className="card-head">
        <h2>
          {TERMS.achievements} · {unlockedCount(list)}/{list.length}
        </h2>
        <MoreLink to="/milestones">All achievements</MoreLink>
      </div>
      {next.length === 0 ? (
        <EmptyState>Tick a task or log a session to start earning achievements.</EmptyState>
      ) : (
        <div className="stack">
          {next.map((a) => (
            <ProgressLine
              key={a.id}
              title={
                <span>
                  <strong>{a.title}</strong> <span className="ink-3 small">· {a.description}</span>
                </span>
              }
              done={Math.round(a.progress * 100)}
              total={100}
              right={a.detail}
              valueText={a.detail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ComingUpCard({ data, cw }: { data: AppData; cw: number }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Coming up</h2>
      </div>
      <div className="stack">
        {[cw + 1, cw + 2]
          .filter((w) => w <= TOTAL_WEEKS)
          .map((w) => {
            const wp = weekProgress(data, w);
            return (
              <div key={w} className="row between">
                <span>
                  <WeekLink week={w}>
                    <strong>Week {w}</strong>
                  </WeekLink>{' '}
                  · <Vi>{weekDef(w).topic}</Vi>
                </span>
                <span className="small ink-3">
                  {fmtRange(weekRange(data, w))} · {wp.done}/{wp.total}
                </span>
              </div>
            );
          })}
      </div>
      <div className="section-sm">
        <ProgressBar done={cw} total={TOTAL_WEEKS} thin label="Weeks elapsed" valueText={`${cw} of ${TOTAL_WEEKS} weeks`} />
      </div>
    </div>
  );
}
