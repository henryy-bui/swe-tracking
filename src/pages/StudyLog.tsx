import { useMemo, useState, type FormEvent } from 'react';
import { LOG_TAGS, useStore, type LogTag } from '@/store/useStore';
import { TOTAL_WEEKS, weekDef } from '@/data/roadmap';
import { minutesByCalendarWeek, minutesThisWeek, totalMinutes, weekForDate } from '@/lib/derive';
import { fmtDate, fmtDateLong, fmtHours, pct, plural, today, weekStart } from '@/lib/date';
import { EmptyState, PageHead, StatTile, WeekLink, toast } from '@/components/ui';
import { WeeklyHoursChart } from '@/components/WeeklyHoursChart';

export default function StudyLog() {
  const data = useStore();
  const { addLog, deleteLog } = useStore();

  const [date, setDate] = useState(today());
  const [hours, setHours] = useState('1');
  const [tag, setTag] = useState<LogTag>('study');
  const [week, setWeek] = useState<string>(() => String(weekForDate(data, today()) ?? ''));
  const [note, setNote] = useState('');
  const [weekTouched, setWeekTouched] = useState(false);
  const [filter, setFilter] = useState<'all' | LogTag>('all');

  const onDateChange = (d: string) => {
    setDate(d);
    if (!weekTouched && d) setWeek(String(weekForDate(data, d) ?? ''));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const mins = Math.round(Number(hours) * 60);
    if (!date || !mins || mins <= 0) return;
    addLog({ date, minutes: mins, week: week ? Number(week) : undefined, tag, note: note.trim() });
    setNote('');
    toast(`Logged ${fmtHours(mins)}`);
  };

  const total = totalMinutes(data);
  const thisWeek = minutesThisWeek(data);
  const buckets = minutesByCalendarWeek(data, 12);
  const weeksWithLogs = useMemo(() => new Set(data.logs.map((l) => weekStart(l.date))).size, [data.logs]);
  const avg = weeksWithLogs ? Math.round(total / weeksWithLogs) : 0;

  const visible = (filter === 'all' ? data.logs : data.logs.filter((l) => l.tag === filter)).slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.createdAt < b.createdAt ? 1 : -1));
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
      <PageHead title="Study log" subtitle="Log sessions to track hours against your weekly target and keep your streak alive." />

      <div className="grid-tiles">
        <StatTile label="Total logged" value={fmtHours(total)} sub={plural(data.logs.length, 'session')} />
        <StatTile label="This week" value={fmtHours(thisWeek)} sub={data.weeklyTargetHours > 0 ? `${pct(thisWeek, data.weeklyTargetHours * 60)}% of ${data.weeklyTargetHours}h target` : 'No target set'} />
        <StatTile label="Average per active week" value={fmtHours(avg)} sub={plural(weeksWithLogs, 'week') + ' with sessions'} />
        <StatTile label="Target" value={`${data.weeklyTargetHours}h`} sub="per week · change in Settings" />
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head">
            <h2>Add session</h2>
          </div>
          <form onSubmit={submit} className="form-grid">
            <div className="field">
              <label htmlFor="log-date">Date</label>
              <input id="log-date" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="log-hours">Hours</label>
              <input id="log-hours" type="number" min="0.25" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="log-tag">Type</label>
              <select id="log-tag" value={tag} onChange={(e) => setTag(e.target.value as LogTag)}>
                {LOG_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="log-week">Roadmap week</label>
              <select
                id="log-week"
                value={week}
                onChange={(e) => {
                  setWeek(e.target.value);
                  setWeekTouched(true);
                }}
              >
                <option value="">— none —</option>
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w} · {weekDef(w).topic}
                  </option>
                ))}
              </select>
            </div>
            <div className="field wide">
              <label htmlFor="log-note">Note</label>
              <input id="log-note" type="text" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you work on?" />
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
            <h2>Hours per week · last 12 weeks</h2>
          </div>
          {data.logs.length === 0 ? <EmptyState>Nothing logged yet.</EmptyState> : <WeeklyHoursChart buckets={buckets} targetMinutes={data.weeklyTargetHours * 60} />}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h2>Sessions</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | LogTag)} aria-label="Filter by type" style={{ width: 'auto' }}>
            <option value="all">All types</option>
            {LOG_TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {groups.length === 0 ? (
          <EmptyState>No sessions match.</EmptyState>
        ) : (
          groups.map(([d, entries]) => (
            <div key={d}>
              <div className="date-group">
                <span>{fmtDateLong(d)}</span>
                <span className="tabular">{fmtHours(entries.reduce((s, l) => s + l.minutes, 0))}</span>
              </div>
              <ul className="list">
                {entries.map((l) => (
                  <li key={l.id}>
                    <div className="body">
                      <div className="title">
                        {fmtHours(l.minutes)} <span className="pill">{l.tag}</span>
                        {l.week && (
                          <>
                            {' '}
                            <WeekLink week={l.week} />
                          </>
                        )}
                      </div>
                      {l.note && <div className="note">{l.note}</div>}
                    </div>
                    <div className="actions">
                      <button className="btn sm ghost" onClick={() => deleteLog(l.id)} aria-label={`Delete session on ${fmtDate(l.date)}`}>
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </>
  );
}
