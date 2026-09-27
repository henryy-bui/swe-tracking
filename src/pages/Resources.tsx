import { useId } from 'react';
import { useStore, type ResourceStatus } from '@/store/useStore';
import { RESOURCES, type ResourceDef } from '@/data/roadmap';
import { resourceState } from '@/lib/derive';
import { STATUS_LABEL } from '@/lib/labels';
import { useDraft } from '@/lib/useDraft';
import { PageHead, StatusPill, Vi, WeekLink, toast } from '@/components/ui';

const RESOURCE_STATUSES: ResourceStatus[] = ['not-started', 'in-progress', 'done'];

export default function Resources() {
  const data = useStore();
  const categories = [...new Set(RESOURCES.map((r) => r.category))];
  const done = RESOURCES.filter((r) => resourceState(data, r.id).status === 'done').length;

  return (
    <>
      <PageHead title="Resources" subtitle={`${done} of ${RESOURCES.length} complete. The courses and books from the roadmap, with the weeks they support.`} />
      <div className="stack">
        {categories.map((cat) => (
          <div className="card" key={cat}>
            <div className="card-head">
              <h2>
                <Vi>{cat}</Vi>
              </h2>
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
  const id = useId();
  const saved = useStore((s) => s.resources[def.id]);
  const setResource = useStore((s) => s.setResource);
  const st = { status: saved?.status ?? 'not-started', progress: Number(saved?.progress) || 0, note: saved?.note ?? '' };
  const [note, setNote, commitNote] = useDraft(st.note, (v) => {
    setResource(def.id, { note: v });
    toast('Note saved.');
  });

  const onStatus = (status: ResourceStatus) => {
    const patch: Partial<typeof st> = { status };
    if (status === 'done') patch.progress = 100;
    if (status === 'not-started') patch.progress = 0;
    setResource(def.id, patch);
  };

  const onProgress = (progress: number) => {
    const patch: Partial<typeof st> = { progress };
    if (progress >= 100) patch.status = 'done';
    else if (progress > 0 && st.status === 'not-started') patch.status = 'in-progress';
    setResource(def.id, patch);
  };

  return (
    <div className="resource">
      <div>
        <div className="row">
          <strong>
            <a href={def.url} target="_blank" rel="noreferrer">
              {def.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </strong>
          <span className="pill">{def.type === 'book' ? 'Book' : 'Course'}</span>
          <StatusPill status={st.status} />
        </div>
        <div className="desc">
          <Vi>{def.description}</Vi>
        </div>
        <div className="small ink-3 section-xs">
          Supports{' '}
          {def.weeks[0] === def.weeks[1] ? (
            <WeekLink week={def.weeks[0]} />
          ) : (
            <>
              weeks <WeekLink week={def.weeks[0]}>{def.weeks[0]}</WeekLink>–<WeekLink week={def.weeks[1]}>{def.weeks[1]}</WeekLink>
            </>
          )}
        </div>
        <div className="field section-sm">
          <label htmlFor={`${id}-note`}>Notes</label>
          <input id={`${id}-note`} type="text" className="input" value={note} onChange={(e) => setNote(e.target.value)} onBlur={commitNote} placeholder="Where you are, key takeaways…" />
        </div>
      </div>
      <div className="controls">
        <label htmlFor={`${id}-status`} className="sr-only">
          Status of {def.title}
        </label>
        <select id={`${id}-status`} value={st.status} onChange={(e) => onStatus(e.target.value as ResourceStatus)}>
          {RESOURCE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <label className="small ink-2" htmlFor={`${id}-progress`}>
          Progress · {st.progress}%
        </label>
        <input id={`${id}-progress`} type="range" min={0} max={100} step={5} value={st.progress} onChange={(e) => onProgress(Number(e.target.value))} />
      </div>
    </div>
  );
}
