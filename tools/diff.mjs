// Screenshot-diff harness: shoots the LOCAL rebuild under identical conditions
// to the reference (via the shared shoot module), compares every PNG pair with
// pixelmatch at threshold 0.1, writes diff images, and reports.
//
// BASE_URL (default http://localhost:3000) selects the local server. It must
// not be hardcoded — the dev server's port is whatever it is.
//
// Besides the full-image comparison, each pair gets a "shellPercent": a
// second pixelmatch run restricted to the shell region (sidebar column +
// header bar), cropped from BOTH images by DOM-measured bounding boxes in
// reference/shell-boxes.json. Height mismatches therefore cannot hide shell
// regressions: the shell lives in the top band present on both sides.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { shootAll, ROUTES, THEMES, VIEWPORTS, pngPath } from "./shoot.mjs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ROUTES=customers          -> only /customers (leading slash optional)
// ROUTES=customers,deals    -> those two
// SKIP_SHOOT=1              -> reuse whatever is already in current/
// VERBOSE=1                 -> per-shot progress lines
// A filtered run writes its filter into diffs/report.json so a partial result
// can never be mistaken for a full one later.
const ROUTE_FILTER = (process.env.ROUTES || "")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean)
  .map((r) => (r === "root" ? "/" : r.startsWith("/") ? r : `/${r}`));
const SKIP_SHOOT = process.env.SKIP_SHOOT === "1";
const VERBOSE = process.env.VERBOSE === "1";

const ACTIVE_ROUTES = ROUTE_FILTER.length
  ? ROUTES.filter((r) => ROUTE_FILTER.includes(r))
  : ROUTES;

if (ROUTE_FILTER.length && ACTIVE_ROUTES.length === 0) {
  console.error(`\n  No route matches ROUTES=${process.env.ROUTES}`);
  console.error(`  Known routes: ${ROUTES.join(" ")}  (use "root" for /)\n`);
  process.exit(1);
}
const CURRENT_DIR = join(process.cwd(), "current");
const REF_DIR = join(process.cwd(), "reference");
const DIFFS_DIR = join(process.cwd(), "diffs");

// Shell region boxes, per viewport width, measured from the live DOM by
// tools/measure-shell.mjs. Rects may be null (mobile sidebar is a Sheet).
const SHELL_BOXES = existsSync(join(REF_DIR, "shell-boxes.json"))
  ? JSON.parse(readFileSync(join(REF_DIR, "shell-boxes.json"), "utf8"))
  : null;

// Extract a sub-rectangle as a new PNG (clamped to the image bounds).
function cropPng(img, rect) {
  const x = Math.max(0, Math.min(rect.x, img.width - 1));
  const y = Math.max(0, Math.min(rect.y, img.height - 1));
  const width = Math.max(1, Math.min(rect.width, img.width - x));
  const height = Math.max(1, Math.min(rect.height, img.height - y));
  const out = new PNG({ width, height });
  PNG.bitblt(img, out, x, y, width, height, 0, 0);
  return { img: out, width, height };
}

// pixelmatch over both shell rects; returns summed mismatch ratio.
function compareShell(img1, img2, shellRects, diffDir, name) {
  let mismatched = 0;
  let total = 0;
  for (const [key, rect] of Object.entries(shellRects)) {
    if (!rect) continue;
    const a = cropPng(img1, rect);
    const b = cropPng(img2, rect);
    if (a.width !== b.width || a.height !== b.height) return null; // shell itself resized
    const d = new PNG({ width: a.width, height: a.height });
    mismatched += pixelmatch(a.img.data, b.img.data, d.data, a.width, a.height, {
      threshold: 0.1,
    });
    total += a.width * a.height;
    writeFileSync(join(diffDir, `${name}-shell-${key}.png`), PNG.sync.write(d));
  }
  return total ? { mismatched, total, percent: +((mismatched / total) * 100).toFixed(2) } : null;
}

const slug = (route) => (route === "/" ? "root" : route.slice(1));

