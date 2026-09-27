import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* Null when the app runs in local-only mode (no env vars configured). */
export const cloudConfig = url && anonKey ? { url, anonKey } : null;

export const isCloudConfigured = cloudConfig !== null;

export const TABLE = 'tracker_state';

let clientPromise: Promise<SupabaseClient> | null = null;

/* The client library is loaded on demand, so local-only builds never download it. */
export const getSupabase = (): Promise<SupabaseClient> | null => {
  if (!cloudConfig) return null;
  clientPromise ??= import('@supabase/supabase-js').then((m) => m.createClient(cloudConfig.url, cloudConfig.anonKey));
  return clientPromise;
};
