import { useStore } from '@/store/useStore';
import { achievements, GROUP_LABEL, nextUp, unlockedCount, type AchievementGroup } from '@/lib/achievements';
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
      <PageHead title="Milestones" subtitle="Earned automatically from what you log and tick off. Nothing to configure." />

      <div className="grid-tiles">
        <StatTile label="Unlocked" value={`${unlocked} / ${list.length}`} sub={`${Math.round((unlocked / list.length) * 100)}% of milestones`} />
        {next.map((a) => (
          <StatTile key={a.id} label="Next up" value={a.title} sub={a.detail} />
        ))}
      </div>

      {GROUPS.map((g) => {
        const items = list.filter((a) => a.group === g);
        return (
          <div className="card" key={g} style={{ marginTop: 14 }}>
            <div className="card-head">
              <h2>{GROUP_LABEL[g]}</h2>
              <span className="small muted tabular">
                {items.filter((a) => a.unlocked).length}/{items.length}
              </span>
            </div>
            <div className="milestone-grid">
              {items.map((a) => (
                <div key={a.id} className={`milestone${a.unlocked ? ' unlocked' : ''}`}>
                  <div className="milestone-icon">{a.unlocked ? <Check size={18} /> : <Trophy size={18} />}</div>
                  <div className="grow">
                    <div className="milestone-title">{a.title}</div>
                    <div className="small muted">{a.description}</div>
                    {!a.unlocked && (
                      <div style={{ marginTop: 6 }}>
                        <ProgressBar done={Math.round(a.progress * 100)} total={100} thin label={`${a.title}: ${a.detail}`} />
                        <div className="hint tabular" style={{ marginTop: 3 }}>
                          {a.detail}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