// ---- 1) Shoot the local rebuild into current/ --------------------------------
mkdirSync(CURRENT_DIR, { recursive: true });
// Preflight: confirm something is actually serving BASE_URL before spending
// ~2 minutes shooting 42 pages that will all fail identically. Three runs were
// lost to a stopped dev server producing 42 ERR_CONNECTION_REFUSED lines; one
// clear line up front is worth more than 42 identical ones at the end.
async function reachable(url, timeoutMs = 2500) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    await fetch(url, { signal: ac.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// SKIP_SHOOT never touches the server, so do not gate on reachability there.
if (!SKIP_SHOOT && !(await reachable(BASE_URL))) {
  console.error(`\n  Nothing is serving ${BASE_URL}.`);
  console.error("  The dev server is not running, or it is on another port.\n");

  const base = new URL(BASE_URL);
  const candidates = [];
  for (let port = 3000; port <= 3010; port++) {
    if (String(port) !== base.port) candidates.push(`${base.protocol}//${base.hostname}:${port}`);
  }
  const found = [];
  for (const url of candidates) if (await reachable(url, 700)) found.push(url);

  if (found.length) {
    console.error("  Found a server on:");
    for (const url of found) console.error(`    ${url}`);
    console.error(`\n  Re-run with:  $env:BASE_URL="${found[0]}"; pnpm diff\n`);
  } else {
    console.error("  Start it in a SEPARATE terminal and leave it running:");
    console.error("    pnpm dev\n");
    console.error("  Then re-run the diff here. See AGENTS.md > Running the harness.\n");
  }
  process.exit(1);
}

const scope =
  ACTIVE_ROUTES.length === ROUTES.length
    ? "all routes"
    : ACTIVE_ROUTES.join(" ");

if (SKIP_SHOOT) {
  console.log(`== Reusing existing current/ (SKIP_SHOOT=1) — ${scope} ==`);
} else {
  console.log(`== Shooting local rebuild (${BASE_URL}) — ${scope} ==`);
  const quietLog = { log: () => {}, error: (...a) => console.error(...a) };
  const shot = await shootAll({
    baseUrl: BASE_URL,
    outDir: CURRENT_DIR,
    routes: ACTIVE_ROUTES,
    log: VERBOSE ? console : quietLog,
  });
  const expected = ACTIVE_ROUTES.length * THEMES.length * VIEWPORTS.length;
  if (shot.failures.length) {
    console.error(`Local capture incomplete (${shot.failures.length} failures) — aborting diff.`);
    for (const f of shot.failures.slice(0, 5)) console.error(`  - ${f.name ?? ""} ${f.error ?? f}`);
    process.exit(1);
  }
  console.log(`   captured ${expected}/${expected}`);
}

// ---- 2) Compare every current/ PNG against its reference/ counterpart --------
console.log("\n== Comparing against reference/ ==");
mkdirSync(DIFFS_DIR, { recursive: true });
const browser = await chromium.launch();

const results = [];
const heightMismatches = [];

for (const route of ACTIVE_ROUTES) {
  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      const name = `${slug(route)}-${theme}-${vp.width}`;
      const currentPng = pngPath(CURRENT_DIR, route, theme, vp);
      const refPng = pngPath(REF_DIR, route, theme, vp);

      if (!existsSync(currentPng)) {
        results.push({ name, error: "local capture missing" });
        continue;
      }
      if (!existsSync(refPng)) {
        results.push({ name, error: "reference missing" });
        continue;
      }

      const img1 = PNG.sync.read(readFileSync(currentPng));
      const img2 = PNG.sync.read(readFileSync(refPng));

      // Shell sub-diff: crop both sides to the shell rects and compare. Works
      // across height mismatches because the shell band exists on both sides.
      const shellRects = SHELL_BOXES?.[String(vp.width)];
      const shell =
        img1.width === img2.width && shellRects
          ? compareShell(img1, img2, shellRects, DIFFS_DIR, name)
          : null;

      // Size mismatch = layout bug. Do not crash, do not resize — record it.
      if (img1.width !== img2.width || img1.height !== img2.height) {
        heightMismatches.push({
          name,
          local: `${img1.width}x${img1.height}`,
          ref: `${img2.width}x${img2.height}`,
          shellPercent: shell ? shell.percent : null,
        });
        results.push({ name, error: "HEIGHT MISMATCH", shellPercent: shell ? shell.percent : null });
        continue;
      }

      const { width, height } = img1;
      const diff = new PNG({ width, height });
      const mismatchedPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
        threshold: 0.1,
      });
      writeFileSync(join(DIFFS_DIR, `${name}.png`), PNG.sync.write(diff));
      results.push({
        name,
        mismatchedPixels,
        totalPixels: width * height,
        percent: +((mismatchedPixels / (width * height)) * 100).toFixed(2),
        shellPercent: shell ? shell.percent : null,
      });
    }
  }
}

await browser.close();

// ---- 3) Report -----------------------------------------------------------------
const scored = results
  .filter((r) => r.percent !== undefined)
  .sort((a, b) => b.percent - a.percent);

for (const m of heightMismatches) {
  console.log(
    `${m.name}: HEIGHT MISMATCH local=${m.local} ref=${m.ref}` +
      (m.shellPercent !== null && m.shellPercent !== undefined ? ` (shell ${m.shellPercent}%)` : "")
  );
}
for (const r of results.filter((r) => r.error && r.error !== "HEIGHT MISMATCH")) {
  console.log(`${r.name}: ${r.error}`);
}

const withShell = results.filter((r) => r.shellPercent != null);
if (withShell.length) {
  console.log("\nShell region mismatch (sidebar + header), all pairs sorted:");
  console.table(
    [...withShell]
      .sort((a, b) => b.shellPercent - a.shellPercent)
      .map((r) => ({ name: r.name, "shell %": r.shellPercent }))
  );
  const shellMean = +(
    withShell.reduce((s, r) => s + r.shellPercent, 0) / withShell.length
  ).toFixed(2);
  console.log(`Mean shell mismatch: ${shellMean}%`);
}

console.log("\nTop 10 by % pixels differing (threshold 0.1):");
console.table(
  scored.slice(0, 10).map((r) => ({
    name: r.name,
    "mismatched px": r.mismatchedPixels,
    "total px": r.totalPixels,
    "%": r.percent,
  }))
);

const mean = scored.length
  ? +(scored.reduce((sum, r) => sum + r.percent, 0) / scored.length).toFixed(2)
  : null;
console.log(`Pairs compared: ${scored.length}/42`);
console.log(`Mean mismatch across pairs: ${mean === null ? "n/a" : mean + "%"}`);

writeFileSync(
  join(DIFFS_DIR, "report.json"),
  JSON.stringify(
    {
      baseUrl: BASE_URL,
      threshold: 0.1,
      // A filtered run covers only some routes. Recorded so a partial report
      // is never read as a full one.
      routesCovered: ACTIVE_ROUTES,
      partial: ACTIVE_ROUTES.length !== ROUTES.length,
      reusedCurrent: SKIP_SHOOT,
      generatedAt: new Date().toISOString(),
      compared: scored.length,
      meanPercent: mean,
      meanShellPercent: withShell.length
        ? +(withShell.reduce((s, r) => s + r.shellPercent, 0) / withShell.length).toFixed(2)
        : null,
      heightMismatches,
      results: scored,
    },
    null,
    2
  )
);
console.log("report -> diffs/report.json");
