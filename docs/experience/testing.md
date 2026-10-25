# Cinematic experience: reproducible verification

## Run the production suite

Use an **unconfigured local test environment**, not a production database or real user account. Streamed responses in the UI tests are controlled browser transport doubles; they are not application features or claims of real provider output. The standard Supabase host is blocked by the browser tests, and the waitlist test uses an `.invalid` email address. Browser interception does not block server-side actions: the unconfigured/test-database requirement is important.

```bash
npm ci
npm run build
npm test
```

Playwright starts `next start` if no server is already listening on port 3000. Alternatively, start the preview yourself:

```bash
npm run start -- --hostname 0.0.0.0
npm test
```

Useful commands:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
npm test -- --grep 'Builder is real'
```

`test:unit` runs pure intro/camera/scroll/code tests without starting a web server or browser. The full suite contains **29 tests: 4 pure tests and 25 real-browser tests**, with no retries.

### Browser runtime

The restricted Linux environment cannot download Playwright's normal browser from its external CDN. `scripts/test-browser.mjs` instead provisions Chromium **153** from the npm-distributed `@sparticuz/chromium` package and uses Playwright **1.64.1**. That optional development-only browser harness requires **Node 22.17+ on the 22.x line, or Node 24+**. It is not shipped in the website runtime and does not change Next's production Node requirements.

The script configures the packaged Linux shared libraries automatically. It retains actual SwiftShader **WebGL2**, but adds `--disable-gpu-compositing` to work around a sandbox software-compositor RAF starvation issue. It does **not** disable WebGL or mock the brain/world in the ordinary visual tests. No application code uses that browser flag.

On a normal workstation, Playwright's managed Chromium is an alternative:

```bash
npx playwright install chromium
npx playwright test
```

The managed-browser alternative is documented for convenience; the recorded runs below used the packaged Linux Chromium. No Safari, Firefox or physical-device run is claimed.

## Development / Strict Mode

`reactStrictMode: true` is retained in the existing Next configuration. Stop the production server first: development and production share `.next`.

```bash
npm run dev -- --hostname 0.0.0.0 --port 3001
# In another terminal, after the first compilation:
TEST_BASE_URL=http://127.0.0.1:3001 npm test -- --grep 'fresh visit|keyboard users|Builder is real|mobile 390|real Playground UI'
```

The five-case development pass checks literal typing and persistent ownership under effect setup/cleanup, keyboard skip, reversible room/camera/code, the 390px layout/menu, and actual Playground request/decoder/history UI. The cold development run exposed a skipped-letter timing edge case; the one-character-at-a-time cadence fix was applied and the five-case pass rerun successfully.

## Coverage

| Area | Actual assertions |
| --- | --- |
| Fresh intro | Maximum one loader and one brain; all prefixes `B`, `BU`, `BUD`, `BUDA`, `BUDAI`; real `data-rendered=true`; the exact same canvas after handoff; no premature world; no ordinary console/page errors |
| Return/navigation | Reload, native anchors, legal route, browser back, language switching: no second intro; no leaked body overflow lock |
| Keyboard | Main inert during intro; Tab reaches Skip; Enter completes it; focus returns to main; root skip target works; mobile menu Escape/overflow cleanup |
| GPU lifecycle | Hero draw calls stop when faded out and resume on reverse scroll; shader-failure allocations freed; WebGL unavailable fallback; lost world context removed; partial factory failure removes both canvas and DOM renderer; preference toggling leaves one world |
| Native scroll | Camera positions and DOM code reconstructed exactly on reverse; mouse wheel still moves the document; illustrative code sends **zero** `/api/playground` requests |
| Connected chapters | Capabilities, Builder, Waitlist and Roadmap use different camera positions in the same stage; all four real roadmap milestones remain visible/readable and focusable |
| Responsive | 1440×1000, 390×844 and 360×740; no horizontal page overflow; editor fits inside the mobile monitor and below the heading; desktop/mobile resizing retains one world; email field is at least 16px |
| Reduced motion / no JS | No intro or animated WebGL under reduced motion; full code in the static frame; readable form; no-JS rendering exposes content/navigation and no blocking loader |
| Slow/failing intro | Delayed brain bundle falls back; a deliberately stalled RAF cannot hold the page or restart a completed intro |
| Playground | Real persona/language/message payload; progressive text and NUL metadata trailer; existing Stop reader cancellation; visible error/retry state; local conversation persistence and explicit history reopening; Hero Ask handoff; guest image upload opens existing account gate |
| Waitlist | Native required/email validation; individual/company fields; team/use-case/referral controls; honest unavailable error and no fabricated production signup/count |
| Routes / APIs | Home, admin, four legal pages; health/features/manifest; invalid shared-conversation 404; unauthorized/unconfigured admin status; safe empty chat/image requests return the existing validation/configuration/auth status |
| Pure functions | Bounded intro policy and slow-frame cadence; finite/continuous/reversible camera; reversible chapter mapping; monotonic bounded code reveal; tokenizer preserves every source character |

## Artifacts

`npm test` creates an ignored `playwright-report/index.html`, `test-results/*.png`, and failure-only traces/screenshots. The fresh-intro test attaches timestamped DOM observations to the HTML report. Desktop and both mobile intro tests attach observed layout shifts and enforce a total below 0.03. Screenshots include desktop intro/hero/Builder/Capabilities/Waitlist/Roadmap, both mobile widths, and reduced motion. They were visually inspected during refinement. Generated browser outputs are intentionally not committed.

Vercel analytics requests are suppressed in the test browser; analytics delivery is **not** verified. Real Anthropic output, successful magic links/OAuth, signed-in vision, cloud history/memory and successful Supabase insertion require the actual service configuration. The test doubles and missing-configuration paths do not prove those integrations end to end. API implementations and existing environment variable names were not replaced.

See [`implementation-report.md`](./implementation-report.md) for recorded results and remaining limitations, and [`sources-and-licenses.md`](./sources-and-licenses.md) for exact source/asset provenance.
