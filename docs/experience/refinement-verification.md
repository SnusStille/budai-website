# Critical fix and cinematic refinement — verified implementation

**2026-10-25 · `arena/8ed4b39d-budai-website` branch · synchronized from production baseline `2d12f841b10eef8c0fb0ea3be9354c2010e927c2` (`https://stilledev.se`)**

Actual existing source changed, not a replacement template. The workspace live preview runs the final optimized production build on port 3000. The supplied immutable Vercel URL and production domain were not deployed by this work; no merge or external deployment is claimed.

## 1. Actual cause, reproduced before editing

Starting at `0d59981`, the root had one loading component but **several sequential visual implementations**:

- SSR `renderBrain=false` / `phase=pending` rendered `BrainFallback`'s different hand-drawn SVG immediately.
- Hydration removed it and imported the real procedural brain. The camera clock ran before first valid paint and the renderer's first frame had zero gain, so delayed setup could skip the intended initial pose or look blank.
- A 1,600ms timeout could swap the SVG back in.
- The previous iteration deliberately morphed this same canvas into a large 3D logo and kept it on the hero; preference changes could reactivate that hero renderer.

The starting-build delayed-hydration trace observed the alternate SVG and landing identity morph. This was not guessed to be a nested-layout bug. Earlier tests counted canvases but actually *required* the SVG fallback and hero logo; those expectations were wrong for the latest brief.

Detailed source investigation and first verification gate: [critical-loading-fix.md](./critical-loading-fix.md).

## 2. Corrected loading lifecycle / unwanted brain removal

- Deleted `BrainFallback.tsx`, not CSS-hidden. Removed brand sampling, identity shader/program/buffers and the logo-morph drawing path from `BrainFlight`.
- One opening surface, one state owner: **pending → preparing → playing → revealing → done**. No separate backdrop/interface/scene controllers or animated wordmark/logo.
- Readiness means a visible rendered frame at the canonical initial camera. The actual camera starts only then; it crosses into the recovered model. Camera duration is **2,500ms + 500ms reveal after readiness**. Preparation is bounded at 1,400ms and degrades promptly; cold navigation is not promised to finish in three seconds.
- Preparation/failure uses a small raster captured **from that actual deterministic renderer**, same `43f44c9` SDF anatomy, seed 43044, first pose, shader and light time. It is not a placeholder model or alternative SVG. Desktop/mobile files together are about **41kB**; reproduce with `npm run brain:poster` using existing tools/dependencies.
- No initial zero-gain paint, no advancing camera before readiness, no late-import restart. Completion is published after React removes the opening DOM; timers/listeners/frames/resources are cleaned up. Actual unmount releases the context; connected-canvas StrictMode replay remains safe.
- **Continuous Single-Canvas Brain Hero (`intro` → `hero` → `journey`).** The single WebGL2 `<BrainFlight />` canvas (`data-brain-model="budai-neural-43f44c9"`) stays mounted inside `.intelligence-stage` from the opening (`intro`) into the landing page hero (`#intelligence`, `data-sequence="hero"`, `HERO_POSE` at `z = -1.65`) and through the neural scroll passage (`#signal`, `data-sequence="journey"`), without unmounting, remounting, flashing, or creating a second brain. Once the user reaches `#playground`, the brain sleeps (`data-scene-sleeping="true"`), and in `#capabilities` and below it unmounts (`requestRole(null)`) so `WorldStage` owns the GPU alone.
- **No logo in opening or hero.** The BudAI Confluence logo is never used as the opening loader or hero sculpture; it remains in the navbar, app branding, footer, and metadata while `DEVELOPED BY STILLEDEV` attribution is preserved throughout.

The critical gate passed **9/9 development/StrictMode cases and 9/9 optimized-production cases before secondary visual work**. The final suite adds a pristine, unsuppressed-visitor check after delayed promotional timers.

## 3. Logo placement and preserved product

Confluence's vector/wordmark, navigation, actual app interfaces, footer, favicon, Apple/PWA and social assets remain. It no longer becomes the opening or hero centrepiece. The optional user-triggered brand play is lazy on explicit intent, not two default full-viewport FX canvases; its giant 3D logo reward is removed. Stilledev mark/attribution and unrelated branding are unchanged.

**No API contract, environment-variable name, database/auth connection, product model integration, route or deployment configuration was changed in this refinement.** Actual chat submission, decoding/stream trailer, Stop, persona/model/language selection, upload/account gates, voice, local history/memory controls and waitlist logic remain. No hardcoded answers, prices, dates or fake live data were added.

## 4. Brain → actual Playground, without extra scenery

