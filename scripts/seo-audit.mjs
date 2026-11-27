#!/usr/bin/env node
/**
 * Small, credential-free technical SEO crawl for the canonical public pages.
 * Start the site first, then run SEO_BASE_URL=http://127.0.0.1:3000 npm run seo:audit.
 * It only requests pages on that origin; Google Search Console data is never guessed.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = new URL(process.env.SEO_BASE_URL || "http://127.0.0.1:3000");
const canonicalOrigin = process.env.SEO_CANONICAL_ORIGIN || "https://stilledev.se";
const indexablePaths = [
  "/", "/sv", "/contact", "/sv/contact", "/changelog",
  "/legal/privacy", "/legal/terms", "/legal/cookies", "/legal/gdpr", "/legal/data",
];
const noindexPaths = ["/labs", "/sv/labs"];
const retiredProfileRedirects = [["/oliver-stille", "/"], ["/sv/oliver-stille", "/sv"]];
const timeoutMs = 12_000;
const issues = [];
const pages = [];
const htmlByPath = new Map();

function issue(level, pathName, message) { issues.push({ level, path: pathName, message }); }
function decodeHtml(value = "") {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1].toLowerCase(), decodeHtml(m[2] ?? m[3] ?? "")]));
}
function readTags(html, tagName) { return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((m) => ({ raw: m[0], attrs: attributes(m[0]) })); }
function canonicalHref(html) { return readTags(html, "link").find(({ attrs }) => attrs.rel?.split(/\s+/).includes("canonical"))?.attrs.href || ""; }
function robotsValue(html) { return readTags(html, "meta").find(({ attrs }) => attrs.name?.toLowerCase() === "robots")?.attrs.content?.toLowerCase() || ""; }
function titleValue(html) { return decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || ""); }
function descriptionValue(html) { return readTags(html, "meta").find(({ attrs }) => attrs.name?.toLowerCase() === "description")?.attrs.content || ""; }
function jsonLd(html, pathName) {
  const output = [];
  for (const match of html.matchAll(/<script\b(?=[^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { output.push(JSON.parse(match[1])); }
    catch { issue("error", pathName, "Invalid JSON-LD block"); }
  }
  return output;
}
async function fetchPage(pathName, { redirect = "follow" } = {}) {
  const url = new URL(pathName, base);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect, signal: controller.signal, headers: { "user-agent": "StilledevSeoAudit/1.0" } });
    const body = await response.text();
    return { response, body };
  } finally { clearTimeout(timer); }
}
function flattenTypes(data) {
  return data.flatMap((entry) => Array.isArray(entry["@graph"]) ? entry["@graph"] : [entry]);
}

for (const pathName of indexablePaths) {
  try {
    const { response, body } = await fetchPage(pathName);
    htmlByPath.set(pathName, body);
    const title = titleValue(body);
    const description = descriptionValue(body);
    const canonical = canonicalHref(body);
    const robots = robotsValue(body);
    const lang = body.match(/<html\b[^>]*\blang="([^"]+)"/i)?.[1] || "";
    const h1Count = [...body.matchAll(/<h1\b/gi)].length;
    const types = flattenTypes(jsonLd(body, pathName)).flatMap((item) => Array.isArray(item["@type"]) ? item["@type"] : item["@type"] ? [item["@type"]] : []);
    const record = { path: pathName, status: response.status, title, description, canonical, robots: robots || "(inherited)", lang, h1Count, schemaTypes: [...new Set(types)] };
    pages.push(record);
    if (!response.ok) issue("error", pathName, `HTTP ${response.status}`);
    if (!title) issue("error", pathName, "Missing title");
    else if (title.length > 70) issue("warning", pathName, `Title is ${title.length} characters; review search-result truncation`);
    if (!description) issue("error", pathName, "Missing meta description");
    else if (description.length < 70 || description.length > 175) issue("warning", pathName, `Meta description is ${description.length} characters; review length and clarity`);
    if (!canonical) issue("error", pathName, "Missing canonical link");
    else if (new URL(canonical).origin !== canonicalOrigin || new URL(canonical).pathname.replace(/\/$/, "") !== (pathName === "/" ? "" : pathName)) issue("error", pathName, `Unexpected canonical: ${canonical}`);
    if (/\bnoindex\b/.test(robots)) issue("error", pathName, "A sitemap/public page is marked noindex");
    if (!lang) issue("error", pathName, "Missing html lang attribute");
    if (h1Count !== 1) issue("warning", pathName, `Expected one server-rendered H1; found ${h1Count}`);
  } catch (error) {
    issue("error", pathName, `Request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const pathName of noindexPaths) {
  try {
    const { response, body } = await fetchPage(pathName);
    if (!response.ok) issue("error", pathName, `HTTP ${response.status}`);
    if (!/\bnoindex\b/i.test(robotsValue(body))) issue("error", pathName, "Placeholder is missing its intentional noindex directive");
  } catch (error) {
    issue("error", pathName, `Request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const [pathName, destination] of retiredProfileRedirects) {
  try {
    const { response } = await fetchPage(pathName, { redirect: "manual" });
    const location = response.headers.get("location");
    const target = location ? new URL(location, base).pathname : "";
    if (![301, 308].includes(response.status) || target !== destination) {
      issue("error", pathName, `Expected permanent redirect to ${destination}; received ${response.status} ${location || "without Location"}`);
    }
  } catch (error) {
    issue("error", pathName, `Request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

let sitemapText = "";
try {
  const { response, body } = await fetchPage("/sitemap.xml");
  sitemapText = body;
  if (!response.ok) issue("error", "/sitemap.xml", `HTTP ${response.status}`);
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeHtml(m[1]));
  if (!locs.length) issue("error", "/sitemap.xml", "Sitemap contains no loc entries");
  if (new Set(locs).size !== locs.length) issue("error", "/sitemap.xml", "Sitemap contains duplicate loc entries");
  if (/<lastmod>[^<]+<\/lastmod>/i.test(body)) issue("warning", "/sitemap.xml", "Review lastmod values: only publish real content modification dates");
  for (const pathName of indexablePaths) {
    const expected = `${canonicalOrigin}${pathName === "/" ? "" : pathName}`;
    if (!locs.includes(expected)) issue("error", "/sitemap.xml", `Missing canonical URL ${expected}`);
  }
  const listedPaths = locs.map((loc) => new URL(loc).pathname || "/");
  for (const pathName of listedPaths) {
    const page = pages.find((entry) => entry.path === pathName);
    if (page && /\bnoindex\b/i.test(page.robots)) issue("error", pathName, "URL appears in sitemap and is noindex");
  }
} catch (error) { issue("error", "/sitemap.xml", `Request failed: ${error instanceof Error ? error.message : String(error)}`); }

try {
  const { response, body } = await fetchPage("/robots.txt");
  if (!response.ok) issue("error", "/robots.txt", `HTTP ${response.status}`);
  if (!body.includes(`${canonicalOrigin}/sitemap.xml`)) issue("error", "/robots.txt", "Robots.txt does not reference the canonical sitemap");
} catch (error) { issue("error", "/robots.txt", `Request failed: ${error instanceof Error ? error.message : String(error)}`); }

const internalTargets = new Map();
for (const [sourcePath, html] of htmlByPath) {
  for (const { attrs } of readTags(html, "a")) {
    const href = attrs.href;
    if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    try {
      const target = new URL(href, new URL(sourcePath, base));
      if (target.origin !== base.origin && target.origin !== canonicalOrigin) continue;
      if (target.pathname.startsWith("/api/") || /\.(?:png|jpe?g|webp|svg|pdf|zip|mp[34])$/i.test(target.pathname)) continue;
      const targetPath = `${target.pathname || "/"}${target.search}`;
      if (!internalTargets.has(targetPath)) internalTargets.set(targetPath, sourcePath);
    } catch { issue("warning", sourcePath, `Could not parse internal href: ${href.slice(0, 100)}`); }
  }
}
const targets = [...internalTargets.entries()].slice(0, 250);
let nextTarget = 0;
await Promise.all(Array.from({ length: Math.min(8, targets.length) }, async () => {
  while (nextTarget < targets.length) {
    const [targetPath, sourcePath] = targets[nextTarget++];
    try {
      const { response } = await fetchPage(targetPath);
      if (!response.ok) issue("warning", sourcePath, `Internal link ${targetPath} returned HTTP ${response.status}`);
    } catch (error) { issue("warning", sourcePath, `Internal link ${targetPath} could not be checked (${error instanceof Error ? error.message : String(error)})`); }
  }
}));

const report = { generatedAt: new Date().toISOString(), baseUrl: base.origin, canonicalOrigin, pageCount: pages.length, sitemapCount: (sitemapText.match(/<loc>/g) || []).length, internalLinksChecked: targets.length, pages, issues };
const snapshotDir = path.join(root, ".cache", "seo-audit");
const noSnapshot = process.argv.includes("--no-snapshot");
let changes = [];
if (!noSnapshot) {
  await mkdir(snapshotDir, { recursive: true });
  const latestPath = path.join(snapshotDir, "latest.json");
  try {
    const previous = JSON.parse(await readFile(latestPath, "utf8"));
    const before = new Map((previous.pages || []).map((page) => [page.path, page]));
    changes = pages.flatMap((page) => {
      const old = before.get(page.path);
      if (!old) return [`${page.path}: newly audited`];
      return ["title", "description", "canonical", "robots"].filter((key) => old[key] !== page[key]).map((key) => `${page.path}: ${key} changed`);
    });
  } catch { changes = ["No previous SEO snapshot; this run establishes the baseline."]; }
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  await writeFile(latestPath, serialized);
  const stamp = report.generatedAt.replace(/[:.]/g, "-");
  await writeFile(path.join(snapshotDir, `${stamp}.json`), serialized);
  const history = (await readdir(snapshotDir)).filter((name) => /^\d{4}-.*\.json$/.test(name)).sort();
  await Promise.all(history.slice(0, Math.max(0, history.length - 30)).map((name) => import("node:fs/promises").then(({ unlink }) => unlink(path.join(snapshotDir, name)))));
}

console.log(`SEO audit: ${base.origin} → ${canonicalOrigin}`);
console.log(`${pages.length} canonical pages · ${report.sitemapCount} sitemap URLs · ${report.internalLinksChecked} internal links checked`);
for (const page of pages) console.log(`${page.status} ${page.path.padEnd(22)} ${page.lang.padEnd(2)} H1:${page.h1Count} ${page.title}`);
if (changes.length) console.log(`\nChanges since previous snapshot:\n- ${changes.join("\n- ")}`);
if (issues.length) {
  console.log(`\n${issues.length} review item(s):`);
  for (const entry of issues) console.log(`- ${entry.level.toUpperCase()} ${entry.path}: ${entry.message}`);
} else console.log("\nNo technical SEO issues detected in the configured checks.");
if (!noSnapshot) console.log(`Snapshot history: ${path.relative(root, snapshotDir)} (metadata only; no rankings/traffic data)`);
if (issues.some((entry) => entry.level === "error")) process.exitCode = 1;
