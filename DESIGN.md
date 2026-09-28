# Design guidelines

The tracker follows a warm, calm visual language: cream neutrals, one terracotta accent, serif type for display, sans for everything else, soft rounded surfaces, and generous whitespace. Every rule here maps to a token or class in `src/styles.css`. When adding UI, use the tokens and existing classes first; add a token before adding a raw color.

## Principles

1. **Warm neutrals, one accent.** Backgrounds are cream, not white or grey. Text is warm near-black, never `#000`. Terracotta is the only decorative color and it marks the primary action, the active nav item, the current week, and progress.
2. **Serif for display only.** Page titles, hero lines, stat values, week numbers, and project names use the serif. Body copy, labels, buttons, and tables use the system sans. Never set paragraphs in the serif.
3. **Hairlines over shadows.** Depth comes from a 1px border and a slightly different surface tone. Shadows are near-invisible on light and absent in dark mode, except overlays (palette, sheet, toast) which use `--shadow-overlay`. Hover changes border color, not elevation.
4. **Status is never color alone.** Good, warning, and critical always pair a color with an icon and a label: the `AlertTriangle` icon plus "overdue", the `Check` icon plus "Done". Status colors are reserved for state and never reused for data categories (difficulty, tags).
5. **Data is one hue.** Charts use the accent as the single series color and a one-hue terracotta ramp for magnitude. Text on charts uses ink tokens, never the series color.
6. **Quiet motion.** Transitions are 120–250 ms on background, border, and width. The phone sheet slides up in 220 ms as the one allowed transform animation. Everything stops under `prefers-reduced-motion`.
7. **Readable for everyone.** Text meets 4.5:1 and controls 3:1 against their surface in both themes; every interactive element has a visible focus ring; dialogs trap focus and return it; charts carry a text equivalent.

## Vocabulary

Use the same word for the same thing everywhere, including reports and search. Labels live in `src/lib/labels.ts`.

| Concept | Word | Not |
|---|---|---|
| A checklist entry | task | item |
| A time entry | session (the page is Study log, the action is Log session) | log, entry |
| The week a record belongs to | Roadmap week | linked week |
| The achievements page | Achievements | milestones (which are the checkpoints inside a side project) |
| A task the user added | tagged **Yours** | mine, custom |
| Project badges | Start project 1 / Finish project 1 | side project 1 |
| Statuses | Not started · In progress · Done · Skipped · Blocked (Skipped and Blocked are manual flags on a week) | todo, complete, stuck |
| Project milestone groups | Engineering requirements · Deliverables · Yours | tasks, checklist |
| The week's reading | Reading this week | resources, books |
| Enumerations | Capitalized labels: Easy, Study, High priority | raw values |

Roadmap content (topics, tasks, goals) is Vietnamese and is wrapped in `<Vi>` so screen readers switch language. UI chrome is English.

## Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F4F3EE` | `#1F1E1D` | page and sidebar |
| `--surface` | `#FCFBF8` | `#2B2A27` | cards, inputs, buttons, empty heatmap cells |
| `--surface-2` | `#F0EEE6` | `#353330` | hover fills, quiet pills |
| `--surface-3` | `#E6E3D8` | `#413E3A` | progress track |
| `--border` / `--border-strong` | 10% / 20% ink | 12% / 24% cream | hairlines / inputs |
| `--ink` | `#1F1E1D` | `#F4F3EE` | primary text, focus ring |
| `--ink-2` | `#5E5D59` | `#C2C0B6` | secondary text, labels (`.ink-2`) |
| `--muted` | `#6B6964` | `#A09E98` | tertiary text, hints, axis labels (`.ink-3`); 4.7:1 on every surface |
| `--accent` | `#D97757` | `#E08A6D` | active nav icon, current-week ring, chart series |
| `--accent-strong` | `#A34B2C` | `#E08A6D` | primary button, progress fill, pressed filter underline (5.6:1 with `--accent-ink`) |
| `--accent-hover` | `#8F3F22` | `#E89A80` | primary button hover |
| `--accent-ink` | `#FCFBF8` | `#1F1E1D` | text on `--accent-strong` |
| `--accent-soft` / `--accent-soft-ink` | `#F6E4DB` / `#8A3F22` | `#4A2A1C` / `#F6E4DB` | active nav, banners, links, selected palette row |
| `--good` / `--good-text` / `--good-soft` | `#0CA30C` / `#1F6B1F` / `#E3EFDD` | `#0CA30C` / `#6FCF6F` / `#1E3A1E` | done, on track; bars fill with `--good-text` |
| `--warning` / `--warning-text` / `--warning-soft` | `#FAB219` / `#7A5200` / `#FBEED0` | same / `#FFD36B` / `#4A3600` | behind pace, high priority, stars use `--warning-text` |
| `--critical` / `--critical-text` / `--critical-soft` | `#D03B3B` / `#9A2626` / `#F7DFD9` | same / `#FF8F8F` / `#4A1C1C` | overdue, destructive |
| `--on-status` | `#FFFFFF` | same | text or icon on a solid status color |
| `--series-1` | `#D97757` | `#D06E4E` | the single chart series |
| `--ramp-1..4` | `#E5A386 #D97757 #B85A38 #8F3F22` | `#8F4628 #B85A38 #D97757 #EDA48A` | heatmap magnitude, low to high (level 1 "active, no time" is a `--ramp-2` ring) |
| `--grid` / `--axis` | `#E6E3D8` / `#C9C6BA` | `#3A3835` / `#4A4743` | chart gridlines and baseline |
| `--scrim` | 40% ink | 60% black | backdrops |
| `--shadow` / `--shadow-overlay` | faint / soft | none / none | cards / palette, sheet, toast |

