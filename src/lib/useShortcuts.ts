import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUi } from '@/store/ui';
import { useTimer } from '@/store/timer';
import { useStore } from '@/store/useStore';
import { currentWeek } from '@/lib/derive';
import { today } from '@/lib/date';
import { toast } from '@/components/ui';

const GO: Record<string, string> = {
  o: '/',
  w: '/weeks',
  l: '/log',
  f: '/followups',
  d: '/dsa',
  p: '/projects',
  r: '/resources',
  m: '/milestones',
  s: '/settings',
};

const isTyping = (t: EventTarget | null) => {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName);
};

/* Global keyboard shortcuts: Cmd/Ctrl+K or "/" for search, "g" + letter to jump, "t" for the timer. */
export function useShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    let pendingG = 0;
    const onKey = (e: KeyboardEvent) => {
      const ui = useUi.getState();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ui.togglePalette();
        return;
      }
      if (ui.paletteOpen || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        ui.openPalette();
        return;
      }
      if (e.key === '?') {
        ui.openPalette();
        return;
      }
      if (pendingG && Date.now() - pendingG < 900 && GO[e.key]) {
        e.preventDefault();
        navigate(GO[e.key]);
        pendingG = 0;
        return;
      }
      pendingG = 0;
      if (e.key === 'g') {
        pendingG = Date.now();
        return;
      }
      if (e.key === 't') {
        const t = useTimer.getState();
        if (t.startedAt) {
          const minutes = t.stop();
          if (minutes >= 1) {
            const data = useStore.getState();
            data.addLog({ date: today(), minutes, week: currentWeek(data) ?? undefined, tag: 'study', note: '' });
            toast(`Logged ${minutes} min`);
          } else toast('Timer stopped');
        } else {
          t.start();
          toast('Focus timer started');
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);
}
