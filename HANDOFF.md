# Session handoff

Read `AGENTS.md` first: it holds the durable conventions, the harness rules,
and the reference patterns that repeatedly cost time. This file is the current
state and what to do next.

## Start here

1. Two terminals (`AGENTS.md` has the procedure). `pnpm dev` in one.
2. `$env:ROUTES=""; pnpm diff` in the other. Check that campaigns-dark-390
   comes back at roughly 0.07% -- see "one artifact" below. That confirms the
   last fix and gives you a clean baseline.
3. Then take whatever the person asks for. If they leave it open, the honest
   list of remaining work is short and it is at the bottom of this file.

## Where the build stands

All seven routes are built and every control on them is wired. There are no
stubs, no height mismatches, the working tree is clean and everything is
committed.

Last clean full run: 42/42 pairs, **mean 0.17%**, worst pair 0.87%, 22 of 42
under 0.10%.

| route       | best | worst | worst pair           |
|-------------|------|-------|----------------------|
| /settings   | 0.01 | 0.15  | settings-dark-1440   |
| /leads      | 0.01 | 0.06  | leads-light-390      |
| /campaigns  | 0.02 | 0.07  | campaigns-dark-390   |
| /           | 0.06 | 0.34  | root-light-390       |
| /deals      | 0.11 | 0.53  | deals-dark-390       |
| /analytics  | 0.10 | 0.41  | analytics-light-390  |
| /customers  | 0.17 | 0.87  | customers-dark-1024  |

**One artifact to know about.** The newest `diffs/report.json` in the tree
(06:46) shows campaigns-dark-390 at 0.79% instead of 0.07%. That is Next's dev
overlay: a stale HMR error during the run parked an "1 Issue" toast in that one
shot. Commit `c6d0f00` hides the overlay during capture and that report
predates it. If your first run does *not* put the pair back near 0.07%, then
something real is wrong and it is worth chasing.

## Commits worth knowing about

The route builds are the bulk of the history. These are the ones that changed
something you could otherwise re-break:

- `16aee8c` the header's search button is 32px, not 28px. At 28 the whole
  right-hand header group lands 4px off on **every** route.
- `929a9ab` the win-rate chart fills its card instead of holding a 16:9 box.
  Its plot is 214px tall at every viewport in the reference.
- `edb19fd` the kanban win-probability bars are tinted by the card's status,
  not all chart-3.
- `d1a4fe6` + `c6d0f00` Next's dev overlay is kept out of captures, badge and
  error toast both.
- `94fa532` + `f8935b6` the capture waits for recharts to stop animating, and
  the reference set was re-shot under that rule (26 of 42 shots changed).
- `8a7f044` + `c4734b8` the capture browser runs with `--disable-lcd-text`,
  and the set was re-shot again. Chromium was picking subpixel or greyscale
  text antialiasing per compositing layer, which is a race: /leads landed on
  one side in the reference and the other locally, ghosting every glyph.

**Do not re-capture the reference without being asked.** It has been done
twice, both times for a specific, evidenced capture fault.

## Interactions: what works, and what is inert on purpose

Everything here works on the mock data:

- **Command palette** on Cmd/Ctrl-K, from both header search buttons and the
  sidebar's Search item. Filters as you type, Enter navigates, Escape closes.
- **Header**: Today, Last 7 days and the Filters menu all drive one date
  range. Customize opens a theme and sidebar dialog.
- **/customers**: plan filter, density, column show/hide, CSV export,
  pagination across both pages, row drag-reorder, working row menu.
- **/leads**: status filter, CSV export, row menu, row reorder, and the region
  card's Map view.
- **/deals**: columns reorder and cards drag between stages, counts following.
- **/campaigns**: the growth simulator's sliders drive the projected figures.

Three controls are inert deliberately, all for the same reason -- there is no
data behind them. **Do not "fix" these by inventing behaviour:**

- The two **"View all"** buttons (open deals, top landing pages). Both tables
  already show every row the fixtures hold. They are deliberately NOT
  disabled: a disabled button renders differently and would move the diff.
- **"Manage licenses"** in the leads row menu. The reference offers it; no
  licence data exists anywhere, so it is shown unavailable rather than wired
  to something unrelated.
- The kanban **"+"** buttons. Adding a deal means inventing a card's worth of
  data, which is worth doing properly with a form or not at all. The person
  has been offered this and has not asked for it yet.

## The one open puzzle: /customers at 1024

0.82-0.87%, the last real outlier, and a genuine puzzle rather than a to-do.

At that width the health-gauge legend labels truncate in ours and do not in
the reference, which narrows the legend by 23px and, because the row is
centred, shifts the gauge 11px right.

What has already been established, so you do not repeat it:
- The `<li>` markup is **byte-identical** between the two.
- Every computed style compared on the row, list, item, label and text span
  matches: width, min-width, overflow, white-space, flex-shrink, font,
  letter-spacing, word-break, text-wrap.
- The ancestor chain matches, down to the same 348px card and 713px grid.
- Cloned into a neutral 2000px container, our list item's min-content is
  139.15px and the reference's is 162.15px. Same HTML, same CSS, different
  intrinsic size.
- Removing `min-w-0`, forcing the label's flex-shrink to 0, setting the text's
  min-width to max-content and dropping the list's max-width all fail to move
  the row's width.

The next thing to try is enumerating every CSS rule that matches that element
on each side (`document.styleSheets`, walking layer rules, `el.matches`). An
attempt at this returned zero matches and needs a different approach --
Tailwind v4 nests everything in `@layer`, and the walker has to recurse into
`CSSLayerBlockRule.cssRules`.

Do not pin a width on the legend to make the number fall. It would match one
viewport and break two others.

## Two deliberate non-matches

Neither is a bug; leave them:
- The campaign table's channel column uses neutral lucide icons where the
  reference uses Google Ads / Meta / TikTok brand marks. Trademarks, left out
  on purpose.
- A few `aria-label`s where the reference uses `<span class="sr-only">`.
  Invisible either way.

## How the person wants to work

- **Standing instruction:** end every response with a bullet-point change log
  explaining your decisions in terms an average person would follow. This is
  not optional and applies to every reply, not just code ones.
- They run the commands; you have no terminal into their dev server. Ask for a
  specific command and wait for the output.
- Two terminals, always. `shadcn add` and anything that touches
  `next.config.ts` will take the dev server down -- say so when you ask.
- They eyeball the pages alongside the numbers, so say what changed visually,
  not just that a number moved.
- When something in the reference surprises you, say so plainly and show the
  evidence. Most of the real fixes in this project came from numbers that
  looked wrong rather than from pages that looked wrong.

## One thing that is not a code problem

The git remote `github.com/MikkoWuyin-dev/dashboard-rebuild` is public, and
`reference/` holds 42 full-page screenshots plus the complete saved HTML of a
commercial template, alongside our reconstruction of it in `src/`. The person
has been told once. If it is still public, raise it once more before adding
anything to it.
