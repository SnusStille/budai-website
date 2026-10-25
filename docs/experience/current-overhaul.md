# Current overhaul — ownership, recovery and implementation

> Superseded visual brief: the latest refinement explicitly removes the opening/hero logo reveal, alternate SVG brain and cable/portal scenes. See [critical refinement verification](./refinement-verification.md). Historical observations below are not the current acceptance result.

2026-10-25, starting at `bbf5e61` on the existing Arena branch. This supersedes the earlier Fold/small-approach implementation, not the existing application. Final verification is recorded separately after the optimized build.

## Audit: observed causes, not guessed mounts

- Current root `Providers` mounts `LoadingScreen` exactly once. No nested layout or `loading.tsx` starts another opening. It would be false to report two active loader components at this starting revision.
- The earlier reproducible duplication is in `426a348`: the loader called `markIntroDone()` at the start of its fade, which mounted Hero's **separate `HeroBrainPanel/BrainFlight`, `ParticleCore`, and orbital `AICore`** underneath the still-running opening. Independent renderers/cameras plus an extra large logo composition produced the double-opening/double-brain appearance. This was ownership/handoff, not a z-index problem. Those three now-unreferenced legacy scene components are removed from source, not CSS-hidden. The useful, user-triggered logo easter egg and actual product are retained.
- No separate eye/cartoon brain model or downloaded brain asset exists in the inspected asset tree/history. The exact identifiable unwanted secondary presentation is that legacy Hero composite; no nonexistent model is invented in this report.
- The current branch's intro only went z=4.9→3.65, never inside the cortex. Its `settled` departure also blended the controlled intro camera back toward 4.6. Both are corrected: the shared opening passes through the cortex to z=−1.65, condenses the same neural points into the new identity, and holds that exact final camera pose on the landing.
- The current B silhouette is replaced rather than given another glow effect.
- The current story faded out before the actual product arrived. The final 110svh now overlaps the actual product DOM in stable, server-rendered flow. One native-scroll source supplies both the brain camera and the real chat surface's projection. The spatial frame is unprojected from the real chat's actual bounds through the renderer's actual MVP, not a cloned interface or a second independently timed scene.
- The existing isolated `main` stacking context placed the root brain above the chat even when the chat's local z-index was higher. A documented shared layer contract now places scene pixels behind opaque usable product surfaces. This fixes composition, not scene duplication; the single canvas/owner is unchanged.

## What was actually recoverable

Git `43f44c9` contains the real `BrainScrollStory.tsx`, its **four stages** (Write / Memory / Decide / Voice & vision), exact bilingual descriptions, region-facing yaw/tilt poses and procedural SDF anatomy. These are recovered into `lib/experience/brain-story.ts` and the shared camera. The former reconstruction omitted those four stages; this one restores them.

The historical story itself orbits regions and zooms z=4.6→4.0; the historical opening contains the actual fly-through. We do not mislabel the old orbit as a recovered deep camera flight. The new scroll journey faithfully recovers that four-region tour first, then continues into a real, reversible through-flight and the actual Playground as requested. The historical story's private scroll listener, React frame-state and second renderer are deliberately not revived.

The literal supplied `01 · Signal / A mind that listens` string was not found in available Git history. The user's supplied useful copy is now directly integrated into `#signal`, followed by the recovered four stages; Context / Memory / Two languages remain explicit. No Hero Ask interface is mounted there.

## Confluence, not a plain B

Two continuous neural ribbons meet around a shared computational cell. The static SVG, extruded 3D volume, opening particle-morph target, capability core and all icon/social files derive from one vector path in `lib/brand.ts`.

`BudAILogo` keeps the existing API and adds restrained travelling internal signals/receipt at the cell. One shared visibility/preferences observer sleeps all offscreen/reduced-motion SVGs; no logo canvas, JS animation RAF, or per-frame React state is added. The opening actually forms the mark in the existing brain renderer; its manufactured, lit volume remains on the landing. No independent spinning sphere/logo scene is introduced. Stilledev exports/attribution are untouched.

## Product and physical architecture

