import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  label: string;
  placeholder?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

/* Small textarea with Save / Cancel, used for follow-up details and problem notes. */
export function InlineNoteEditor({ value, label, placeholder, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="row inline-editor">
      <textarea
        ref={ref}
        className="grow"
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSave(draft.trim());
        }}
        aria-label={label}
        placeholder={placeholder}
      />
      <button className="btn sm" onClick={() => onSave(draft.trim())}>
        Save
      </button>
      <button className="btn sm ghost" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
