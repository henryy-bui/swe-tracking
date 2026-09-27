import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { isOverdue, sortFollowUps } from '@/lib/derive';
import { EmptyState, PageHead, Tabs } from '@/components/ui';
import { FollowUpForm } from '@/components/FollowUpForm';
import { FollowUpRow } from '@/components/FollowUpRow';

type Filter = 'open' | 'overdue' | 'done' | 'all';

const EMPTY: Record<Filter, string> = {
  open: 'No open follow-ups. Add a question or blocker above so it comes back to you.',
  overdue: 'Nothing overdue. Nice.',
  done: 'Nothing closed yet. Tick a follow-up when you have answered it.',
  all: 'No follow-ups yet. Add your first one above.',
};

export default function FollowUps() {
  const followUps = useStore((s) => s.followUps);
  const [filter, setFilter] = useState<Filter>('open');

  const counts = {
    open: followUps.filter((f) => !f.done).length,
    overdue: followUps.filter(isOverdue).length,
    done: followUps.filter((f) => f.done).length,
    all: followUps.length,
  };

  const list = sortFollowUps(
    followUps.filter((f) => {
      if (filter === 'open') return !f.done;
      if (filter === 'overdue') return isOverdue(f);
      if (filter === 'done') return f.done;
      return true;
    }),
  );

  return (
    <>
      <PageHead title="Follow-ups" subtitle="Questions to answer, topics to revisit, blockers to clear. Give them a due date and they resurface on the Overview." />

      <div className="stack">
        <div className="card">
          <div className="card-head">
            <h2>New follow-up</h2>
          </div>
          <FollowUpForm />
        </div>

        <div className="card">
          <Tabs<Filter>
            value={filter}
            onChange={setFilter}
            items={[
              { id: 'open', label: `Open (${counts.open})` },
              { id: 'overdue', label: `Overdue (${counts.overdue})` },
              { id: 'done', label: `Done (${counts.done})` },
              { id: 'all', label: `All (${counts.all})` },
            ]}
          />
          {list.length === 0 ? (
            <EmptyState>{EMPTY[filter]}</EmptyState>
          ) : (
            <ul className="list">
              {list.map((f) => (
                <FollowUpRow key={f.id} f={f} showWeek />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
