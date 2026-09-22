// Ground-truth capture from the LIVE target site. Do not point this at the rebuild.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "https://shadcncraft-sales-marketing-dashboard.vercel.app";
const ROUTES = ["/", "/analytics", "/campaigns", "/deals", "/leads", "/customers", "/settings"];
const THEMES = ["light", "dark"];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
];
const OUT_DIR = join(process.cwd(), "reference");
const SETTLE_TIMEOUT_MS = 30_000;
const NAV_TIMEOUT_MS = 60_000;

const KILL_MOTION_CSS = `*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}`;

const urlFor = (route) => `${BASE_URL}${route}`;
const pngPath = (route, theme, vp) =>
  join(OUT_DIR, `${route === "/" ? "root" : route.slice(1)}-${theme}-${vp.width}.png`);
const htmlPath = (route, theme, vp) =>
  join(OUT_DIR, `${route === "/" ? "root" : route.slice(1)}-${theme}-${vp.width}.html`);

// Hash three horizontal bands of a PNG (decoded in the page via canvas).
// Identical bands mean the compositor repeated slices -> corrupt capture.
async function pngLooksCorrupt(page, pngBuffer) {
  const dataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
  return page.evaluate(async (src) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error("screenshot PNG failed to decode"));
      img.src = src;
    });
    const { width: w, height: h } = img;
    if (h < 300) return { corrupt: false, w, h, reason: "too short to check" };
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const bandHash = (y0, y1) => {
      const bandH = y1 - y0;
      const data = ctx.getImageData(0, y0, w, bandH).data;
      let hash = 2166136261 >>> 0;
      for (let y = 0; y < bandH; y += 7) {
        const row = y * w * 4;
        for (let x = 0; x < w; x += 11) {
          const i = row + x * 4;
          hash ^= data[i] | (data[i + 1] << 8) | (data[i + 2] << 16);
          hash = (hash * 16777619) >>> 0;
        }
      }
      return hash;
    };
    const third = Math.floor(h / 3);
    const bands = [bandHash(0, third), bandHash(third, 2 * third), bandHash(2 * third, h)];
    const corrupt =
      bands[0] === bands[1] || bands[1] === bands[2] || bands[0] === bands[2];
    return { corrupt, w, h, bands };
  }, dataUrl);
}

// Scroll-and-stitch fallback: viewport shots stepped down the page, composited
// on an off-DOM canvas inside the page, returned as a single PNG.
async function scrollStitch(page) {
  const shots = await page.evaluate(async () => {
    const vh = window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const positions = [];
    for (let y = 0; y < total; y += vh) positions.push(y);
    return { positions, vh, total };
  });
  const buffers = [];
  for (const y of shots.positions) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(180);
    buffers.push((await page.screenshot()).toString("base64"));
  }
  const dataUrl = await page.evaluate(
    async ({ b64s, vh, total }) => {
      const imgs = [];
      for (const b64 of b64s) {
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = `data:image/png;base64,${b64}`;
        });
        imgs.push(img);
      }
      const canvas = document.createElement("canvas");
      canvas.width = imgs[0].naturalWidth;
      canvas.height = total;
      const ctx = canvas.getContext("2d");
      imgs.forEach((img, i) => {
        const y = Math.min(i * vh, total - img.naturalHeight);
        ctx.drawImage(img, 0, y);
      });
      return canvas.toDataURL("image/png");
    },
    { b64s: buffers, vh: shots.vh, total: shots.total }
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

const combos = [];
for (const route of ROUTES)
  for (const theme of THEMES)
    for (const vp of VIEWPORTS) combos.push({ route, theme, vp });

const alreadyDone = (c) =>
  existsSync(pngPath(c.route, c.theme, c.vp)) && existsSync(htmlPath(c.route, c.theme, c.vp));
const pending = process.env.RESUME ? combos.filter((c) => !alreadyDone(c)) : combos;

console.log(`Target: ${BASE_URL}`);
console.log(
  `${combos.length} combinations total, ${pending.length} to capture (RESUME=${!!process.env.RESUME}).`
);
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const failures = [];
const stitches = [];

for (const { route, theme, vp } of pending) {
  const label = `${route} ${theme} ${vp.width}x${vp.height}`;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  try {
    // Prime localStorage on the site's origin, then reload so next-themes
    // applies the stored theme before first paint.
    await page.goto(urlFor(route), { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    await page.evaluate((t) => localStorage.setItem("theme", t), theme);
    await page.goto(urlFor(route), { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS });

    // Mandatory settle: the site streams ~28 panels in after first paint.
    await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, {
      timeout: SETTLE_TIMEOUT_MS,
    });

    await page.addStyleTag({ content: KILL_MOTION_CSS });
    await page.waitForTimeout(250);

    // Full-page shot, then verify it isn't slice-duplicated; stitch if it is.
    let png = pngPath(route, theme, vp);
    let buffer = await page.screenshot({ path: png, fullPage: true });
    const check = await pngLooksCorrupt(page, buffer);
    if (check.corrupt) {
      console.log(`STITCH ${label}: fullPage showed repeated slices, scroll-and-stitching`);
      stitches.push(label);
      buffer = await scrollStitch(page);
      writeFileSync(png, buffer);
    }

    writeFileSync(htmlPath(route, theme, vp), await page.content());
    console.log(`OK  ${label} (${check.w}x${check.h})`);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error(`FAILED ${label}: ${msg.split("\n")[0]}`);
    failures.push(`${label} (${msg.split("\n")[0]})`);
  } finally {
    await context.close();
  }
}

await browser.close();

console.log(`\nCaptured ${pending.length - failures.length}/${pending.length}.`);
if (stitches.length) console.log(`Scroll-and-stitch used for: ${stitches.join(", ")}`);
if (failures.length) {
  console.log("Did not complete:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exitCode = 1;
}
