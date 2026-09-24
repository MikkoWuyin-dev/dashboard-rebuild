// Dev helper: print a readable tree of the main-content region of a reference
// HTML capture. Usage: node tools/tree.mjs reference/root-light-1440.html
import { readFileSync } from "node:fs";

const file = process.argv[2];
const html = readFileSync(file, "utf8");
const body = html.slice(html.indexOf("<body"));

const VOID = new Set([
  "img", "br", "hr", "input", "meta", "link", "path", "circle", "rect", "line",
  "polyline", "polygon", "ellipse", "use", "stop", "col", "area", "base",
  "source", "track", "wbr",
]);

const re = /<\/?([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^"'>])*)>/g;
let m;
let depth = 0;
let lastTextEnd = 0;
const out = [];
let skipDepth = null;

function textBetween(from, to) {
  return html.slice(from, to).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// Start after the header: the scrollable content container.
const start = body.indexOf('<div class="flex flex-1 flex-col gap-4 overflow-auto');
if (start === -1) {
  console.error("content container not found");
  process.exit(1);
}
re.lastIndex = start;
lastTextEnd = start;
let contentDepth = null;

while ((m = re.exec(body))) {
  const isClose = m[0].startsWith("</");
  const tag = m[1].toLowerCase();
  const attrs = m[2] ?? "";
  const idx = body.indexOf(m[0], re.lastIndex - m[0].length);

  if (!isClose && !VOID.has(tag)) {
    const text = textBetween(lastTextEnd, idx);
    if (text && contentDepth !== null) out.push(`${"  ".repeat(contentDepth)}"${text}"`);
    lastTextEnd = re.lastIndex;
    if (contentDepth !== null && contentDepth < 18) {
      const slot = /data-slot="([^"]*)"/.exec(attrs)?.[1];
      const cls = /class="([^"]*)"/.exec(attrs)?.[1];
      const icon = /class="lucide lucide-([\w-]+)/.exec(attrs)?.[1];
      const href = / href="([^"]*)"/.exec(attrs)?.[1];
      const style = /style="([^"]*)"/.exec(attrs)?.[1];
      const bits = [
        slot ? `slot=${slot}` : null,
        tag === "svg" ? `icon=${icon ?? "svg"}` : null,
        tag === "img" ? `img src=${/src="([^"]*)"/.exec(attrs)?.[1] ?? ""}` : null,
        href ? `href=${href}` : null,
        style ? `style=${style}` : null,
        cls
          ? `cls=${cls
              .split(/\s+/)
              .filter(
                (c) =>
                  !c.startsWith("group-") &&
                  !c.startsWith("hover:") &&
                  !c.startsWith("focus") &&
                  !c.startsWith("active:") &&
                  !c.startsWith("disabled:") &&
                  !c.startsWith("aria-") &&
                  !c.startsWith("data-open") &&
                  !c.startsWith("dark:") &&
                  !c.startsWith("peer-") &&
                  c !== "group"
              )
              .join(" ")
              .slice(0, 200)}`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
      out.push(`${"  ".repeat(contentDepth)}<${tag === "svg" ? "svg" : tag}${bits ? " " + bits : ""}>`);
    }
    contentDepth = contentDepth === null ? 0 : contentDepth + 1;
  } else if (isClose) {
    if (contentDepth !== null) contentDepth = Math.max(0, contentDepth - 1);
    lastTextEnd = re.lastIndex;
  }
}

console.log(out.join("\n"));