Dark mode is a selected set, not an inversion: surfaces get warmer and lighter as they stack, the UI accent lightens for legibility, and the ramp runs toward the surface for low values. The chart series in dark mode is slightly deeper than the UI accent because the validator's dark lightness band rejects the lighter tint. Both dark scopes (`prefers-color-scheme` guarded by `:root:not([data-theme='light'])`, and `:root[data-theme='dark']`) must carry the same values.

Chart colors pass the dataviz palette validator against both surfaces; re-run it if you change `--series-1` or the ramp. Text and control colors were checked with WCAG contrast math; re-check if you change `--muted`, `--accent-strong`, or a `*-text` token.

## Typography

| Role | Font | Size / weight |
|---|---|---|
| Page title `h1` | Lora (serif) | 28px / 500, 24px on phones |
| Hero line, project title, phase title, brand | Lora | 26 / 20 / 19 / 20px, 500 |
| Stat tile value, week number, timer clock | Lora | 28 / 20 / 28px, 500 |
| Section heading `h2` in cards | system sans | 15px / 600 |
| Body | system sans | 15px / 400, line-height 1.55 |
| Labels, meta, hints | system sans | 13px (labels 600), 12px hints |
| Kicker / eyebrow | system sans | 11–12px / 600–700, uppercase, 0.06em tracking |

Lora loads from Google Fonts with `Georgia` as fallback, so offline still renders correctly. Numbers that align in columns use `.tabular`. Inputs are 16px under 600px so iOS does not zoom.

## Spacing and shape

- Spacing scale: 4, 8, 12, 16, 24, 32. Cards use 18–20px padding (16px on phones); page gutters are 36px on desktop and 16px on phones.
- Vertical rhythm comes from classes, not inline styles: `.stack` (14px gap between cards), `.section` (14px top), `.section-sm` (12px), `.section-xs` (6px), `.section-xxs` (3px), `.section-xs-b` (8px bottom), `.push-end` (auto left margin), `.span-2` (two form columns).
- Radius tokens: `--radius-lg` 16px (palette, sheet), `--radius` 12px (cards, tiles), `--radius-sm` 8px (controls, nav rows), `--radius-xs` 5px (kbd, tooltip), 999px pills.
- Content max width 1120px. Sidebar 240px, replaced by the phone chrome under 860px.

## Components

