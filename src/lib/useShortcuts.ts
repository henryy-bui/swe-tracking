import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUi } from '@/store/ui';
import { toggleTimer } from '@/lib/session';

const GO: Record<string, string> = {
  t: '/today',
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

/* Global keyboard shortcuts: Cmd/Ctrl+K, "/" or "?" for search, "g" + letter to jump, "t" for the timer. */
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

      if (e.key === '/' || e.key === '?') {
        e.preventDefault();
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
      if (e.key === 't') toggleTimer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);
}
