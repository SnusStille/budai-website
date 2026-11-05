/**
 * Repeatable secret scan (audit point B4).
 *
 *   npm run scan:secrets                    # tracked working tree + full git history
 *   npm run scan:secrets -- --working-tree  # tracked files only (fast, shallow clones)
 *   npm run scan:secrets -- --update-baseline  # rewrite the reviewed baseline
 *
 * Findings already recorded in scripts/secret-scan-baseline.json are reported
 * as acknowledged and do not fail the run. Everything else exits 1, so CI
 * fails on a newly committed credential. The baseline stores only hashes and
 * pattern ids — never the secret itself.
 *
 * This is a first line of defence, not a replacement for GitHub secret
 * scanning, push protection or provider-side key rotation.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "scripts", "secret-scan-baseline.json");
const updateBaseline = process.argv.includes("--update-baseline");
const workingTreeOnly = process.argv.includes("--working-tree");

const PATTERNS = [
  { id: "anthropic-api-key", re: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { id: "openai-api-key", re: /\bsk-[A-Za-z0-9]{32,}/g },
  { id: "github-token", re: /\bgh[pousr]_[A-Za-z0-9]{36,}/g },
  { id: "aws-access-key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
  { id: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { id: "slack-token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g },
  { id: "supabase-secret-key", re: /\bsb_secret_[A-Za-z0-9_-]{10,}/g },
  {
    id: "hardcoded-credential-fallback",
    re: /\w*(?:PASSWORD|SECRET|API_KEY|TOKEN)\w*\s*(?:\|\||[:=])\s*["']([^"']{6,})["']/g,
    group: 1,
  },
  {
    id: "dotenv-credential",
    re: /^[+]?\s*[A-Za-z0-9_]*(?:PASSWORD|SECRET|API_KEY|TOKEN|SERVICE_ROLE_KEY)[A-Za-z0-9_]*\s*=\s*([^\s#]{6,})/gm,
    group: 1,
  },
  {
    // Credentials pasted into markdown or comments (`` `password` is `value` ``).
    id: "documented-credential-literal",
    re: /(?:password|access key|admin key|default key)\W{0,25}\*{0,2}`([A-Za-z0-9!@#$%^&*_\-]{8,})`/gi,
    group: 1,
  },
  {
    id: "documented-credential-plain",
    re: /(?:Admin password|Password):\s*\**([A-Za-z0-9!@#$%^&*_\-]{8,})\**/gi,
    group: 1,
  },
];

// Obvious placeholders, fixtures and env references. Reviewed, intentionally
// narrow — do not add broad words like "secret" or "key" here.
const ALLOW_VALUE =
    /your|example|placeholder|xxx|change|dummy|redact|\[removed\]|undefined|null|process\.env|\$\{|<|\.\.\.|^(?:NEXT_PUBLIC_|SUPABASE_|ANTHROPIC_|OPENAI_|ADMIN_|VITE_)|^admin[A-Z]|^(?:unit-)?test[-_]|^not-|^\$|^env\(|^=|^\s*$/i;
const SKIP_PATH =
  /(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|[^/]+\.(?:png|jpe?g|gif|webp|avif|ico|woff2?|ttf|eot|mp4|pdf|zip|map)|\.next|node_modules|test-results|playwright-report)(?:$|\/)/i;

function git(args, encoding = "utf8") {
  return execFileSync("git", args, { cwd: ROOT, encoding, maxBuffer: 64 * 1024 * 1024 });
}

function mask(value) {
  return `${value.slice(0, 2)}… (${value.length} chars)`;
}

function scanLine(line, source, file, lineNo, out) {
  if (line.length > 20_000) return;
  for (const { id, re, group } of PATTERNS) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(line)) !== null) {
      const value = group ? match[group] : match[0];
      if (!value || ALLOW_VALUE.test(value)) continue;
      const fingerprint = createHash("sha256")
        .update(`${source}|${file}|${id}|${lineNo}|${value}`)
        .digest("hex")
        .slice(0, 16);
      out.push({ id: fingerprint, pattern: id, source, file, line: lineNo, sample: mask(value) });
      if (!group) break;
    }
  }
}

const findings = [];
let files = 0;
let commits = 0;

// 1. Tracked files in the current tree.
const tracked = git(["ls-files", "-z"], "buffer").toString("utf8").split("\0").filter(Boolean);
for (const file of tracked) {
  if (SKIP_PATH.test(file) || !existsSync(path.join(ROOT, file))) continue;
  const buf = readFileSync(path.join(ROOT, file));
  if (buf.includes(0)) continue; // binary
  files++;
  buf
    .toString("utf8")
    .split("\n")
    .forEach((line, i) => scanLine(line, "working-tree", file, i + 1, findings));
}

// 2. Added lines in every commit reachable from any ref.
if (!workingTreeOnly) {
  const patch = git([
    "log", "--all", "-p", "-U0", "--format=@@@COMMIT %H", "--", ".",
  ]);
  let commit = "unknown";
  let file = "unknown";
  let lineNo = 0;
  for (const line of patch.split("\n")) {
    if (line.startsWith("@@@COMMIT ")) {
      commit = line.slice(10).trim();
      commits++;
      continue;
    }
    if (line.startsWith("+++ b/")) {
      file = line.slice(6).trim();
      lineNo = 0;
      continue;
    }
    if (line.startsWith("+++ ") || line.startsWith("--- ")) continue;
    if (!line.startsWith("+")) continue;
    lineNo++;
    if (SKIP_PATH.test(file)) continue;
    scanLine(line.slice(1), commit, file, lineNo, findings);
  }
}

// Deduplicate identical fingerprints (a value can match two patterns).
const unique = [...new Map(findings.map((f) => [f.id, f])).values()];

let baseline = { findings: [] };
if (existsSync(BASELINE_PATH) && !updateBaseline) {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
}
const acknowledged = new Set((baseline.findings ?? []).map((f) => f.id));
const fresh = unique.filter((f) => !acknowledged.has(f.id));

if (updateBaseline) {
  const next = {
    comment:
      "Reviewed findings only. Hashes, never secret values. Regenerate with `npm run scan:secrets -- --update-baseline` after reviewing each finding.",
    findings: unique.map((f) => ({
      id: f.id,
      pattern: f.pattern,
      note: `${f.source === "working-tree" ? "working tree" : "history"} · ${f.file}`,
    })),
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Baseline written: ${next.findings.length} reviewed finding(s) → ${path.relative(ROOT, BASELINE_PATH)}`);
  process.exit(0);
}

console.log(
  `Secret scan: ${files} tracked file(s), ${workingTreeOnly ? "history skipped" : `${commits} commit(s)`}, ` +
    `${unique.length} finding(s), ${unique.length - fresh.length} acknowledged, ${fresh.length} new.`
);

if (fresh.length) {
  for (const f of fresh) {
    console.error(
      `  NEW ${f.pattern} · ${f.source} · ${f.file}:${f.line} · ${f.sample} · id=${f.id}`
    );
  }
  console.error(
    "Rotate any real credential immediately, remove it from the tree, then review the baseline. " +
      "Never add an unreviewed finding to scripts/secret-scan-baseline.json."
  );
  process.exit(1);
}

console.log("Secret scan: clean (no unacknowledged credentials).");
