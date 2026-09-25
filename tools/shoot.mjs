// Shared capture logic — the single source of truth for how screenshots are
// taken. Both the reference capture (tools/capture.mjs) and the local rebuild
// capture (tools/diff.mjs) MUST go through this module so that any pixel
// difference between the two reflects the pages, not the capture conditions.
//
// Capture strategy: the target layout is h-svh with
// main[data-slot="sidebar-inset"] set to overflow-hidden and an inner
// overflow-auto container, so document.scrollHeight never exceeds the viewport
// and Playwright's fullPage:true would capture exactly one screen. Instead we:
//   1. take one full-viewport screenshot at scrollTop 0 (sidebar, header and
//      content as a real visitor sees them), then
//   2. scroll the inner container in clientHeight steps, screenshotting only
//      the container's own bounding box (clipped to the viewport) at each
//      step, and stitch that column below the first shot.
// Fixed chrome (sidebar/header) therefore appears once, not repeated per
// slice. Sticky elements pinned inside the container are skipped per slice so
// they don't smear; they remain in their natural position from the first shot.
// We deliberately do NOT relax overflow/height via CSS: panels use flex-1 and
// h-full, so unclamping changes how tall they render and would capture a page
// no real visitor ever sees.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const ROUTES = ["/", "/analytics", "/campaigns", "/deals", "/leads", "/customers", "/settings"];
export const THEMES = ["light", "dark"];
export const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
];

const SETTLE_TIMEOUT_MS = 30_000;
const NAV_TIMEOUT_MS = 60_000;

export const KILL_MOTION_CSS = `*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}
/* Next's dev overlay. devIndicators:false removes its idle badge but not the
   error toast, which parks itself bottom-left and lands in the shot: one stale
   HMR error during a run put an "1 Issue" pill into campaigns-dark-390 and
   nothing else, which reads as a regression on one pair. The reference is a
   production build and has no such element, so this rule is a no-op there --
   both sides still run identical logic. */
nextjs-portal { display: none !important; }`;

const slug = (route) => (route === "/" ? "root" : route.slice(1));
export const pngPath = (outDir, route, theme, vp) =>
  join(outDir, `${slug(route)}-${theme}-${vp.width}.png`);
export const htmlPath = (outDir, route, theme, vp) =>
  join(outDir, `${slug(route)}-${theme}-${vp.width}.html`);

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

