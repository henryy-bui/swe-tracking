import { create } from 'zustand';

/* Transient UI state shared between the shell, shortcuts, and the command palette. */
interface UiState {
  paletteOpen: boolean;
  paletteQuery: string;
  openPalette: (query?: string) => void;
  closePalette: () => void;
  togglePalette: () => void;
}

export const useUi = create<UiState>((set, get) => ({
  paletteOpen: false,
  paletteQuery: '',
  openPalette: (query = '') => set({ paletteOpen: true, paletteQuery: query }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette: () => (get().paletteOpen ? set({ paletteOpen: false }) : set({ paletteOpen: true, paletteQuery: '' })),
}));
