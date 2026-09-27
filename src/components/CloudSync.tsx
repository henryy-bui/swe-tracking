import { useState, type FormEvent } from 'react';
import { isCloudConfigured } from '@/lib/supabase';
import { signInWithMagicLink, signInWithPassword, signOut, signUpWithPassword, syncNow, useSync, type SyncStatus } from '@/store/sync';
import { toast } from '@/components/ui';

export const SYNC_LABEL: Record<SyncStatus, string> = {
  disabled: 'Local only',
  'signed-out': 'Not signed in',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline',
  error: 'Sync error',
};

const SYNC_GLYPH: Record<SyncStatus, string> = {
  disabled: '○',
  'signed-out': '○',
  syncing: '◐',
  synced: '●',
  offline: '◌',
  error: '⚠',
};

/* Compact indicator for the sidebar. */
export function SyncIndicator() {
  const { status, pending } = useSync();
  const cls = status === 'synced' ? 'good' : status === 'error' ? 'critical' : status === 'syncing' || pending ? 'accent' : '';
  return (
    <span className={`pill ${cls}`} title={SYNC_LABEL[status]}>
      <span aria-hidden="true">{SYNC_GLYPH[status]}</span> {pending && status !== 'syncing' ? 'Pending…' : SYNC_LABEL[status]}
    </span>
  );
}

/* Full card for the Settings page. */
export function CloudSyncCard() {
  const { status, user, lastSyncedAt, error, pending } = useSync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isCloudConfigured) {
    return (
      <div className="card">
        <div className="card-head">
          <h2>Cloud sync</h2>
          <span className="pill">Local only</span>
        </div>
        <p className="muted small">
          Sync across devices by connecting a Supabase project. Create one at supabase.com, run <span className="mono">supabase/schema.sql</span> in its SQL editor,
          then copy <span className="mono">.env.example</span> to <span className="mono">.env.local</span> with the project URL and anon key and restart the dev server.
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
    if (err) setMessage(err);
    else {
      setPassword('');
      toast(mode === 'sign-in' ? 'Signed in' : 'Account created');
    }
  };

  const magic = async () => {
    if (!email) {
      setMessage('Enter your email first.');
      return;
    }
    setBusy(true);
    setMessage(await signInWithMagicLink(email));
    setBusy(false);
  };

  if (!user) {
    return (
      <div className="card">
        <div className="card-head">
          <h2>Cloud sync</h2>
          <span className="pill">{SYNC_LABEL[status]}</span>
        </div>
        <p className="muted small">Sign in to keep this tracker in sync across your devices. Your local data is uploaded on first sign-in.</p>
        <form onSubmit={submit} className="form-grid" style={{ marginTop: 12 }}>
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
              minLength={6}
              required
            />
          </div>
          <div className="form-actions wide" style={{ marginTop: 0, justifyContent: 'space-between' }}>
            <div className="row">
              <button type="button" className="btn ghost sm" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
                {mode === 'sign-in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
              </button>
              <button type="button" className="btn ghost sm" onClick={magic} disabled={busy}>
                Email me a magic link
              </button>
            </div>
            <button className="btn primary" type="submit" disabled={busy}>
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>
        {message && (
          <p className="small" style={{ marginTop: 8 }}>
            {message}
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
        <dd>{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : '—'}</dd>
        <dt>Local changes</dt>
        <dd>{pending ? 'waiting to upload' : 'all uploaded'}</dd>
      </dl>
      {error && (
        <p className="error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
      <p className="hint" style={{ marginTop: 10 }}>
        The newest change wins when two devices edit while offline. Changes made here appear on other signed-in devices within a second or two.
      </p>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={() => void syncNow()} disabled={status === 'syncing'}>
          Sync now
        </button>
        <button
          className="btn ghost"
          onClick={async () => {
            await signOut();
            toast('Signed out. Local data stays on this device.');
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
