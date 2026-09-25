# Session handoff

Written at the end of the session that built the last four routes. Read
`AGENTS.md` first -- it holds the durable conventions. This file is the
current state and what to do next.

## Where the build stands

All seven routes are built, and every control on them is wired. Last full run,
42/42 pairs compared, **mean 0.17%**, worst pair 0.87%, 22 of 42 under 0.10%:

| route       | best | worst | worst pair           |
|-------------|------|-------|----------------------|
| /settings   | 0.01 | 0.15  | settings-dark-1440   |
| /leads      | 0.01 | 0.06  | leads-light-390      |
| /campaigns  | 0.02 | 0.07  | campaigns-dark-390   |
| /           | 0.06 | 0.34  | root-light-390       |
| /deals      | 0.11 | 0.53  | deals-dark-390       |
| /analytics  | 0.10 | 0.41  | analytics-light-390  |
| /customers  | 0.17 | 0.87  | customers-dark-1024  |

(Leads' figures are from the run after the antialiasing fix; re-check them
against diffs/report.json rather than trusting this table.)

Nothing is a stub. No height mismatches. The working tree is clean and every
change is committed.

## What changed in the sessions that built this

The four route builds are the bulk of it; these are the commits worth knowing
about, because they changed things you might otherwise re-break:

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
- `8a7f044` + `c4734b8` the capture browser now runs with --disable-lcd-text.
  Chromium was picking subpixel or greyscale text antialiasing per compositing
  layer, which is a race: /leads landed on one side in the reference and the
  other locally, ghosting every glyph on the page. The whole set was re-shot
  under the flag. **Do not re-capture again without being asked.**

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

## Interactions: what works, and what is deliberately inert

The interaction pass is done. Everything below works on the mock data:

- The command palette, on Cmd/Ctrl-K, from both header search buttons and the
  sidebar's Search item. Filters as you type, Enter navigates, Escape closes.
- The header's date range, driven by Today, Last 7 days and the Filters menu
  -- one piece of state, three ways into it. Customize opens a theme and
  sidebar dialog.
- /customers: plan filter, density, column show/hide, CSV export, pagination
  across both pages, row drag-reorder, and a working row menu.
- /leads: status filter, CSV export, row menu, row reorder, and the region
  card's Map view.
- /deals: kanban columns reorder, and cards now drag between stages with the
  stage counts following.
- /campaigns: the growth simulator's sliders drive the projected figures.

Three controls are inert on purpose, all for the same reason -- there is no
data behind them. Do not "fix" these by inventing behaviour:

- The two "View all" buttons (open deals, top landing pages). Both tables
  already show every row the fixtures hold. They are deliberately NOT
  disabled: a disabled button renders differently and would move the diff.
- "Manage licenses" in the leads row menu. The reference offers it; no licence
  data exists anywhere. It is shown unavailable rather than wired to something
  unrelated.
- The kanban "+" buttons. Adding a deal means inventing a card's worth of
  data, which is worth doing properly with a form or not at all.

## Where the remaining pixels are

/customers at 1024 (0.82-0.87%) is the last real outlier, and it is an open
puzzle rather than a to-do. At that width the health-gauge legend labels
truncate in ours and do not in the reference, which narrows the legend by 23px
and shifts the gauge 11px right. The li markup is byte-identical, every
computed style matches, the ancestor chain matches down to the same 348px
card -- and yet, cloned into a neutral container, our list item's min-content
is 139.15px against the reference's 162.15px. Removing the shrink permission,
forcing the label's width and dropping the width cap all fail to move it.
Whatever it is, it is not in the markup or in any computed property I checked.

Two known, deliberate contributors that are not bugs:
- The campaign table's channel column uses neutral lucide icons where the
  reference uses Google Ads / Meta / TikTok brand marks. Left that way on
  purpose.
- The customers and leads tables use aria-label in a few places where the
  reference uses <span class="sr-only">. Invisible either way.

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
