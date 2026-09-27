# SWE Roadmap Tracker

A personal tracker for the 36-week plan in `swe_software_engineer_roadmap_golang_systems.md`: weekly checklist, study log, follow-ups, side projects, resources, and an overview dashboard.

## Run

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

```sh
pnpm build      # typecheck + production build into dist/
pnpm preview    # serve the production build
```

## What it does

- **Overview**: current week and phase, on-track pace versus a linear schedule, hours this week against your target, streak, phase progress, this week's checklist, follow-ups due, hours-per-week chart, side project status.
- **Weekly checklist**: all 36 weeks grouped by phase. Each week has its tasks and DSA item as checkboxes, notes, a quick time log, and follow-ups linked to that week. Weeks can be skipped.
- **Study log**: sessions with date, hours, type, roadmap week, and note. Totals and a 12-week chart.
- **Follow-ups**: questions, blockers, and things to revisit, with due dates, priority, and a linked week. Overdue items are flagged, and can be snoozed a week.
- **Side projects**: the four portfolio projects with status, repo link, milestones (from the roadmap plus your own), and notes.
- **Resources**: Boot.dev courses and the four books with status, progress, and notes.
- **Settings**: plan start date, weekly hour target, JSON export/import, reset.

## Data and multi-device sync

Data is always cached in the browser's localStorage under `swe-tracking:v1`, so the app works offline and without any account. **Settings → Export JSON** gives you an offline backup.

To use it across devices, connect a free Supabase project (hosted Postgres):

1. Create a project at https://supabase.com and open **SQL → New query**. Paste and run `supabase/schema.sql`. It creates one `tracker_state` row per user, protected by row-level security, with realtime enabled.
2. In **Authentication → Providers**, keep Email enabled. For the quickest start, turn off "Confirm email" so password sign-up signs you in immediately, or keep it on and confirm via the email Supabase sends.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key from **Project Settings → API**. Restart `pnpm dev`.
4. Open **Settings → Cloud sync** in the app, create an account, and sign in on every device with the same email.

How sync behaves:

- The whole tracker is one JSON document per user. Every local change is uploaded after a short debounce; other signed-in devices receive it live through Supabase realtime, and also re-check on tab focus and when coming back online.
- On sign-in the app compares timestamps: the newer of local and cloud wins, so an existing device's data is uploaded the first time, and a fresh device downloads it.
- Conflicts are last-write-wins by change time, which is fine for one person editing from several devices but will drop the older of two simultaneous offline edits.
- Signing out keeps the local copy on that device. Resetting data while signed in resets the cloud copy too.

When the env vars are absent, the Cloud sync card explains the setup and everything stays local.

## Stack

Vite, React 18, TypeScript, react-router (hash routing, so it works from any static host), zustand with the persist middleware. No UI library; one stylesheet with light and dark themes. Roadmap content lives in `src/data/roadmap.ts`.
