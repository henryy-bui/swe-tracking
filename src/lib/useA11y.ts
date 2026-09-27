import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface TrapOptions {
  active: boolean;
  onClose?: () => void;
  /* Elements outside the dialog that should be inert while it is open. */
  inertSelector?: string;
  /* Element to focus first; defaults to the first focusable inside. */
  initialFocus?: RefObject<HTMLElement>;
}

/* Keeps Tab inside `ref` while active, closes on Escape, makes the rest of the page inert,
   and returns focus to where it was when the dialog closes. */
export function useFocusTrap(ref: RefObject<HTMLElement>, { active, onClose, inertSelector, initialFocus }: TrapOptions) {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    const others = inertSelector ? Array.from(document.querySelectorAll<HTMLElement>(inertSelector)) : [];
    others.forEach((el) => el.setAttribute('inert', ''));

    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
    const first = initialFocus?.current ?? focusables()[0];
    const t = setTimeout(() => first?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      others.forEach((el) => el.removeAttribute('inert'));
      previous?.focus?.();
    };
  }, [ref, active, onClose, inertSelector, initialFocus]);
}

/* Adds body.typing while a text field has focus, so the phone tab bar can get out of the keyboard's way. */
export function useBodyTypingClass() {
  useEffect(() => {
    const isTextField = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      if (t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return true;
      if (t.tagName !== 'INPUT') return false;
      const type = (t as HTMLInputElement).type;
      return !['checkbox', 'radio', 'range', 'button', 'submit', 'file'].includes(type);
    };
    const onFocusIn = (e: FocusEvent) => isTextField(e.target) && document.body.classList.add('typing');
    const onFocusOut = () => document.body.classList.remove('typing');
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);
}

/* Roving tabindex + arrow keys for a horizontal group (rating stars, chart bars). */
export const rovingKey = (e: React.KeyboardEvent, index: number, count: number, move: (next: number) => void) => {
  const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (e.key === 'Home') {
    e.preventDefault();
    move(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    move(count - 1);
  } else if (map[e.key]) {
    e.preventDefault();
    move((index + map[e.key] + count) % count);
  }
};
