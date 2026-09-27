import { useId, useRef, useState, type FormEvent } from 'react';
import { useStore, type Priority } from '@/store/useStore';
import { currentWeek } from '@/lib/derive';
import { TERMS } from '@/lib/labels';
import { toast } from '@/components/ui';
import { PrioritySelect, WeekSelect } from '@/components/fields';

interface Props {
  /* When given, the follow-up is tied to this week and the week and details fields are hidden. */
  week?: number;
}

export function FollowUpForm({ week: fixedWeek }: Props) {
  const id = useId();
  const data = useStore();
  const addFollowUp = useStore((s) => s.addFollowUp);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [week, setWeek] = useState<string>(() => (fixedWeek ? String(fixedWeek) : String(currentWeek(data) ?? '')));
  const [note, setNote] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addFollowUp({ title: title.trim(), note: note.trim(), due: due || undefined, week: fixedWeek ?? (week ? Number(week) : undefined), priority });
    setTitle('');
    setNote('');
    setDue('');
    toast('Follow-up added.');
    titleRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="field wide">
        <label htmlFor={`${id}-title`}>What needs following up?</label>
        <input
          ref={titleRef}
          id={`${id}-title`}
          type="text"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Why does escape analysis move this slice to the heap?"
          required
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-due`}>Due date</label>
        <input id={`${id}-due`} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-priority`}>Priority</label>
        <PrioritySelect id={`${id}-priority`} value={priority} onChange={setPriority} />
      </div>
      {!fixedWeek && (
        <div className="field">
          <label htmlFor={`${id}-week`}>{TERMS.roadmapWeek}</label>
          <WeekSelect id={`${id}-week`} value={week} onChange={setWeek} />
        </div>
      )}
      {!fixedWeek && (
        <div className="field wide">
          <label htmlFor={`${id}-note`}>Details</label>
          <textarea id={`${id}-note`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context, links, what 'done' looks like (optional)" />
        </div>
      )}
      <div className="form-actions wide">
        <button className={`btn${fixedWeek ? '' : ' primary'}`} type="submit">
          Add follow-up
        </button>
      </div>
    </form>
  );
}
