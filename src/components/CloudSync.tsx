import { useState, type FormEvent } from 'react';
import { isCloudConfigured } from '@/lib/supabase';
import { signInWithMagicLink, signInWithPassword, signOut, signUpWithPassword, syncNow, useSync, type SyncStatus } from '@/store/sync';
import { fmtDateTime } from '@/lib/date';
import { fmtKB } from '@/lib/format';
import { toast } from '@/components/ui';
import { AlertTriangle, Cloud, CloudOff, RefreshCw } from '@/components/icons';

const SYNC_LABEL: Record<SyncStatus, string> = {
  disabled: 'Saved on this device',
  'signed-out': 'Not signed in',
  syncing: 'Saving…',
  synced: 'Synced',
  offline: 'Offline',
  error: 'Sync problem',
};

const SYNC_ICON = {
  disabled: CloudOff,
  'signed-out': CloudOff,
  syncing: RefreshCw,
  synced: Cloud,
  offline: CloudOff,
  error: AlertTriangle,
} as const;

/* Compact indicator for the sidebar and the phone sheet. Only one instance should announce. */
export function SyncIndicator({ announce }: { announce?: boolean }) {
  const status = useSync((s) => s.status);
  const pending = useSync((s) => s.pending);
  const cls = status === 'synced' ? 'good' : status === 'error' ? 'critical' : status === 'syncing' || pending ? 'accent' : '';
  const Icon = pending && status !== 'syncing' ? RefreshCw : SYNC_ICON[status];
  const text = pending && status !== 'syncing' ? 'Saving…' : SYNC_LABEL[status];
  return (
    <span className={`pill ${cls}`} role={announce ? 'status' : undefined} aria-live={announce ? 'polite' : undefined}>
      <Icon size={13} /> {text}
    </span>
  );
}

/* Full card for the Settings page. */
export function CloudSyncCard() {
  const { status, user, lastSyncedAt, error, pending, live, stats } = useSync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'info' | 'error' } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!isCloudConfigured) {
    return (
      <div className="card">
        <div className="card-head">
          <h2>Cloud sync</h2>
          <span className="pill">
            <CloudOff size={13} /> Off
          </span>
        </div>
        <p className="ink-2 small">
          Cloud sync isn't set up for this copy of the app, so your data stays in this browser. Use "Download backup" below to move it to another device. (Developers:
          the README explains how to connect Supabase.)
        </p>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const err = mode === 'sign-in' ? await signInWithPassword(email, password) : await signUpWithPassword(email, password);
    setBusy(false);
    if (err) setMessage({ text: err, kind: mode === 'sign-up' && err.startsWith('Check your email') ? 'info' : 'error' });
    else {
      setPassword('');
      toast(mode === 'sign-in' ? 'Signed in. Syncing your data.' : 'Account created. Syncing your data.');
    }
  };

  const magic = async () => {
    if (!email) {
      setMessage({ text: 'Enter your email first.', kind: 'error' });
      return;
    }
    setBusy(true);
    const res = await signInWithMagicLink(email);
    setBusy(false);
    setMessage(res ? { text: res, kind: res.startsWith('Magic link sent') ? 'info' : 'error' } : null);
  };

  if (!user) {
    return (
      <div className="card">
        <div className="card-head">
          <h2>Cloud sync</h2>
          <span className="pill">
            <CloudOff size={13} /> {SYNC_LABEL[status]}
          </span>
        </div>
        <p className="ink-2 small">Sign in to keep this tracker in sync across your devices. What you have here is uploaded the first time you sign in.</p>
        <form onSubmit={submit} className="form-grid section">
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              aria-describedby="auth-password-hint"
              minLength={6}
              required
            />
            <span id="auth-password-hint" className="hint">
              At least 6 characters
            </span>
          </div>
          <div className="form-actions wide between">
            <div className="row">
              <button type="button" className="btn ghost sm" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
                {mode === 'sign-in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
              </button>
              <button type="button" className="btn ghost sm" onClick={magic} disabled={busy}>
                Email me a sign-in link
              </button>
            </div>
            <button className="btn primary" type="submit" disabled={busy}>
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>
        {message && (
          <p className={`small section-sm${message.kind === 'error' ? ' error' : ''}`} role={message.kind === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>Cloud sync</h2>
        <SyncIndicator />
      </div>
      <dl className="kv">
        <dt>Signed in as</dt>
        <dd>{user.email ?? user.id}</dd>
        <dt>Last synced</dt>
        <dd>{lastSyncedAt ? fmtDateTime(lastSyncedAt) : '—'}</dd>
        <dt>Changes</dt>
        <dd>{pending ? 'saving…' : 'all saved'}</dd>
        <dt>Live updates</dt>
        <dd>{live ? 'connected' : 'reconnecting…'}</dd>
      </dl>
      {error && (
        <p className="error section-sm" role="alert">
          {error}
        </p>
      )}
      <p className="hint section-sm">Changes sync within seconds. If two devices edit while offline, the most recent change wins.</p>
      <div className="row section-sm">
        <button className="btn" onClick={() => void syncNow('manual')} disabled={status === 'syncing'}>
          Sync now
        </button>
        <button
          className="btn ghost"
          onClick={async () => {
            await signOut();
            toast('Signed out. Your data stays on this device.');
          }}
        >
          Sign out
        </button>
        <button className="btn ghost sm push-end" onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails}>
          {showDetails ? 'Hide details' : 'Details'}
        </button>
      </div>
      {showDetails && (
        <dl className="kv small ink-2 section-sm">
          <dt>Requests this session</dt>
          <dd className="tabular">
            {stats.pulls} pulls ({stats.pullsWithData} with data) · {stats.pushes} uploads · {stats.realtimeApplied} live updates · {stats.skippedPulls + stats.skippedPushes} skipped
          </dd>
          <dt>Transferred</dt>
          <dd className="tabular">
            {fmtKB(stats.bytesUp)} up · {fmtKB(stats.bytesDown)} down
          </dd>
        </dl>
      )}
    </div>
  );
}
