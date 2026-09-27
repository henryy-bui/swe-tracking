import { useEffect, useState } from 'react';
import { beep, POMODORO_MINUTES, useTimer } from '@/store/timer';
import { LOG_TAGS, useStore, type LogTag } from '@/store/useStore';
import { currentWeek } from '@/lib/derive';
import { fmtHours, today } from '@/lib/date';
import { toast } from '@/components/ui';

const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/* Sidebar focus timer. Stopping opens a tiny form that logs the session to the study log. */
export function FocusTimer() {
  const { startedAt, pomodoro, alerted, start, stop, setPomodoro, setAlerted } = useTimer();
  const addLog = useStore((s) => s.addLog);
  const data = useStore();
  const [now, setNow] = useState(Date.now());
  const [draft, setDraft] = useState<{ minutes: number; tag: LogTag; note: string } | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const elapsed = startedAt ? now - startedAt : 0;
  const reached = pomodoro && elapsed >= POMODORO_MINUTES * 60000;

  useEffect(() => {
    if (reached && !alerted) {
      setAlerted();
      beep();
      toast(`${POMODORO_MINUTES} minutes of focus. Take a break or keep going.`);
    }
  }, [reached, alerted, setAlerted]);

  const onStop = () => {
    const minutes = stop();
    if (minutes < 1) {
      toast('Session under a minute, not logged.');
      return;
    }
    setDraft({ minutes, tag: 'study', note: '' });
  };

  const onLog = () => {
    if (!draft) return;
    addLog({ date: today(), minutes: draft.minutes, week: currentWeek(data) ?? undefined, tag: draft.tag, note: draft.note.trim() });
    toast(`Logged ${fmtHours(draft.minutes)}`);
    setDraft(null);
  };

  if (draft) {
    return (
      <div className="timer-widget">
        <div className="timer-label">Log {draft.minutes} min as</div>
        <select value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value as LogTag })} aria-label="Session type">
          {LOG_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="input"
          placeholder="Note (optional)"
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onLog()}
          aria-label="Session note"
        />
        <div className="row">
          <button className="btn primary sm" onClick={onLog}>
            Log
          </button>
          <button className="btn ghost sm" onClick={() => setDraft(null)}>
            Discard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`timer-widget${startedAt ? ' running' : ''}${reached ? ' reached' : ''}`}>
      <div className="row between">
        <span className="timer-label">{startedAt ? (reached ? 'Pomodoro done' : 'Focusing') : 'Focus timer'}</span>
        <label className="small muted row" style={{ gap: 4 }}>
          <input type="checkbox" checked={pomodoro} onChange={(e) => setPomodoro(e.target.checked)} style={{ width: 14, height: 14 }} />
          25m
        </label>
      </div>
      <div className="timer-clock tabular" aria-live="off">
        {fmtClock(elapsed)}
      </div>
      {startedAt ? (
        <button className="btn sm" onClick={onStop}>
          Stop &amp; log
        </button>
      ) : (
        <button className="btn primary sm" onClick={start}>
          Start
        </button>
      )}
    </div>
  );
}
