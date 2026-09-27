import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

/* Short feedback messages, optionally with one action (used for Undo). The Toast component renders them in a live region. */
interface ToastState {
  message: string | null;
  action: ToastAction | null;
  seq: number; // changes on every show, so a repeated identical message re-announces
  show: (m: string, action?: ToastAction) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  message: null,
  action: null,
  seq: 0,
  show: (message, action) => set({ message, action: action ?? null, seq: get().seq + 1 }),
  clear: () => set({ message: null, action: null }),
}));

export const toast = (message: string, action?: ToastAction) => useToastStore.getState().show(message, action);