// Composite one viewport shot + the scrolled content column into a full-page
// image. Runs inside the page on an off-DOM canvas; returns a PNG buffer.
async function stitchInnerScroll(page, maskCount) {
  // Start from the top so the viewport shot is the true first screen
  // (matters when a previous stitch pass left the container scrolled).
  await page.evaluate(() => {
    const inset = document.querySelector('[data-slot="sidebar-inset"]');
    if (!inset) return;
    const cands = [...inset.querySelectorAll("*")].filter((el) => {
      const s = getComputedStyle(el);
      return s.overflowY === "auto" || s.overflowY === "scroll";
    });
    let sc = null,
      best = -1;
    for (const c of cands) {
      const d = c.scrollHeight - c.clientHeight;
      if (d > best) {
        best = d;
        sc = c;
      }
    }
    if (sc) sc.scrollTop = 0;
  });
  await page.waitForTimeout(120);
  const firstShot = (await page.screenshot({ mask: maskFromCount(page, maskCount) })).toString("base64");
  const plan = await page.evaluate(() => {
    const inset = document.querySelector('[data-slot="sidebar-inset"]');
    if (!inset) return null;
    const cands = [...inset.querySelectorAll("*")].filter((el) => {
      const s = getComputedStyle(el);
      return s.overflowY === "auto" || s.overflowY === "scroll";
    });
    let sc = null,
      best = -1;
    for (const c of cands) {
      const d = c.scrollHeight - c.clientHeight;
      if (d > best) {
        best = d;
        sc = c;
      }
    }
    if (!sc || sc.scrollHeight <= sc.clientHeight + 1) return null;
    const r = sc.getBoundingClientRect();
    return {
      scrollHeight: sc.scrollHeight,
      clientHeight: sc.clientHeight,
      box: { x: r.x, y: r.y, width: r.width, height: r.height },
      vw: window.innerWidth,
      vh: window.innerHeight,
    };
  });
  if (!plan) return null;

  const slices = [];
  const steps = [];
  for (let y = 0; y < plan.scrollHeight; y += plan.clientHeight) steps.push(y);
  if (steps[steps.length - 1] < plan.scrollHeight - 2) steps.push(plan.scrollHeight); // final partial step
  // The scroll position clamps to scrollHeight - clientHeight; slices dedupe
  // through the actual scrollTop read back per slice, so over-pushing is safe.

  for (const y of steps) {
    await page.evaluate((top) => {
      const inset = document.querySelector('[data-slot="sidebar-inset"]');
      const cands = [...inset.querySelectorAll("*")].filter((el) => {
        const s = getComputedStyle(el);
        return s.overflowY === "auto" || s.overflowY === "scroll";
      });
      let sc = null,
        best = -1;
      for (const c of cands) {
        const d = c.scrollHeight - c.clientHeight;
        if (d > best) {
          best = d;
          sc = c;
        }
      }
      sc.scrollTop = top;
    }, y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(150);

    // Clip = the container's box intersected with the viewport; content is
    // scrolled under it, so this is the newly revealed band of the column.
    const clip = await page.evaluate(() => {
      const inset = document.querySelector('[data-slot="sidebar-inset"]');
      const cands = [...inset.querySelectorAll("*")].filter((el) => {
        const s = getComputedStyle(el);
        return s.overflowY === "auto" || s.overflowY === "scroll";
      });
      let sc = null,
        best = -1;
      for (const c of cands) {
        const d = c.scrollHeight - c.clientHeight;
        if (d > best) {
          best = d;
          sc = c;
        }
      }
      const r = sc.getBoundingClientRect();
      // Sticky elements pinned at the top of the container would repeat in
      // every slice; record how much of this slice they cover so the stitch
      // can skip it.
      let pinOverlap = 0;
      for (const el of sc.querySelectorAll("*")) {
        const s = getComputedStyle(el);
        if (s.position !== "sticky") continue;
        const er = el.getBoundingClientRect();
        if (er.top <= r.top + 2 && er.height > 4 && er.height < r.height - 8) {
          pinOverlap = Math.max(pinOverlap, er.bottom - r.top);
        }
      }
      return {
        x: Math.max(0, r.x),
        y: Math.max(0, r.y),
        width: Math.min(r.width, window.innerWidth - Math.max(0, r.x)),
        height: Math.min(r.height, window.innerHeight - Math.max(0, r.y)),
        pinOverlap,
        scrollTop: sc.scrollTop,
      };
    });
    if (clip.width <= 0 || clip.height <= 0) continue;
    const buf = await page.screenshot({ clip, mask: maskFromCount(page, maskCount) });
    slices.push({ y: clip.scrollTop, clip, b64: buf.toString("base64") });
  }

  const dataUrl = await page.evaluate(
    async ({ firstShot, slices, plan }) => {
      const load = (src) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = () => rej(new Error("slice PNG failed to decode"));
          img.src = `data:image/png;base64,${src}`;
        });
      const first = await load(firstShot);
      const canvas = document.createElement("canvas");
      canvas.width = plan.vw;
      // Content coordinate c sits at canvas y = containerTop + c, so the
      // canvas must extend to containerTop + scrollHeight or the bottom band
      // of content would be clipped.
      const contentTop = Math.max(0, plan.box.y);
      canvas.height = Math.max(plan.vh, contentTop + plan.scrollHeight);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(first, 0, 0);
      for (const s of slices) {
        const img = await load(s.b64);
        // Skip the pinned-sticky band at the top of the slice; draw the rest.
        const skip = Math.min(s.clip.pinOverlap || 0, img.height - 1);
        const drawH = img.height - skip;
        if (drawH > 0) ctx.drawImage(img, 0, skip, img.width, drawH, s.clip.x, s.clip.y + s.y + skip, img.width, drawH);
      }
      return canvas.toDataURL("image/png");
    },
    { firstShot, slices, plan }
  );
  const dims = { w: plan.vw, h: Math.max(plan.vh, Math.max(0, plan.box.y) + plan.scrollHeight) };
  return { buffer: Buffer.from(dataUrl.split(",")[1], "base64"), plan, dims };
}

function maskFromCount(page, count) {
  if (!count) return undefined;
  return Array.from({ length: count }, () => page.locator('[data-slot="avatar"], [data-slot="profile-card-avatar"]'));
}

