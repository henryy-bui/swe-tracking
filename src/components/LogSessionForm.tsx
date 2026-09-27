import { useId, useRef, useState, type FormEvent } from 'react';
import { useStore, type LogTag } from '@/store/useStore';
import { weekForDate } from '@/lib/derive';
import { today } from '@/lib/date';
import { fmtDuration } from '@/lib/format';
import { TERMS } from '@/lib/labels';
import { toast } from '@/components/ui';
import { LogTagSelect, WeekSelect } from '@/components/fields';

interface Props {
  /* When given, the session is tied to this roadmap week and the week field is hidden. */
  week?: number;
}

export function LogSessionForm({ week: fixedWeek }: Props) {
  const id = useId();
  const startDate = useStore((s) => s.startDate);
  const addLog = useStore((s) => s.addLog);
  const [date, setDate] = useState(today());
  const [hours, setHours] = useState('1');
  const [tag, setTag] = useState<LogTag>('study');
  const [week, setWeek] = useState<string>(() => (fixedWeek ? String(fixedWeek) : String(weekForDate({ startDate } as never, today()) ?? '')));
  const [weekTouched, setWeekTouched] = useState(false);
  const [note, setNote] = useState('');
  const hoursRef = useRef<HTMLInputElement>(null);

  const onDateChange = (d: string) => {
    setDate(d);
    if (!fixedWeek && !weekTouched && d) setWeek(String(weekForDate({ startDate } as never, d) ?? ''));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const minutes = Math.round(Number(hours) * 60);
    if (!date || !minutes || minutes <= 0) {
      toast('Enter a date and a number of hours first.');
      return;
    }
    addLog({ date, minutes, week: fixedWeek ?? (week ? Number(week) : undefined), tag, note: note.trim() });
    setNote('');
    toast(`Logged ${fmtDuration(minutes)}.`);
    hoursRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="field">
        <label htmlFor={`${id}-date`}>Date</label>
        <input id={`${id}-date`} type="date" value={date} onChange={(e) => onDateChange(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor={`${id}-hours`}>Hours</label>
        <input ref={hoursRef} id={`${id}-hours`} type="number" min="0.25" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} aria-describedby={`${id}-hours-hint`} required />
        <span id={`${id}-hours-hint`} className="hint">
          0.25 = 15 min
        </span>
      </div>
      <div className="field">
        <label htmlFor={`${id}-tag`}>Type</label>
        <LogTagSelect id={`${id}-tag`} value={tag} onChange={(v) => setTag(v as LogTag)} />
      </div>
      {!fixedWeek && (
        <div className="field">
          <label htmlFor={`${id}-week`}>{TERMS.roadmapWeek}</label>
          <WeekSelect
            id={`${id}-week`}
            value={week}
            onChange={(v) => {
              setWeek(v);
              setWeekTouched(true);
            }}
          />
        </div>
      )}
      <div className="field wide">
        <label htmlFor={`${id}-note`}>Note</label>
        <input id={`${id}-note`} type="text" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you work on? (optional)" />
      </div>
      <div className="form-actions wide">
        <button className="btn primary" type="submit">
          Log session
        </button>
      </div>
    </form>
  );
}
