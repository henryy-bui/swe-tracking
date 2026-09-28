import { useId, useState, type FormEvent } from 'react';
import { useStore, type ProjectMilestone, type ProjectStatus } from '@/store/useStore';
import { PROJECTS, type ProjectDef, type ProjectMilestoneKind } from '@/data/roadmap';
import { projectProgress, projectState, weekRange } from '@/lib/derive';
import { fmtDate } from '@/lib/date';
import { milestoneKey } from '@/lib/keys';
import { STATUS_LABEL, TERMS } from '@/lib/labels';
import { useDraft } from '@/lib/useDraft';
import { deleteMilestoneWithUndo } from '@/lib/undo';
import { PageHead, ProgressBar, StatusPill, Vi, WeekLink, toast } from '@/components/ui';
import { X } from '@/components/icons';

const PROJECT_STATUSES: ProjectStatus[] = ['not-started', 'in-progress', 'done'];

export default function Projects() {
  return (
    <>
      <PageHead title="Side projects" subtitle="Four flagship projects, one per phase. The engineering requirements and interview deliverables from the roadmap are the milestones; add your own as the scope firms up." />
      <div className="stack">
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} def={p} />
        ))}
      </div>
    </>
  );
}

function ProjectCard({ def }: { def: ProjectDef }) {
  const id = useId();
  const data = useStore();
  const setProject = useStore((s) => s.setProject);
  const toggleMilestone = useStore((s) => s.toggleMilestone);
  const addMilestone = useStore((s) => s.addMilestone);
  const st = projectState(data, def.id);
  const pp = projectProgress(data, def.id);
  const startRange = weekRange(data, def.weeks[0]);
  const endRange = weekRange(data, def.weeks[1]);

  const [newMs, setNewMs] = useState('');
  const [note, setNote, commitNote] = useDraft(st.note, (v) => {
    setProject(def.id, { note: v });
    toast('Project notes saved.');
  });
  const [repo, setRepo, commitRepo] = useDraft(st.repo, (v) => {
    setProject(def.id, { repo: v.trim() });
    toast('Repository link saved.');
  });

  const submitMs = (e: FormEvent) => {
    e.preventDefault();
    if (!newMs.trim()) return;
    addMilestone(def.id, newMs.trim());
    setNewMs('');
    toast('Milestone added.');
  };

  const byKind = (kind: ProjectMilestoneKind): ProjectMilestone[] =>
    def.milestones.filter((m) => m.kind === kind).map((m) => st.milestones.find((x) => x.id === milestoneKey(def.id, m.id))!).filter(Boolean);
  const groups: { title: string; items: ProjectMilestone[] }[] = [
    { title: TERMS.requirement, items: byKind('requirement') },
    { title: TERMS.deliverable, items: byKind('deliverable') },
    { title: TERMS.yours, items: st.milestones.filter((m) => m.custom) },
  ];

  return (
    <div className="card project-card" id={def.id}>
      <div className="project-head">
        <div>
          <div className="num">
            Project {def.number} · {def.tag}
          </div>
          <h2>{def.title}</h2>
          <div className="small ink-2 section-xs">
            <WeekLink week={def.weeks[0]} /> – <WeekLink week={def.weeks[1]} />
            {startRange && endRange && ` · ${fmtDate(startRange.start)} – ${fmtDate(endRange.end)}`}
          </div>
        </div>
        <StatusPill status={st.status} />
      </div>

      <p className="section-sm">
        <strong>Problem:</strong> <Vi>{def.problem}</Vi>
      </p>
      <div className="row section-xs" aria-label="Tech stack">
        <strong className="small">Stack:</strong>
        {def.stack.split(',').map((s) => (
          <span key={s.trim()} className="pill">
            {s.trim()}
          </span>
        ))}
      </div>

      <div className="project-controls">
        <div className="field">
          <label htmlFor={`${id}-status`}>Status</label>
          <select id={`${id}-status`} value={st.status} onChange={(e) => setProject(def.id, { status: e.target.value as ProjectStatus })}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-repo`}>Repository or demo link</label>
          <input id={`${id}-repo`} type="url" value={repo} onChange={(e) => setRepo(e.target.value)} onBlur={commitRepo} placeholder="https://github.com/you/project" />
        </div>
      </div>

      <hr className="divider" />

      <div className="row between">
        <h3>Milestones</h3>
        <span className="small ink-2 tabular">
          {pp.done}/{pp.total}
        </span>
      </div>
      <div className="section-xs section-xs-b">
        <ProgressBar done={pp.done} total={pp.total} label={`${def.title} milestones`} valueText={`${pp.done} of ${pp.total} milestones`} />
      </div>
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <div key={g.title} className="section-xs">
            <div className="label small ink-2">{g.title}</div>
            <ul className="checklist">
              {g.items.map((m) => (
                <li key={m.id} className={m.done ? 'done' : ''}>
                  <label>
                    <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(def.id, m.id)} />
                    <span>{m.custom ? m.title : <Vi>{m.title}</Vi>}</span>
                  </label>
                  {m.custom && (
                    <button className="btn sm ghost icon" onClick={() => deleteMilestoneWithUndo(def.id, m)} aria-label={`Remove milestone "${m.title}"`}>
                      <X size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      <form className="inline-add" onSubmit={submitMs}>
        <input type="text" className="input" value={newMs} onChange={(e) => setNewMs(e.target.value)} placeholder="Add a milestone…" aria-label={`New milestone for ${def.title}`} />
        <button className="btn" type="submit">
          Add
        </button>
      </form>
      <p className="hint section-xs">Milestones from the roadmap can't be removed; your own can.</p>

      <hr className="divider" />
      <div className="field">
        <label htmlFor={`${id}-note`}>Notes</label>
        <textarea id={`${id}-note`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} onBlur={commitNote} placeholder="Architecture decisions, links, open questions…" />
      </div>
    </div>
  );
}
