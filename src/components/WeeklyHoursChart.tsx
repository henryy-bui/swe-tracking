import { useEffect, useId, useRef, useState } from 'react';
import type { WeekBucket } from '@/lib/derive';
import { fmtDate, fmtRange } from '@/lib/date';
import { fmtHours } from '@/lib/format';
import { useContainerWidth } from '@/lib/useContainerWidth';
import { rovingKey } from '@/lib/useA11y';

interface Props {
  buckets: WeekBucket[]; // oldest first
  targetMinutes: number;
}

const H = 220;
const PAD = { top: 18, right: 12, bottom: 28, left: 34 };

/* Single-series bar chart of study minutes per calendar week, with a dashed target line.
   The viewBox matches the container's pixel width so labels stay at their true size on phones.
   Each bar is a keyboard stop (arrow keys move between them); tapping toggles the tooltip. */
export function WeeklyHoursChart({ buckets: all, targetMinutes }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const [ref, measured] = useContainerWidth<HTMLDivElement>();
  const rootRef = useRef<HTMLDivElement>(null);
  const W = Math.max(280, measured);
  const narrow = W < 420;
  const buckets = narrow ? all.slice(-8) : all;
  const currentIdx = Math.max(0, buckets.findIndex((b) => b.current));
  const [focusIdx, setFocusIdx] = useState(currentIdx);

  // A tap outside the chart clears the tooltip.
  useEffect(() => {
    if (active === null) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [active]);

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
  const labelEvery = slot < 44 ? 2 : 1;
  const title = `Study hours per week for the last ${buckets.length} weeks: ${fmtHours(total)} in total${targetMinutes > 0 ? `, target ${fmtHours(targetMinutes)} per week` : ''}.`;

  const focusBar = (i: number) => {
    setFocusIdx(i);
    setActive(i);
    rootRef.current?.querySelector<SVGRectElement>(`[data-bar="${i}"]`)?.focus();
  };

  return (
    <div
      className="chart"
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="group" aria-labelledby={`${id}-title`} onMouseLeave={() => setActive(null)}>
        <title id={`${id}-title`}>{title}</title>
        {ticks.map((h) => (
          <g key={h} aria-hidden="true">
            <line className="grid-line" x1={PAD.left} x2={W - PAD.right} y1={y(h * 60)} y2={y(h * 60)} />
            <text className="tick" x={PAD.left - 6} y={y(h * 60) + 4} textAnchor="end">
              {h}h
            </text>
          </g>
        ))}
        {targetMinutes > 0 && targetMinutes <= yMax && (
          <line className="target" x1={PAD.left} x2={W - PAD.right} y1={y(targetMinutes)} y2={y(targetMinutes)} aria-hidden="true" />
        )}
        {buckets.map((b, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const top = y(b.minutes);
          const h = Math.max(0, PAD.top + innerH - top);
          const labelled = b.minutes > 0 && (i === maxIdx || b.current || active === i);
          const showTick = b.current || i % labelEvery === (buckets.length - 1) % labelEvery;
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
                  opacity={active === null || active === i ? 1 : 0.55}
                  aria-hidden="true"
                />
              )}
              {labelled && (
                <text className="value-label" x={cx} y={top - 5} aria-hidden="true">
                  {fmtHours(b.minutes)}
                </text>
              )}
              {showTick && (
                <text className="tick" x={cx} y={H - PAD.bottom + 16} textAnchor="middle" fontWeight={b.current ? 700 : 400} aria-hidden="true">
                  {fmtDate(b.start)}
                </text>
              )}
              <rect
                className="bar-rect hit"
                data-bar={i}
                x={PAD.left + slot * i}
                y={PAD.top}
                width={slot}
                height={innerH}
                role="img"
                aria-label={`Week of ${fmtDate(b.start)}${b.current ? ' (this week)' : ''}: ${fmtHours(b.minutes)}`}
                tabIndex={i === focusIdx ? 0 : -1}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive((a) => (a === i ? null : i))}
                onKeyDown={(e) => rovingKey(e, i, buckets.length, focusBar)}
              />
            </g>
          );
        })}
        <line className="baseline" x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} aria-hidden="true" />
      </svg>
      {active !== null && buckets[active] && (
        <div
          className="tooltip"
          aria-hidden="true"
          style={{
            left: `${((PAD.left + slot * active + slot / 2) / W) * 100}%`,
            top: `${(y(buckets[active].minutes) / H) * 100}%`,
            marginTop: -8,
          }}
        >
          {fmtRange(buckets[active])}: {fmtHours(buckets[active].minutes)}
        </div>
      )}
      <div className="chart-legend" aria-hidden="true">
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
