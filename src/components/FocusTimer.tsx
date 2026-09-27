import { useEffect, useState } from 'react';
import { beep, POMODORO_MINUTES, useTimer } from '@/store/timer';
import { LOG_TAGS, useStore, type LogTag } from '@/store/useStore';
import { currentWeek } from '@/lib/derive';
import { fmtHours, today } from '@/lib/date';
import { toast } from '@/components/ui';
import { Play, Square } from '@/components/icons';

const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/* Ticks once a second while the timer runs. */
const useElapsed = (startedAt: number | null) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return startedAt ? now - startedAt : 0;
};

/* Fires the Pomodoro alert once per session. */
const usePomodoroAlert = (elapsed: number) => {
  const { pomodoro, alerted, setAlerted } = useTimer();
  const reached = pomodoro && elapsed >= POMODORO_MINUTES * 60000;
  useEffect(() => {
    if (reached && !alerted) {
      setAlerted();
      beep();
      toast(`${POMODORO_MINUTES} minutes of focus. Take a break or keep going.`);
    }
  }, [reached, alerted, setAlerted]);
  return reached;
};

interface Props {
  /* Top-bar chip: start/stop only; stopping logs straight away as "study". */
  compact?: boolean;
}

export function FocusTimer({ compact }: Props) {
  const { startedAt, pomodoro, start, stop, setPomodoro } = useTimer();
  const addLog = useStore((s) => s.addLog);
  const data = useStore();
  const [draft, setDraft] = useState<{ minutes: number; tag: LogTag; note: string } | null>(null);
  const elapsed = useElapsed(startedAt);
  const reached = usePomodoroAlert(elapsed);

  const logSession = (minutes: number, tag: LogTag, note: string) => {
    addLog({ date: today(), minutes, week: currentWeek(data) ?? undefined, tag, note: note.trim() });
    toast(`Logged ${fmtHours(minutes)}`);
  };

  const onStop = () => {
    const minutes = stop();
    if (minutes < 1) {
      toast('Session under a minute, not logged.');
      return;
    }
    if (compact) logSession(minutes, 'study', '');
    else setDraft({ minutes, tag: 'study', note: '' });
  };

  if (compact) {
    return startedAt ? (
      <span className={`timer-chip${reached ? ' reached' : ''}`}>
        <span className="timer-clock" aria-live="off">
          {fmtClock(elapsed)}
        </span>
        <button className="btn sm" onClick={onStop} aria-label="Stop timer and log session">
          <Square size={12} filled /> Stop
        </button>
      </span>
    ) : (
      <button className="btn sm ghost" onClick={start} aria-label="Start focus timer">
        <Play size={13} filled /> Focus
      </button>
    );
  }

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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              logSession(draft.minutes, draft.tag, draft.note);
              setDraft(null);
            }
          }}
          aria-label="Session note"
        />
        <div className="row">
          <button
            className="btn primary sm"
            onClick={() => {
              logSession(draft.minutes, draft.tag, draft.note);
              setDraft(null);
            }}
          >
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
          <Square size={13} filled /> Stop &amp; log
        </button>
      ) : (
        <button className="btn primary sm" onClick={start}>
          <Play size={13} filled /> Start
        </button>
      )}
    </div>
  );
}
