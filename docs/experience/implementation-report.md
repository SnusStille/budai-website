# BudAI — cinematic website upgrade

> Historical baseline / pre-Confluence iteration. Current implementation, recovery details and **53-test** verification: [Confluence verification](./confluence-verification.md) and [current overhaul audit](./current-overhaul.md).

> Historical 2026-10-24 baseline report. The 2026-10-25 rebuild adds a distinct neural passage, new physical Capabilities, Next Signal and a redesigned identity. See [rebuild-research.md](./rebuild-research.md), [brand.md](./brand.md) and [the current rebuild report](./rebuild-report.md). The results below describe the earlier baseline, not the latest release.

**2026-10-24 · `arena/74ed593c-budai-website`**

This is an upgrade of the existing application, not a replacement template. The live workspace preview runs the optimized Next production build. At the time of this baseline report no push or deployment had been performed; the five baseline commits were subsequently pushed. Deployment is not claimed.

## Delivered

### One recovered brain, one opening

- Recovered the repository's actual anatomical WebGL2 brain from [`43f44c9`](https://github.com/SnusStille/budai-website/commit/43f44c9), rather than substituting a logo, sphere, video or downloaded model.
- Removed competing Hero brain/particle ownership. Root `LoadingScreen` alone owns the intro and its persistent brain canvas. That **same canvas** moves into the landing composition, then actually sleeps offscreen and resumes on reverse scroll.
- Darkness → neural activity → `B`, `BU`, `BUD`, `BUDA`, `BUDAI` → cinematic page reveal. Nominal story is 2,350ms plus a 700ms reveal after hydration, not a promise that a cold navigation/network fetch finishes in two seconds. Slow frames advance one letter at a time; completed lettering gets a visible dwell.
- No dependency on the developer room, Playground or unrelated asset downloads. A 1,600ms brain fallback and independent completion/bootstrap guards prevent an endless wait. Successful, skipped and timeout-completed visits are recorded for the session.
- Keyboard Skip/Escape, focus restoration, main-content inert handling, no-JS entry, storage failure, reduced motion, WebGL failure and effect cleanup are handled.
- The handoff uses uniform scale/translation, not animated layout dimensions or repeated render-target resizes. The title reserves its field so previously typed letters stay still.

### A connected, reversible world

One lazily constructed Three stage develops from capability architecture into the Builder workspace, a quieter waitlist threshold and illuminated roadmap depth. Camera, lighting, fog, geometry and browser code are deterministic functions of ordinary scroll position. This is not the same particle background repeated behind each section.

Native wheel, touch, keyboard, hash navigation and history remain intact. There is no scroll interception, pinning engine, GSAP/Lenis/R3F dependency or React-state update on every cinematic scroll tick. A shared passive, reference-counted scroll scheduler updates the world and navigation. Initial fragment navigation is immediate; explicitly focused in-page links can use native smooth scrolling.

### Builder: an actual 3D developer setup

The original procedural room has a desk, three monitor bodies/stands, keyboard with 78 instanced keys, chair, tower/cooling rings, mouse, cables, wall panels and lighting. No external GLB, stock room photograph or gaming-brand asset is used.

The camera approaches the desk, dwells on the central screen and departs as the page scrolls. The central IDE is real syntax-highlighted **browser DOM projected into the physical monitor** with CSS3DRenderer. The prepared 18-line example types and untypes reversibly; it never executes or calls an AI endpoint. Both the central IDE and side displays identify their illustrative nature. Full source is available in an accessible disclosure.

The mobile editor uses a separate readable layout, larger text, wrapping and cursor-following viewport. Reduced-motion, save-data, constrained-device and failed-WebGL paths retain a static, usable code display and all product content.

### The rest of the existing site

- Preserved the current BudAI logo, Stilledev identity, biography, product plans and bilingual UI.
- Capabilities have six actual actions rather than invented feature status.
- Waitlist atmosphere is restrained around the real form. Individual/company fields, team/use-case/referral options and native validation remain. An unconfigured **production** database now produces an honest unavailable error/count, not a fake saved signup. The existing local mock and admin behavior are otherwise retained.
- There was no Status section in this checkout. The existing Roadmap/Journey was upgraded using its four real milestones, not fabricated dates or progress claims.
- The actual Playground remains the actual product: persona/language selection, prompts, progressive decoding/trailer, history, error/retry, Stop and guest upload/account gating. Server model/provider routing, auth, vision, memory, database/API contracts and environment variable names were not replaced with demo logic.
- Added accessible labels to existing Playground actions and real `#main` skip targets on existing secondary routes. No product route was removed.

## Verification

| Check | Recorded result |
| --- | --- |
| Optimized build | **PASS**; 18 static pages generated; Next reports home 59.9kB / **267kB first-load JS** |
| TypeScript | **PASS** — `npm run typecheck` |
| ESLint | **PASS** — no warnings/errors |
| Production browser + pure suite | **29/29 PASS** — 25 browser + 4 pure tests, zero retries; about 2m18s |
| Development / React Strict Mode subset | **5/5 PASS** on the final source — fresh intro, keyboard, Builder, 390px mobile and Playground; 52.9s |
| Patch whitespace | **PASS** — `git diff --check` |

