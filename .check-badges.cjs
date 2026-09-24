const fs = require("fs");
const html = fs.readFileSync("reference/deals-light-1440.html", "utf8");

// Every status badge in the reference: text + full class string
const parts = html.split('data-slot="deal-card-status"').slice(1);
const hueRe = /\b(bg|text|border|ring)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/;

for (const seg of parts) {
  const m = seg.match(/data-slot="badge" data-variant="(\w+)" class="([^"]+)"[^>]*>([^<]+)</);
  if (!m) continue;
  const [, variant, cls, text] = m;
  const hues = cls.match(new RegExp(hueRe, "g")) || [];
  console.log(
    text.padEnd(11),
    "variant=" + variant.padEnd(10),
    "hue-utilities: " + (hues.length ? hues.join(",") : "NONE"),
    "| token-colors:",
    (cls.match(/\b(bg|text|border)-(primary|secondary|foreground|border|card|muted)\b/g) || []).join(",") || "none"
  );
}
