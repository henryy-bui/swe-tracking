export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/* Display name of the command modifier for keyboard hints. */
export const MOD_KEY = isMac ? '⌘' : 'Ctrl';
