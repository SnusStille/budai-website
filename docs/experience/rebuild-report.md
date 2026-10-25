# BudAI — living system rebuild

**2026-10-25 · `arena/74ed593c-budai-website` · [PR #6](https://github.com/SnusStille/budai-website/pull/6)**

This extends the existing BudAI application and the earlier five pushed commits. It is not a replacement template. The workspace's live preview runs the optimized production build on port 3000. No merge or production deployment is claimed.

## What changed

### 1. One opening, and a genuinely separate neural journey

The full page now follows **Landing → Neural journey → real Playground → Capabilities → Builder → Waitlist → Roadmap**, with unique chapter numbers 00–06.

The repository's original `43f44c9` brain and story were recovered before reconstruction. The procedural hemispheres, cortical folds, cerebellum, stem, points and synapses remain actual WebGL geometry, not an image, video, logo or independently rotating sphere. The earlier story's private renderer/scroll loop was not pasted back in.

There is one authoritative opening owner in root Providers/LoadingScreen. No nested layout or section mounts another fullscreen loader. One persistent brain renderer has three explicit modes:

- **Opening:** an inward camera approach, neural activity and paced `B → BU → BUD → BUDA → BUDAI`. Nominal timing is 2,350ms plus a 700ms reveal **after hydration**, not a claim that cold navigation completes in three seconds. Slow frames advance one letter at a time, and the completed title gets a dwell. Skip/Escape, readiness, fallback and independent completion guards remain.
- **Landing:** the same brain settles beside the existing product introduction. It does not restart a loader.
- **Neural passage:** the restored `#signal` immediately after Hero has its own full-viewport scroll story, camera travel from z=4.6 through the anatomy to z=−2.8, internal connections and a natural product-environment exit. Original procedural axons continue through the exit so portrait views do not become an empty tunnel. Reversing scroll reconstructs the same camera pose.

The unwanted Hero Ask / generic explanatory presentation is no longer mounted in this passage. Useful work-assistant/SV/EN meaning is moved into the real Playground introduction and existing plans. Six capability actions prefill that actual composer's existing `budai:prompt` contract; they never submit or fabricate a response automatically.

### 2. Capabilities are a purposeful physical system

The cable network and six-card-around-a-core presentation are replaced by an original **laminar intelligence engine**: a dimensional chassis/backplane, precision uprights and six functional cartridges. Their physical details represent writing sheets, automation steps, decision support, paired languages, retained memory layers, and a vision aperture/audio waveform.

Native scroll assembles the layers; pointer/keyboard focus extends and lights the corresponding module. A readable real-DOM index stays separate from the visual model. The architecture then contracts into three access gates, above the real Basic/Consumer/Business comparison. Every gate contains the same six capability bars; differing depth represents expanding access, **not invented feature restrictions**.

Plan availability, features, account requirements, limits and existing founding-member offer are preserved. Basic is free during preview; Consumer and Business remain coming soon. No price was invented. Mobile has a fitted model and stacked, usable index rather than unreadable orbiting labels. Reduced-motion/no-WebGL retain a static architectural drawing and the real plan content.

### 3. Builder, Next Signal and Roadmap connect

The liked Builder remains an actual three-monitor spatial room, not a new unrelated design. Native-scroll camera approach, 78 instanced keys, progressive browser-DOM code and environmental lighting are retained. The central editor stays projected into its physical monitor; it can be reconstructed backwards and has a readable mobile layout/full-source disclosure. The example and side displays explicitly say they are **illustrative**, never a live AI response, and do not execute.

**THE NEXT SIGNAL** now departs that workspace into stepped, distant-light architecture, then a quiet form. The visual approach is outside `#waitlist`, so request-access links still jump directly to the usable form, not through a mandatory animation. Validation, optional individual/company fields, referrals, loading, error and success flows remain. Submission gets `aria-busy` and success a polite live region. The existing local-development mock is not presented as a live database.

The liked four-milestone Roadmap and its actual content remain. Its connected path, node focus/depth and new chapter identity are retained/polished without new dates, milestones or progress percentages.

### 4. A coherent new BudAI identity

The original **Fold** mark is one solid, geometric B with two cut directional ports and a shared spine. A central path and one typographic BudAI wordmark replace the old code/orbit identity across applicable UI, icons and social artwork. It works as pale ink on dark and dark ink on light; it does not rely on gradients, thin rings, glow or SVG animation.

Navigation, opening HUD, landing, Playground, Builder editor, Next Signal, Roadmap, footer and administration use the shared system. Favicon SVG/32px PNG, Apple 180px, PWA 192/512px with maskable safe area, and the 1200×630 OG/Twitter card are updated. Both social-image routes return identical artwork with the actual self-hosted UI font. Assets are reproducible with `npm run brand:generate`.

**Stilledev's mark, attribution, links and identity are unchanged.** See [brand guide](./brand.md).

### 5. Motion, lifecycle and runtime quality

- One passive, reference-counted native-scroll scheduler coordinates chapters, camera, navigation, architectural projection and editor progress. No new scroll/animation/3D runtime dependency; no virtual scrolling or wheel interception.
- The original brain has one persistent GPU owner. The story adds no second canvas, loader, listener or rAF loop. Heavy world code is deferred until the neural exit/product approach and never gates the opening.
- Full-height mobile render targets use a reversible perspective lens, not per-scroll framebuffer resizing or stretched anatomy. Desktop neural views no longer clip at a narrow rectangular canvas edge.
- Raw brain rendering sleeps when faded out. **An already-loaded world also stops actual GPU draws on reverse-to-landing**; its continuous scheduler demand sleeps too. Ordinary scroll resumes the same scene. This is tested with WebGL draw counters, not inferred from opacity.
- Shared primitive geometry is cached. Existing adaptive DPR, lite quality, disposal, partial-construction failure and context-loss handling remain. Reduced-motion changes dispose/recover the visuals without replaying an intro; save-data avoids heavy world initialization.
- Obsolete network/threshold styles and conflicting plan opacity are removed. A real console check caught local production trying to fetch Vercel's unavailable analytics script; analytics now uses Vercel's existing automatic server environment flag, preserving the integration on Vercel without local/Arena 404/MIME errors. No new deployment setting is required.

## Verification actually performed

Results are from the **latest optimized build**, not the earlier baseline report. Machine-readable results: [verification-2026-10-25.json](./verification-2026-10-25.json).

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, no warnings/errors |
| `npm run build` | PASS; 19 static pages; home 59.3kB / 267kB first-load JS |
| `npm test` | **41/41 PASS**, zero retries, zero skipped/flaky; approximately 2m47s |
| Composition | 34 browser tests + 7 pure timeline/camera/code/lens tests |
| Development / React StrictMode | 15 unique focused scenarios passed during development; critical opening + three cinematic scenarios rerun after visual polish |
| Separate guarded local waitlist success check | PASS: real loading, success/live-region and clipboard UI against the existing development-only in-memory mock; no external writes |
| Desktop | 1440×1000; resize and direct-section cases |
| Mobile viewport checks | 390×844 and 360×844: intro, neural entry/interior/reversal, hardware/index/plans, physical Builder/editor, navigation and form fit |
| Throttling | 4× CPU, 150ms latency, 220,000 bytes/sec download: all five prefixes observed, max one loader and brain, no initialized room before entry; release observed at 6,723ms including navigation |
| Layout-shift observations | Desktop fresh visit **0.002601864**; 390px **0.000024491**; 360px **0.009398897**; all below the tests' 0.03 bound. These are lab observations during those tests, not field CLS or a full performance audit |

Coverage includes fresh/return/reload, direct anchors, internal legal navigation/history, rapid native wheel traversal both ways, one retained canvas, exact camera/code reversal, shader failure and freed allocations, stalled rAF, slow brain import, keyboard Skip/focus, reduced motion, no WebGL, no JavaScript content/navigation, context loss/recovery, partial world construction, save-data, actual offscreen GPU sleep/resume, resize, metadata and installed icons. Healthy neural/fast-scroll checks assert no uncaught or console errors.

The actual Playground's response decoder/UI is exercised with controlled browser transport: persona and response language, history, progressive streaming/trailer, Stop, retry/error, and the guest image/account gate. Tests exercise safe existing route/API contracts and the real waitlist's native validation/details/referral/error UI. These are not claims of real Anthropic or authenticated database success.

Actual browser PNGs were inspected, including opening, landing, neural entry/interior/exit, six-module hardware, three gates/plan readability, Builder's physical editor, Next Signal/form, Roadmap, and 360/390px layouts. Regenerate them under ignored `test-results/` with the test command; no image mockups were substituted for the scenes.

## Sources actually used

- [Original BudAI brain/history](https://github.com/SnusStille/budai-website/commit/43f44c9): recovered code and story position; authoritative anatomical basis.
- [14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig), especially [PerspectiveCamera.tsx](https://github.com/14islands/r3f-scroll-rig/blob/master/src/components/PerspectiveCamera.tsx): **focused projection technique/math adapted** for DOM-aligned hardware in the shared canvas. MIT notice retained; no R3F/Lenis runtime installed.
- [digin1/brain-threejs](https://github.com/digin1/brain-threejs): inspected neural propagation/emission and regional activity; **research only**, no source/data/models copied. MIT software is separate from human atlas CC BY-SA 3.0 and mouse Allen terms.
- [decriptcypher/scroll-storytelling](https://github.com/decriptcypher/scroll-storytelling): composition/scroll research only; no license detected, no copying.
- [adrianhensler/three-js-room-demo](https://github.com/adrianhensler/three-js-room-demo): room/light research only; no license detected, no copying; BudAI's existing room retained.

Exact files, dependency compatibility and license decisions are in [rebuild research](./rebuild-research.md); prior licensed techniques and notices remain in [sources and licenses](./sources-and-licenses.md).

## Honest release limits

1. No Anthropic key, Supabase configuration or real authenticated session was available in this sandbox. Real provider replies/model tiers, signed-in image/voice workflows, durable waitlist/queue/auth/database success and external OAuth require service-backed staging verification. Their implementation and configuration were not replaced with mocks. The separate successful signup test uses only the existing local-development memory mock, not a live database.
2. The supplied public Vercel/stilledev URLs could not be visually inspected from this restricted network (TLS connection failure). The verified website is the actual local optimized build. No claim is made that an immutable supplied deployment URL changed.
3. Chromium uses real WebGL through SwiftShader in this sandbox. Responsive browser viewports are not physical phone tests. Safari, Firefox, real-device frame rate/battery, Lighthouse and field performance are not certified here.
4. `npm audit` still reports the **same 8 baseline findings: 3 moderate, 4 high, 1 critical**, including the existing Next.js/tooling dependency chain. No unsafe forced major-framework migration was made as part of this visual rebuild. These findings need a separate security-maintenance update before treating the stack as security-cleared.
5. The current PR remains open. No merge or production deployment is claimed; the production-mode workspace preview is left running for review.

## Reproduce locally

Use disposable/unconfigured local services for QA, not a live customer database. After `npm ci`:

```sh
npm run typecheck
npm run lint
npm run build
# In a separate terminal: npm run start -- --hostname 0.0.0.0
npm test
```

`npm run test:e2e` runs all 34 browser cases; `npm run test:unit` runs the seven pure cases without a browser/server. The default production suite deliberately excludes the development-only memory-mock signup test. With **only** `npm run dev -- --hostname 0.0.0.0` running, opt into that guard-checked test using:

```sh
TEST_WAITLIST_DEV=1 node scripts/test-browser.mjs waitlist-dev.spec.ts
```

Do not run development and production servers against the same `.next` directory simultaneously. Browser screenshots/traces/HTML reports are ignored generated artifacts, not application assets. The small committed verification JSON records the latest successful run.
