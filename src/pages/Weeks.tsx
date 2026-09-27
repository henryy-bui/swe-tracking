import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { PHASES, WEEKS } from '@/data/roadmap';
import { currentWeek, phaseProgress, weekProgress, weekRange, weekStatus } from '@/lib/derive';
import { fmtRange } from '@/lib/date';
import { pct } from '@/lib/format';
import { MilestoneBadge, PageHead, ProgressBar, Stars, StatusPill, Tabs, Vi } from '@/components/ui';

type Filter = 'all' | '1' | '2' | '3' | '4';

export default function Weeks() {
  const data = useStore();
  const cw = currentWeek(data);
  const [filter, setFilter] = useState<Filter>('all');
  const phases = filter === 'all' ? PHASES : PHASES.filter((p) => String(p.id) === filter);

  return (
    <>
      <PageHead
        title="Weekly checklist"
        subtitle={
          <>
            {WEEKS.length} weeks in {PHASES.length} phases. Open a week to tick tasks, take notes, and log time. Task text comes from the roadmap and is in Vietnamese.
          </>
        }
      >
        {cw && (
          <Link to={`/weeks/${cw}`} className="btn primary">
            Go to week {cw}
          </Link>
        )}
      </PageHead>

      <Tabs<Filter>
        label="Phase"
        value={filter}
        onChange={setFilter}
        items={[{ id: 'all', label: 'All phases' }, ...PHASES.map((p) => ({ id: String(p.id) as Filter, label: `Phase ${p.id}` }))]}
      />

      {phases.map((ph) => {
        const pp = phaseProgress(data, ph.id);
        return (
          <section key={ph.id} aria-labelledby={`phase-${ph.id}`}>
            <div className="phase-head">
              <div className="row between">
                <h2 id={`phase-${ph.id}`}>
                  Phase {ph.id}: {ph.title}
                </h2>
                <span className="small ink-2 tabular">
                  {pp.weeksDone}/{pp.weeks} weeks · {pct(pp.done, pp.total)}%
                </span>
              </div>
              <div className="focus">
                <Vi>{ph.focus}</Vi>
              </div>
            </div>
            <div className="week-list">
              {WEEKS.filter((w) => w.phase === ph.id).map((w) => {
                const wp = weekProgress(data, w.week);
                const st = weekStatus(data, w.week);
                const range = weekRange(data, w.week);
                const rating = data.retros[String(w.week)]?.rating ?? 0;
                return (
                  <Link key={w.week} to={`/weeks/${w.week}`} className={`week-row${cw === w.week ? ' current' : ''}`} aria-describedby={`week-${w.week}-meta`}>
                    <div className="num">
                      Week <strong>{w.week}</strong>
                    </div>
                    <div>
                      <div className="topic">
                        <Vi>{w.topic}</Vi> {w.milestone && <MilestoneBadge milestone={w.milestone} />}
                        {cw === w.week && (
                          <span className="pill accent">
                            Now
                          </span>
                        )}
                      </div>
                      <div className="dates" id={`week-${w.week}-meta`}>
                        {range ? `${fmtRange(range)} · ` : ''}
                        DSA: <Vi>{w.dsa}</Vi>
                      </div>
                    </div>
                    <div className="right">
                      <span className="row">
                        <Stars rating={rating} />
                        <StatusPill status={st} />
                      </span>
                      <ProgressBar done={wp.done} total={wp.total} thin decorative />
                      <span className="sr-only">
                        {wp.done} of {wp.total} tasks done
                      </span>
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
