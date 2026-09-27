import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { defaultData, useStore, validateImport, type AppData } from '@/store/useStore';
import { TOTAL_WEEKS } from '@/data/roadmap';
import { currentWeek, weekRange } from '@/lib/derive';
import { addDays, fmtDateLong, fmtRange, today } from '@/lib/date';
import { useDraft } from '@/lib/useDraft';
import { downloadBackup, downloadText } from '@/lib/download';
import { progressReportMarkdown } from '@/lib/report';
import { PageHead, toast } from '@/components/ui';
import { CloudSyncCard } from '@/components/CloudSync';
import { Download, FileText } from '@/components/icons';

const DEFAULT_TARGET = defaultData().weeklyTargetHours;

export default function Settings() {
  const data = useStore();
  const { setStartDate, setWeeklyTarget, importData, resetData } = useStore();
  const [start, setStart] = useDraft(data.startDate ?? '', () => undefined);
  const [target, setTarget] = useDraft(String(data.weeklyTargetHours), () => undefined);
  const [importError, setImportError] = useState<{ friendly: string; detail: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const cw = currentWeek(data);
  const endDate = data.startDate ? addDays(data.startDate, TOTAL_WEEKS * 7 - 1) : null;

  const savePlan = (e: FormEvent) => {
    e.preventDefault();
    const t = Number(target);
    if (!Number.isFinite(t) || t < 0) {
      toast('The weekly target must be a number of hours, 0 or more.');
      return;
    }
    if (!start && data.startDate) {
      if (!window.confirm('Remove the start date? Week dates, the current week, and your pace will be hidden until you set one again.')) return;
    }
    setStartDate(start || null);
    setWeeklyTarget(t);
    toast('Plan settings saved.');
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
        setImportError({ friendly: "This file isn't a tracker backup, or it's damaged. Choose a file made with \"Download backup\".", detail: err });
        return;
      }
      if (!window.confirm('Restoring replaces everything currently saved in this browser (and, if signed in, in the cloud). Continue?')) return;
      importData(parsed as Partial<AppData>);
      toast('Backup restored.');
    } catch {
      setImportError({ friendly: "This file couldn't be read as a backup. Choose a .json file made with \"Download backup\".", detail: 'Invalid JSON' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onReset = () => {
    if (!window.confirm('Delete all progress, sessions, follow-ups, problems, and notes? If you are signed in, this also clears the cloud copy on every device. This cannot be undone.')) return;
    resetData();
    toast('All data deleted.');
  };

  const counts = {
    tasks: Object.values(data.tasks).filter((t) => t.done).length,
    logs: data.logs.length,
    followUps: data.followUps.length,
    problems: data.problems.length,
    notes: Object.keys(data.weekNotes).length,
    retros: Object.keys(data.retros).length,
  };

  return (
    <>
      <PageHead title="Settings" subtitle="Plan dates, weekly target, cloud sync, and backups." />

      <div className="stack">
        <CloudSyncCard />

        <div className="card">
          <div className="card-head">
            <h2>Plan</h2>
          </div>
          <form className="form-grid" onSubmit={savePlan}>
            <div className="field">
              <label htmlFor="set-start">Start date</label>
              <input id="set-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-describedby="set-start-hint" />
              <span id="set-start-hint" className="hint">
                The day week 1 begins
              </span>
            </div>
            <div className="field">
              <label htmlFor="set-target">Weekly target (hours)</label>
              <input id="set-target" type="number" min={0} step={0.5} value={target} onChange={(e) => setTarget(e.target.value)} aria-describedby="set-target-hint" />
              <span id="set-target-hint" className="hint">
                Default {DEFAULT_TARGET}h
              </span>
            </div>
            <div className="form-actions">
              <button className="btn primary" type="submit">
                Save
              </button>
            </div>
          </form>
          {data.startDate && (
            <dl className="kv section-sm">
              <dt>Week 1</dt>
              <dd>{fmtDateLong(data.startDate)}</dd>
              <dt>Week {TOTAL_WEEKS} ends</dt>
              <dd>{fmtDateLong(endDate)}</dd>
              <dt>Today</dt>
              <dd>{cw ? `Week ${cw} (${fmtRange(weekRange(data, cw), true)})` : '—'}</dd>
            </dl>
          )}
          <p className="hint section-sm">Changing the start date shifts every week's dates. Ticked tasks and sessions are kept.</p>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Backup</h2>
          </div>
          <p className="ink-2 small">Your data is saved in this browser and, if you're signed in, in the cloud. Download a backup file to keep your own copy or move to another device.</p>
          <dl className="kv section-sm">
            <dt>Tasks done</dt>
            <dd>{counts.tasks}</dd>
            <dt>Study sessions</dt>
            <dd>{counts.logs}</dd>
            <dt>Follow-ups</dt>
            <dd>{counts.followUps}</dd>
            <dt>DSA problems</dt>
            <dd>{counts.problems}</dd>
            <dt>Week notes</dt>
            <dd>{counts.notes}</dd>
            <dt>Retrospectives</dt>
            <dd>{counts.retros}</dd>
          </dl>
          <div className="row section-sm">
            <button
              className="btn"
              onClick={() => {
                downloadBackup();
                toast('Backup downloaded.');
              }}
            >
              <Download size={15} /> Download backup
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              Restore from backup…
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} className="sr-only" tabIndex={-1} aria-hidden="true" />
            <button
              className="btn ghost"
              onClick={() => {
                downloadText(`swe-roadmap-report-${today()}.md`, progressReportMarkdown(data), 'text/markdown');
                toast('Progress report downloaded.');
              }}
              title="A Markdown summary of every phase, week, project, and resource"
            >
              <FileText size={15} /> Progress report
            </button>
          </div>
          {importError && (
            <p className="error section-sm" role="alert" title={importError.detail}>
              {importError.friendly}
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Delete everything</h2>
          </div>
          <p className="ink-2 small">Deletes all your data here and, if signed in, on every synced device. Download a backup first if you might want it back.</p>
          <div className="section-sm">
            <button className="btn danger" onClick={onReset}>
              Delete all data…
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
