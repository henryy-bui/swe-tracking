/* The weekly DSA cell of the roadmap, parsed once at module load.
   Three shapes appear in the sheet:
     "Pattern (Problem A, Problem B)"      -> pattern + problems
     "Prefix: Problem A, Problem B"        -> pattern + problems (review sprints)
     "Free text"                           -> pattern only, no problems */

export interface DsaDef {
  pattern: string;
  problems: string[];
  raw: string;
}

const splitList = (s: string): string[] =>
  s
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

export const parseDsa = (raw: string): DsaDef => {
  const text = raw.trim();
  const paren = /^(.*?)\s*\((.*)\)\s*$/.exec(text);
  if (paren) return { pattern: paren[1].trim(), problems: splitList(paren[2]), raw: text };
  const colon = /^([^:]+):\s*(.+)$/.exec(text);
  if (colon) return { pattern: colon[1].trim(), problems: splitList(colon[2]), raw: text };
  return { pattern: text, problems: [], raw: text };
};

/* "Pattern (A, B)" for display; the raw cell when there are no problems. */
export const dsaLabel = (d: DsaDef): string => (d.problems.length ? `${d.pattern} (${d.problems.join(', ')})` : d.raw);

/* Case- and whitespace-insensitive key for matching problem titles. */
export const problemKey = (title: string): string => title.toLowerCase().replace(/\s+/g, ' ').trim();