`PlaygroundArrival` wraps the real existing panel, not a second chat. It preserves input DOM/state, streaming, history, account/guest flows, uploads, voice and controls. Direct links and deliberate interaction settle the interface immediately. Expansion removes the transform and restores a real full-viewport panel without remounting the input. It is now also available on mobile. Without WebGL/reduced motion, this is ordinary, flat HTML from the beginning.

Playground output develops into six orderly shared-world routes. They converge into the **Confluence manifold**: a manufactured central intelligence core and six physically attached instruments (writing sheets, stepped automation, decision fork, paired-language bridges, ordered memory plates, vision aperture/audio bars). Bonded flat waveguides replace a cable network and the earlier unrelated cartridge stack. Focus/scroll light the corresponding route; no six floating cards or glowing central sphere. Routes clear the readable index on arrival. The same existing three access gates and exact plan facts remain.

Builder's room, actual DOM editor and illustrative-code labels, Next Signal's directly usable form, and the existing four-milestone Roadmap remain. No decorative code is executed and no price/date/milestone is invented.

## Technology and rights

No new runtime dependency. Existing raw WebGL2, Three 0.186, Framer Motion and native scrolling are retained. Original ear-clip/volume and MVP-plane math avoid importing another 3D stack or a runtime SVG loader into entry.

