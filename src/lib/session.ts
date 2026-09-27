/* One place for "stop the focus timer and turn it into a study session", so the sidebar widget,
   the phone chip, the command palette, and the `t` shortcut all behave the same way. */
import { useTimer } from '@/store/timer';
import { useStore, type LogTag } from '@/store/useStore';
import { currentWeek } from '@/lib/derive';
import { today } from '@/lib/date';
import { fmtDuration } from '@/lib/format';
import { LOG_TAG_LABEL } from '@/lib/labels';
import { toast } from '@/store/toast';

export const MIN_SESSION_MINUTES = 1;

/* Saves a session for today against the current roadmap week and confirms it. */
export const logSession = (minutes: number, tag: LogTag = 'study', note = ''): void => {
  const data = useStore.getState();
  const week = currentWeek(data) ?? undefined;
  data.addLog({ date: today(), minutes, week, tag, note: note.trim() });
  toast(`Logged ${fmtDuration(minutes)} as ${LOG_TAG_LABEL[tag]}${week ? ` to week ${week}` : ''}. Edit it in Study log.`);
};

/* Stops the timer. Returns the elapsed minutes, or null (with a toast) when too short to keep. */
export const stopTimer = (): number | null => {
  const minutes = useTimer.getState().stop();
  if (minutes < MIN_SESSION_MINUTES) {
    toast('Timer stopped. Sessions under a minute are not logged.');
    return null;
  }
  return minutes;
};

/* Stop and log straight away (phone chip, palette, shortcut). */
export const stopTimerAndLog = (tag: LogTag = 'study', note = ''): void => {
  const minutes = stopTimer();
  if (minutes !== null) logSession(minutes, tag, note);
};

export const toggleTimer = (): void => {
  const t = useTimer.getState();
  if (t.startedAt) stopTimerAndLog();
  else {
    t.start();
    toast('Focus timer started.');
  }
};