// Capture every route x theme x viewport combination of one site into outDir.
// Identical logic for the live target and the local rebuild: same viewports,
// same theme switching (localStorage "theme" + reload), same aria-busy settle,
// same animation-killing CSS, same avatar masking, same corruption fallback.
export async function shootAll({ baseUrl, outDir, resume = false, log = console, routes = ROUTES, themes = THEMES, viewports = VIEWPORTS }) {
  const combos = [];
  for (const route of routes)
    for (const theme of themes)
      for (const vp of viewports) combos.push({ route, theme, vp });

  const alreadyDone = (c) =>
    existsSync(pngPath(outDir, c.route, c.theme, c.vp)) &&
    existsSync(htmlPath(outDir, c.route, c.theme, c.vp));
  const pending = resume ? combos.filter((c) => !alreadyDone(c)) : combos;

  log.log(`Target: ${baseUrl}`);
  log.log(
    `${combos.length} combinations total, ${pending.length} to capture (RESUME=${!!resume}).`
  );
  mkdirSync(outDir, { recursive: true });

  // --disable-lcd-text forces greyscale text antialiasing. Without it Chromium
  // picks subpixel (LCD) or greyscale per compositing layer, and which one a
  // page gets is a race: the same markup came out LCD on /deals and greyscale
  // on /customers, and /leads and /settings landed on opposite sides of it
  // between the reference and local runs. That is text ghosting across a whole
  // page for no reason, and it makes the numbers unreproducible run to run.
  const browser = await chromium.launch({ args: ["--disable-lcd-text"] });
  const failures = [];
  const stitched = [];

  for (const { route, theme, vp } of pending) {
    const label = `${route} ${theme} ${vp.width}x${vp.height}`;
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    try {
      // Prime localStorage on the site's origin, then reload so next-themes
      // applies the stored theme before first paint.
      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
      await page.evaluate((t) => localStorage.setItem("theme", t), theme);
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS });

      // Mandatory settle: streaming dashboards render panels after first paint.
      await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, {
        timeout: SETTLE_TIMEOUT_MS,
      });

      await page.addStyleTag({ content: KILL_MOTION_CSS });
      await page.waitForTimeout(250);

      // recharts animates in JavaScript (react-smooth), which the CSS above
      // cannot stop, so a settled aria-busy does not mean a settled chart.
      // Wait for every chart shape to stop moving instead of guessing a
      // duration: three consecutive identical geometry samples, 150ms apart.
      await page.waitForFunction(
        () => {
          const shapes = document.querySelectorAll(
            "path.recharts-sector, path.recharts-rectangle, path.recharts-curve, path.recharts-radial-bar-sector"
          );
          const w = /** @type {any} */ (window);
          if (!shapes.length) return true;
          let sig = "";
          for (const s of shapes) sig += s.getAttribute("d") || "";
          w.__shotStable = w.__shotSig === sig ? (w.__shotStable || 0) + 1 : 0;
          w.__shotSig = sig;
          return w.__shotStable >= 2;
        },
        null,
        { timeout: SETTLE_TIMEOUT_MS, polling: 150 }
      );

      // Mask every avatar wrapper with the default mask colour: the wrapper
      // [data-slot=avatar] exists on BOTH sides (reference img-only masking
      // left an asymmetry — our initials fallbacks showed as diffs).
      const maskCount = await page.locator('[data-slot="avatar"], [data-slot="profile-card-avatar"]').count();

      let png = pngPath(outDir, route, theme, vp);
      let buffer;
      let dims;
      const stitchedResult = await stitchInnerScroll(page, maskCount);
      if (stitchedResult) {
        stitched.push(label);
        buffer = stitchedResult.buffer;
        dims = stitchedResult.dims;
        const check = await pngLooksCorrupt(page, buffer);
        if (check.corrupt) {
          log.log(`RETRY ${label}: stitched image showed repeated slices, re-stitching once`);
          const again = await stitchInnerScroll(page, maskCount);
          buffer = again ? again.buffer : buffer;
        }
      } else {
        // No inner overflow: the page genuinely fits one screen.
        buffer = await page.screenshot({ fullPage: true, mask: maskFromCount(page, maskCount) });
        const check = await pngLooksCorrupt(page, buffer);
        dims = { w: check.w, h: check.h };
      }
      writeFileSync(png, buffer);
      writeFileSync(htmlPath(outDir, route, theme, vp), await page.content());
      log.log(`OK  ${label} (${dims.w}x${dims.h})`);
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      log.error(`FAILED ${label}: ${msg.split("\n")[0]}`);
      failures.push(`${label} (${msg.split("\n")[0]})`);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  log.log(`\nCaptured ${pending.length - failures.length}/${pending.length}.`);
  if (stitched.length) log.log(`Inner-scroll stitch used for: ${stitched.length}/${pending.length} shots`);
  if (failures.length) {
    log.log("Did not complete:");
    for (const f of failures) log.log(`  - ${f}`);
  }
  return { captured: pending.length - failures.length, total: pending.length, failures, stitched };
}
