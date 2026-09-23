// Measures the shell region (sidebar column + header bar) for each capture
// viewport against the running rebuild and writes reference/shell-boxes.json.
// tools/diff.mjs crops BOTH sides of every pair to these rects before
// comparing, so shell regressions are visible even when the full-page images
// differ in height. The two rects are stored separately — their union would
// cover most of the content area, which is exactly what we want to exclude.
// Boxes come from the live DOM — nothing is hardcoded.
//
// Usage: BASE_URL=http://localhost:3000 node tools/measure-shell.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { VIEWPORTS } from "./shoot.mjs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "reference/shell-boxes.json";

const browser = await chromium.launch();
const boxes = {};

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    const rects = await page.evaluate(() => {
      // Sidebar column: the fixed container rendered by ui/sidebar.tsx.
      // On mobile the sidebar is a Sheet (hidden until opened), so the shell
      // is the header bar alone — either rect may legitimately be absent.
      const sidebar = document.querySelector('[data-slot="sidebar-container"]');
      const header = document.querySelector(
        '[data-slot="sidebar-inset"] header'
      );
      if (!sidebar && !header) return null;
      const rectOf = (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(Math.max(0, r.x)),
          y: Math.round(Math.max(0, r.y)),
          width: Math.round(Math.min(r.width, window.innerWidth - Math.max(0, r.x))),
          height: Math.round(r.height),
        };
      };
      return {
        sidebar: sidebar ? rectOf(sidebar) : null,
        header: header ? rectOf(header) : null,
      };
    });
    if (!rects) throw new Error("shell elements not found");
    boxes[vp.width] = rects;
    console.log(`${vp.width}w ->`, JSON.stringify(rects));
  } finally {
    await context.close();
  }
}

await browser.close();
writeFileSync(OUT, JSON.stringify(boxes, null, 2) + "\n");
console.log(`wrote ${OUT}`);
