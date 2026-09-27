import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* Focus timer. Start time persists so a page reload does not lose the session. */
interface TimerState {
  startedAt: number | null; // epoch ms
  pomodoro: boolean; // alert at 25 minutes
  alerted: boolean;
  start: () => void;
  stop: () => number; // returns elapsed minutes
  setPomodoro: (on: boolean) => void;
  setAlerted: () => void;
}

export const POMODORO_MINUTES = 25;

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      startedAt: null,
      pomodoro: true,
      alerted: false,
      start: () => set({ startedAt: Date.now(), alerted: false }),
      stop: () => {
        const { startedAt } = get();
        const minutes = startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0;
        set({ startedAt: null, alerted: false });
        return minutes;
      },
      setPomodoro: (pomodoro) => set({ pomodoro }),
      setAlerted: () => set({ alerted: true }),
    }),
    { name: 'swe-tracking:timer' },
  ),
);

/* Short beep without any audio asset. */
export const beep = () => {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    setTimeout(() => void ctx.close(), 600);
  } catch {
    /* audio blocked; the visual cue still shows */
  }
};
