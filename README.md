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
- **Weekly checklist**: all 36 weeks grouped by phase. Each week has its roadmap tasks and DSA item as checkboxes, plus your own tasks, notes, a quick time log, follow-ups linked to that week, and a retrospective (1–5 rating, what went well, what to improve). Weeks can be skipped.
- **Focus timer**: start/stop in the sidebar; stopping logs the session to the study log. Optional 25-minute Pomodoro alert.
- **Activity heatmap**: GitHub-style calendar of the last 26 weeks on the Overview.
- **Study log**: sessions with date, hours, type, roadmap week, and note. Totals and a 12-week chart.
- **Follow-ups**: questions, blockers, and things to revisit, with due dates, priority, and a linked week. Overdue items are flagged, and can be snoozed a week.
- **DSA problems**: track problems with difficulty, topic, and week. Solved problems come back for review on a spaced schedule (1, 3, 7, 14, 30 days); due reviews show in the sidebar badge and on the Overview.
- **Side projects**: the four portfolio projects with status, repo link, milestones (from the roadmap plus your own), and notes.
- **Resources**: Boot.dev courses and the four books with status, progress, and notes.
- **Settings**: plan start date, weekly hour target, cloud sync, JSON export/import, reset.
- **Theme**: the button beside the app name cycles auto / light / dark (per device, not synced).

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

Request budget: pulls are conditional (the server returns the document only when its copy is newer), focus and reconnect pulls are throttled to once per five minutes while realtime is connected, and pushes are de-duplicated by a content hash so unchanged data is never re-uploaded. Rapid edits coalesce into one upload after 1.5 s of quiet. Settings → Cloud sync shows the counts for the current session.

When the env vars are absent, the Cloud sync card explains the setup and everything stays local.

## On a phone

The layout switches to a bottom tab bar and a "More" sheet under 860px. Open the deployed URL in Safari or Chrome and use "Add to Home Screen" to install it as a standalone app; the icon comes from `public/apple-touch-icon.png` (regenerate with `node scripts/make-touch-icon.mjs`).

## Design

Colors, type, spacing, component rules, and the icon set are documented in `DESIGN.md`. Use its tokens and classes when adding UI.

## Stack

Vite, React 18, TypeScript, react-router (hash routing, so it works from any static host), zustand with the persist middleware. No UI library; one stylesheet with light and dark themes. Roadmap content lives in `src/data/roadmap.ts`.
