import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, type LogTag } from '@/store/useStore';
import { minutesByCalendarWeek, minutesThisWeek, totalMinutes } from '@/lib/derive';
import { fmtDateLong, weekStart } from '@/lib/date';
import { fmtHours, pct, plural } from '@/lib/format';
import { deleteLogWithUndo } from '@/lib/undo';
import { EmptyState, PageHead, StatTile } from '@/components/ui';
import { WeeklyHoursChart } from '@/components/WeeklyHoursChart';
import { LogSessionForm } from '@/components/LogSessionForm';
import { SessionRow } from '@/components/SessionRow';
import { LogTagSelect } from '@/components/fields';

export default function StudyLog() {
  const data = useStore();
  const [filter, setFilter] = useState<'all' | LogTag>('all');

  const total = totalMinutes(data);
  const thisWeek = minutesThisWeek(data);
  const buckets = minutesByCalendarWeek(data, 12);
  const weeksWithLogs = useMemo(() => new Set(data.logs.map((l) => weekStart(l.date))).size, [data.logs]);
  const avg = weeksWithLogs ? Math.round(total / weeksWithLogs) : 0;

  const visible = useMemo(
    () => (filter === 'all' ? data.logs : data.logs.filter((l) => l.tag === filter)).slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.createdAt < b.createdAt ? 1 : -1)),
    [data.logs, filter],
  );
  const groups = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const l of visible) {
      if (!map.has(l.date)) map.set(l.date, []);
      map.get(l.date)!.push(l);
    }
    return [...map.entries()];
  }, [visible]);

  return (
    <>
      <PageHead title="Study log" subtitle="Every study session, with hours against your weekly target. Sessions also feed your streak and the activity calendar." />

      <div className="stack">
        <div className="grid-tiles">
          <StatTile label="Total logged" value={fmtHours(total)} sub={plural(data.logs.length, 'session')} />
          <StatTile
            label="This calendar week"
            value={fmtHours(thisWeek)}
            sub={data.weeklyTargetHours > 0 ? `Mon–Sun · ${pct(thisWeek, data.weeklyTargetHours * 60)}% of ${data.weeklyTargetHours}h target` : 'Mon–Sun · no target set'}
          />
          <StatTile label="Average per active week" value={fmtHours(avg)} sub={`${plural(weeksWithLogs, 'week')} with sessions`} />
          <StatTile
            label="Weekly target"
            value={`${data.weeklyTargetHours}h`}
            sub={
              <>
                <Link to="/settings">Change in Settings</Link>
              </>
            }
          />
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-head">
              <h2>Log a session</h2>
            </div>
            <LogSessionForm />
          </div>
          <div className="card">
            <div className="card-head">
              <h2>Study hours · last 12 weeks</h2>
            </div>
            {data.logs.length === 0 ? <EmptyState>Your first session will show up here.</EmptyState> : <WeeklyHoursChart buckets={buckets} targetMinutes={data.weeklyTargetHours * 60} />}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Sessions</h2>
            <LogTagSelect value={filter} onChange={setFilter} includeAll aria-label="Show sessions of type" />
          </div>
          {groups.length === 0 ? (
            <EmptyState>{data.logs.length === 0 ? 'No sessions yet. Log one above, or start the focus timer.' : 'No sessions of this type yet.'}</EmptyState>
          ) : (
            groups.map(([d, entries]) => (
              <div key={d}>
                <div className="date-group">
                  <span>{fmtDateLong(d)}</span>
                  <span className="tabular">{fmtHours(entries.reduce((s, l) => s + l.minutes, 0))}</span>
                </div>
                <ul className="list">
                  {entries.map((l) => (
                    <SessionRow key={l.id} log={l} showWeek onDelete={() => deleteLogWithUndo(l)} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
