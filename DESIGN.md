# Design guidelines

The tracker follows a warm, calm visual language: cream neutrals, one terracotta accent, serif type for display, sans for everything else, soft rounded surfaces, and generous whitespace. Every rule here maps to a token or class in `src/styles.css`. When adding UI, use the tokens and existing classes first; add a token before adding a raw color.

## Principles

1. **Warm neutrals, one accent.** Backgrounds are cream, not white or grey. Text is warm near-black, never `#000`. Terracotta is the only decorative color and it marks the primary action, the active nav item, the current week, and progress.
2. **Serif for display only.** Page titles, hero lines, stat values, week numbers, and project names use the serif. Body copy, labels, buttons, and tables use the system sans. Never set paragraphs in the serif.
3. **Hairlines over shadows.** Depth comes from a 1px border and a slightly different surface tone. Shadows are near-invisible on light and absent in dark mode. Hover changes border color, not elevation.
4. **Status is never color alone.** Good, warning, and critical always pair a color with an icon and a label (for example `⚠ overdue`, `✓ Done`). Status colors are reserved for state and never reused for data series.
5. **Data is one hue.** Charts use the accent as the single series color and a one-hue terracotta ramp for magnitude. Text on charts uses ink tokens, never the series color.
6. **Quiet motion.** Transitions are 120–250 ms on background, border, and width only. Nothing bounces.

## Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F4F3EE` | `#1F1E1D` | page and sidebar |
| `--surface` | `#FCFBF8` | `#2B2A27` | cards, inputs, buttons |
| `--surface-2` | `#F0EEE6` | `#353330` | hover fills, quiet pills |
| `--surface-3` | `#E6E3D8` | `#413E3A` | progress track, empty heatmap cell |
| `--border` / `--border-strong` | 10% / 20% ink | 12% / 24% cream | hairlines / inputs |
| `--ink` | `#1F1E1D` | `#F4F3EE` | primary text |
| `--ink-2` | `#5E5D59` | `#C2C0B6` | secondary text, labels |
| `--muted` | `#8A8883` | `#8A8883` | tertiary text, axis labels |
| `--accent` | `#D97757` | `#E08A6D` | primary button, active nav icon, progress |
| `--accent-hover` | `#C4663F` | `#E89A80` | primary button hover |
| `--accent-soft` / `--accent-soft-ink` | `#F6E4DB` / `#8A3F22` | `#4A2A1C` / `#F6E4DB` | active nav, banners, links |
| `--good` / `--good-text` / `--good-soft` | `#0CA30C` / `#1F6B1F` / `#E3EFDD` | `#0CA30C` / `#6FCF6F` / `#1E3A1E` | done, on track |
| `--warning` / `--warning-text` / `--warning-soft` | `#FAB219` / `#7A5200` / `#FBEED0` | same / `#FFD36B` / `#4A3600` | behind pace, high priority, stars |
| `--critical` / `--critical-text` / `--critical-soft` | `#D03B3B` / `#9A2626` / `#F7DFD9` | same / `#FF8F8F` / `#4A1C1C` | overdue, destructive |
| `--series-1` | `#D97757` | `#D06E4E` | the single chart series |
| `--ramp-1..4` | `#E5A386 #D97757 #B85A38 #8F3F22` | `#8F4628 #B85A38 #D97757 #EDA48A` | heatmap magnitude, low to high |

Dark mode is a selected set, not an inversion: surfaces get warmer and lighter as they stack, the UI accent lightens for legibility, and the ramp runs toward the surface for low values. The chart series in dark mode is slightly deeper than the UI accent because the validator's dark lightness band (OKLCH L 0.48–0.67) rejects the lighter tint. Both dark scopes (`prefers-color-scheme` guarded by `:root:not([data-theme='light'])`, and `:root[data-theme='dark']`) must carry the same values.

Chart colors pass the dataviz palette validator against both surfaces: the series clears the lightness band and 3:1 contrast, and each ramp is monotone, single-hue, with step gaps of at least 0.06 L and the step nearest the surface at or above 2:1. Re-run the validator if you change `--series-1` or the ramp.

## Typography

| Role | Font | Size / weight |
|---|---|---|
| Page title `h1` | Lora (serif) | 28px / 500, 24px on phones |
| Hero line, project title, phase title | Lora | 26 / 20 / 19px, 500 |
| Stat tile value, week number, timer clock | Lora | 28 / 20 / 28px, 500 |
| Section heading `h2` in cards | system sans | 15px / 600 |
| Body | system sans | 15px / 400, line-height 1.55 |
| Labels, meta, hints | system sans | 13px (labels 600), 12px hints |
| Kicker / eyebrow | system sans | 11–12px / 600–700, uppercase, 0.06em tracking |

