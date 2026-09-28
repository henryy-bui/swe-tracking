# SWE Roadmap Tracker

A personal tracker for the 36-week plan in `swe_software_engineer_roadmap_golang_systems.md` (a transcription of the Google Sheets roadmap: Weekly Checklist, Reading & Resources, Side Projects, Dashboard): weekly checklist, study log, follow-ups, DSA reviews, side projects, resources, achievements, and an overview dashboard.

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

- **Today**: the daily entry point and first tab on phones. Unfinished tasks for the current week, your plan for the week (from last week's retrospective), follow-ups due today, DSA reviews due with one-tap "Mark reviewed", today's and this week's hours, the timer, and a session form.
- **Overview**: current week and phase, on-track pace versus an even schedule, a finish-date forecast at your current rate, hours this calendar week against your target, streak, the sheet's dashboard numbers (weeks done, in progress, not started, blocked, overall and per phase, with a donut), this week's checklist, follow-ups due, DSA reviews due, the activity calendar, hours-per-week chart, side project status, the roadmap's guidelines (20–25 h/week, 1–2 DSA problems a day, spaced repetition), and the achievements closest to unlocking.
- **Weekly checklist**: all 36 weeks grouped by phase. Each week has its roadmap tasks and DSA item as checkboxes, the reading for the week (linked to the Resources page), the week's named NeetCode problems with one button to add them to the DSA page, your own tasks (tagged "Yours"), notes, a code / LeetCode link, a session form, follow-ups linked to that week, a retrospective (1–5 rating, what went well, what to improve, plan for next week), and a summary you can copy as Markdown or download. "Mark all done", "Untick all" (with confirmation), "Skip week" and "Block week" are there for catch-up and stuck weeks; skipped and blocked weeks don't count against your pace. Roadmap task text is Vietnamese as written.
- **Focus timer**: start in the sidebar or the phone top bar. The sidebar widget asks for a type and note when you stop; the phone chip, the `t` shortcut, and the palette action log the session immediately as Study against the current week (edit it in the Study log). A 25-minute alert is on by default: it beeps, shows a toast, and, when the tab is in the background and you have allowed notifications, sends a system notification.
- **Study log**: sessions with date, hours, type, roadmap week (auto-suggested from the date), and note. Totals, a 12-week chart, and the list grouped by day.
- **Follow-ups**: questions, blockers, and things to revisit, with due date, priority, and roadmap week. Overdue items are flagged, can be snoozed a week, and their details edited in place.
- **DSA problems**: problems with difficulty, topic, and week, added one at a time, pasted as a list ("Title | difficulty | link", one per line), or seeded from the roadmap (this week's problems on the DSA page or the week page, every missing problem from Settings; difficulty defaults to Medium). "Mark solved" schedules reviews after 1, 3, 7, 14, then 30 days; due reviews show as a badge, on the Overview, and on Today.
- **Undo**: deleting a session, follow-up, problem, task, or milestone shows a toast with Undo for a few seconds instead of asking first. Only "Untick all" and "Delete all data" still confirm.
- **Side projects**: the four flagship projects with problem statement, tech stack, status, repo link, milestones (the roadmap's engineering requirements and interview deliverables, plus your own), and notes.
- **Resources**: the roadmap's reading list (Boot.dev, Let's Go, Let's Go Further, Concurrency in Go, DDIA, Use The Index Luke, gRPC: Up and Running, System Design Interview, AWS Well-Architected & Terraform, Staff Engineer) grouped by domain, with author, chapters to read, goal, status, progress, and notes.
- **Achievements**: earned automatically for streaks, hours, phases, DSA, projects, and habits.
- **Search and shortcuts**: `⌘K` / `Ctrl+K`, `/`, or `?` opens a palette that searches weeks, tasks, reading, notes, follow-ups, problems, projects, and resources, plus quick actions (timer, theme, current week, backup, add this week's DSA problems). `g` then `t` `o` `w` `l` `f` `d` `p` `r` `m` `s` jumps to a page; `t` on its own starts or stops the timer.
- **Settings**: start date, weekly target (default 20 h, from the roadmap's 20–25 h/week), cloud sync, backup download and restore, a whole-plan progress report in Markdown, a calendar export (.ics with every week, its reading and code link, open follow-up due dates, and upcoming reviews), seeding of all roadmap DSA problems, and delete-everything.
- **Theme**: the button beside the app name cycles Auto / Light / Dark (per device, not synced).

## Data and multi-device sync

Data is always cached in the browser's localStorage under `swe-tracking:v1`, so the app works offline and without any account. **Settings → Download backup** gives you an offline copy.

Progress is keyed by stable ids from `src/data/roadmap.ts` (data version 3). Backups and cloud documents from earlier versions, which keyed tasks by position, are migrated on load, import, and cloud pull (`src/data/legacy.ts` maps every old key). A device running an older build never pushes over a newer document; it shows a sync error asking for an update instead.

To use it across devices, connect a free Supabase project (hosted Postgres):

1. Create a project at https://supabase.com and open **SQL → New query**. Paste and run `supabase/schema.sql`. It creates one `tracker_state` row per user, protected by row-level security, with realtime enabled.
2. In **Authentication → Providers**, keep Email enabled. For the quickest start, turn off "Confirm email" so password sign-up signs you in immediately, or keep it on and confirm via the email Supabase sends. Magic-link sign-in ("Email me a sign-in link") also works with the default email provider.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key from **Project Settings → API**. Restart `pnpm dev`.
4. Open **Settings → Cloud sync** in the app, create an account, and sign in on every device with the same email.

How sync behaves:

- The whole tracker is one JSON document per user. Every local change is uploaded after 1.5 s of quiet; other signed-in devices receive it live through Supabase realtime, and also re-check on tab focus and when coming back online.
- On sign-in the app compares timestamps: the newer of local and cloud wins, so an existing device's data is uploaded the first time, and a fresh device downloads it.
- Conflicts are last-write-wins by change time, which is fine for one person editing from several devices but will drop the older of two simultaneous offline edits.
- Signing out keeps the local copy on that device. Deleting all data while signed in clears the cloud copy too.
- Request budget: pulls are conditional (the server returns the document only when its copy is newer), focus and reconnect pulls are throttled to once per five minutes while realtime is connected and once per 30 seconds otherwise, and uploads are de-duplicated by a content hash so unchanged data is never re-sent. Settings → Cloud sync → Details shows the counts for the current session.

When the env vars are absent, the Cloud sync card says so and everything stays local.

## On a phone

The layout switches to a bottom tab bar and a "More" sheet under 860px. Open the deployed URL in Safari or Chrome and use "Add to Home Screen" to install it as a standalone app; the icon comes from `public/apple-touch-icon.png` (regenerate with `node scripts/make-touch-icon.mjs`).

## Design

Colors, type, spacing, component rules, vocabulary, accessibility rules, and the icon set are documented in `DESIGN.md`. Use its tokens and classes when adding UI.

## Stack

Vite, React 18, TypeScript, react-router (hash routing, so it works from any static host), zustand with the persist middleware. No UI library; one stylesheet with light and dark themes. Roadmap content lives in `src/data/roadmap.ts` (transcribed from the markdown roadmap; task and milestone ids there are permanent); labels in `src/lib/labels.ts`.
