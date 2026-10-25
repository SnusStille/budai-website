# BudAI — Next-Level Experience & Living Intelligence Engine Overhaul

## 1. Git & Deployment Baseline Verification

- **Repository**: `https://github.com/SnusStille/budai-website`
- **Active Working Branch**: `arena/8ed4b39d-budai-website` (PR #7)
- **Production Deployment Source**: Verified via GitHub Deployments API (`https://api.github.com/repos/SnusStille/budai-website/deployments`) that both the Production environment (`https://stilledev.se`) and the Vercel Preview environment (`https://budai-website-lfhpp3qq4-stilledev.vercel.app/`) are deployed from branch `arena/8ed4b39d-budai-website`.
- **Branch Audit**: Inspected all 15 branches in the repository (`main` + 14 `arena/*` branches) and confirmed `arena/8ed4b39d-budai-website` is the newest, most complete branch in the repository.

---

## 2. GitHub Visual Component Research & License Audit

| Repository | SPDX License | Evaluated Patterns & Takeaways | How Applied in BudAI |
| --- | --- | --- | --- |
| `itsjwill/motion-primitives-website` | `NOASSERTION` (`null`) — **inspected conceptually only; zero code copied** | Conceptual composition of `src/app/neural/page.tsx`, `src/components/cards/living-system.tsx`, and `src/app/_sections/code-preview.tsx` (pairing live telemetry badges with architectural preview panels). | Inspired our original `[data-living-code-console]` and multi-depth `.capability-code-depth-backdrop` inside `CapabilityMap.tsx`. |
| `ibelick/motion-primitives` | `MIT` | Clean spring transitions and progressive disclosure micro-interactions. | Applied restrained spring/opacity transitions on module focus and code readout switching. |
| `tengbao/vanta` (`src/vanta.net.js`) | `MIT` | Distance-thresholded 3D spatial node-and-edge graph with camera parallax and additive line blending. | Informed the 3D spatial node/synapse lattice and relay gate hierarchy in `capability-engine.ts` and `BrainFlight.tsx`. |
| `mrdoob/three.js` | `MIT` | `RoomEnvironment` PMREM lighting, `CatmullRomCurve3` + `TubeGeometry`, `EdgesGeometry`, `CanvasTexture` on 3D planes, and `CSS3DRenderer`. | Powers the single-world `world.ts` and `capability-engine.ts` without extra runtime dependencies. |
| `pmndrs/react-three-fiber` & `pmndrs/drei` | `MIT` | Demand-driven frame loops, view-offset projection alignment, and glass/emissive material layering. | Applied directly in `world.ts` (`domViewOffset` / `worldUnitsPerPixel` and sleep-when-hidden GPU loop). |
| `pmndrs/postprocessing` | `Zlib` | Multi-tap Gaussian bloom and ACES Filmic tone mapping. | Used in `BrainFlight.tsx` (`FS_BLUR` / `FS_COMPOSITE`) and `world.ts` (`THREE.ACESFilmicToneMapping`). |
| `greensock/GSAP` | Custom (`NOASSERTION`) — **not installed** | ScrollTrigger scrub math (`clamp`, `smoothstep`, reversible progress). | Implemented via zero-dependency deterministic math in `lib/experience/timeline.ts` and `lib/experience/scroll.ts`. |
| `14islands/r3f-scroll-rig` | `MIT` | DOM-rect-to-WebGL viewport projection (`setViewOffset`) so 3D scenes track sticky DOM containers without scroll hijacking. | Used in `lib/experience/projection.ts` and `lib/experience/world.ts` to lock the 3D Living Intelligence Engine to `[data-capability-viewport]` and `[data-access-architecture]`. |

---

## 3. Capabilities Overhaul (`03 / THE LIVING INTELLIGENCE ENGINE`)

### Three Internal Creative Concepts Evaluated

1. **Concept A — Holographic AST Cylinder**: A rotating cylindrical tower of syntax tokens around a central pillar. *Rejected* because text on the back of the cylinder is inverted/occluded and doesn't clearly separate the 6 capabilities or morph cleanly into the 3 access tiers.
2. **Concept B — Dimensional 3D Code Architecture + Central Intelligence Core & Sculptural Module Stations (SELECTED)**:
   - **Multi-Plane 3D Code Slates (`createCodeSlateTexture`)**: Six high-DPI `THREE.CanvasTexture` glass code panels positioned in 3D depth behind and around the engine (`write.ts`, `automate.ts`, `decide.ts`, `bilingual.ts`, `memory.ts`, `multimodal.ts`), framed with `EdgesGeometry` borders that tilt in 3D perspective and illuminate when their corresponding capability is active or hovered.
   - **Floating 3D Syntax Token Stream (`tokenPlates`)**: Twelve 3D floating syntax plates (`export const budai`, `await memory.recall()`, `stream({ lang: "sv" })`, `vision.parse(frame)`, `core.route(intent)`, etc.) drifting through Z-depth and brightening as the camera scrubs through the section.
   - **Central Intelligence Core + 6 Sculptural Capability Stations**: An `IcosahedronGeometry` core surrounded by three counter-rotating orbital gimbals, feeding six curved `TubeGeometry` waveguides with traveling energy pulses into six distinct 3D module geometries (`Octahedron` for Write, dual `Torus` for Automate, `Cone` for Decide, twin `Sphere` nodes for Swedish + English, `Box` vault for Memory, `Dodecahedron` + wave ring for Vision & Voice).
   - **Live Code Execution Console (`[data-living-code-console]`)**: Embedded in the sticky 3D viewport readout, displaying the active module's live TypeScript invocation (`01-write.ts` .. `06-multimodal.ts`) and clicking through to prefill the real AI Playground.
   - **Seamless Morph into Access Architecture (`[data-access-architecture]`)**: As the user scrolls to the plans (`Basic`, `Consumer`, `Business`), the 3D engine morphs (`accessMorph` `0 → 1`) to reveal three ascending 3D hexagonal Access Tier Stations connected by a curved energy bridge and paired with `core.tier("basic" | "consumer" | "business")` routing headers.
3. **Concept C — Particle-Only Code Rain**: Falling character sprites behind HTML cards. *Rejected* per explicit product direction ("Do not simply place a Matrix-style falling green character animation behind cards").

---

## 4. Intro (`#intelligence`) & Brain-to-Playground Transition (`#signal` → `#playground`)

- **Cortical Rim Lighting & Organic Breathing (`BrainFlight.tsx`)**:
  - Added subtle organic breathing motion (`1.0 + 0.007 * sin(uTime * 1.15 + aR * 3.2)`) on the cortical surface and silhouette rim luminance (`vRim`) so the 3D neural brain has deeper sculptural relief and atmospheric glow in the Intro and Hero stages.
  - Interactive capability chips (`Personal · write & plan`, `Business · automate`, `SV / EN`, `Memory & voice`) dispatch `budai:brain-region` (`0..3`) to highlight the corresponding brain lobe in real time.
- **Continuous Brain-to-Playground Digital Intelligence Corridor**:
  - As the camera flies into the brain (`#signal`), organic neural folds gradually dissolve into a full-frustum 3D Digital Intelligence system (`aRegion = -2`) featuring 5 concentric octagonal relay gates, 12 converging longitudinal pathways, and horizontal data bus rungs that guide the camera directly into the interactive `#playground` composer with zero cuts, blank frames, or duplicate WebGL canvases.

---

## 5. Removal of Standalone `05 / THE NEXT SIGNAL` & Section Renumbering

- **Removed Standalone `05 / THE NEXT SIGNAL` Section**:
  - Removed the standalone `05 / THE NEXT SIGNAL` chapter (`"Some signals are worth following."`, `.next-signal-approach`, `.next-signal-beacon`, and `.waitlist-horizon`) from `app/page.tsx`, `components/sections/Waitlist.tsx`, `lib/experience/timeline.ts`, `lib/experience/scroll.ts`, `lib/experience/world.ts`, and `app/experience.css`.
  - Removed the standalone `Waitlist` top-bar link from `components/sections/Navbar.tsx` and `components/ui/SectionDots.tsx`.
- **Renumbered Roadmap to `05`**:
  - `components/sections/Journey.tsx` (`#roadmap`) is now **`05 / THE SYSTEM EVOLVES`** (`CHAPTERS` `00` `intelligence` → `01` `signal` → `02` `playground` → `03` `capabilities` → `04` `about` → `05` `roadmap`).
- **Preserved Real Waitlist Functionality**:
  - Embedded `<Waitlist />` (`id="waitlist"`, `.early-access-card`) inside `Capabilities.tsx` directly beneath the `Basic` / `Consumer` / `Business` plan cards so visitors can still join the early-access list for upcoming Consumer and Business plans with full Supabase persistence (`addWaitlistUser`, `getWaitlistCount`, `getWaitlistStatus`, referral codes, and `/admin` management).
