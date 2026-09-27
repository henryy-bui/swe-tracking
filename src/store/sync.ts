/* Cloud sync: one JSON document per user in Supabase, last-write-wins by updatedAt.
   - On sign-in: compare local vs remote timestamps, then pull or push.
   - On every local change: debounced push.
   - Realtime subscription + tab focus: pull newer remote versions. */
import { create } from 'zustand';
import type { RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabase, isCloudConfigured, TABLE } from '@/lib/supabase';
import { pickData, useStore, type AppData } from '@/store/useStore';

export type SyncStatus = 'disabled' | 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error';

interface SyncState {
  status: SyncStatus;
  user: User | null;
  lastSyncedAt: string | null;
  error: string | null;
  pending: boolean; // local changes not yet pushed
}

export const useSync = create<SyncState>(() => ({
  status: isCloudConfigured ? 'signed-out' : 'disabled',
  user: null,
  lastSyncedAt: null,
  error: null,
  pending: false,
}));

const setSync = (patch: Partial<SyncState>) => useSync.setState(patch);

const ts = (iso: string | null | undefined): number => (iso ? Date.parse(iso) || 0 : 0);

let supabase: SupabaseClient | null = null; // set by initSync once the client library has loaded
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let channel: RealtimeChannel | null = null;
let applyingRemote = false;
let started = false;

interface Row {
  data: AppData;
  updated_at: string;
}

const fetchRemote = async (userId: string): Promise<Row | null> => {
  const { data, error } = await supabase!.from(TABLE).select('data, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Row | null) ?? null;
};

const pushLocal = async (userId: string): Promise<void> => {
  const local = pickData(useStore.getState());
  const updatedAt = local.updatedAt ?? new Date().toISOString();
  const { error } = await supabase!.from(TABLE).upsert({ user_id: userId, data: local, updated_at: updatedAt }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
  setSync({ status: 'synced', lastSyncedAt: new Date().toISOString(), error: null, pending: false });
};

const applyRemote = (row: Row) => {
  applyingRemote = true;
  try {
    useStore.getState().applyRemote(row.data, row.updated_at);
  } finally {
    applyingRemote = false;
  }
  setSync({ status: 'synced', lastSyncedAt: new Date().toISOString(), error: null, pending: false });
};

const fail = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  setSync({ status: offline ? 'offline' : 'error', error: msg });
  console.warn('[sync]', msg);
};

/* Reconcile local and remote once (sign-in, focus, manual "sync now"). */
export const syncNow = async (): Promise<void> => {
  const user = useSync.getState().user;
  if (!supabase || !user) return;
  setSync({ status: 'syncing' });
  try {
    const remote = await fetchRemote(user.id);
    const local = useStore.getState();
    if (!remote) {
      await pushLocal(user.id);
      return;
    }
    const remoteTs = ts(remote.updated_at);
    const localTs = ts(local.updatedAt);
    if (remoteTs > localTs) applyRemote(remote);
    else if (localTs > remoteTs) await pushLocal(user.id);
    else setSync({ status: 'synced', lastSyncedAt: new Date().toISOString(), error: null, pending: false });
  } catch (e) {
    fail(e);
  }
};

const schedulePush = () => {
  const user = useSync.getState().user;
  if (!supabase || !user) return;
  setSync({ pending: true });
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    pushTimer = null;
    setSync({ status: 'syncing' });
    try {
      await pushLocal(user.id);
    } catch (e) {
      fail(e);
    }
  }, 800);
};

const subscribeRealtime = (userId: string) => {
  unsubscribeRealtime();
  channel = supabase!
    .channel(`tracker_state:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` }, (payload) => {
      const row = payload.new as Partial<Row> | undefined;
      if (!row || !row.data || !row.updated_at) return;
      if (ts(row.updated_at) > ts(useStore.getState().updatedAt)) applyRemote(row as Row);
    })
    .subscribe();
};

const unsubscribeRealtime = () => {
  if (channel) {
    void supabase?.removeChannel(channel);
    channel = null;
  }
};

const onSession = (session: Session | null) => {
  const user = session?.user ?? null;
  setSync({ user, status: user ? 'syncing' : 'signed-out', error: null });
  if (user) {
    subscribeRealtime(user.id);
    void syncNow();
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
      if (event === 'TOKEN_REFRESHED') return; // same user, nothing to reconcile
      onSession(session);
    });

    useStore.subscribe((s, prev) => {
      if (applyingRemote) return;
      if (s.updatedAt !== prev.updatedAt) schedulePush();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void syncNow());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void syncNow();
      });
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
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
    const user = useSync.getState().user;
    if (user) {
      try {
        await pushLocal(user.id);
      } catch (e) {
        fail(e);
      }
    }
  }
  await supabase.auth.signOut();
};
