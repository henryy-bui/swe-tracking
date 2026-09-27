import { useEffect, useState } from 'react';

/* Local editing copy of a stored value. Re-syncs when the stored value changes (cloud sync, import,
   navigation) and commits only when the user actually changed something. */
export function useDraft<T>(source: T, commit: (value: T) => void): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState(source);
  useEffect(() => setValue(source), [source]);
  const commitIfChanged = () => {
    if (value !== source) commit(value);
  };
  return [value, setValue, commitIfChanged];
}
