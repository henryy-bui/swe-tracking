import { useState } from 'react';
import { useStore, type FollowUp } from '@/store/useStore';
import { fmtDate } from '@/lib/date';
import { DueLabel, PriorityPill, WeekLink, toast } from '@/components/ui';
import { InlineNoteEditor } from '@/components/InlineNoteEditor';
import { X } from '@/components/icons';

interface Props {
  f: FollowUp;
  showWeek?: boolean;
  compact?: boolean; // week page: no snooze/edit
}

export function FollowUpRow({ f, showWeek, compact }: Props) {
  const toggleFollowUp = useStore((s) => s.toggleFollowUp);
  const snoozeFollowUp = useStore((s) => s.snoozeFollowUp);
  const deleteFollowUp = useStore((s) => s.deleteFollowUp);
  const updateFollowUp = useStore((s) => s.updateFollowUp);
  const [editing, setEditing] = useState(false);

  const remove = () => {
    if (f.note && !window.confirm(`Delete "${f.title}" and its details?`)) return;
    deleteFollowUp(f.id);
    toast('Follow-up deleted.');
  };

  return (
    <li className={f.done ? 'done' : ''}>
      <input type="checkbox" checked={f.done} onChange={() => toggleFollowUp(f.id)} aria-label={f.title} />
      <div className="body">
        <div className="title">{f.title}</div>
        <div className="meta">
          <DueLabel followUp={f} />
          {f.priority === 'high' && <PriorityPill priority="high" />}
          {showWeek && f.week && <WeekLink week={f.week} />}
          {f.done && f.doneAt && <span>done {fmtDate(f.doneAt)}</span>}
        </div>
        {editing ? (
          <InlineNoteEditor
            value={f.note}
            label={`Details for "${f.title}"`}
            placeholder="Context, links, what 'done' looks like"
            onSave={(v) => {
              updateFollowUp(f.id, { note: v });
              setEditing(false);
              toast('Details saved.');
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          f.note && <div className="note">{f.note}</div>
        )}
      </div>
      <div className="actions">
        {!compact && !f.done && (
          <button
            className="btn sm ghost"
            onClick={() => {
              snoozeFollowUp(f.id, 7);
              toast('Due date moved a week out.');
            }}
            aria-label={`Snooze "${f.title}" for one week`}
          >
            Snooze 1 week
          </button>
        )}
        {!compact && !editing && (
          <button className="btn sm ghost" onClick={() => setEditing(true)} aria-label={`Edit details of "${f.title}"`}>
            Edit details
          </button>
        )}
        <button className="btn sm ghost icon" onClick={remove} aria-label={`Delete "${f.title}"`}>
          <X size={14} />
        </button>
      </div>
    </li>
  );
}
