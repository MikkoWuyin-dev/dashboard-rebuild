// Verify the wrapper-level mask: sample [data-slot=avatar] boxes in the fresh
// reference PNG (deals-light-1440) and confirm each is a flat #ff00ff block.
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("https://shadcncraft-sales-marketing-dashboard.vercel.app/deals");
  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload({ waitUntil: "networkidle" });
  await page
    .waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: 30000 })
    .catch(() => {});
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });

  const boxes = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-slot="avatar"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) out.push({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
    });
    return out;
  });
  await browser.close();

  const png = PNG.sync.read(fs.readFileSync("reference/deals-light-1440.png"));
  const isMaskColor = (r, g, b) => Math.abs(r - 255) < 12 && Math.abs(g - 0) < 12 && Math.abs(b - 255) < 12;

  let flat = 0, nonFlat = 0, offPage = 0;
  for (const b of boxes) {
    if (b.y + b.h > png.height || b.x + b.w > png.width) { offPage++; continue; }
    const colors = new Set();
    for (let y = b.y + 1; y < b.y + b.h - 1; y += 2)
      for (let x = b.x + 1; x < b.x + b.w - 1; x += 2) {
        const i = (png.width * y + x) << 2;
        colors.add(`${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`);
      }
    const allMask = [...colors].every((c) => isMaskColor(...c.split(",").map(Number)));
    if (allMask) flat++; else nonFlat++;
  }
  console.log(`avatar wrappers measured: ${boxes.length}`);
  console.log(`flat mask blocks: ${flat}`);
  console.log(`NOT flat (photo or partial): ${nonFlat}`);
  console.log(`off-page (below fold, not in viewport band): ${offPage}`);
})();
