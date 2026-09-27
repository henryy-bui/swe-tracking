import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportJSON, useStore } from '@/store/useStore';
import { useUi } from '@/store/ui';
import { useTimer } from '@/store/timer';
import { useTheme } from '@/store/theme';
import { buildIndex, groupResults, KIND_LABEL, search, type SearchResult } from '@/lib/search';
import { currentWeek } from '@/lib/derive';
import { downloadText, today } from '@/lib/date';
import { toast } from '@/components/ui';
import { Search } from '@/components/icons';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const MOD_KEY = isMac ? '⌘' : 'Ctrl';

/* Cmd/Ctrl+K search over everything, plus a few quick actions. */
export function CommandPalette() {
  const { paletteOpen, paletteQuery, closePalette } = useUi();
  const data = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // The index is rebuilt only while the palette is open and the data changes.
  const index = useMemo(() => (paletteOpen ? buildIndex(data) : []), [paletteOpen, data]);
  const results = useMemo(() => search(index, query), [index, query]);
  const groups = useMemo(() => groupResults(results), [results]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (!paletteOpen) return;
    setQuery(paletteQuery);
    setSelected(0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [paletteOpen, paletteQuery]);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!paletteOpen) return null;

  const run = (r: SearchResult) => {
    closePalette();
    if (r.to) {
      navigate(r.to);
      return;
    }
    switch (r.action) {
      case 'timer': {
        const t = useTimer.getState();
        if (t.startedAt) {
          const minutes = t.stop();
          if (minutes >= 1) {
            useStore.getState().addLog({ date: today(), minutes, week: currentWeek(data) ?? undefined, tag: 'study', note: '' });
            toast(`Logged ${minutes} min`);
          } else toast('Timer stopped');
        } else {
          t.start();
          toast('Focus timer started');
        }
        break;
      }
      case 'theme':
        useTheme.getState().cycle();
        break;
      case 'today': {
        const cw = currentWeek(data);
        navigate(cw ? `/weeks/${cw}` : '/settings');
        if (!cw) toast('Set a start date first');
        break;
      }
      case 'export':
        downloadText(`swe-tracking-${today()}.json`, exportJSON());
        toast('Backup downloaded');
        break;
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(flat.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[selected]) run(flat[selected]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  };

  let cursor = -1;
  return (
    <>
      <div className="palette-backdrop" onClick={closePalette} />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search">
        <div className="palette-input">
          <Search size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search weeks, tasks, notes, problems… or type an action"
            aria-label="Search"
            aria-activedescendant={flat[selected] ? `palette-${flat[selected].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="kbd">esc</kbd>
        </div>
        <div className="palette-results" ref={listRef} role="listbox">
          {flat.length === 0 && <div className="empty">Nothing matches “{query}”.</div>}
          {groups.map((g) => (
            <div key={g.kind} className="palette-group">
              <div className="palette-group-title">{KIND_LABEL[g.kind]}</div>
              {g.items.map((r) => {
                cursor++;
                const idx = cursor;
                return (
                  <div
                    key={r.id}
                    id={`palette-${r.id}`}
                    data-index={idx}
                    role="option"
                    aria-selected={idx === selected}
                    className={`palette-item${idx === selected ? ' selected' : ''}`}
                    onMouseEnter={() => setSelected(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => run(r)}
                  >
                    <div className="grow">
                      <div className="palette-title">{r.title}</div>
                      {r.subtitle && <div className="palette-sub">{r.subtitle}</div>}
                    </div>
                    {idx === selected && <kbd className="kbd">↵</kbd>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="kbd">g</kbd> then <kbd className="kbd">o</kbd>/<kbd className="kbd">w</kbd>/<kbd className="kbd">l</kbd>/<kbd className="kbd">f</kbd>/<kbd className="kbd">d</kbd>/<kbd className="kbd">p</kbd>/<kbd className="kbd">m</kbd>/<kbd className="kbd">s</kbd> jump to a page
          </span>
          <span>
            <kbd className="kbd">t</kbd> timer
          </span>
          <span>
            <kbd className="kbd">{MOD_KEY}</kbd>
            <kbd className="kbd">K</kbd> or <kbd className="kbd">/</kbd> search
          </span>
        </div>
      </div>
    </>
  );
}
