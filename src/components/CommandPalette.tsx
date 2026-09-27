import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useUi } from '@/store/ui';
import { useTheme } from '@/store/theme';
import { buildIndex, groupResults, KIND_LABEL, search, type SearchResult } from '@/lib/search';
import { currentWeek } from '@/lib/derive';
import { downloadBackup } from '@/lib/download';
import { toggleTimer } from '@/lib/session';
import { MOD_KEY } from '@/lib/platform';
import { useFocusTrap } from '@/lib/useA11y';
import { toast } from '@/components/ui';
import { Search } from '@/components/icons';

/* Cmd/Ctrl+K search over everything, plus a few quick actions. */
export function CommandPalette() {
  const paletteOpen = useUi((s) => s.paletteOpen);
  const paletteQuery = useUi((s) => s.paletteQuery);
  const closePalette = useUi((s) => s.closePalette);
  const updatedAt = useStore((s) => s.updatedAt);
  const navigate = useNavigate();
  const id = useId();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => closePalette(), [closePalette]);
  useFocusTrap(dialogRef, { active: paletteOpen, onClose: close, inertSelector: '.app > :not(.palette):not(.palette-backdrop)', initialFocus: inputRef });

  // The index is built while the palette is open and rebuilt if the data changes meanwhile.
  const index = useMemo(() => (paletteOpen ? buildIndex(useStore.getState()) : []), [paletteOpen, updatedAt]);
  const results = useMemo(() => search(index, query), [index, query]);
  const groups = useMemo(() => groupResults(results), [results]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (!paletteOpen) return;
    setQuery(paletteQuery);
    setSelected(0);
  }, [paletteOpen, paletteQuery]);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!paletteOpen) return null;

  const run = (r: SearchResult) => {
    close();
    if (r.to) {
      navigate(r.to);
      return;
    }
    switch (r.action) {
      case 'timer':
        toggleTimer();
        break;
      case 'theme':
        useTheme.getState().cycle();
        break;
      case 'today': {
        const cw = currentWeek(useStore.getState());
        navigate(cw ? `/weeks/${cw}` : '/settings');
        if (!cw) toast('Set a start date in Settings to unlock the current week.');
        break;
      }
      case 'export':
        downloadBackup();
        toast('Backup downloaded.');
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
    }
  };

  const listId = `${id}-list`;
  let cursor = -1;
  return (
    <>
      <div className="palette-backdrop" onClick={close} />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" ref={dialogRef}>
        <div className="palette-input">
          <Search size={18} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat[selected] ? `${id}-opt-${selected}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search weeks, tasks, notes, problems… or type an action"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <button className="btn ghost sm palette-cancel" onClick={close}>
            Cancel
          </button>
        </div>
        <div className="sr-only" role="status" aria-live="polite">
          {flat.length === 0 ? 'No results' : `${flat.length} results`}
        </div>
        {flat.length === 0 && (
          <div className="palette-results">
            <div className="empty">Nothing matches “{query}”. Try a week number, a topic, or a task.</div>
          </div>
        )}
        <div className="palette-results" ref={listRef} role="listbox" id={listId} aria-label="Results" hidden={flat.length === 0}>
          {groups.map((g) => (
            <div key={g.kind} role="group" aria-labelledby={`${id}-g-${g.kind}`}>
              <div className="palette-group-title" id={`${id}-g-${g.kind}`}>
                {KIND_LABEL[g.kind]}
              </div>
              {g.items.map((r) => {
                cursor++;
                const idx = cursor;
                return (
                  <div
                    key={r.id}
                    id={`${id}-opt-${idx}`}
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
                    {idx === selected && (
                      <kbd className="kbd" aria-hidden="true">
                        ↵
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="palette-foot" aria-hidden="true">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="kbd">esc</kbd> close
          </span>
          <span>
            <kbd className="kbd">g</kbd> then a letter jumps to a page: <kbd className="kbd">o</kbd> overview <kbd className="kbd">w</kbd> weeks <kbd className="kbd">l</kbd> log{' '}
            <kbd className="kbd">f</kbd> follow-ups <kbd className="kbd">d</kbd> DSA <kbd className="kbd">p</kbd> projects <kbd className="kbd">r</kbd> resources <kbd className="kbd">m</kbd>{' '}
            achievements <kbd className="kbd">s</kbd> settings
          </span>
          <span>
            <kbd className="kbd">t</kbd> start / stop timer
          </span>
          <span>
            <kbd className="kbd">{MOD_KEY}</kbd>
            <kbd className="kbd">K</kbd>, <kbd className="kbd">/</kbd> or <kbd className="kbd">?</kbd> open this
          </span>
        </div>
      </div>
    </>
  );
}
