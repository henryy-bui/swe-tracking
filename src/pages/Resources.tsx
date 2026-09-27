import { useState } from 'react';
import { useStore, type ResourceStatus } from '@/store/useStore';
import { RESOURCES, type ResourceDef } from '@/data/roadmap';
import { resourceState } from '@/lib/derive';
import { PageHead, ProgressBar, WeekLink, toast } from '@/components/ui';

const STATUS_LABEL: Record<ResourceStatus, string> = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

export default function Resources() {
  const data = useStore();
  const categories = [...new Set(RESOURCES.map((r) => r.category))];
  const done = RESOURCES.filter((r) => resourceState(data, r.id).status === 'done').length;

  return (
    <>
      <PageHead title="Reading & resources" subtitle={`${done} of ${RESOURCES.length} complete. Courses and books from the roadmap, with the weeks they support.`} />
      <div className="stack">
        {categories.map((cat) => (
          <div className="card" key={cat}>
            <div className="card-head">
              <h2>{cat}</h2>
            </div>
            {RESOURCES.filter((r) => r.category === cat).map((r) => (
              <ResourceRow key={r.id} def={r} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function ResourceRow({ def }: { def: ResourceDef }) {
  const data = useStore();
  const setResource = useStore((s) => s.setResource);
  const st = resourceState(data, def.id);
  const [note, setNote] = useState(st.note);

  const onStatus = (status: ResourceStatus) => {
    const patch: Partial<typeof st> = { status };
    if (status === 'done') patch.progress = 100;
    if (status === 'todo') patch.progress = 0;
    setResource(def.id, patch);
  };

  const onProgress = (progress: number) => {
    const patch: Partial<typeof st> = { progress };
    if (progress >= 100) patch.status = 'done';
    else if (progress > 0 && st.status === 'todo') patch.status = 'in-progress';
    setResource(def.id, patch);
  };

  return (
    <div className="resource">
      <div>
        <div className="row">
          <strong>
            <a href={def.url} target="_blank" rel="noreferrer">
              {def.title}
            </a>
          </strong>
          <span className="pill">{def.type}</span>
          <span className={`pill ${st.status === 'done' ? 'done' : st.status === 'in-progress' ? 'in-progress' : ''}`}>{STATUS_LABEL[st.status]}</span>
        </div>
        <div className="desc">{def.description}</div>
        <div className="small faint" style={{ marginTop: 4 }}>
          Supports{' '}
          {def.weeks[0] === def.weeks[1] ? (
            <WeekLink week={def.weeks[0]} />
          ) : (
            <>
              weeks <WeekLink week={def.weeks[0]}>{def.weeks[0]}</WeekLink>–<WeekLink week={def.weeks[1]}>{def.weeks[1]}</WeekLink>
            </>
          )}
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <input
            type="text"
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => {
              if (note !== st.note) {
                setResource(def.id, { note });
                toast('Saved');
              }
            }}
            placeholder="Where you are, key takeaways…"
            aria-label={`Notes for ${def.title}`}
          />
        </div>
      </div>
      <div className="controls">
        <select value={st.status} onChange={(e) => onStatus(e.target.value as ResourceStatus)} aria-label={`Status of ${def.title}`}>
          {(Object.keys(STATUS_LABEL) as ResourceStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <label className="small muted" htmlFor={`${def.id}-progress`}>
          Progress · {st.progress}%
        </label>
        <input id={`${def.id}-progress`} type="range" min={0} max={100} step={5} value={st.progress} onChange={(e) => onProgress(Number(e.target.value))} />
        <ProgressBar done={st.progress} total={100} thin label={`${st.progress}% of ${def.title}`} />
      </div>
    </div>
  );
}
