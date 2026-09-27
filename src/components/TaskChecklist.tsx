import { useStore } from '@/store/useStore';
import { isDone, taskItems } from '@/lib/derive';
import { fmtDate } from '@/lib/date';
import { TERMS } from '@/lib/labels';
import { toast, Vi } from '@/components/ui';
import { X } from '@/components/icons';

interface Props {
  week: number;
  showDates?: boolean; // completion date next to ticked tasks
  deletable?: boolean; // allow removing the user's own tasks
}

/* The week's checklist: roadmap tasks, the DSA item, and the user's own tasks. */
export function TaskChecklist({ week, showDates, deletable }: Props) {
  const data = useStore();
  const setTask = useStore((s) => s.setTask);
  const deleteCustomTask = useStore((s) => s.deleteCustomTask);
  const items = taskItems(data, week);

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
                onClick={() => {
                  deleteCustomTask(week, it.customId!);
                  toast('Task removed.');
                }}
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
