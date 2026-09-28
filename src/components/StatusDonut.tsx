/* Weeks by status as a donut. Hand-drawn SVG, one segment per status, with a legend and an sr-only
   table so the numbers never depend on colour alone. */
import type { StatusCounts } from '@/lib/derive';
import { STATUS_LABEL, type Status } from '@/lib/labels';

const ORDER: { key: keyof Omit<StatusCounts, 'total' | 'pct'>; status: Status; className: string }[] = [
  { key: 'done', status: 'done', className: 'seg-done' },
  { key: 'inProgress', status: 'in-progress', className: 'seg-progress' },
  { key: 'blocked', status: 'blocked', className: 'seg-blocked' },
  { key: 'skipped', status: 'skipped', className: 'seg-skipped' },
  { key: 'notStarted', status: 'not-started', className: 'seg-rest' },
];

export function StatusDonut({ counts, size = 160 }: { counts: StatusCounts; size?: number }) {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const total = Math.max(1, counts.total);
  let offset = 0;
  const segments = ORDER.map((o) => {
    const n = counts[o.key];
    const len = (n / total) * c;
    const seg = { ...o, n, len, offset };
    offset += len;
    return seg;
  });
  const summary = ORDER.map((o) => `${counts[o.key]} ${STATUS_LABEL[o.status].toLowerCase()}`).join(', ');

  return (
    <div className="donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Weeks by status: ${summary}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="seg-track" fill="none" strokeWidth={16} />
        {segments
          .filter((s) => s.n > 0)
          .map((s) => (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={16}
              className={s.className}
              strokeDasharray={`${s.len} ${c - s.len}`}
              strokeDashoffset={-s.offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          ))}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="donut-value">
          {counts.pct}%
        </text>
      </svg>
      <ul className="donut-legend" aria-hidden="true">
        {segments.map((s) => (
          <li key={s.key}>
            <span className={`swatch ${s.className}`} />
            <span className="grow">{STATUS_LABEL[s.status]}</span>
            <span className="tabular">{s.n}</span>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>Weeks by status</caption>
        <tbody>
          {segments.map((s) => (
            <tr key={s.key}>
              <th scope="row">{STATUS_LABEL[s.status]}</th>
              <td>{s.n}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Total</th>
            <td>{counts.total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