The original recovered four-stage copy/model remains after Hero and before Playground. Its formerly large half-turn/unwind becomes calm **forward camera beats**; absolute progress remains reversible without accumulated lag.

Removed the enclosing portal/cage, six long neural rails and outgoing cable fan. Biological connections gently recede into sparse ordered samples. **One small signal** reaches the actual toolbar: its endpoint is unprojected through the renderer's actual MVP to the real DOM bounds, not a cloned interface.

The real surface retains its input node/state, settles at full readable size, has modest perspective instead of becoming a tiny distant app, and immediately prioritises interaction/direct navigation/fullscreen/overlays. There is no blur, extra loader or chat-completion gate.

The shared bus now has an explicit **DOM update → GPU render** order. The raw scene is driven directly by the opening clock or the same native narrative snapshot; it has no independent application RAF. Visibility/settled interaction pause GPU work; leaving for Hero disposes the narrative scene. No Lenis/GSAP/R3F runtime added.

## 5. Central Intelligence Core, Capability Pathways, Developer Room, and Next Signal

The **Capabilities (`#capabilities`)** environment combines the sparse deterministic **information register** for all six modules (`Write`, `Automate`, `Decide`, `Swedish + English`, `Memory`, `Vision and voice`) with a 3D **Central Intelligence Core** (faceted icosahedral nucleus, wireframe lattice, counter-rotating gimballed signal rings, and axial spine), **six smooth architectural pathways**, station rings, and travelling signal pulses that intensify on the focused capability module.

In **Access Architecture (`Choose your way in`)**, the same six capability constellations appear across all three tiers (`01 / BASIC`, `02 / CONSUMER`, `03 / BUSINESS`), joined by a shared-intelligence longitudinal pathway and three tier cores with 1, 2, and 3 concentric orbital capacity rings.

In **The Builder (`#about`)**, instanced 3D keyboard keys, cylindrical puck, and dangling under-desk `TubeGeometry` cables were removed in favor of a sleek low-profile input deck with cyan lightbar and an updated left-monitor `BUDAI / INTELLIGENCE CORE` 6-pathway diagram alongside the real CSS3D `ProgressiveEditor`.

In **Waitlist (`#waitlist`)**, the approach features a 3D **Next Signal Relay Core**, three concentric horizon wave rings, converging signal pathways, and a 37-point harmonic field while `#waitlist` anchor links go directly to the usable form. Roadmap (`#roadmap`) retains its four milestone stages and converges smoothly into the `#continuation` outro.

## 6. Outro: THE SIGNAL CONTINUES

The existing footer now closes the same story, not a new section/canvas/overlay. Roadmap pieces become quieter, its final node converges toward one small stable point, and the same camera gently retreats. Footer typography/spacing and the existing return-to-product route conclude the experience.

Removed the giant bottom wordmark and automatic end-of-page promotional toast. Footer links/legal dialogs/Stilledev attribution stay available with no wait or scroll lock. The closing pose reconstructs on reverse scroll and GPU drawing actually sleeps when fully settled, even for a short desktop footer. Reduced-motion/no-WebGL have an immediately readable static ending.

## 7. Research and licensing

Actual files, compatibility and decisions: [refinement-research.md](./refinement-research.md).

