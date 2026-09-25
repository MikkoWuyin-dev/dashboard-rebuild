# Rebuild conventions

A from-scratch rebuild of a live dashboard, verified by screenshot diffing.
Read this before changing anything.

## Ground truth
- `reference/` holds 42 PNG + 42 HTML captures of the LIVE target, fully
  settled. These are the specification. Never edit or regenerate them unless
  explicitly told to re-capture.
- Class strings, layout and copy come from
  `reference/<route>-<theme>-<width>.html`. Do not invent spacing values.
- `src/data/panel-fixtures.json` is the SINGLE source for panel content:
  chart series values, table rows and panel text for all 28 panels across the
  six data routes. Do NOT re-extract chart geometry from the reference SVG --
  the numeric values are already recovered there. Rendering traced SVG `d`
  paths produces a picture of a chart, not a chart.
- `src/data/*.json` fixtures hold extracted content. Use the strings exactly:
  text width drives layout, so substitutions prevent convergence.

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

## Running the harness (two terminals, never one)

`capture:ref` hits the LIVE target; `diff` hits your dev server. Running them
in the terminal that holds `pnpm dev` kills the server, and the diff then
reports 42 connection failures. Two failed runs were caused by exactly this.

  Terminal 1:  pnpm dev                     # start it and leave it alone
  Terminal 2:  pnpm capture:ref             # wait for "Captured 42/42"
               $env:BASE_URL="http://localhost:3000"; pnpm diff

Never run the diff on a partial reference set. A capture that stops early
leaves reference/ mixed across two mask definitions, producing numbers that
look real and are not -- the one failure this harness cannot catch for you.
If a capture stops short: `git checkout -- reference/` and start over.

Expect `capture:ref` to stitch ~40/42 shots while the local diff capture
stitches only the routes that are built; that asymmetry is correct.

## Rules that do not bend
- Never raise the pixelmatch threshold.
- Never edit, regenerate or resize reference images to make a number fall.
- Never add fixed heights to force a match.
- Never screenshot before [aria-busy="true"] clears.
- One deliverable per prompt. Stop when it is done.
- Commit at the end of every prompt, before reporting.

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

## React 19 gotcha already hit
Mutating a ref inside a setState updater breaks in dev only: StrictMode
double-invokes updaters and the second pass reads the cleared value. Capture
the value before the updater.

## Reporting
End every response with a plain-language "Change log", per the standing
instruction in each prompt.
