/* Delete something and offer to put it back from the toast. Replaces confirm dialogs for single items. */
import { useStore, type CustomTask, type FollowUp, type LogEntry, type Problem, type ProjectMilestone } from '@/store/useStore';
import type { ProjectId } from '@/data/roadmap';
import { customKey } from '@/lib/keys';
import { fmtDuration } from '@/lib/format';
import { toast } from '@/store/toast';

const undo = (label: string, restore: () => void) => toast(label, { label: 'Undo', onClick: restore });

export const deleteLogWithUndo = (entry: LogEntry) => {
  const s = useStore.getState();
  s.deleteLog(entry.id);
  undo(`Deleted the ${fmtDuration(entry.minutes)} session.`, () => useStore.getState().restoreLog(entry));
};

export const deleteFollowUpWithUndo = (f: FollowUp) => {
  const s = useStore.getState();
  s.deleteFollowUp(f.id);
  undo(`Deleted "${f.title}".`, () => useStore.getState().restoreFollowUp(f));
};

export const deleteProblemWithUndo = (p: Problem) => {
  const s = useStore.getState();
  s.deleteProblem(p.id);
  undo(`Deleted "${p.title}".`, () => useStore.getState().restoreProblem(p));
};

export const deleteCustomTaskWithUndo = (week: number, task: CustomTask) => {
  const s = useStore.getState();
  const mark = s.tasks[customKey(week, task.id)];
  s.deleteCustomTask(week, task.id);
  undo(`Removed "${task.title}".`, () => useStore.getState().restoreCustomTask(week, task, mark));
};

export const deleteMilestoneWithUndo = (projectId: ProjectId, m: ProjectMilestone) => {
  const s = useStore.getState();
  s.deleteMilestone(projectId, m.id);
  undo(`Removed "${m.title}".`, () => useStore.getState().restoreMilestone(projectId, m));
};
