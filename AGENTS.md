# Rebuild conventions

A from-scratch rebuild of a live dashboard, verified by screenshot diffing.
Read this before changing anything.

## Ground truth
- `reference/` holds 42 PNG + 42 HTML captures of the LIVE target, fully
  settled. These are the specification. Never edit or regenerate them unless
  explicitly told to re-capture.
- Class strings, layout and copy come from
  `reference/<route>-<theme>-<width>.html`. Do not invent spacing values.
- `src/data/panel-fixtures.json` is the raw extraction for all routes: chart
  series values, table rows and panel text. Do NOT re-extract chart geometry
  from the reference SVG -- rendering traced `d` paths produces a picture of a
  chart, not a chart.
- Each built route now has its own fixture (`leads-fixture.json`,
  `analytics-fixture.json`, `campaigns-fixture.json`, `root-fixture.json`,
  `customers-fixture.json`, `deals-fixture.json`). Those are what the
  components read. Use the strings exactly: text width drives layout, so
  substitutions prevent convergence.
- Tailwind only sees class names that appear as literal strings in source.
  A `bg-chart-3` that exists only inside a JSON fixture never reaches the CSS.
  Keep colour maps as literal arrays/records in the `.tsx`.

## The harness
- `pnpm diff` shoots localhost into `current/`, compares against
  `reference/`, writes `diffs/report.json`.
- Local URL comes from BASE_URL. Reference measurement uses REF_BASE_URL,
  defaulting to the live target. Never point REF_BASE_URL at localhost.
- `tools/shoot.mjs` is the single capture implementation. Reference and local
  MUST run identical logic.
- Pages scroll an inner container, not the document. Capture stitches slices
  of that container. Do NOT "fix" this by overriding overflow or height --
  panels use flex-1 and would render at the wrong size.
- Avatars are masked on both sides via [data-slot="avatar"]. Our placeholders
  differ from the target's photos by design and are excluded.
- The capture waits for `aria-busy` to clear, adds motion-killing CSS, THEN
  waits for every recharts shape's geometry to stop changing. That last wait
  is not optional: recharts animates in JavaScript, which CSS cannot stop, and
  without it 26 of the 42 reference shots were caught mid-animation.
- `next.config.ts` sets `devIndicators: false` and the injected CSS hides
  `nextjs-portal`. Next's dev overlay puts both an idle badge and an error
  toast at the bottom-left of the viewport, and either will land in the shot.
  The toast is worse than the badge because it appears only sometimes: one
  stale HMR error during a run put an "1 Issue" pill into a single shot and
  read as a regression on that one pair. The reference is a production build
  with no such element, so hiding it changes nothing on that side.
- The capture browser launches with `--disable-lcd-text`. Chromium otherwise
  picks subpixel or greyscale text antialiasing per compositing layer, and
  which one a page gets is a race -- it ghosted every glyph on /leads.

## Running the harness (two terminals, never one)

`capture:ref` hits the LIVE target; `diff` hits your dev server. Running them
in the terminal that holds `pnpm dev` kills the server, and the diff then
reports 42 connection failures. Several failed runs were caused by exactly
this. `pnpm dlx shadcn add ...` also tends to take the dev server with it.

  Terminal 1:  pnpm dev                     # start it and leave it alone
  Terminal 2:  pnpm capture:ref             # wait for "Captured 42/42"
               $env:BASE_URL="http://localhost:3000"; pnpm diff

Iterating on one route? Shoot only that route -- 6 shots instead of 42:

  $env:ROUTES="customers"; pnpm diff     # one route
  $env:ROUTES="customers,deals"          # several ("root" means /)
  $env:SKIP_SHOOT="1"                    # reuse current/, just re-compare
  $env:VERBOSE="1"                       # per-shot progress lines

A filtered run records routesCovered and partial:true in diffs/report.json, so
a partial result cannot be mistaken for a full one. Run an unfiltered diff
before believing an overall mean.

Never run the diff on a partial reference set. A capture that stops early
leaves reference/ mixed across two capture rules, producing numbers that look
real and are not -- the one failure this harness cannot catch for you.
If a capture stops short: `git checkout -- reference/` and start over.

Never `git add -A` while a capture is running. It stages a half-finished
reference set into whatever you are committing.

## Rules that do not bend
- Never raise the pixelmatch threshold.
- Never edit, regenerate or resize reference images to make a number fall.
- Never add fixed heights to force a match.
- Never screenshot before [aria-busy="true"] clears.
- One deliverable per prompt. Stop when it is done.
- Commit at the end of every prompt, before reporting.

