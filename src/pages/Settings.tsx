import { useRef, useState, type ChangeEvent } from 'react';
import { exportJSON, useStore, validateImport, STORAGE_KEY, type AppData } from '@/store/useStore';
import { TOTAL_WEEKS } from '@/data/roadmap';
import { currentWeek, weekRange } from '@/lib/derive';
import { addDays, downloadText, fmtDateLong, today } from '@/lib/date';
import { PageHead, toast } from '@/components/ui';
import { CloudSyncCard } from '@/components/CloudSync';

export default function Settings() {
  const data = useStore();
  const { setStartDate, setWeeklyTarget, importData, resetData } = useStore();
  const [start, setStart] = useState(data.startDate ?? '');
  const [target, setTarget] = useState(String(data.weeklyTargetHours));
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const cw = currentWeek(data);
  const endDate = data.startDate ? addDays(data.startDate, TOTAL_WEEKS * 7 - 1) : null;

  const savePlan = () => {
    setStartDate(start || null);
    const t = Number(target);
    if (Number.isFinite(t) && t >= 0) setWeeklyTarget(t);
    toast('Settings saved');
  };

  const onExport = () => {
    downloadText(`swe-tracking-${today()}.json`, exportJSON());
    toast('Backup downloaded');
  };

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const err = validateImport(parsed);
      if (err) {
        setImportError(err);
        return;
      }
      const ok = window.confirm('Importing replaces everything currently saved in this browser. Continue?');
      if (!ok) return;
      importData(parsed as Partial<AppData>);
      setStart((parsed as Partial<AppData>).startDate ?? '');
      setTarget(String((parsed as Partial<AppData>).weeklyTargetHours ?? 10));
      toast('Data imported');
    } catch {
      setImportError('Could not parse that file as JSON.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onReset = () => {
    const ok = window.confirm('Reset all progress, logs, follow-ups, and notes? If you are signed in, the reset syncs to your other devices too. This cannot be undone. Export a backup first if you want one.');
    if (!ok) return;
    resetData();
    setStart('');
    setTarget('10');
    toast('All data reset');
  };

  const counts = {
    tasks: Object.values(data.tasks).filter((t) => t.done).length,
    logs: data.logs.length,
    followUps: data.followUps.length,
    notes: Object.keys(data.weekNotes).length,
  };

  return (
    <>
      <PageHead title="Settings" subtitle="Plan dates, weekly target, cloud sync, and backups." />

      <CloudSyncCard />

      <div className="card">
        <div className="card-head">
          <h2>Plan</h2>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="set-start">Start date (week 1 begins)</label>
            <input id="set-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="set-target">Weekly target (hours)</label>
            <input id="set-target" type="number" min={0} step={0.5} value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div className="form-actions" style={{ marginTop: 0 }}>
            <button className="btn primary" onClick={savePlan}>
              Save
            </button>
          </div>
        </div>
        {data.startDate && (
          <dl className="kv" style={{ marginTop: 14 }}>
            <dt>Week 1</dt>
            <dd>{fmtDateLong(data.startDate)}</dd>
            <dt>Week 36 ends</dt>
            <dd>{fmtDateLong(endDate)}</dd>
            <dt>Today</dt>
            <dd>
              {cw ? (
                <>
                  Week {cw} ({fmtDateLong(weekRange(data, cw)!.start)} – {fmtDateLong(weekRange(data, cw)!.end)})
                </>
              ) : (
                '—'
              )}
            </dd>
          </dl>
        )}
        <p className="hint" style={{ marginTop: 10 }}>
          Changing the start date shifts every week's dates. Completed tasks and logs are unaffected.
        </p>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Backup</h2>
        </div>
        <p className="muted small">
          Data is cached in this browser (localStorage key <span className="mono">{STORAGE_KEY}</span>) and, when signed in, mirrored to the cloud. Export a JSON file for an offline backup.
        </p>
        <dl className="kv" style={{ marginTop: 10 }}>
          <dt>Tasks done</dt>
          <dd>{counts.tasks}</dd>
          <dt>Sessions</dt>
          <dd>{counts.logs}</dd>
          <dt>Follow-ups</dt>
          <dd>{counts.followUps}</dd>
          <dt>Week notes</dt>
          <dd>{counts.notes}</dd>
        </dl>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" onClick={onExport}>
            Export JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import JSON…
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} className="sr-only" aria-label="Import JSON file" />
        </div>
        {importError && (
          <p className="error" style={{ marginTop: 8 }}>
            Import failed: {importError}
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Danger zone</h2>
        </div>
        <p className="muted small">Removes all progress, logs, follow-ups, notes, and settings from this browser.</p>
        <div style={{ marginTop: 12 }}>
          <button className="btn danger" onClick={onReset}>
            Reset all data
          </button>
        </div>
      </div>
    </>
  );
}
