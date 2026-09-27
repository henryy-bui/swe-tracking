import type { LogEntry } from '@/store/useStore';
import { fmtDate } from '@/lib/date';
import { fmtDuration } from '@/lib/format';
import { LOG_TAG_LABEL } from '@/lib/labels';
import { WeekLink } from '@/components/ui';
import { X } from '@/components/icons';

interface Props {
  log: LogEntry;
  showDate?: boolean;
  showWeek?: boolean;
  onDelete?: () => void;
}

export function SessionRow({ log, showDate, showWeek, onDelete }: Props) {
  return (
    <li>
      <div className="body">
        <div className="title">
          {fmtDuration(log.minutes)} <span className="pill">{LOG_TAG_LABEL[log.tag]}</span>
          {showWeek && log.week && (
            <>
              {' '}
              <WeekLink week={log.week} />
            </>
          )}
        </div>
        <div className="meta">
          {showDate && <span>{fmtDate(log.date)}</span>}
          {log.note && <span>{log.note}</span>}
        </div>
      </div>
      {onDelete && (
        <div className="actions">
          <button className="btn sm ghost icon" onClick={onDelete} aria-label={`Delete the ${fmtDuration(log.minutes)} session on ${fmtDate(log.date)}`}>
            <X size={14} />
          </button>
        </div>
      )}
    </li>
  );
}
