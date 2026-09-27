/* iCalendar export: week windows, open follow-up due dates, and DSA review dates as all-day events. */
import { TOTAL_WEEKS, weekDef, phaseOfWeek } from '@/data/roadmap';
import type { AppData } from '@/store/useStore';
import { taskItems, weekRange } from '@/lib/derive';
import { addDays } from '@/lib/date';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const ymd = (iso: string) => iso.replace(/-/g, '');

/* RFC 5545: lines longer than 75 octets are folded with CRLF + space. */
const fold = (line: string): string => {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ' ' + rest.slice(74);
  }
  out.push(rest);
  return out.join('\r\n');
};

interface Event {
  uid: string;
  start: string; // YYYY-MM-DD, inclusive
  end: string; // YYYY-MM-DD, inclusive
  summary: string;
  description?: string;
}

const event = (e: Event, stamp: string): string[] => [
  'BEGIN:VEVENT',
  `UID:${e.uid}@swe-tracking`,
  `DTSTAMP:${stamp}`,
  `DTSTART;VALUE=DATE:${ymd(e.start)}`,
  `DTEND;VALUE=DATE:${ymd(addDays(e.end, 1))}`, // DTEND is exclusive
  `SUMMARY:${esc(e.summary)}`,
  ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
  'END:VEVENT',
];

export interface IcsOptions {
  weeks?: boolean;
  followUps?: boolean;
  reviews?: boolean;
}

export const buildIcs = (data: AppData, opts: IcsOptions = { weeks: true, followUps: true, reviews: true }): string => {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SWE Roadmap Tracker//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:SWE Roadmap'];

  if (opts.weeks && data.startDate) {
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const r = weekRange(data, w)!;
      const def = weekDef(w);
      const tasks = taskItems(data, w).map((t) => `• ${t.label}`).join('\n');
      lines.push(...event({ uid: `week-${w}`, start: r.start, end: r.end, summary: `Week ${w}: ${def.topic}`, description: `Phase ${phaseOfWeek(w).id} · ${phaseOfWeek(w).title}\n${tasks}` }, stamp));
    }
  }
  if (opts.followUps) {
    for (const f of data.followUps) {
      if (f.done || !f.due) continue;
      lines.push(...event({ uid: `fu-${f.id}`, start: f.due, end: f.due, summary: `Follow-up: ${f.title}`, description: f.note || undefined }, stamp));
    }
  }
  if (opts.reviews) {
    for (const p of data.problems) {
      if (p.status !== 'solved' || !p.nextReview) continue;
      lines.push(...event({ uid: `review-${p.id}-${p.reviewCount}`, start: p.nextReview, end: p.nextReview, summary: `Review: ${p.title}`, description: p.url || undefined }, stamp));
    }
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
};

export const countIcsEvents = (ics: string) => (ics.match(/BEGIN:VEVENT/g) ?? []).length;
