/* Select controls for the app's enumerations. Callers supply the surrounding <label>. */
import { DIFFICULTIES, LOG_TAGS, PRIORITIES, type Difficulty, type LogTag, type Priority } from '@/store/useStore';
import { TOTAL_WEEKS, weekDef } from '@/data/roadmap';
import { DIFFICULTY_LABEL, LOG_TAG_LABEL, PRIORITY_LABEL } from '@/lib/labels';

interface Base {
  id?: string;
  className?: string;
  'aria-label'?: string;
}

const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

/* "Sliding Window (…)" -> "Sliding Window" */
export const dsaTopic = (week: number) => weekDef(week).dsa.replace(/\s*\(.*$/, '').trim();

export function WeekSelect({
  value, onChange, labelOf = (w) => weekDef(w).topic, allowNone = true, ...rest
}: Base & { value: string; onChange: (v: string) => void; labelOf?: (week: number) => string; allowNone?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {allowNone && <option value="">No week</option>}
      {WEEKS.map((w) => (
        <option key={w} value={w}>
          Week {w} · {labelOf(w)}
        </option>
      ))}
    </select>
  );
}

export function PrioritySelect({ value, onChange, ...rest }: Base & { value: Priority; onChange: (v: Priority) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Priority)} {...rest}>
      {PRIORITIES.map((p) => (
        <option key={p} value={p}>
          {PRIORITY_LABEL[p]}
        </option>
      ))}
    </select>
  );
}

export function LogTagSelect({ value, onChange, includeAll, ...rest }: Base & { value: LogTag | 'all'; onChange: (v: LogTag | 'all') => void; includeAll?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as LogTag | 'all')} {...rest}>
      {includeAll && <option value="all">All types</option>}
      {LOG_TAGS.map((t) => (
        <option key={t} value={t}>
          {LOG_TAG_LABEL[t]}
        </option>
      ))}
    </select>
  );
}

export function DifficultySelect({ value, onChange, ...rest }: Base & { value: Difficulty; onChange: (v: Difficulty) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Difficulty)} {...rest}>
      {DIFFICULTIES.map((d) => (
        <option key={d} value={d}>
          {DIFFICULTY_LABEL[d]}
        </option>
      ))}
    </select>
  );
}
