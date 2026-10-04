/* Dead-CSS remover — uses a real CSS parser (postcss) so nested blocks,
   @media/@keyframes and comments can never be mis-split.
   A rule is removed only when *every* class in its selector is unused in the
   source tree, i.e. the class name never appears anywhere in app/ components/ lib/. */
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");

const CSS_FILE = "app/globals.css";

function collectCode() {
  const roots = ["app", "components", "lib", "types"];
  let out = "";
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
        walk(p);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        out += fs.readFileSync(p, "utf8");
      }
    }
  };
  for (const r of roots) if (fs.existsSync(r)) walk(r);
  return out;
}

const code = collectCode();
const css = fs.readFileSync(CSS_FILE, "utf8");
const root = postcss.parse(css);

/* class names never touched by the app but kept on purpose (state/animation) */
const KEEP_PREFIXES = ["is-", "animate-", "gpu", "perspective", "backface", "preserve", "sr-only"];

function classesIn(selector) {
  const out = [];
  const re = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g;
  let m;
  while ((m = re.exec(selector))) out.push(m[1]);
  return out;
}

function isUnused(name) {
  if (KEEP_PREFIXES.some((p) => name.startsWith(p))) return false;
  // word-boundary search in the source tree
  return !new RegExp(`(^|[^\\w-])${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\\w-])`).test(code);
}

let removed = [];
root.walkRules((rule) => {
  const parent = rule.parent;
  // never touch keyframe steps or font-face internals
  if (parent && parent.type === "atrule" && /keyframes/i.test(parent.name)) return;
  const selectors = rule.selectors;
  const allDead = selectors.every((sel) => {
    const cls = classesIn(sel);
    return cls.length > 0 && cls.every(isUnused);
  });
  if (allDead) {
    removed.push(selectors.join(", ").replace(/\s+/g, " ").slice(0, 90));
    rule.remove();
  }
});

/* afterwards drop empty at-rules (e.g. media queries with no rules left) */
root.walkAtRules((at) => {
  if (/media|supports|layer/i.test(at.name) && at.nodes && at.nodes.length === 0) at.remove();
});

const out = root.toString();
fs.writeFileSync(CSS_FILE, out);

const byPrefix = {};
for (const sel of removed) {
  const m = sel.match(/\.(-?[a-zA-Z]+)/);
  const key = m ? m[1].split("-")[0] : "?";
  byPrefix[key] = (byPrefix[key] || 0) + 1;
}
console.log("removed rules:", removed.length);
console.log("by prefix:", Object.entries(byPrefix).sort((a, b) => b[1] - a[1]).slice(0, 20));
console.log("lines:", css.split("\n").length, "->", out.split("\n").length);
