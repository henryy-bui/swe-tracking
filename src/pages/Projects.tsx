import { useState, type FormEvent } from 'react';
import { useStore, type ProjectStatus } from '@/store/useStore';
import { PROJECTS, type ProjectDef } from '@/data/roadmap';
import { projectProgress, projectState, weekRange } from '@/lib/derive';
import { fmtDate } from '@/lib/date';
import { PageHead, ProgressBar, WeekLink, toast } from '@/components/ui';

const STATUS_LABEL: Record<ProjectStatus, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', done: 'Done' };

export default function Projects() {
  return (
    <>
      <PageHead title="Side projects" subtitle="Four portfolio projects, one per phase. Milestones start from the roadmap requirements; add your own as the scope firms up." />
      <div className="stack">
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} def={p} />
        ))}
      </div>
    </>
  );
}

function ProjectCard({ def }: { def: ProjectDef }) {
  const data = useStore();
  const { setProject, toggleMilestone, addMilestone, deleteMilestone } = useStore();
  const st = projectState(data, def.id);
  const pp = projectProgress(data, def.id);
  const startRange = weekRange(data, def.weeks[0]);
  const endRange = weekRange(data, def.weeks[1]);

  const [newMs, setNewMs] = useState('');
  const [note, setNote] = useState(st.note);
  const [repo, setRepo] = useState(st.repo);

  const submitMs = (e: FormEvent) => {
    e.preventDefault();
    if (!newMs.trim()) return;
    addMilestone(def.id, newMs.trim());
    setNewMs('');
  };

  return (
    <div className="card project-card" id={def.id}>
      <div className="project-head">
        <div>
          <div className="num">Side project {def.number} · {def.tag}</div>
          <h2>{def.title}</h2>
          <div className="small muted" style={{ marginTop: 4 }}>
            <WeekLink week={def.weeks[0]} /> → <WeekLink week={def.weeks[1]} />
            {startRange && endRange && ` · ${fmtDate(startRange.start)} – ${fmtDate(endRange.end)}`}
          </div>
        </div>
        <span className={`pill ${st.status === 'done' ? 'done' : st.status === 'in-progress' ? 'in-progress' : ''}`}>{STATUS_LABEL[st.status]}</span>
      </div>

      <p style={{ marginTop: 10 }}>
        <strong>Goal:</strong> {def.goal}
      </p>
      <p className="req">
        <strong>Requirements:</strong> {def.requirements}
      </p>

      <div className="project-controls">
        <div className="field">
          <label htmlFor={`${def.id}-status`}>Status</label>
          <select id={`${def.id}-status`} value={st.status} onChange={(e) => setProject(def.id, { status: e.target.value as ProjectStatus })}>
            {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${def.id}-repo`}>Repository / demo URL</label>
          <input
            id={`${def.id}-repo`}
            type="url"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            onBlur={() => {
              if (repo !== st.repo) {
                setProject(def.id, { repo: repo.trim() });
                toast('Saved');
              }
            }}
            placeholder="https://github.com/you/project"
          />
        </div>
      </div>

      <hr className="divider" />

      <div className="row between">
        <h3>Milestones</h3>
        <span className="small muted tabular">
          {pp.done}/{pp.total}
        </span>
      </div>
      <div style={{ margin: '8px 0 6px' }}>
        <ProgressBar done={pp.done} total={pp.total} label={`${pp.done} of ${pp.total} milestones`} />
      </div>
      <ul className="checklist">
        {st.milestones.map((m) => (
          <li key={m.id} className={m.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(def.id, m.id)} />
              <span>{m.title}</span>
            </label>
            {m.custom && (
              <button className="btn sm ghost" onClick={() => deleteMilestone(def.id, m.id)} aria-label={`Delete milestone "${m.title}"`}>
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      <form className="inline-add" onSubmit={submitMs}>
        <input type="text" className="input" value={newMs} onChange={(e) => setNewMs(e.target.value)} placeholder="Add a milestone…" aria-label={`New milestone for ${def.title}`} />
        <button className="btn" type="submit">
          Add
        </button>
      </form>

      <hr className="divider" />
      <div className="field">
        <label htmlFor={`${def.id}-note`}>Notes</label>
        <textarea
          id={`${def.id}-note`}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => {
            if (note !== st.note) {
              setProject(def.id, { note });
              toast('Notes saved');
            }
          }}
          placeholder="Architecture decisions, links, open questions…"
        />
      </div>
    </div>
  );
}
