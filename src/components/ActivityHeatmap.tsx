import { addDays, fmtDate, fmtDateLong, today, weekStart } from '@/lib/date';
import { fmtHours } from '@/lib/format';
import { useContainerWidth } from '@/lib/useContainerWidth';

interface Props {
  minutesByDay: Map<string, number>;
  activeDays: Set<string>;
  maxWeeks?: number;
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
const GAP = 3;

/* GitHub-style calendar. Columns are weeks (Mon-Sun), rows are weekdays. Cell size and week count
   come from the measured container width. A visually hidden table carries the per-day values. */
export function ActivityHeatmap({ minutesByDay, activeDays, maxWeeks = 26 }: Props) {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const weeks = Math.min(maxWeeks, width >= 640 ? 26 : width >= 480 ? 20 : 14);
  const cell = Math.max(8, Math.min(16, Math.floor((width - GAP * (weeks - 1)) / weeks)));

  const end = today();
  const firstMonday = addDays(weekStart(end), -7 * (weeks - 1));
  const columns: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) col.push(addDays(firstMonday, w * 7 + d));
    columns.push(col);
  }

  let lastLabelAt = -10;
  const labels = columns.map((col, i) => {
    const m = Number(col[0].slice(5, 7)) - 1;
    const prev = i > 0 ? Number(columns[i - 1][0].slice(5, 7)) - 1 : -1;
    if (m === prev || i - lastLabelAt < Math.ceil(30 / (cell + GAP))) return '';
    lastLabelAt = i;
    return MONTHS[m];
  });

  const totalMinutes = [...minutesByDay.entries()].filter(([d]) => d >= firstMonday && d <= end).reduce((s, [, m]) => s + m, 0);
  const activeCount = [...activeDays].filter((d) => d >= firstMonday && d <= end).length;
  const columnsStyle = { gridTemplateColumns: `repeat(${weeks}, ${cell}px)`, gap: GAP };
  const daysWithActivity = columns.flat().filter((d) => d <= end && (activeDays.has(d) || (minutesByDay.get(d) ?? 0) > 0));

  return (
    <div className="heatmap-wrap" ref={ref}>
      <div className="heatmap" aria-hidden="true">
        <div className="heatmap-months" style={columnsStyle}>
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
        <div className="heatmap-grid" style={columnsStyle}>
          {columns.map((col) => (
            <div key={col[0]} className="heatmap-col" style={{ gridTemplateRows: `repeat(7, ${cell}px)`, gap: GAP }}>
              {col.map((day) => {
                const future = day > end;
                const minutes = minutesByDay.get(day) ?? 0;
                const lv = future ? -1 : level(minutes, activeDays.has(day));
                const title = future ? '' : `${fmtDate(day)}: ${minutes ? fmtHours(minutes) : activeDays.has(day) ? 'active' : 'no activity'}`;
                return <span key={day} className={`cell${future ? ' future' : ''} l${Math.max(lv, 0)}`} style={{ width: cell, height: cell }} title={title} />;
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Screen-reader version of the same data. */}
      <table className="sr-only">
        <caption>
          Activity over the last {weeks} weeks: {activeCount} active days, {fmtHours(totalMinutes)} logged.
        </caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Logged</th>
          </tr>
        </thead>
        <tbody>
          {daysWithActivity.map((d) => (
            <tr key={d}>
              <td>{fmtDateLong(d)}</td>
              <td>{minutesByDay.get(d) ? fmtHours(minutesByDay.get(d)!) : 'active, no time logged'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row between small ink-2 section-sm">
        <span>
          {activeCount} active days · {fmtHours(totalMinutes)} logged
        </span>
        <span className="heatmap-legend" aria-hidden="true">
          <span className="cell l1" /> active
          <span className="legend-gap">Less</span>
          {[2, 3, 4, 5].map((l) => (
            <span key={l} className={`cell l${l}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
