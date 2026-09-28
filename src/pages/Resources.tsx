import { useEffect, useId } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore, type ResourceStatus } from '@/store/useStore';
import { RESOURCES, type ResourceDef, type ResourceType } from '@/data/roadmap';
import { resourceState } from '@/lib/derive';
import { STATUS_LABEL } from '@/lib/labels';
import { useDraft } from '@/lib/useDraft';
import { PageHead, StatusPill, Vi, WeekLink, toast } from '@/components/ui';

const RESOURCE_STATUSES: ResourceStatus[] = ['not-started', 'in-progress', 'done'];
const TYPE_LABEL: Record<ResourceType, string> = { book: 'Book', course: 'Course', docs: 'Docs' };

export default function Resources() {
  const data = useStore();
  const { hash } = useLocation();
  const domains = [...new Set(RESOURCES.map((r) => r.domain))];
  const done = RESOURCES.filter((r) => resourceState(data, r.id).status === 'done').length;

  // /resources#book-lets-go from a week page lands on that row.
  useEffect(() => {
    const id = hash.replace(/^#/, '');
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ block: 'center' });
      el.classList.add('flash');
      const t = setTimeout(() => el.classList.remove('flash'), 1600);
      return () => clearTimeout(t);
    }
  }, [hash]);

  return (
    <>
      <PageHead title="Resources" subtitle={`${done} of ${RESOURCES.length} complete. The books, courses and docs from the roadmap, with the chapters to read and the weeks they support.`} />
      <div className="stack">
        {domains.map((domain) => (
          <div className="card" key={domain}>
            <div className="card-head">
              <h2>{domain}</h2>
            </div>
            {RESOURCES.filter((r) => r.domain === domain).map((r) => (
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
    <div className="resource" id={def.id}>
      <div>
        <div className="row">
          <strong>
            <a href={def.url} target="_blank" rel="noreferrer">
              {def.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </strong>
          <span className="small ink-2">{def.author}</span>
          <span className="pill">{TYPE_LABEL[def.type]}</span>
          <StatusPill status={st.status} />
        </div>
        <div className="desc">
          <Vi>{def.chapters}</Vi>
        </div>
        <div className="small ink-2 section-xs">
          <Vi>{def.goal}</Vi>
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
