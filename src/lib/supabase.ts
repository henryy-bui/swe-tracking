import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* Null when the app runs in local-only mode (no env vars configured). */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export const isCloudConfigured = supabase !== null;

export const TABLE = 'tracker_state';
