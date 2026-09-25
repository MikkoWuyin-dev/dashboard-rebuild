# Session handoff

Written at the end of the session that built the last four routes. Read
`AGENTS.md` first -- it holds the durable conventions. This file is the
current state and what to do next.

## Where the build stands

All seven routes are built and diffing. Last full run, 42/42 pairs compared,
**mean 0.26%**, worst pair 1.13%:

| route       | best | worst | worst pair           |
|-------------|------|-------|----------------------|
| /settings   | 0.01 | 0.15  | settings-dark-1440   |
| /campaigns  | 0.02 | 0.07  | campaigns-dark-390   |
| /           | 0.06 | 0.33  | root-light-390       |
| /deals      | 0.11 | 0.54  | deals-dark-390       |
| /analytics  | 0.10 | 0.42  | analytics-light-390  |
| /customers  | 0.17 | 0.87  | customers-dark-1024  |
| /leads      | 0.24 | 1.13  | leads-light-390      |

Nothing is a stub. No height mismatches. The working tree is clean and every
change is committed.

## What changed this session

Fourteen commits, `f32ab3b` through `f8935b6`. The four route builds are the
bulk of it; these are the ones worth knowing about because they changed
things you might otherwise re-break:

- `16aee8c` the header's search button is 32px, not 28px. It was shifting the
  whole right-hand header group by 4px on **every** route.
- `d1a4fe6` `devIndicators: false`. Next's dev badge was sitting in every
  390px capture and none of the reference's -- ~900 phantom pixels per mobile
  shot on every route.
- `94fa532` + `f8935b6` the capture now waits for recharts to stop animating,
  and the whole reference set was re-shot under that rule. 26 of the 42 shots
  changed. **Do not re-capture again without being asked.**
- `929a9ab` the win-rate chart was holding a 16:9 box instead of filling its
  card, so its plot was 299px tall at 1440 where the reference is 214px.
- `edb19fd` the kanban win-probability bars are tinted by the card's status,
  not all chart-3.

## Where the remaining pixels are

`/leads` is the weakest route and the obvious next target. The mismatch is
spread thinly rather than sitting in one panel, so band the diff image first
(`AGENTS.md`, "How to find what is actually wrong") rather than guessing.

`/customers` at 1024 (0.82-0.87%) is the next one. Its 1440 pairs are at
0.17-0.21%, so whatever it is shows up only where the table sits at
min-content.

Two known, deliberate contributors that are not bugs:
- The campaign table's channel column uses neutral lucide icons where the
  reference uses Google Ads / Meta / TikTok brand marks. Left that way on
  purpose. Do not "fix" it by adding the logos.
- The customers and leads tables use `aria-label` where the reference uses
  `<span class="sr-only">`. Invisible either way; harmless to align.

## Interactions still to build

Everything renders and the data is real, but these controls do nothing yet.
This is the natural next body of work after the remaining pixels:

- Command palette (⌘K) behind the header search button and the sidebar's
  "Search" item. Needs `cmdk`.
- The header's date-range control (Today / Last 7 days) and the Filters and
  Customize popovers.
- `/customers` toolbar: All customers, Comfortable, Columns, Export.
- `/customers` pagination: the nav buttons are wired but only page 1's ten of
  sixteen rows were ever extracted, so page 2 needs its rows pulled from the
  reference first.
- `/leads`: the Status filter menu, Export, and the region card's Map view
  (the List/Map toggle currently toggles nothing).
- `/analytics`: "View all" on top landing pages.
- Row drag-reorder in the customers and leads tables. Kanban *column*
  reordering already works; row reordering does not.
- Per-row action menus open, but their items do nothing.

The growth simulator on `/campaigns` IS live -- its sliders drive the
projected leads, customers and revenue. Use it as the model for how much
behaviour these panels should have.

## How the person wants to work

- **Standing instruction:** end every response with a bullet-point change log
  explaining your decisions in terms an average person would follow. This is
  not optional and it applies to every reply, not just code ones.
- They run the commands; you do not have a terminal into their dev server.
  Ask for a specific command and wait for the output.
- Two terminals, always. See `AGENTS.md`.
- They are eyeballing the pages alongside the numbers, so say what you
  changed visually, not just that a number moved.
- When you find something in the reference that surprises you, say so plainly
  and show the evidence. Several of this session's real fixes came from
  numbers that looked wrong rather than from the page looking wrong.

## One thing that is not a code problem

The git remote `github.com/MikkoWuyin-dev/dashboard-rebuild` is public, and
`reference/` contains 42 full-page screenshots plus the complete saved HTML
of a commercial template, alongside our reconstruction of it in `src/`. The
person has been told. If it is still public, it is worth raising once more
before adding anything to it.
