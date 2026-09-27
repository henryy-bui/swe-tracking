/* Cloud sync: one JSON document per user in Supabase, last-write-wins by updatedAt.

   Request budget (the point of this module):
   - Pull is conditional: the server is asked only for a row newer than what we have, so an
     in-sync check is one tiny request with an empty body, not the whole document.
   - Focus/online pulls are throttled while the realtime channel is connected, because realtime
     already delivers other devices' changes.
   - Push is de-duplicated by a content hash cached in localStorage: unchanged content is never
     re-uploaded, rapid edits coalesce into one upload, and at most one push is in flight.
   - Repeated sign-in events for the same user do not re-subscribe or re-sync. */
import { create } from 'zustand';
import type { RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabase, isCloudConfigured, TABLE } from '@/lib/supabase';
import { pickData, useStore, type AppData } from '@/store/useStore';

export type SyncStatus = 'disabled' | 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncStats {
  pulls: number; // requests that asked the server for data
  pullsWithData: number; // ...of which returned a newer document
  pushes: number; // uploads
  skippedPulls: number; // avoided by throttling
  skippedPushes: number; // avoided because content was unchanged
  realtimeApplied: number; // documents received live from other devices
  bytesUp: number;
  bytesDown: number;
}

interface SyncState {
  status: SyncStatus;
  user: User | null;
  lastSyncedAt: string | null;
  error: string | null;
  pending: boolean; // local changes not yet pushed
  live: boolean; // realtime channel joined
  stats: SyncStats;
}

const zeroStats = (): SyncStats => ({ pulls: 0, pullsWithData: 0, pushes: 0, skippedPulls: 0, skippedPushes: 0, realtimeApplied: 0, bytesUp: 0, bytesDown: 0 });

export const useSync = create<SyncState>(() => ({
  status: isCloudConfigured ? 'signed-out' : 'disabled',
  user: null,
  lastSyncedAt: null,
  error: null,
  pending: false,
  live: false,
  stats: zeroStats(),
}));

const setSync = (patch: Partial<SyncState>) => useSync.setState(patch);
const bump = (patch: Partial<SyncStats>) =>
  useSync.setState((s) => {
    const stats = { ...s.stats };
    for (const [k, v] of Object.entries(patch)) stats[k as keyof SyncStats] += v as number;
    return { stats };
  });

/* ---- Tunables ---- */
export const PUSH_DEBOUNCE_MS = 1500;
export const PULL_MIN_INTERVAL_LIVE_MS = 5 * 60_000; // focus/online pulls while realtime is connected
export const PULL_MIN_INTERVAL_MS = 30_000; // ...and while it is not
const META_KEY = 'swe-tracking:sync-meta';

/* ---- Local cache of what the server already has ---- */
interface SyncMeta {
  userId: string;
  hash: string;
  updatedAt: string | null;
}

const loadMeta = (): SyncMeta | null => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as SyncMeta) : null;
  } catch {
    return null;
  }
};
const saveMeta = (m: SyncMeta | null) => {
  try {
    if (m) localStorage.setItem(META_KEY, JSON.stringify(m));
    else localStorage.removeItem(META_KEY);
  } catch {
    /* storage unavailable; we just push once more next time */
  }
};

