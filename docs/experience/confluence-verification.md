# Confluence overhaul — finished implementation and verification

> Superseded visual brief: the latest refinement explicitly removes the opening/hero logo reveal, alternate SVG brain and cable/portal scenes. See [critical refinement verification](./refinement-verification.md). Historical observations below are not the current acceptance result.

**2026-10-25 · existing branch `arena/74ed593c-budai-website` · [PR #6](https://github.com/SnusStille/budai-website/pull/6)**

The actual existing application is modified. The workspace preview runs its optimized production build on port 3000. No merge or external production deployment is claimed. Earlier reports of 41 tests/Fold describe a superseded iteration, not this result.

## Delivered in code

| Requirement | Implemented result |
| --- | --- |
| One opening / one owner | Root Providers/LoadingScreen remains the only opening-state owner. Historical competing Hero scene components are deleted, not CSS-hidden. Real-browser fresh/refresh/history/StrictMode tests verify one loader and one brain canvas. |
| Camera actually enters | The prior 4.9→3.65 approach and its unwanted `settled` camera pullback are replaced. Actual rendered observations record **z=4.8949→−1.65**, crossing the cortex before identity formation. Nominal sequence is **2,800ms + 650ms reveal after hydration**, not a cold-network promise. |
| Biological → digital → landing | The same neural vertices form the new mark; an extruded, lit version resolves at the **same final pose** on landing. One retained canvas, no independently spinning hero brain/orb or extra intro. |
| Restore original tour | Recovered `43f44c9`'s exact four bilingual stages and region poses into `brain-story.ts`. The historical story orbits/zooms; the historical opening has the fly-through. The restored tour now continues into a genuine absolute/reversible deep flight. It is not described falsely as pixel-identical recovery of an unavailable deployed sequence. |
| Useful Signal messaging | `01 · Signal`, “A mind that listens”, context/account memory/SV+EN meaning and the recovered Write/Memory/Decide/Voice+vision tour are directly integrated. No generic Hero Ask interface is mounted there. |
| New living logo | **Confluence**: two continuous ribbons and one computational cell, not the old B. Shared vector/wordmark, real travelling signals, shared visibility/reduced-motion lifecycle, 3D counterpart, all applicable UI/icons/social files. Stilledev identity/attribution is untouched. |
| Brain → actual Playground | The real existing chat panel overlaps the final flight in stable SSR layout. Its projection derives from the same camera distance. A real spatial frame is unprojected through the renderer's MVP from the actual panel bounds. No cloned chat, screenshot, second loader or blank interstitial. |
| Product usability | Input DOM/state survives arrival/reversal/fullscreen. Direct links and deliberate interaction settle the surface. Mobile fullscreen and a fitted composer are available; overlays remain closable above navigation. Normal/no-WebGL/reduced-motion HTML is usable. |
| Playground exit | Six ordered output routes lead into the shared world's capability core. Native scroll alone drives the exit; no chat completion is required. Routes clear the readable index on arrival. |
| Meaningful Capabilities | A central manufactured Confluence core with six bonded flat waveguides/instruments: writing sheets, automation steps, decision fork, paired-language bridges, retained memory plates, aperture/waveform. Not random cable bundles, a sphere, six floating cards, or the earlier unrelated cartridge stack. |
| Accurate access tiers | Existing three access gates and Basic/Consumer/Business facts/availability/limits preserved; same six capabilities, expanding access. No invented price, date or plan restriction. |
| Builder / Waitlist / Roadmap | Existing three-monitor room, real DOM editor and explicitly illustrative code retained. Next Signal's quieter approach remains outside the directly usable form anchor. Actual validation/submission/success/error flow and original four roadmap milestones retained; no fabricated milestones/dates. |
| Motion / performance | One passive native-scroll bus; no new runtime library or virtual scroller. Absolute camera reconstruction, fixed render-target dimensions, late world loading, adaptive quality, reduced-motion/no-WebGL/save-data fallbacks and actual GPU sleep/resume. No generic world dust field. |
| Product audit fixes | The already-documented optional model tiers now have a real configuration-aware picker/server allowlist. Default API/auth/quota/vision/stream-memory behavior remains. Voice startup/permission failure, cleanup, bounded retries and modal layering are corrected. No hardcoded answers were introduced into the application. |

## Root causes and recovery, with scope boundaries

The starting `bbf5e61` did **not** have two active LoadingScreen mounts. The reproducible historical cause in `426a348` was early `markIntroDone()` revealing separate HeroBrainPanel/BrainFlight + ParticleCore + AICore underneath a still-running full-screen intro. Those unused legacy components are now removed from source. No separate cartoon/eye model exists in the inspected asset/history inventory; the known offending secondary Hero composite is identified rather than inventing an asset name.

Current-branch problems were also real: the camera never entered, `settled` pulled it back, the logo remained a B, the recovered four-stage tour was missing, and the brain disappeared before the actual chat arrived. The isolated main stacking context additionally put the one root scene **above** usable chat surfaces. The shared layer contract fixes composition; it is not used to conceal duplicate owners.

Full audit/design/provenance: [current-overhaul.md](./current-overhaul.md). Shared identity: [brand.md](./brand.md).

## Executed checks — latest optimized build

| Check | Observed result |
| --- | --- |
| TypeScript | PASS, `npm run typecheck` |
| ESLint | PASS, no warnings/errors |
| Optimized build | PASS; 19 static pages; home **62.2kB**, **272kB first-load JS** |
| Bundle change | Previous 267kB → 272kB first-load JS; **+5kB**, no new runtime dependency |
| Full test run | **53/53 PASS**, zero skipped/flaky/retries, **211.057s** report duration |
| Composition | **42 actual browser tests + 11 pure tests** |
| Development / StrictMode | 26 unique focused scenarios passed across development runs; separate guard-checked local mock signup/copy success passed |
| Responsive | Desktop 1440×1000, tablet 834×1112, mobile 390×844 and 360×844; resize covered |
| Throttled fresh visit | 4× CPU, 150ms latency, 220,000 bytes/s: all five prefixes, max one loader/brain, no initialized heavy world at entry; release observed at **7,184ms including navigation** |
| Lab layout-shift observations | Desktop fresh **0.002601864**; 390px **0.000024491**; 360px **0.009398897**, all below the 0.03 regression bound. These are observations during those tests, not field CLS. |

Machine-readable test names/results, metrics and actual opening-camera observations: [verification-confluence-2026-10-25.json](./verification-confluence-2026-10-25.json).

Browser coverage includes actual cortex crossing before morph, identical final landing pose/canvas, real travelling SVG signal/reduced-motion pause, all four recovered stages, direct/repeated loads, typing prefixes, keyboard Skip/focus, frozen animation clock, delayed bundle, shader/partial-allocation failure, context loss/recovery, no WebGL, no JavaScript content/navigation, save-data, normal/fast/reverse scroll, actual GPU draw-counter sleep/resume, 3D Builder/code reconstruction, mobile menu/form fit, and resize/editor alignment.

**The new arrival tests independently project the recorded 3D frame corners through the actual MVP back to the real DOM bounds** on desktop/tablet/mobile. They check forward growth, exact reverse camera reconstruction, one connected input element, typing and fullscreen preservation. Healthy arrival/native fast-scroll checks assert no uncaught or console errors.

The actual product response reader/UI is tested with explicit browser transport doubles: persona/language/history, progressive stream/trailer, Stop, retry, configured tier selection/persistence. Browser recognition doubles exercise EN/SV dictation, permission/start failure and voice-mode close/no-auto-retry behavior. Upload/account gating, safe route/API contracts, waitlist validation/details/referral/error and local-development memory-mock success/copy are covered. These doubles are confined to tests, not the application.

Actual final PNGs were reviewed: Confluence landing, original brain regions, neural/actual-interface arrival on desktop/tablet/mobile, clean six-instrument manifold, access comparison, preserved physical Builder, quiet form and unchanged connected Roadmap. Generated screenshots/traces are under ignored `test-results/`, not replacement product visuals or committed datasets.

## Sources actually used / rights

- [BudAI history `43f44c9`](https://github.com/SnusStille/budai-website/commit/43f44c9): recovered procedural anatomy, original four-stage copy and poses, fly-through basis.
- [14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig), [PerspectiveCamera](https://github.com/14islands/r3f-scroll-rig/blob/master/src/components/PerspectiveCamera.tsx): focused DOM/perspective alignment adaptation, retained [MIT notice](./licenses/r3f-scroll-rig-MIT.txt). No R3F/Drei/Lenis runtime added. New MVP-plane solve and extrusion code are original.
- [Three.js](https://github.com/mrdoob/three.js): existing 0.186 rendering library; inspected PerspectiveCamera view offsets/projection updates, BufferGeometry and disposal. MIT; no remote models/textures required.
- [digin1/brain-threejs](https://github.com/digin1/brain-threejs): activity/propagation research only, **no code/data/model reuse**. MIT software does not grant the separate CC BY-SA human atlas / Allen mouse data rights.
- [decriptcypher/scroll-storytelling](https://github.com/decriptcypher/scroll-storytelling): composition/scroll research only, no license found, no copying. Its newer React/Next/R3F/GSAP stack was not installed.

Additional earlier research/licensing remains in [rebuild-research.md](./rebuild-research.md) and [sources-and-licenses.md](./sources-and-licenses.md). No unlicensed demo asset, copyrighted gaming logo or external anatomical dataset is shipped.

## Important files

- `LoadingScreen.tsx`, `BrainFlight.tsx`, `brain.ts`, `intro.ts`: single lifecycle, true entry, morph, retained pose and renderer/resources.
- `BrainScrollStory.tsx`, `brain-story.ts`: recovered original stages/poses plus supplied Signal meaning.
- `PlaygroundArrival.tsx`, `playground-portal.ts`, `projection.ts`, `AIPlayground.tsx`: actual DOM handoff, inverse projection, mobile/overlay usability and preserved product.
- `brand.ts`, `identity-volume.ts`, `mark-motion.ts`, `BudAILogo.tsx`, `BudAIWordmark.tsx`, public icons/social assets: one living identity.
- `capability-engine.ts`, `world.ts`, `WorldStage.tsx`, `timeline.ts`, `scroll.ts`: physical manifold, output path, truthful access comparison and shared world/lifecycle.
- `ai-models.ts`, existing feature/playground API routes, `VoiceOrb.tsx`: configuration-aware tier selection and reliable voice failure cleanup.
- `arrival.spec.ts`, `brand.spec.ts`, `cinematic*.spec.ts`, `experience.spec.ts`, `product.spec.ts`, `unit.spec.ts`: regression coverage.

## Remaining verification / release limits

1. No real Anthropic key, Supabase database or authenticated session was available. Actual provider replies/tiers, signed-in vision/history/memory, durable waitlist/queue/auth writes and OAuth require configured-service staging verification. Real microphone/audio/speech-service operation was not tested; recognition tests use controlled browser doubles.
2. Anonymous requests to both supplied public URLs were retried and failed with curl **35 / SSL_ERROR_SYSCALL** under the sandbox's outbound restrictions. They were not visually verified, and no claim is made that an immutable supplied Vercel deployment changed. The verified site is the workspace's actual optimized build.
3. Chromium 153 uses real WebGL through SwiftShader. Viewport tests are not physical-phone, Safari/Firefox, battery, sustained-device-FPS, Lighthouse or field-performance certification.
4. Fresh `npm audit` still returns the unchanged **8 baseline findings: 3 moderate, 4 high, 1 critical** in the existing Next/tooling dependency chain. No forced major-framework migration was mixed into this overhaul. This is not a security-cleared release.
5. The existing PR remains open. No merge or production deployment is claimed; the production-mode workspace preview is left running.

## Reproduce

Use local/disposable services, not a customer database:

```sh
npm ci
npm run typecheck
npm run lint
npm run build
# separate terminal: npm run start -- --hostname 0.0.0.0
npm test
```

`npm run test:e2e` includes the new arrival tests and runs all 42 browser cases; `npm run test:unit` runs all 11 pure cases without a server/browser. The development-only signup check is deliberately excluded from the production suite. With only `next dev` running and no real database, explicitly opt in with `TEST_WAITLIST_DEV=1 node scripts/test-browser.mjs waitlist-dev.spec.ts`. Do not run dev/production simultaneously against the same `.next` directory.