- [MuhammedAlii/high-end](https://github.com/MuhammedAlii/high-end): inspected its single GSAP ticker/Lenis `autoRaf:false`, visibility/device boundary and rendered-frame readiness. **Research only**, no license found, no source/assets copied. Its Next16/React19/R3F9/GSAP/Lenis stack was not installed.
- [intframe/scroll-rig](https://github.com/intframe/scroll-rig): focused camera-beat/visibility techniques adapted into pure absolute functions on the existing native bus, not an imported scroll controller. [MIT notice retained](./licenses/intframe-scroll-rig-MIT.txt). Its mutable smoothing/extra listeners were intentionally not adopted.
- [14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig): retained focused DOM/perspective adaptation and [MIT notice](./licenses/r3f-scroll-rig-MIT.txt), without its runtime. New inverse-plane signal implementation is original.
- [decriptcypher/scroll-storytelling](https://github.com/decriptcypher/scroll-storytelling): composition research only, no license found, no copying or new frame-sequence assets.

No external anatomical model/data, unlicensed demo asset or copyrighted gaming logo was added.

## 8. Checks actually executed

Latest machine-readable results and per-critical-case invariants: [verification-refinement-2026-10-25.json](./verification-refinement-2026-10-25.json).

| Check | Result |
| --- | --- |
| TypeScript | PASS |
| ESLint | PASS, no warnings/errors |
| Production build | PASS, 19 static pages; home 64.7kB / **271kB first-load JS** |
| Bundle / dependencies | Starting 272kB → **271kB**; no new runtime dependency |
| Full optimized test run | **69/69 PASS**; **55 browser + 14 pure**; zero skipped/flaky/retries; approximately **4m8s** |
| Critical visual records | 10 critical/default cases: **no alternate brain, no opening/hero logo, no resting-hero brain observed**; maximum one brain canvas/opening surface |
| Desktop/tablet/mobile | 1440×1000, 834×1112, 390×844, 360×844 and 360×740/resize cases |
| Cold/throttled entry | 4× CPU, 150ms latency, 220,000 bytes/s; max one surface/brain; no heavy room initialised; release observed at **7,193ms including navigation** |
| Lab layout-shift observations | Desktop **0.002509017**; 390px **0.015957195**; 360px **0** in those test windows, all below the 0.03 regression bound. Not field CLS or a zero-shift guarantee. |
| Separate local signup check | PASS, existing development-only in-memory mock; real loading/success/clipboard UI, no external writes |

Rendered tests include fresh/default sessions, normal and cache-disabled hard refresh, delayed hydration/first paint, delayed renderer, shader/partial allocation failure, frozen animation clock, WebGL unavailable, reduced motion/preferences changes, resize, direct anchors/legal/history, slow/fast/reverse native scrolling, same model identity, no logo in opening/hero, actual renderer disposal, quiet pristine defaults, real DOM/matched signal on three viewports, keyboard Skip/focus, scene sleep/resume, preserved 3D Builder/code, accurate tiers, footer camera reversal/GPU sleep and clickable legal/product links.

Product tests exercise the actual UI/decoder with explicit **test-only** transport/recognition doubles: progressive stream/trailer, Stop cancellation, persona/SV/EN/model IDs/history, upload/account gating, retry/error and voice permission/start/close behavior. They do not certify live provider or database success. Actual browser PNGs were inspected for first paint, opening, clean desktop/mobile hero, original tour, readable real-interface arrival, sparse field/access comparison, Builder, form, Roadmap and final footer. Screenshots/traces are ignored regenerated artifacts, not replacement product visuals.

## 9. Important source files

- `LoadingScreen.tsx`, `BrainFlight.tsx`, **new** `BrainPoster.tsx`; **deleted** `BrainFallback.tsx`; `Hero.tsx`, `intro.ts`, same-model assets and authoring script.
- `scroll.ts`, `brain.ts`, `PlaygroundArrival.tsx`, **new** `playground-signal.ts` replacing `playground-portal.ts`.
- `information-patterns.ts`, `information-field.ts`, `capability-engine.ts`, `CapabilityMap.tsx`, `Capabilities.tsx`, `world.ts`, `WorldStage.tsx`.
- `Footer.tsx`, `timeline.ts`; `LazyEgg.tsx`/`LogoEasterEgg.tsx`, retired `Logo3D.tsx`, homepage promo removal and automatic-toast cleanup.
- `loading-lifecycle.spec.ts`, `arrival.spec.ts`, `outro.spec.ts`, cinematic/experience/unit regressions; existing product/brand checks preserved.

## 10. Honest limits / release state

- No real Anthropic/Supabase credentials, signed-in session, durable database/queue or microphone/speech-service staging was available. Live replies/vision/memory/history/auth/OAuth/waitlist writes and real microphone behavior need service/device-backed verification. Test doubles are confined to tests, not substituted into the app.
- Both supplied external URLs were retried: curl **35 / TLS SSL_ERROR_SYSCALL** under outbound restrictions. Public production/immutable preview rendering was not verified or deployed. Review the current workspace preview/PR, not a claim that the old immutable URL changed.
- Chromium 153 uses real WebGL via SwiftShader. Responsive viewport tests are not physical phone, Safari/Firefox, sustained FPS/battery, Lighthouse or field-performance certification.
- Fresh `npm audit` retains the same **8 baseline findings: 3 moderate, 4 high, 1 critical** in the existing framework/tooling chain. No forced major upgrade was mixed into this focused task; this is not a security-cleared release.
- Current PR remains open. No merge or production deployment is claimed. The optimized workspace preview is left running.

Reproduce with `npm run build`, `npm run start -- --hostname 0.0.0.0` in another terminal, then `npm test`. `npm run test:loading` runs the 10 focused cases; `npm run test:e2e` all 55 browser cases; `npm run test:unit` all 14 pure cases. Use only local/disposable services, not a customer database. The local mock signup is separately opt-in (`TEST_WAITLIST_DEV=1 node scripts/test-browser.mjs waitlist-dev.spec.ts`) against `next dev`; do not run dev/start simultaneously on one `.next` directory.
