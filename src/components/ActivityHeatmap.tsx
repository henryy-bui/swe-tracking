import { addDays, fmtDate, fmtHours, today, weekStart } from '@/lib/date';

interface Props {
  minutesByDay: Map<string, number>;
  activeDays: Set<string>;
  weeks?: number;
}

/* Level 0 = nothing, 1 = active without logged time, 2-5 = sequential steps of logged time. */
const level = (minutes: number, active: boolean): number => {
  if (minutes >= 180) return 5;
  if (minutes >= 120) return 4;
  if (minutes >= 60) return 3;
  if (minutes > 0) return 2;
  return active ? 1 : 0;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* GitHub-style calendar of the last N weeks. Columns are weeks (Mon-Sun), rows are weekdays. */
export function ActivityHeatmap({ minutesByDay, activeDays, weeks = 26 }: Props) {
  const end = today();
  const firstMonday = addDays(weekStart(end), -7 * (weeks - 1));
  const columns: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) col.push(addDays(firstMonday, w * 7 + d));
    columns.push(col);
  }

  // Month label whenever a column starts a new month.
  const labels = columns.map((col, i) => {
    const m = Number(col[0].slice(5, 7)) - 1;
    const prev = i > 0 ? Number(columns[i - 1][0].slice(5, 7)) - 1 : -1;
    return m !== prev ? MONTHS[m] : '';
  });

  const totalMinutes = [...minutesByDay.entries()].filter(([d]) => d >= firstMonday && d <= end).reduce((s, [, m]) => s + m, 0);
  const activeCount = [...activeDays].filter((d) => d >= firstMonday && d <= end).length;

  return (
    <div className="heatmap-wrap">
      <div className="heatmap" role="img" aria-label={`Activity over the last ${weeks} weeks: ${activeCount} active days, ${fmtHours(totalMinutes)} logged.`}>
        <div className="heatmap-months" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
        <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
          {columns.map((col) => (
            <div key={col[0]} className="heatmap-col">
              {col.map((day) => {
                const future = day > end;
                const minutes = minutesByDay.get(day) ?? 0;
                const lv = future ? -1 : level(minutes, activeDays.has(day));
                const title = future ? '' : `${fmtDate(day, { weekday: 'short', day: 'numeric', month: 'short' })}: ${minutes ? fmtHours(minutes) : activeDays.has(day) ? 'active' : 'no activity'}`;
                return <span key={day} className={`cell${future ? ' future' : ''} l${Math.max(lv, 0)}`} title={title} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="row between small muted" style={{ marginTop: 8 }}>
        <span>
          {activeCount} active days · {fmtHours(totalMinutes)} logged
        </span>
        <span className="heatmap-legend">
          Less
          {[0, 2, 3, 4, 5].map((l) => (
            <span key={l} className={`cell l${l}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
