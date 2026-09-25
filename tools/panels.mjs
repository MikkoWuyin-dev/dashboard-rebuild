// Dev helper: dump the panel structure (titles, layout containers, widget
// kinds) of every route from its reference HTML. Usage:
//   node tools/panels.mjs reference/root-light-1440.html
import { readFileSync } from "node:fs";

const file = process.argv[2];
const html = readFileSync(file, "utf8");
const start = html.indexOf('<div class="flex flex-1 flex-col gap-4 overflow-auto');
const main = html.slice(start, html.indexOf("</main>", start));

// Tokenize
const re = /<\/?([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^"'>])*)>/g;
let m;
let depth = 0;
const VOID = new Set([
  "img", "br", "hr", "input", "meta", "link", "path", "circle", "rect", "line",
  "polyline", "polygon", "ellipse", "use", "stop", "col", "area", "base",
  "source", "track", "wbr",
]);
const events = [];

function textBetween(from, to) {
  return html.slice(from, to).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

const isInteresting = (attrs, tag) => {
  if (tag === "svg") return null;
  const slot = /data-slot="([^"]*)"/.exec(attrs)?.[1];
  const cls = /class="([^"]*)"/.exec(attrs)?.[1];
  if (cls && /order-\d/.test(cls)) return { kind: "layout", label: cls.match(/order-\d/)[0] };
  if (cls && /\bcontents\b/.test(cls)) return { kind: "layout", label: "col" };
  if (cls && /^grid | flex flex-col gap-4 lg:flex-row/.test(cls)) return { kind: "layout", label: "row" };
  if (slot === "card") {
    const size = /data-size="([^"]*)"/.exec(attrs)?.[1] ?? "default";
    const h = /\bh-\d+\b/.exec(cls ?? "")?.[0] ?? "";
    return { kind: "card", label: `${size}${h ? " " + h : ""}` };
  }
  if (slot === "metric-card-title") return { kind: "metric-title", label: "" };
  if (slot === "card-title") return { kind: "title", label: "" };
  if (slot === "card-description") return { kind: "desc", label: "" };
  if (slot === "chart") {
    return { kind: "chart", label: "" };
  }
  if (slot === "table") return { kind: "table", label: "" };
  if (slot === "item-group") return { kind: "item-group", label: "" };
  if (slot === "progress") return { kind: "progress", label: "" };
  if (slot === "avatar") return { kind: "avatar", label: "" };
  return null;
};

re.lastIndex = start;

while ((m = re.exec(main))) {
  const isClose = m[0].startsWith("</");
  const tag = m[1].toLowerCase();
  const attrs = m[2] ?? "";
  const info = isInteresting(attrs, tag);

  if (!isClose && !VOID.has(tag)) {
    if (info) {
      events.push({ depth, ...info, text: "" });
      if (["metric-title", "title", "desc"].includes(info.kind)) {
        // capture text immediately following
        const nextText = textBetween(re.lastIndex, re.lastIndex + 400);
        events[events.length - 1].text = nextText.slice(0, 90);
      }
    }
    depth++;
  } else if (isClose) {
    depth = Math.max(0, depth - 1);
  }
}

for (const e of events) {
  const pad = "  ".repeat(Math.min(e.depth, 14));
  const label = e.text ? `${e.label} ${JSON.stringify(e.text)}` : e.label;
  console.log(`${pad}[${e.kind}] ${label}`);
}