Lora loads from Google Fonts with `Georgia` as fallback, so offline still renders correctly. Numbers that align in columns use `.tabular`.

## Spacing and shape

- Spacing scale: 4, 8, 12, 16, 24, 32. Cards use 18–20px padding; page gutters are 36px on desktop and 16px on phones.
- Radius: 12px cards and tiles (`--radius`), 8px controls (`--radius-sm`), 999px pills.
- Card gap 14px; tile grid gap 12px; list rows separated by hairlines, not gaps.
- Content max width 1120px. Sidebar 240px, collapsing to a horizontal scrollable row under 860px.

## Components

- **Buttons**: `.btn` (surface + hairline), `.btn.primary` (accent), `.btn.ghost` (text only), `.btn.danger` (critical outline), `.btn.sm`, `.btn.icon` (square, icon only, needs `aria-label`). One primary per card.
- **Pills** `.pill` with `.done/.good`, `.in-progress/.accent`, `.warning`, `.critical/.overdue`, `.skipped`. Always include an icon or glyph plus text.
- **Badges** `.badge` on nav items for counts; `.badge.critical` only for overdue.
- **Inputs** get an accent border and a soft accent ring on focus. Labels sit above, 13px, semi-bold.
- **Cards** `.card` with `.card-head` (title left, action or status right).
- **Stat tiles** `.tile` with label, serif value, muted sub line.
- **Progress** `.bar` (accent fill, turns good at 100%) and `.progress-line`.
- **Lists** `.list` rows with `.body`, `.meta`, `.actions`; `.checklist` for checkbox rows.
- **Empty states** `.empty`: dashed border, one sentence that says what to do.
- **Toast** `.toast`: dark pill at the bottom, 2.4 s, for confirmations only.

## Icons

Icons live in `src/components/icons.tsx` as hand-drawn stroke SVGs: 24px grid, 1.75px stroke, round caps and joins, `currentColor`, default size 18px. They are decorative by default (`aria-hidden`); pass `title` when an icon stands alone with meaning. To add one, copy a Lucide-style path into `make('name', [...paths])`. Icons inherit text color; the active nav icon and primary actions take the accent. Never use emoji or Unicode symbols as icons.

App icon: `public/favicon.svg`, a terracotta rounded square with a cream route-and-check mark, referenced from `index.html` and `public/manifest.webmanifest`.

## Mobile

Breakpoints: **860px** switches chrome, **600px** tightens layout, **420px** reduces chart density. Desktop keeps the sidebar; under 860px it is replaced by:

- A sticky **top bar** with the serif brand, a compact focus-timer chip (start, or elapsed + stop), and the theme toggle. It pads for the status-bar safe area.
- A fixed **bottom tab bar** with Overview, Weeks, Log, Follow-ups, More. Icon over an 11px label, 50px tall, active in accent, safe-area padding below. Badges sit at the top right of the icon; the More tab shows a dot when DSA reviews are due.
- A **More sheet** sliding up from the bottom (rounded top, handle, backdrop) with the remaining destinations as 16px rows, the full timer widget, and the plan summary with sync status. It closes on backdrop tap, Escape, or navigation and locks page scroll while open.

Rules under 600px: inputs are 16px so iOS does not zoom; cards pad 16px; stat values, hero, and timer clock step down; list-row actions wrap onto their own line; week prev/next become a three-column grid; page-head stacks. On touch devices (`pointer: coarse`) small buttons are at least 36px tall and checkboxes 22px. The toast sits above the tab bar. Charts measure their container (`useContainerWidth`) so text never scales down; the hours chart shows 8 weeks under 420px and the heatmap 14–20 weeks under 640px.

Installable: the manifest and Apple metas allow "Add to Home Screen"; `public/apple-touch-icon.png` is generated by `node scripts/make-touch-icon.mjs`.

## Do and don't

- Do keep one accent. Don't introduce blue, purple, or a second brand color.
- Do use `--ink-2` and `--muted` for hierarchy. Don't fade text with opacity.
- Do put the serif on short display lines. Don't set body text or buttons in it.
- Do show status with icon + label. Don't rely on red or green alone.
- Do use existing classes and tokens. Don't write hex values inside components.
- Do test both themes with the toggle. Don't assume dark mode is an inverted light mode.