/* Cheap content hash (djb2 over the JSON without the timestamp). */
export const hashDoc = (d: AppData): string => {
  const { updatedAt: _ts, ...rest } = d;
  const s = JSON.stringify(rest);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${(h >>> 0).toString(36)}:${s.length}`;
};

const ts = (iso: string | null | undefined): number => (iso ? Date.parse(iso) || 0 : 0);

/* ---- Module state ---- */
let supabase: SupabaseClient | null = null; // set by initSync once the client library has loaded
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pushing = false;
let pushQueued = false;
let channel: RealtimeChannel | null = null;
let applyingRemote = false;
let started = false;
let activeUserId: string | null = null;
let lastPullAt = 0;
let meta: SyncMeta | null = typeof localStorage !== 'undefined' ? loadMeta() : null;

interface Row {
  data: AppData;
  updated_at: string;
}

const rememberServerState = (userId: string, data: AppData, updatedAt: string | null) => {
  meta = { userId, hash: hashDoc(data), updatedAt };
  saveMeta(meta);
};

/* One request: returns the row only if it is newer than `since` (or exists at all when `since` is null). */
const fetchNewer = async (userId: string, since: string | null): Promise<Row | null> => {
  let q = supabase!.from(TABLE).select('data, updated_at').eq('user_id', userId);
  if (since) q = q.gt('updated_at', since);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  bump({ pulls: 1, pullsWithData: data ? 1 : 0, bytesDown: data ? JSON.stringify(data).length : 0 });
  lastPullAt = Date.now();
  return (data as Row | null) ?? null;
};

const pushLocal = async (userId: string): Promise<void> => {
  const local = pickData(useStore.getState());
  const updatedAt = local.updatedAt ?? new Date().toISOString();
  const hash = hashDoc(local);
  // Same content as the server already holds (for example a task ticked and unticked): nothing to send.
  if (meta && meta.userId === userId && meta.hash === hash) {
    bump({ skippedPushes: 1 });
    setSync({ status: 'synced', error: null, pending: false });
    return;
  }
  const body = { user_id: userId, data: local, updated_at: updatedAt };
  const { error } = await supabase!.from(TABLE).upsert(body, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
  bump({ pushes: 1, bytesUp: JSON.stringify(body).length });
  rememberServerState(userId, local, updatedAt);
  setSync({ status: 'synced', lastSyncedAt: new Date().toISOString(), error: null, pending: false });
};

const applyRemote = (userId: string, row: Row, source: 'pull' | 'realtime') => {
  applyingRemote = true;
  try {
    useStore.getState().applyRemote(row.data, row.updated_at);
  } finally {
    applyingRemote = false;
  }
  rememberServerState(userId, pickData(useStore.getState()), row.updated_at);
  if (source === 'realtime') bump({ realtimeApplied: 1, bytesDown: JSON.stringify(row).length });
  setSync({ status: 'synced', lastSyncedAt: new Date().toISOString(), error: null, pending: false });
};

const fail = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  setSync({ status: offline ? 'offline' : 'error', error: msg });
  console.warn('[sync]', msg);
};

export type SyncReason = 'sign-in' | 'focus' | 'online' | 'manual';

/* Reconcile local and remote. Focus/online calls are throttled; sign-in and manual always run. */
export const syncNow = async (reason: SyncReason = 'manual'): Promise<void> => {
  const user = useSync.getState().user;
  if (!supabase || !user) return;

  if (reason === 'focus' || reason === 'online') {
    const minInterval = useSync.getState().live ? PULL_MIN_INTERVAL_LIVE_MS : PULL_MIN_INTERVAL_MS;
    if (Date.now() - lastPullAt < minInterval) {
      bump({ skippedPulls: 1 });
      return;
    }
  }

  setSync({ status: 'syncing' });
  try {
    const local = useStore.getState();
    const knownServer = meta && meta.userId === user.id ? meta : null;
    // Ask only for something newer than what we know the server has (or than our own copy).
    // A copy with no timestamp has never synced, so fetch whatever exists.
    const since = local.updatedAt ? (knownServer?.updatedAt ?? local.updatedAt) : null;
    const remote = await fetchNewer(user.id, since);

    if (remote) {
      if (ts(remote.updated_at) > ts(local.updatedAt)) applyRemote(user.id, remote, 'pull');
      else await pushLocal(user.id); // server has a row but ours is newer (or equal timestamp: push wins ties for the caller)
      return;
    }
    // Nothing newer on the server. Push if our content differs from what the server is known to hold.
    await pushLocal(user.id);
  } catch (e) {
    fail(e);
  }
};

const runPush = async () => {
  const user = useSync.getState().user;
  if (!supabase || !user) return;
  if (pushing) {
    pushQueued = true;
    return;
  }
  pushing = true;
  setSync({ status: 'syncing' });
  try {
    await pushLocal(user.id);
  } catch (e) {
    fail(e);
  } finally {
    pushing = false;
    if (pushQueued) {
      pushQueued = false;
      void runPush();
    }
  }
};

const schedulePush = () => {
  const user = useSync.getState().user;
  if (!supabase || !user) return;
  setSync({ pending: true });
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void runPush();
  }, PUSH_DEBOUNCE_MS);
};

/* Flush a pending debounced push immediately (sign-out, page hide). */
const flushPush = async () => {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
    await runPush();
  }
};

const subscribeRealtime = (userId: string) => {
  if (channel) return;
  channel = supabase!
    .channel(`tracker_state:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` }, (payload) => {
      const row = payload.new as Partial<Row> | undefined;
      if (!row || !row.data || !row.updated_at) return;
      lastPullAt = Date.now(); // the channel just proved it is delivering
      if (ts(row.updated_at) > ts(useStore.getState().updatedAt)) applyRemote(userId, row as Row, 'realtime');
    })
    .subscribe((status) => setSync({ live: status === 'SUBSCRIBED' }));
};

const unsubscribeRealtime = () => {
  if (channel) {
    void supabase?.removeChannel(channel);
    channel = null;
  }
  setSync({ live: false });
};

const onSession = (session: Session | null) => {
  const user = session?.user ?? null;
  if (user && user.id === activeUserId) return; // token refresh or duplicate SIGNED_IN: nothing changed
  activeUserId = user?.id ?? null;
  setSync({ user, status: user ? 'syncing' : 'signed-out', error: null });
  if (user) {
    if (meta && meta.userId !== user.id) {
      meta = null;
      saveMeta(null);
    }
    subscribeRealtime(user.id);
    void syncNow('sign-in');
  } else {
    unsubscribeRealtime();
    setSync({ lastSyncedAt: null, pending: false });
  }
};

/* Call once at app start. Safe to call when cloud is not configured. */
export const initSync = (): void => {
  const loading = getSupabase();
  if (!loading || started) return;
  started = true;

  void loading.then((client) => {
    supabase = client;

    // Fires INITIAL_SESSION on load, then SIGNED_IN / SIGNED_OUT as they happen.
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return;
      onSession(session);
    });

    useStore.subscribe((s, prev) => {
      if (applyingRemote) return;
      if (s.updatedAt !== prev.updatedAt) schedulePush();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void syncNow('online'));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void syncNow('focus');
        else void flushPush();
      });
      window.addEventListener('pagehide', () => void flushPush());
    }
  });
};

/* ---- Auth helpers used by the Settings page ---- */

const NOT_READY = 'Cloud sync is not configured.';

export const signInWithPassword = async (email: string, password: string): Promise<string | null> => {
  if (!supabase) return NOT_READY;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
};

export const signUpWithPassword = async (email: string, password: string): Promise<string | null> => {
  if (!supabase) return NOT_READY;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return error.message;
  if (data.session) return null;
  return 'Check your email to confirm the account, then sign in.';
};

export const signInWithMagicLink = async (email: string): Promise<string | null> => {
  if (!supabase) return NOT_READY;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
  return error ? error.message : 'Magic link sent. Open it on this device to sign in.';
};

export const signOut = async (): Promise<void> => {
  if (!supabase) return;
  await flushPush();
  await supabase.auth.signOut();
};
