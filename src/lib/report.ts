/* Markdown generators: one week's summary and a whole-plan progress report. */
import { PHASES, PROJECTS, RESOURCES, TOTAL_WEEKS, phaseOfWeek, weekDef } from '@/data/roadmap';
import type { AppData } from '@/store/useStore';
import {
  isDone, minutesForRoadmapWeek, overallProgress, phaseProgress, projectProgress, projectState, resourceState, streak, taskItems, totalMinutes,
  weekProgress, weekRange, weekStatus,
} from '@/lib/derive';
import { fmtDate, fmtHours, pct, today } from '@/lib/date';

const line = (s = '') => s + '\n';

export const weekSummaryMarkdown = (data: AppData, week: number): string => {
  const def = weekDef(week);
  const phase = phaseOfWeek(week);
  const range = weekRange(data, week);
  const wp = weekProgress(data, week);
  const items = taskItems(data, week);
  const minutes = minutesForRoadmapWeek(data, week);
  const sessions = data.logs.filter((l) => l.week === week);
  const followUps = data.followUps.filter((f) => f.week === week);
  const problems = (data.problems ?? []).filter((p) => p.week === week);
  const retro = data.retros?.[String(week)];
  const note = data.weekNotes[String(week)];

  let md = '';
  md += line(`# Week ${week}: ${def.topic}`);
  md += line(`Phase ${phase.id} · ${phase.title}${range ? ` · ${fmtDate(range.start)} – ${fmtDate(range.end)}` : ''}`);
  md += line();
  md += line(`**Status:** ${weekStatus(data, week)} · ${wp.done}/${wp.total} items · ${fmtHours(minutes)} logged in ${sessions.length} session${sessions.length === 1 ? '' : 's'}`);
  md += line();
  md += line('## Checklist');
  for (const it of items) md += line(`- [${isDone(data, it.key) ? 'x' : ' '}] ${it.kind === 'dsa' ? 'DSA: ' : ''}${it.label}`);
  if (retro && (retro.rating || retro.wentWell || retro.improve)) {
    md += line();
    md += line('## Retrospective');
    if (retro.rating) md += line(`Rating: ${'★'.repeat(retro.rating)}${'☆'.repeat(5 - retro.rating)}`);
    if (retro.wentWell) md += line(`**Went well:** ${retro.wentWell}`);
    if (retro.improve) md += line(`**Improve:** ${retro.improve}`);
  }
  if (note) {
    md += line();
    md += line('## Notes');
    md += line(note);
  }
  if (problems.length) {
    md += line();
    md += line('## DSA problems');
    for (const p of problems) md += line(`- [${p.status === 'solved' ? 'x' : ' '}] ${p.title} (${p.difficulty})`);
  }
  if (followUps.length) {
    md += line();
    md += line('## Follow-ups');
    for (const f of followUps) md += line(`- [${f.done ? 'x' : ' '}] ${f.title}${f.due ? ` (due ${f.due})` : ''}`);
  }
  if (sessions.length) {
    md += line();
    md += line('## Sessions');
    for (const s of [...sessions].sort((a, b) => (a.date < b.date ? -1 : 1))) md += line(`- ${s.date} · ${fmtHours(s.minutes)} · ${s.tag}${s.note ? ` · ${s.note}` : ''}`);
  }
  return md;
};

export const progressReportMarkdown = (data: AppData): string => {
  const overall = overallProgress(data);
  const hours = totalMinutes(data);
  const problems = data.problems ?? [];
  const solved = problems.filter((p) => p.status === 'solved').length;
  let md = '';
  md += line(`# SWE Roadmap progress report`);
  md += line(`Generated ${fmtDate(today(), { day: 'numeric', month: 'long', year: 'numeric' })}${data.startDate ? ` · plan started ${fmtDate(data.startDate, { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}`);
  md += line();
  md += line(`- Items: **${overall.done} / ${overall.total}** (${pct(overall.done, overall.total)}%) · weeks complete: ${overall.weeksDone} / ${TOTAL_WEEKS}`);
  md += line(`- Study time: **${fmtHours(hours)}** across ${data.logs.length} sessions · current streak ${streak(data)} days`);
  md += line(`- DSA: ${solved} solved of ${problems.length} tracked`);
  md += line(`- Follow-ups: ${data.followUps.filter((f) => f.done).length} closed, ${data.followUps.filter((f) => !f.done).length} open`);
  md += line();
  md += line('## Phases');
  md += line('| Phase | Weeks | Items | Progress |');
  md += line('|---|---|---|---|');
  for (const p of PHASES) {
    const pp = phaseProgress(data, p.id);
    md += line(`| ${p.id}. ${p.title} | ${pp.weeksDone}/${pp.weeks} | ${pp.done}/${pp.total} | ${pct(pp.done, pp.total)}% |`);
  }
  md += line();
  md += line('## Weeks');
  md += line('| Week | Topic | Status | Items | Hours | Rating |');
  md += line('|---|---|---|---|---|---|');
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const wp = weekProgress(data, w);
    const r = data.retros?.[String(w)]?.rating ?? 0;
    md += line(`| ${w} | ${weekDef(w).topic} | ${weekStatus(data, w)} | ${wp.done}/${wp.total} | ${fmtHours(minutesForRoadmapWeek(data, w))} | ${r ? '★'.repeat(r) : ''} |`);
  }
  md += line();
  md += line('## Side projects');
  for (const p of PROJECTS) {
    const st = projectState(data, p.id);
    const pp = projectProgress(data, p.id);
    md += line(`- **${p.number}. ${p.title}** — ${st.status.replace('-', ' ')} · ${pp.done}/${pp.total} milestones${st.repo ? ` · ${st.repo}` : ''}`);
  }
  md += line();
  md += line('## Resources');
  for (const r of RESOURCES) {
    const st = resourceState(data, r.id);
    md += line(`- ${r.title} — ${st.status.replace('-', ' ')}${r.type === 'book' ? ` (${st.progress}%)` : ''}`);
  }
  return md;
};
