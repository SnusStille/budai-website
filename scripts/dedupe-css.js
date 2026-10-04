const postcss = require('postcss');
const fs = require('fs');
const FILE = 'app/globals.css';
const src = fs.readFileSync(FILE, 'utf8');
const root = postcss.parse(src);

// collect top-level rules per selector
const groups = {};
root.walkRules((rule) => {
  if (rule.parent.type !== 'root') return;
  const sel = rule.selector.trim();
  if (!/^[.a-zA-Z]/.test(sel)) return;
  (groups[sel] = groups[sel] || []).push(rule);
});

let removedDecls = 0;
let removedRules = 0;
for (const [sel, rules] of Object.entries(groups)) {
  if (rules.length < 2) continue;
  // properties set by the LAST rule already win — drop them from earlier ones
  const lastProps = new Set(
    rules[rules.length - 1].nodes.filter((n) => n.type === 'decl').map((n) => n.prop)
  );
  for (let i = 0; i < rules.length - 1; i++) {
    const r = rules[i];
    r.each((node) => {
      if (node.type === 'decl' && lastProps.has(node.prop)) {
        node.remove();
        removedDecls++;
      }
    });
    if (!r.nodes || r.nodes.length === 0) {
      r.remove();
      removedRules++;
    }
  }
}
fs.writeFileSync(FILE, root.toString());
console.log('removed declarations:', removedDecls, '| removed empty rules:', removedRules);
