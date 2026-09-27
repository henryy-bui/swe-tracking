-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- One row per user holding the whole tracker document as JSON.

create table if not exists public.tracker_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb        not null,
  updated_at timestamptz  not null default now()
);

alter table public.tracker_state enable row level security;

drop policy if exists "users manage their own row" on public.tracker_state;
create policy "users manage their own row"
  on public.tracker_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Live updates across devices.
alter publication supabase_realtime add table public.tracker_state;

-- Query shape used by the app (one row, primary-key lookup, conditional on freshness):
--   select data, updated_at from tracker_state where user_id = auth.uid() and updated_at > $since
-- The primary key index covers it; no further index is needed. When the row is not newer the
-- response is empty, so an in-sync check costs a few hundred bytes.