- **Buttons**: `.btn` (surface + hairline), `.btn.primary` (`--accent-strong`), `.btn.ghost` (text only), `.btn.danger` (critical outline), `.btn.sm`, `.btn.icon` (square, icon only, needs `aria-label`). One primary per card. Disabled links use `aria-disabled` and the same dimmed style.
- **Pills** `.pill` with `.done/.good`, `.in-progress/.accent`, `.warning`, `.critical/.overdue`, `.skipped`. Status pills always carry an icon (`StatusPill`, `PriorityPill`, `DueLabel`); neutral metadata pills (type, difficulty, "Now") may be text only.
- **Badges** `.badge` on nav items for counts, with sr-only context; `.badge.critical` only for overdue.
- **Inputs** show a dark focus ring plus an accent border. Labels sit above, 13px, semi-bold; hints below in `.hint` and wired with `aria-describedby`.
- **Cards** `.card` with `.card-head` (title left, action or status right).
- **Stat tiles** `.tile` as a `<dl>`: label, serif value, muted sub line; pass `srValue` when the visual value is a compact code like "3 · 1 · 0".
- **Progress** `.bar` (fill `--accent-strong`, turns good at 100%, hairline inset ring) and `.progress-line`. Bars are `role="progressbar"` labelled by their title, or `decorative` when the number is written next to them.
- **Filter groups** `.tabs`: pressed buttons (`aria-pressed`), not ARIA tabs, since there are no panels.
- **Lists** `.list` rows with `.body`, `.meta`, `.actions`; `.checklist` for checkbox rows. Delete buttons confirm when data would be lost, and every action toasts.
- **Empty states** `.empty`: dashed border, one sentence that says what to do, with a link to the page where you do it.
- **Toast** `.toast` inside a permanent `role="status"` region: short feedback (saved, deleted, timer events), 3.2 s, one sentence. With an action (`.toast-action`, used for Undo) it stays 7 s. Prefer delete-then-Undo over a confirm dialog for single items; confirm only for bulk or irreversible actions.
- **Callout** `.callout`: accent left border on `--surface-2` with an uppercase `.callout-title`, for a short piece of the user's own text that deserves attention (the plan for the week).
- **Command palette** `.palette`: centered at 12vh on desktop, full-screen with a Cancel button on phones; `role="combobox"` input, grouped `role="listbox"`, focus trapped, footer lists shortcuts.
- **Achievements** `.milestone`: card with a round icon well; unlocked cards use the good-soft fill, locked ones a thin progress bar and `current / target`.
- **Phone chrome**: sticky top bar `.mobile-top`, fixed `.tabbar` (5 tabs, 50px, safe-area padding, hidden while typing), and the `.sheet` dialog (focus trapped, `inert` on the rest, closes on backdrop, Escape, or navigation).
- Others in use: `.banner`, `.hero` + `.kicker` + `.pace`, `.kv` definition lists, `.milestone-badge`, `.rating` + `.stars`, `.search-btn` + `.kbd`, `.timer-widget` + `.timer-chip`, `.heatmap`, `.divider`, `.inline-add`, `.inline-editor`, `.kind-tag`, `.week-nav`, `.skip-link`.

## Accessibility rules

- Skip link first in the DOM; `main` has `id="main"`. After navigation the page `h1` receives focus and `document.title` updates.
- Icon-only controls have `aria-label`. Arrows in prose are `aria-hidden` with sr-only "to". Links that open a new tab say so in sr-only text.
- Focus: `:focus-visible` is a 2px ink ring with a bg halo so it survives on accent-soft; never remove it. Dialogs use `useFocusTrap` (trap, Escape, `inert` outside, return focus).
- Roving tabindex + arrow keys for the star rating and the chart bars (`rovingKey`).
- Charts: the hours chart is a `role="group"` with `role="img"` bars; the heatmap has a visually hidden table.
- Touch: 44px minimum for small and icon buttons, stars, filter buttons, and palette rows on coarse pointers.

## Icons

Icons live in `src/components/icons.tsx` as hand-drawn stroke SVGs: 24px grid, 1.75px stroke, round caps and joins, `currentColor`, default size 18px. They are decorative by default (`aria-hidden`); pass `title` when an icon stands alone with meaning. To add one, copy a Lucide-style path into `make('name', [...paths])`. Never use emoji or Unicode symbols as icons; stars, arrows, and crosses are all components (`Stars`, `MoreLink`, `X`). Delete icons that lose their last use.

App icon: `public/favicon.svg`, a terracotta rounded square with a cream route-and-check mark, referenced from `index.html` and `public/manifest.webmanifest`; `public/apple-touch-icon.png` is generated by `node scripts/make-touch-icon.mjs`.

## Mobile

Breakpoints: **860px** switches chrome, **600px** tightens layout, **420px** reduces chart density. See Phone chrome above. Charts measure their container (`useContainerWidth`) so text never scales down; the hours chart shows 8 weeks under 420px and the heatmap 14–20 weeks under 640px.

## Do and don't

- Do keep one accent. Don't introduce blue, purple, or a second brand color.
- Do use `.ink-2` and `.ink-3` for hierarchy. Don't fade text with opacity.
- Do put the serif on short display lines. Don't set body text or buttons in it.
- Do show status with icon + label. Don't rely on red or green alone.
- Do use existing classes and tokens. Don't write hex values or spacing in components.
- Do confirm before destroying data and toast after every action. Don't let a click do something silently.
- Do test both themes with the toggle and once with the keyboard only. Don't assume dark mode is an inverted light mode.
