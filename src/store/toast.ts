import { create } from 'zustand';

/* Short feedback messages. The Toast component renders them in a live region. */
interface ToastState {
  message: string | null;
  seq: number; // changes on every show, so a repeated identical message re-announces
  show: (m: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  message: null,
  seq: 0,
  show: (message) => set({ message, seq: get().seq + 1 }),
  clear: () => set({ message: null }),
}));

export const toast = (message: string) => useToastStore.getState().show(message);
