import { useEffect, useRef, useState, type RefObject } from 'react';

/* Measures the rendered width of an element so SVG charts can size their viewBox to real pixels
   instead of scaling text down on narrow screens. Returns the fallback until mounted. */
export function useContainerWidth<T extends HTMLElement>(fallback = 640): [RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.round(el.getBoundingClientRect().width) || fallback);
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);

  return [ref, width];
}
