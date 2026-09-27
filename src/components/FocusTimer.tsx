import { useEffect, useId, useState } from 'react';
import { beep, POMODORO_MINUTES, useTimer } from '@/store/timer';
import { type LogTag } from '@/store/useStore';
import { logSession, stopTimer, stopTimerAndLog } from '@/lib/session';
import { toast } from '@/components/ui';
import { LogTagSelect } from '@/components/fields';
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

const MESSAGE = `${POMODORO_MINUTES} minutes of focus done. Take a break or keep going.`;

/* Ask once for permission to notify when the tab is in the background. */
const requestNotifyPermission = () => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
  void Notification.requestPermission();
};

/* Fires the Pomodoro alert once per session: beep + toast, plus a system notification when the tab is hidden. */
const usePomodoroAlert = (elapsed: number) => {
  const { pomodoro, alerted, setAlerted } = useTimer();
  const reached = pomodoro && elapsed >= POMODORO_MINUTES * 60000;
  useEffect(() => {
    if (reached && !alerted) {
      setAlerted();
      beep();
      toast(MESSAGE);
      if (typeof document !== 'undefined' && document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('Pomodoro done', { body: MESSAGE, icon: '/favicon.svg', tag: 'pomodoro' });
        } catch {
          /* notifications unavailable in this context */
        }
      }
    }
  }, [reached, alerted, setAlerted]);
  return reached;
};

interface Props {
  /* Top-bar chip: start/stop only; stopping logs straight away as Study. */
  compact?: boolean;
}

export function FocusTimer({ compact }: Props) {
  const id = useId();
  const startedAt = useTimer((s) => s.startedAt);
  const pomodoro = useTimer((s) => s.pomodoro);
  const start = useTimer((s) => s.start);
  const setPomodoro = useTimer((s) => s.setPomodoro);
  const [draft, setDraft] = useState<{ minutes: number; tag: LogTag; note: string } | null>(null);
  const elapsed = useElapsed(startedAt);
  const reached = usePomodoroAlert(elapsed);

  if (compact) {
    return startedAt ? (
      <span className={`timer-chip${reached ? ' reached' : ''}`}>
        <span className="timer-clock" aria-live="off">
          {fmtClock(elapsed)}
          {reached && <span className="sr-only"> – Pomodoro done</span>}
        </span>
        <button className="btn sm" onClick={() => stopTimerAndLog()} aria-label="Stop timer and log the session">
          <Square size={12} filled /> Stop &amp; log
        </button>
      </span>
    ) : (
      <button className="btn sm ghost" onClick={start} aria-label="Start focus timer">
        <Play size={13} filled /> Start timer
      </button>
    );
  }

  const onStop = () => {
    const minutes = stopTimer();
    if (minutes !== null) setDraft({ minutes, tag: 'study', note: '' });
  };

  const save = () => {
    if (!draft) return;
    logSession(draft.minutes, draft.tag, draft.note);
    setDraft(null);
  };

  if (draft) {
    return (
      <div className="timer-widget" role="group" aria-label="Log the finished session">
        <div className="timer-label">Log {draft.minutes} min as</div>
        <LogTagSelect value={draft.tag} onChange={(v) => setDraft({ ...draft, tag: v as LogTag })} aria-label="Session type" />
        <input
          type="text"
          className="input"
          placeholder="Note (optional)"
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          aria-label="Session note"
        />
        <div className="row">
          <button className="btn primary sm" onClick={save}>
            Log session
          </button>
          <button
            className="btn ghost sm"
            onClick={() => {
              setDraft(null);
              toast(`${draft.minutes} min not logged.`);
            }}
          >
            Don't log
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`timer-widget${startedAt ? ' running' : ''}${reached ? ' reached' : ''}`} role="group" aria-label="Focus timer">
      <div className="row between">
        <span className="timer-label">{startedAt ? (reached ? 'Pomodoro done' : 'Focusing') : 'Focus timer'}</span>
        <label className="small ink-2 row timer-option" htmlFor={`${id}-pomo`}>
          <input
            id={`${id}-pomo`}
            type="checkbox"
            checked={pomodoro}
            onChange={(e) => {
              setPomodoro(e.target.checked);
              if (e.target.checked) requestNotifyPermission();
            }}
          />
          25-min alert
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
