import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'system' | 'light' | 'dark';
const ORDER: Theme[] = ['system', 'light', 'dark'];

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycle: () => void;
}

export const applyTheme = (t: Theme) => {
  if (typeof document === 'undefined') return;
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
};

/* Per-device preference; deliberately not part of the synced document. */
export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      cycle: () => get().setTheme(ORDER[(ORDER.indexOf(get().theme) + 1) % ORDER.length]),
    }),
    { name: 'swe-tracking:theme', onRehydrateStorage: () => (s) => s && applyTheme(s.theme) },
  ),
);
