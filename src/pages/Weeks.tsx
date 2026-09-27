import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { PHASES, WEEKS, projectById } from '@/data/roadmap';
import { currentWeek, phaseProgress, weekProgress, weekRange, weekStatus } from '@/lib/derive';
import { fmtDate, pct } from '@/lib/date';
import { PageHead, ProgressBar, StatusPill, Tabs } from '@/components/ui';
import { Star } from '@/components/icons';

type Filter = 'all' | '1' | '2' | '3' | '4';

export default function Weeks() {
  const data = useStore();
  const cw = currentWeek(data);
  const [filter, setFilter] = useState<Filter>('all');

  const phases = filter === 'all' ? PHASES : PHASES.filter((p) => String(p.id) === filter);

  return (
    <>
      <PageHead title="Weekly checklist" subtitle="36 weeks, 4 phases. Open a week to tick tasks, take notes, and log time.">
        {cw && (
          <Link to={`/weeks/${cw}`} className="btn primary">
            Go to week {cw}
          </Link>
        )}
      </PageHead>

      <Tabs<Filter>
        value={filter}
        onChange={setFilter}
        items={[
          { id: 'all', label: 'All' },
          ...PHASES.map((p) => ({ id: String(p.id) as Filter, label: `Phase ${p.id}` })),
        ]}
      />

      {phases.map((ph) => {
        const pp = phaseProgress(data, ph.id);
        return (
          <section key={ph.id}>
            <div className="phase-head">
              <div className="row between">
                <h2>
                  Phase {ph.id}: {ph.title}
                </h2>
                <span className="small muted tabular">
                  {pp.weeksDone}/{pp.weeks} weeks · {pct(pp.done, pp.total)}%
                </span>
              </div>
              <div className="focus">{ph.focus}</div>
            </div>
            <div className="week-list">
              {WEEKS.filter((w) => w.phase === ph.id).map((w) => {
                const wp = weekProgress(data, w.week);
                const st = weekStatus(data, w.week);
                const r = weekRange(data, w.week);
                const rating = data.retros?.[String(w.week)]?.rating ?? 0;
                return (
                  <Link key={w.week} to={`/weeks/${w.week}`} className={`week-row${cw === w.week ? ' current' : ''}`}>
                    <div className="num">
                      WEEK
                      <strong>{w.week}</strong>
                    </div>
                    <div>
                      <div className="topic">
                        {w.topic}{' '}
                        {w.milestone && (
                          <span className="milestone-badge">
                            {w.milestone.kind === 'start' ? 'Start' : 'Finish'} project {projectById(w.milestone.project).number}
                          </span>
                        )}
                        {cw === w.week && <span className="pill accent" style={{ marginLeft: 6 }}>Now</span>}
                      </div>
                      <div className="dates">
                        {r ? `${fmtDate(r.start)} – ${fmtDate(r.end)} · ` : ''}
                        DSA: {w.dsa}
                      </div>
                    </div>
                    <div className="right">
                      <span className="row" style={{ gap: 6 }}>
                        {rating > 0 && (
                          <span className="stars" role="img" aria-label={`Rated ${rating} of 5`}>
                            {Array.from({ length: rating }, (_, i) => (
                              <Star key={i} size={12} filled />
                            ))}
                          </span>
                        )}
                        <StatusPill status={st} />
                      </span>
                      <ProgressBar done={wp.done} total={wp.total} thin label={`Week ${w.week}: ${wp.done} of ${wp.total} done`} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
