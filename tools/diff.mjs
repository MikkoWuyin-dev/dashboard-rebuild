// Screenshot-diff harness: shoots the LOCAL rebuild under identical conditions
// to the reference (via the shared shoot module), compares every PNG pair with
// pixelmatch at threshold 0.1, writes diff images, and reports.
//
// BASE_URL (default http://localhost:3000) selects the local server. It must
// not be hardcoded — the dev server's port is whatever it is.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { shootAll, ROUTES, THEMES, VIEWPORTS, pngPath } from "./shoot.mjs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CURRENT_DIR = join(process.cwd(), "current");
const REF_DIR = join(process.cwd(), "reference");
const DIFFS_DIR = join(process.cwd(), "diffs");

const slug = (route) => (route === "/" ? "root" : route.slice(1));

// ---- 1) Shoot the local rebuild into current/ --------------------------------
mkdirSync(CURRENT_DIR, { recursive: true });
console.log(`== Shooting local rebuild (${BASE_URL}) into current/ ==`);
const shot = await shootAll({ baseUrl: BASE_URL, outDir: CURRENT_DIR });
if (shot.failures.length) {
  console.error(`Local capture incomplete (${shot.failures.length} failures) — aborting diff.`);
  process.exit(1);
}

// ---- 2) Compare every current/ PNG against its reference/ counterpart --------
console.log("\n== Comparing against reference/ ==");
mkdirSync(DIFFS_DIR, { recursive: true });
const browser = await chromium.launch();

const results = [];
const heightMismatches = [];

for (const route of ROUTES) {
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

      // Size mismatch = layout bug. Do not crash, do not resize — record it.
      if (img1.width !== img2.width || img1.height !== img2.height) {
        heightMismatches.push({
          name,
          local: `${img1.width}x${img1.height}`,
          ref: `${img2.width}x${img2.height}`,
        });
        results.push({ name, error: "HEIGHT MISMATCH" });
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
  console.log(`${m.name}: HEIGHT MISMATCH local=${m.local} ref=${m.ref}`);
}
for (const r of results.filter((r) => r.error && r.error !== "HEIGHT MISMATCH")) {
  console.log(`${r.name}: ${r.error}`);
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
      compared: scored.length,
      meanPercent: mean,
      heightMismatches,
      results: scored,
    },
    null,
    2
  )
);
console.log("report -> diffs/report.json");
