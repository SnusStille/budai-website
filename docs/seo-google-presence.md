# Stilledev / Oliver Stille — Google presence

**Scope checked:** repository and the rendered production-mode preview, 26 November 2026. This is a technical readiness check, not a ranking report. Google Search Console and Google search-result data are not connected in this workspace; no positions, traffic or indexing outcomes are claimed.

## Baseline audit

- The site already had localized page metadata, canonical links, `robots.txt`, a sitemap, and a JSON-LD graph for `Organization`, `Person` and `SoftwareApplication`.
- The global graph did not include `WebSite`; Oliver's `Person.url` pointed to a homepage fragment rather than a dedicated profile page.
- `/labs` and `/sv/labs` were present in the sitemap but emitted `noindex, follow`, preventing the requested Labs search landing page from being indexed.
- The sitemap wrote the current request time as `<lastmod>` for every URL. These were not page modification dates, so they have been removed rather than fabricated.
- `/admin` was both disallowed in `robots.txt` and explicitly `noindex`. A crawler blocked by robots cannot read the page's `noindex` response. The route is now crawlable only to receive its existing `noindex` directives; authentication remains the access-control boundary.
- Public profile URLs already linked from the website are GitHub (`github.com/SnusStille`) and LinkedIn (`linkedin.com/in/oliver-stille-8bb48a403`). No Instagram profile or public SkandiaMäklarna biography was present in the repository, so none was invented or added to `sameAs`.
- The previous homepage byline exposed the city name Helsingborg. It was removed from that byline and is not repeated on the new profile. No private street address, private phone number or personal identity number was added to metadata or structured data.
- The phone presentation previously replaced marketing routes with the Playground landing page. Googlebot is already exempt from this presentation rule; the responsive `/labs` and `/oliver-stille` pages are now also directly reachable by people following search results on phones.
- Existing language routing provides stable English and Swedish home, Labs and contact URLs. The new profile has matching English and Swedish routes with reciprocal `hreflang` and canonical URLs.

## Changes

- Added `/oliver-stille` (English default) and `/sv/oliver-stille` (Swedish), with one server-rendered H1, a professional summary, BudAI and Labs links, a separately labeled SkandiaMäklarna experience entry, GitHub/LinkedIn links, and the public business contact `info@stilledev.se`.
- The experience text reuses the role wording already published on the site (“Meeting manager and coder” / “Mötesansvarig och kodare”), adds no dates, and explicitly separates the role from Stilledev. No “salesperson” title was added because no verified source for that title was supplied.
- Added a shared root JSON-LD graph for `WebSite`, `Organization`, `Person` and `SoftwareApplication`; the profile route adds `ProfilePage` and a `BreadcrumbList`. `sameAs` only includes the two public profiles already linked by Stilledev.
- Made Labs indexable and gave it distinct metadata, an explicit Stilledev Labs H1, and useful public information about its current status and BudAI. No unreleased client work or invented projects are shown.
- Added internal links from the homepage byline and company footer to Oliver's profile; added clear links between the profile, BudAI, Labs and the company contact.
- Reworked the sitemap to list canonical, indexable URLs only, include the profile language pair and omit synthetic `lastmod` dates. `robots.txt` points to that canonical sitemap.
- Added a credential-free `npm run seo:audit` command. It checks rendered metadata, canonical URLs, language tags, one server-rendered H1, indexability, JSON-LD parsing, sitemap/robots consistency and internal-link response status. It stores metadata-only snapshots under ignored `.cache/seo-audit/` for change comparisons; it does not collect Search Console data or crawl third-party profiles.

## Checks performed

- `node --check scripts/seo-audit.mjs`, `npm run typecheck`, `npm run lint`, `npm run build` and `git diff --check` passed. The build prints the repository's existing Next.js warnings: React 18 support is deprecated for Next.js 16, and the `middleware` convention is deprecated in favor of `proxy`.
- Focused Playwright checks passed: all 5 tests in `seo-presence.spec.ts` and 8 selected Labs/profile navigation, metadata and responsive tests in `stilledev-labs.spec.ts`.
- `npm run seo:audit -- --no-snapshot` checked 14 canonical pages, 14 sitemap URLs and 14 unique internal-link targets. It reported no issues in the configured checks.
- The rendered English and Swedish profile HTML was checked for canonical/hreflang metadata and parsed JSON-LD. The profile graph contains only the named professional entities and verified public profiles; no telephone or address properties or apparent personal-number pattern were found. The published contact is the requested business email. This cannot determine whether an unknown fact is private without owner input.
- A local mobile browser run of `/oliver-stille` at 390 × 844 reported FCP 176 ms, LCP 176 ms, CLS 0, DOMContentLoaded 59 ms, no horizontal overflow and no Three.js request. This is a single unthrottled local lab sample, not a repeatable production benchmark or Google's Core Web Vitals field data. No production CWV or search performance has been measured.
- Screenshots were inspected at desktop (1440 px) and mobile (390 px): the profile follows the existing dark/cyan visual language, the language selector and page links fit at mobile width, and contact and experience sections remain legible.

## Search Console — manual steps for Oliver

1. Sign in at Google Search Console with the Google account that should own the property.
2. Add a **Domain** property for `stilledev.se` and complete Google's DNS TXT verification at the domain provider. Keep the verification record in place. A Domain property includes both HTTP/HTTPS and `www` variants.
3. In **Sitemaps**, submit `https://stilledev.se/sitemap.xml`. Confirm the fetch and discovered URL count; resolve any reported fetch or parsing error.
4. In **URL inspection**, inspect and request indexing for:
   - `https://stilledev.se/oliver-stille`
   - `https://stilledev.se/sv/oliver-stille`
   - `https://stilledev.se/labs`
   - `https://stilledev.se/sv/labs`
   - `https://stilledev.se/` and `https://stilledev.se/sv`
   Confirm that Google's selected canonical matches each language URL and that the rendered page contains the expected H1 and content. Requests are suggestions, not guarantees.
5. In **Page indexing**, review crawled/not-indexed, duplicate canonical and robots findings. The admin route should remain excluded through its `noindex` response; do not remove access controls to improve indexing.
6. In **Core Web Vitals**, review mobile and desktop field data once Google has enough real-user data. The local mobile layout checks in this repository are not a substitute for field data. Review **Performance → Search results** after enough impressions accrue; use the page/query filters for Oliver, Stilledev and Labs. Only report values shown by Search Console.
7. For old personal information, first remove or correct it at the source and ask that site's owner to update it. Then use Search Console **Removals** for a temporary urgent hide while Google recrawls. For content on sites Stilledev does not control, contact the publisher and use Google's public outdated-content/personal-information request flows where eligible. A removal request does not erase the source and is not guaranteed.

## Still needs owner confirmation

- Confirm the exact SkandiaMäklarna role wording and whether it is current. The page currently preserves the existing public wording without dates or an inferred sales title.
- Send the exact official Instagram (and any other professional-profile) URLs if they should be listed. Until then they are intentionally omitted from visible links and `sameAs`.
- If there is a public employer/staff page for the SkandiaMäklarna role, provide its exact URL before linking to or marking up that relationship.
- Complete Search Console DNS verification and review actual indexing, query, security, manual-action and Core Web Vitals reports. None can be inspected from this repository alone.

Google controls crawling, indexing and result presentation. This work improves the site's clarity and technical eligibility but cannot guarantee a specific position, knowledge panel or result layout.
