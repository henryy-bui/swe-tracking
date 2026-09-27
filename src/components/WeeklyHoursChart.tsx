import { useId, useState } from 'react';
import type { WeekBucket } from '@/lib/derive';
import { fmtDate, fmtHours } from '@/lib/date';

interface Props {
  buckets: WeekBucket[]; // oldest first
  targetMinutes: number;
}

const W = 640;
const H = 220;
const PAD = { top: 18, right: 12, bottom: 28, left: 34 };

/* Single-series bar chart of study minutes per calendar week, with a dashed target line. */
export function WeeklyHoursChart({ buckets, targetMinutes }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxMinutes = Math.max(60, ...buckets.map((b) => b.minutes), targetMinutes);
  const maxHours = Math.ceil(maxMinutes / 60);
  const yMax = maxHours * 60;
  const y = (m: number) => PAD.top + innerH - (m / yMax) * innerH;
  const slot = innerW / buckets.length;
  const barW = Math.max(6, Math.min(36, slot * 0.6));

  const ticks = [0, Math.round(maxHours / 2), maxHours].filter((v, i, a) => a.indexOf(v) === i);
  const maxIdx = buckets.reduce((best, b, i) => (b.minutes > buckets[best].minutes ? i : best), 0);
  const total = buckets.reduce((s, b) => s + b.minutes, 0);

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-title`} onMouseLeave={() => setHover(null)}>
        <title id={`${id}-title`}>{`Study hours per week for the last ${buckets.length} weeks, ${fmtHours(total)} in total.`}</title>
        {ticks.map((h) => (
          <g key={h}>
            <line className="grid-line" x1={PAD.left} x2={W - PAD.right} y1={y(h * 60)} y2={y(h * 60)} />
            <text className="tick" x={PAD.left - 6} y={y(h * 60) + 4} textAnchor="end">
              {h}h
            </text>
          </g>
        ))}
        {targetMinutes > 0 && targetMinutes <= yMax && (
          <line className="target" x1={PAD.left} x2={W - PAD.right} y1={y(targetMinutes)} y2={y(targetMinutes)} />
        )}
        {buckets.map((b, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const top = y(b.minutes);
          const h = Math.max(0, PAD.top + innerH - top);
          const labelled = b.minutes > 0 && (i === maxIdx || b.current || hover === i);
          const showTick = buckets.length <= 8 || i % 2 === buckets.length % 2 || b.current;
          return (
            <g key={b.start}>
              {h > 0 && (
                <rect
                  className="bar-rect"
                  x={cx - barW / 2}
                  y={top}
                  width={barW}
                  height={h}
                  rx={Math.min(4, barW / 2)}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                />
              )}
              {labelled && (
                <text className="value-label" x={cx} y={top - 5}>
                  {fmtHours(b.minutes)}
                </text>
              )}
              {showTick && (
                <text className="tick" x={cx} y={H - PAD.bottom + 16} textAnchor="middle" fontWeight={b.current ? 700 : 400}>
                  {fmtDate(b.start)}
                </text>
              )}
              <rect
                className="bar-rect hit"
                x={PAD.left + slot * i}
                y={PAD.top}
                width={slot}
                height={innerH}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`Week of ${fmtDate(b.start)}: ${fmtHours(b.minutes)}`}
              />
            </g>
          );
        })}
        <line className="baseline" x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} />
      </svg>
      {hover !== null && (
        <div
          className="tooltip"
          style={{
            left: `${((PAD.left + slot * hover + slot / 2) / W) * 100}%`,
            top: `${(y(buckets[hover].minutes) / H) * 100}%`,
            marginTop: -8,
          }}
        >
          {fmtDate(buckets[hover].start)} – {fmtDate(buckets[hover].end)}: {fmtHours(buckets[hover].minutes)}
        </div>
      )}
      <div className="chart-legend">
        <span>
          <span className="swatch" /> Hours logged
        </span>
        {targetMinutes > 0 && (
          <span>
            <span className="swatch target" /> Target {fmtHours(targetMinutes)}/week
          </span>
        )}
      </div>
    </div>
  );
}