The suite covers single ownership and literal five-letter typing, the same surviving rendered canvas, timeout/slow-asset recovery, no replay, GPU sleep/resume/disposal, native/reverse camera and editor reconstruction, chapter changes, 360px/390px layouts, resizing, reduced motion, unavailable WebGL, context loss, partial construction failure, keyboard/focus, no-JS content, real Playground UI with controlled streams, saved-thread reopening, Stop reader cancellation, upload auth gate, waitlist failure/validation, language changes, routes and safe API requests.

Desktop intro/hero/Builder/Capabilities/Waitlist/Roadmap and both mobile sizes were captured and visually inspected. This is actual Chromium execution, not a source-inspection-only completion claim. One production DOM observer run recorded the brain canvas at 1.14s, the five letter prefixes at 1.70/1.86/2.10/2.28/2.50s, reveal at 3.13s and loader removal at 3.83s from navigation. It observed a maximum of one loader/brain, and the same canvas survived. These include hydration and software-rendering overhead; actual WebGL rendering was verified separately.

Exact test commands, browser setup and assertions are in [`testing.md`](./testing.md).

### Layout-shift measurement

A Chromium PerformanceObserver measured the first **12 seconds after load**, without interactions, with consent declined, nonessential popups dismissed and software WebGL2 enabled. Standard session-window CLS, not a Lighthouse score or field-data claim:

| Case | Measured CLS |
| --- | ---: |
| Fresh desktop, 1440×1000 | approximately **0.0024** |
| Fresh mobile, 390×844 | approximately **0.000025** |
| Direct desktop Builder anchor | approximately **0.000032** |

These are individual lab observations, not field guarantees; an earlier direct-anchor run recorded 0.0024 as font timing varied. The earlier layout-dimension handoff measured about **0.196** on desktop. The transform-only correction removes that large decorative shift; the remaining small font/caret shifts are not claimed as zero. The production suite also guards total observed intro shifts below **0.03** on desktop and both mobile widths. About and Playground render stable server HTML rather than collapsing dynamic placeholders.

### Costs and lifecycle

Three and the room load only after intro completion and approach to the relevant chapter. The brain is retained but inactive offscreen; the world is visibility-aware, capped and uses adaptive DPR. Established **and partially constructed** GPU resources, DOM renderers, listeners and timers have explicit cleanup.

Eager SSR of the product/Builder content is a deliberate layout-stability tradeoff reflected in the 267kB initial JS figure. No 60fps, Lighthouse-score, battery-life or physical-device performance claim is made. The production build retains Next's existing edge-runtime/static-generation advisory; development emits the framework's future `allowedDevOrigins` notice and cache serialization notices, not blocking preview errors.

## Sources and assets actually used

- Original brain: repository history, [`43f44c9`](https://github.com/SnusStille/budai-website/commit/43f44c9).
- [jasc66/scroll-flyover](https://github.com/jasc66/scroll-flyover), **MIT**: focused approach/dwell/depart, normalized scroll and readable-pause techniques, reimplemented locally; not its full engine/site.
- [AETumiApp/threejs-scroll-animation](https://github.com/AETumiApp/threejs-scroll-animation), **MIT**: deterministic progress-to-camera/material, reduced-motion frame, adaptive rendering and disposal techniques, reimplemented locally.
- [Three.js](https://github.com/mrdoob/three.js), **MIT**: renderer, CSS3D utilities, room environment and rounded geometry. New desk/room/props/scene geometry, screen art, beacons and seeded grain are procedural/original.
- [Plus Jakarta Sans](https://github.com/tokotype/PlusJakartaSans) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono), **OFL 1.1**: self-hosted through Fontsource, with retained license notices.

The requested Universe repository was researched but not copied. ScrollSpire and Portfolio-cinematic had no detected license; neither source nor assets were reused. All five candidate reviews, precise inspected-file links, compatibility/cost decisions, shipped asset inventory and retained notices are in [`sources-and-licenses.md`](./sources-and-licenses.md). Loader causes and timing/scroll/compositor discoveries are recorded in [`loader-investigation.md`](./loader-investigation.md).

## Not verified / remaining release work

1. **Real service integrations:** no configured Anthropic/authenticated vision/Supabase credentials were available for a successful provider/auth/database end-to-end run. Streaming/Stop/history UI tests use controlled transport responses. Missing-configuration APIs were actually checked; they are not proof of a successful provider call, magic link/OAuth login or database insert. Existing Stop behavior cancels the reader but is not a new guarantee of immediate upstream-provider network abort. The baseline's server model selection is preserved; comments describing optional model tiers are not evidence of a wired client tier picker.
2. **Public deployments:** the supplied Vercel/stilledev.se URLs could not be fetched from this restricted network. No claim that either public deployment already contains these commits. Preview verification used the local production build.
3. **Browser/device scope:** Chromium/SwiftShader and emulated viewports were exercised, not physical phones, Safari, Firefox or a formal WCAG audit. Analytics delivery was not tested. Real low-end hardware/field performance remains a release check.
4. **Pre-existing security debt:** dependency audit remains **8 findings: 3 moderate, 4 high, 1 critical**, unchanged from the baseline audit. In particular, the existing Next dependency requires a separately planned security/framework upgrade; a breaking forced migration was not hidden inside this visual task. Review this before a public production release.

## Saved increments

Source commits: `278f1a0` (connected experience and recovery), `236a40b` (existing product/skip labels), `5145211` (slow-frame letter cadence), `69d38ef` (transform-only handoff and failsafe session completion). Reproducible tests, ignore rules and these reports are saved as a separate final QA increment on the same Arena branch. Nothing was pushed or deployed.