## How to find what is actually wrong

Two techniques did nearly all the work; reach for them before guessing.

1. **Band the diff image.** Count red pixels per horizontal strip of
   `diffs/<name>.png` to find which panel owns the mismatch, then crop
   reference / current / diff side by side and look at them. Ghosted text
   across a whole region means an offset, not a content error; find what is
   pushing it.
2. **Audit class strings.** For each `data-slot`, build a multiset of class
   strings from `reference/<route>-light-1440.html` and from
   `current/<route>-light-1440.html`, and print what appears in one and not
   the other. This found the kanban progress tints, the settings avatar
   nesting and the win-rate chart height -- none of which the eye caught.
   Beware two false positives: tailwind-merge reorders classes, so the same
   set can print as two different strings; and `first:pl-4` on every cell is
   equivalent to `pl-4` on the first one.

When a number will not move, check geometry directly in the browser at the
exact viewport (column widths, wrapper sizes, computed styles) rather than
staring at the picture. Measure both sides the same way in the same session.

## Patterns the reference uses that cost us time

- **Button sizes.** `size="icon"` is 32px and keeps `rounded-lg`;
  `size="icon-sm"` is 28px AND swaps in `rounded-[min(var(--radius-md),12px)]`.
  Row grips, row action menus and pagination buttons are all `icon-sm`. The
  header's search button is the one 32px exception in the shell.
- **Chart containers.** `ChartContainer` defaults to `aspect-video`, which is
  almost never what the reference wants. Panels that fill a card use
  `className="min-h-0 w-full flex-1"`; fixed squares use `size-50` (200px) or
  `size-45` (180px). A chart whose height tracks the card width is this bug.
- **Card headers with a CardAction** often carry
  `className="max-sm:flex max-sm:flex-col"`, which drops the two-column header
  grid below 640px so the title and description keep full width. Missing it
  wraps the title beside the legend and pushes the whole panel down.
- **Avatars in tables** are `size="sm"` (24px), not the default 32px. Getting
  this wrong on one table widened it 32px and shifted an entire page column.
- **Checkboxes in tables** carry `mr-1`. Without it the checkbox column is 4px
  narrow, which is enough to shift every column where the table sits at
  min-content.
- **Two tables, two conventions.** The customers and leads tables put
  `first:pl-4 last:pr-4` on every cell; the deals table has neither. Do not
  push edge padding into the shared `table.tsx`.
- **Progress bars are tinted per row**, not per panel:
  `**:data-[slot=progress-indicator]:bg-*`. On the kanban it follows the
  card's status badge, not the percentage.
- **Bars that are not charts.** Revenue-vs-target is 40 flex ticks; traffic by
  channel is flex-grow segments; the heatmaps are opacity on `bg-chart-3`.
  Check before reaching for recharts.
- **Progress panels scale to 120% of target** so the dashed target marker sits
  at 83.3333%.

## Decisions already made
- Next 16.3.4, React 19.2.8, Tailwind v4, shadcn on the BASE UI base (not
  Radix), preset base-nova, baseColor neutral.
- Geist / Geist Mono via next/font/google as --font-sans / --font-mono.
- globals.css tokens are verbatim from the target. Do not adjust or convert
  to oklch.
- Badge colours come from the reference's own utility classes, NOT the
  semantic success/warning tokens. Verified against the reference set:
    green (bg-green-100/text-green-700 + dark variants): Committed,
      Contract sent, Healthy
    yellow (bg-yellow-100/text-yellow-700 + dark variants): At risk
    destructive token (bg-destructive/10 text-destructive): Critical, Lost
    uncoloured default variants: New, Working, On track, and every region
      badge (NA-West, NA-East, EMEA, APAC)
  Check a badge against the reference before colouring it.
- Kanban column reordering uses native pointer events. No dnd library.
- The two funnels (marketing funnel, pipeline by stage) are ONE drawn SVG
  component, `funnel-panel.tsx`, not a chart library. Its generator is
  documented in the file and reproduces the reference's path strings exactly.
  Do not replace it with recharts.
- Brand logos are deliberately not reproduced. The campaign table's channel
  column uses neutral lucide icons of the same 16px footprint where the
  reference uses Google Ads / Meta / TikTok marks.

## React 19 gotcha already hit
Mutating a ref inside a setState updater breaks in dev only: StrictMode
double-invokes updaters and the second pass reads the cleared value. Capture
the value before the updater.

## Reporting
End every response with a plain-language "Change log", per the standing
instruction in each prompt.
