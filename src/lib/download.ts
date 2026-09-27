import { exportJSON } from '@/store/useStore';
import { today } from '@/lib/date';

export const downloadText = (filename: string, text: string, type = 'application/json'): void => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* The JSON backup used by Settings and the command palette. */
export const downloadBackup = (): void => downloadText(`swe-tracking-${today()}.json`, exportJSON());