Previously inspected [14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) supplies the focused DOM/projection technique already attributed in `projection.ts`, with its retained MIT notice. [Three.js](https://github.com/mrdoob/three.js), specifically installed `src/cameras/PerspectiveCamera.js` (`setViewOffset`, `clearViewOffset`, projection updates) and `BufferGeometry`/resource disposal, is the underlying rendering reference; its MIT notice is retained by the dependency and existing licenses. [scroll-storytelling](https://github.com/decriptcypher/scroll-storytelling) remains research-only (no license found). [brain-threejs](https://github.com/digin1/brain-threejs) remains research-only: software MIT is not the same grant as the separate CC BY-SA human atlas / Allen mouse data terms. No biological datasets, unlicensed demo assets or third-party logos are copied.

## Product audit corrections

The repository's `.env.example` documented Fast/Quality/Deep tiers, but the inspected client had no model picker and the API always selected only `ANTHROPIC_MODEL`. The optional configuration is now genuinely wired: public fixed tier IDs/labels, only configured choices, persisted selection, and a server allowlist. Default model, auth, quotas, vision, streaming/trailer and memory contracts remain unchanged. No provider/model ID or key is exposed by the feature list, and arbitrary/unavailable client model names are rejected.

Voice dictation now releases its listening state if recognition startup throws and stops recognition on unmount. Voice-mode permission failures are explicit, do not create an automatic recognition restart loop, and leave a real retry/close action; the tracked retry timeout is cleared on cleanup. Product overlays and mobile fullscreen settle the camera projection and rise above navigation without remounting chat/input state. Actual microphone/provider operation still requires service/device-backed verification; browser regression tests use explicit recognition/transport doubles, not application mocks.

## 2026-10-25 3D Architectural Overhaul (`7ec7309` & `8d1777b`)

1. **Brain-to-Playground Full-Frustum Digital Intelligence Environment (`components/effects/BrainFlight.tsx`, `lib/experience/brain.ts`)**:
   - Separated organic cortex attenuation (`vRegion > -1.5`) from the emerging Digital Intelligence geometry (`vRegion = -2`) in `FS_POINTS` and `FS_LINES` so the late-journey transition (`p = 0.70 → 0.95`) illuminates into a full-viewport 3D architectural corridor rather than fading to black.
   - Constructed 5 concentric 12-segment 3D relay gates, 6 depth planes of octagonal relay nodes, 12 converging longitudinal signal highways, and horizontal data-bus rungs along `z = -1.15` to `-3.85`.
   - Wired interactive Hero cortical lobe chips (`[data-hero-brain-region]`) in `components/sections/Hero.tsx` to resonate the corresponding lobe on the persistent Hero brain (`budai:brain-region`).

2. **Capabilities Visual 1 — 3D Central Intelligence Core & 6 Sculptural Capability Modules (`lib/experience/capability-engine.ts`, `components/experience/CapabilityMap.tsx`, `components/sections/Capabilities.tsx`)**:
   - Replaced the sparse dot-on-line field in `[data-capability-viewport]` with a multi-layered 3D Central Intelligence Core (`IcosahedronGeometry` outer lattice + `OctahedronGeometry` inner nucleus + 3 tilted `TorusGeometry` gimbal rings + vertical spine), 6 curved `TubeGeometry` neural waveguides with dual travelling signal spheres, and 6 distinct 3D capability sculptures:
     - `01 / Write`: 3 staggered 3D document planes with glowing editorial header and typography bars.
     - `02 / Automate`: 4-stage 3D hexagonal workflow chain linked by automation conduits.
     - `03 / Decide`: 3D octahedral decision core branching into 3 weighted evaluation nodes.
     - `04 / Swedish + English`: Dual-helix 3D bilingual wave bridge (`TubeGeometry` strands) with 7 cross-translation rungs.
     - `05 / Memory`: 3-layer 3D horizontal context stack pierced by 4 vertical memory-bus pillars and pinned memory nodes.
     - `06 / Vision and voice`: Dual-ring 3D optical camera iris + 6-bar 3D acoustic frequency equalizer array.
   - Added `.capability-active-readout` live telemetry HUD inside `[data-capability-viewport]` and updated reduced-motion SVG fallbacks.

3. **Capabilities Visual 2 — 3 Monumental 3D Access Tier Stations (`lib/experience/capability-engine.ts`, `components/sections/Capabilities.tsx`)**:
   - Replaced the sparse dot clusters in `[data-access-architecture]` with 3 sculptural 3D Tier Stations linked by a horizontal `TubeGeometry` escalation conduit and travelling signal pulses:
     - `01 / Basic` (*Available now · Personal core*): Hexagonal base pedestal + 6 support pillars + floating 3D octahedral core + orbital ring.
     - `02 / Consumer` (*Coming soon · Deep memory*): Elevated dual-ring pedestal + 3D icosahedral core + 3 stacked memory rings + dual counter-rotating gimbal rings.
     - `03 / Business` (*Coming soon · Team constellation*): Wide command platform + multi-ring team core + 4 orbiting 3D satellite workspace nodes connected by radial spokes.

4. **Chapters 04, 05 & 06 — Builder Holo-Core, Next Signal Horizon Beacon & 4 Sculptural Roadmap Milestones (`lib/experience/developer-room.ts`, `lib/experience/world.ts`)**:
   - Added a rotating 3D Holographic Neural Core sculpture (`IcosahedronGeometry` cage + `OctahedronGeometry` core + orbital ring) on the Builder desk, high-DPI (`768×576`) side telemetry displays, monitor rim wireframes, and an additive floor grid.
   - Upgraded Chapter 05 (`#waitlist` / `.next-signal-approach`) with a hexagonal pedestal, geodesic lattice core, vertical beacon spire, 4 concentric `TorusGeometry` horizon wave rings, and 6 converging `TubeGeometry` waveguides with travelling signal spheres.
   - Upgraded Chapter 06 (`#roadmap` & `#continuation`) with a multi-strand `TubeGeometry` spine, 4 travelling signal pulses, hexagonal pedestals, and 4 distinct 3D milestone sculptures (Foundation Hex-Core, Developer Preview Dual-Gimbal Beacon Spire, Plans & Teams 3-Satellite Constellation, and Universal Geodesic Horizon Sphere).

5. **Consolidated All-in-One Supabase Schema (`supabase/schema.sql`)**:
   - Unified `schema.sql` and `MIGRATION_v2.sql`..`MIGRATION_v9_feedback.sql` into a single, 100% idempotent SQL script covering all enums, tables (`waitlist_users`, `admin_events`, `platform_events`, `feedback`, `profiles`, `conversations`, `messages`, `memories`, `usage_daily`, `usage_guest_daily`, `shared_conversations`, and locked-down legacy preview tables), indexes, triggers, RLS policies, and RPC functions (`waitlist_count`, `waitlist_status`, `waitlist_credit_referrer`, `handle_new_user`).

