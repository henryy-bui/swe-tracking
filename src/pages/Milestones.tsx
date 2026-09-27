import { useStore } from '@/store/useStore';
import { achievements, GROUP_LABEL, nextUp, unlockedCount, type AchievementGroup } from '@/lib/achievements';
import { TERMS } from '@/lib/labels';
import { PageHead, ProgressBar, StatTile } from '@/components/ui';
import { Check, Trophy } from '@/components/icons';

const GROUPS: AchievementGroup[] = ['progress', 'consistency', 'hours', 'dsa', 'projects', 'habits'];

export default function Milestones() {
  const data = useStore();
  const list = achievements(data);
  const unlocked = unlockedCount(list);
  const next = nextUp(list, 3);

  return (
    <>
      <PageHead title={TERMS.achievements} subtitle="Earned automatically from what you log and tick off." />

      <div className="stack">
        <div className="grid-tiles">
          <StatTile label="Unlocked" value={`${unlocked} / ${list.length}`} sub={`${Math.round((unlocked / list.length) * 100)}% of achievements`} />
          {next.map((a) => (
            <StatTile key={a.id} label="Next up" value={a.title} sub={a.detail} />
          ))}
        </div>

        {GROUPS.map((g) => {
          const items = list.filter((a) => a.group === g);
          return (
            <div className="card" key={g}>
              <div className="card-head">
                <h2>{GROUP_LABEL[g]}</h2>
                <span className="small ink-2 tabular">
                  {items.filter((a) => a.unlocked).length}/{items.length}
                </span>
              </div>
              <ul className="milestone-grid">
                {items.map((a) => (
                  <li key={a.id} className={`milestone${a.unlocked ? ' unlocked' : ''}`}>
                    <div className="milestone-icon" aria-hidden="true">
                      {a.unlocked ? <Check size={18} /> : <Trophy size={18} />}
                    </div>
                    <div className="grow">
                      <div className="milestone-title">
                        {a.title}
                        <span className="sr-only">{a.unlocked ? ', unlocked' : ', locked'}</span>
                      </div>
                      <div className="small ink-2">{a.description}</div>
                      {!a.unlocked && (
                        <div className="section-xs">
                          <ProgressBar done={Math.round(a.progress * 100)} total={100} thin label={a.title} valueText={a.detail} />
                          <div className="hint tabular section-xxs">{a.detail}</div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
