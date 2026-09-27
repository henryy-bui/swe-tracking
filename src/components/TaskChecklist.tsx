import { useStore } from '@/store/useStore';
import { isDone, taskItems } from '@/lib/derive';
import { fmtDate } from '@/lib/date';
import { TERMS } from '@/lib/labels';
import { deleteCustomTaskWithUndo } from '@/lib/undo';
import { Vi } from '@/components/ui';
import { X } from '@/components/icons';

interface Props {
  week: number;
  showDates?: boolean; // completion date next to ticked tasks
  deletable?: boolean; // allow removing the user's own tasks
  onlyOpen?: boolean; // hide ticked tasks (Today page)
}

/* The week's checklist: roadmap tasks, the DSA item, and the user's own tasks. */
export function TaskChecklist({ week, showDates, deletable, onlyOpen }: Props) {
  const data = useStore();
  const setTask = useStore((s) => s.setTask);
  const items = taskItems(data, week).filter((it) => !onlyOpen || !isDone(data, it.key));

  if (items.length === 0) return <div className="hint">Every task for this week is ticked.</div>;

  return (
    <ul className="checklist">
      {items.map((it) => {
        const done = isDone(data, it.key);
        const mark = data.tasks[it.key];
        return (
          <li key={it.key} className={done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={done} onChange={(e) => setTask(it.key, e.target.checked)} />
              <span>
                {it.kind === 'dsa' && <span className="kind-tag">DSA</span>}
                {it.kind === 'custom' && <span className="kind-tag">{TERMS.yours}</span>}
                {it.kind === 'custom' ? it.label : <Vi>{it.label}</Vi>}
              </span>
            </label>
            {showDates && done && mark?.at && <span className="meta">{fmtDate(mark.at)}</span>}
            {deletable && it.kind === 'custom' && it.customId && (
              <button
                className="btn sm ghost icon"
                onClick={() => deleteCustomTaskWithUndo(week, { id: it.customId!, title: it.label })}
                aria-label={`Remove task "${it.label}"`}
              >
                <X size={14} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
