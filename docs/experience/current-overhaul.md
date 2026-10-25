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
| `theatre-js/theatre` | `Apache-2.0` — **not installed** | Keyframed sequence envelopes (`packages/core/src/sequences`) and multi-phase normalized timeline choreography. | Applied in the 4-phase `BudAI` opening reveal (`--opening-progress` `0..1` envelopes) and the multi-stage AI Assembly Line (`intakeFactor`, `connectFactor`, `outputFocus`). |
| `14islands/r3f-scroll-rig` | `MIT` | DOM-rect-to-WebGL viewport projection (`setViewOffset`) so 3D scenes track sticky DOM containers without scroll hijacking. | Used in `lib/experience/projection.ts` and `lib/experience/world.ts` to lock the 3D scenes to `[data-capability-viewport]` and `[data-access-architecture]`. |

---

## 3. Capabilities Overhaul: Two Immersive 3D Experiences

### Experience One: `03A / THE INFINITE CODE CHAMBER` (`[data-infinite-code-chamber]`)

- **3D Chamber Architecture & Multi-Speed Depth Parallax**:
  - Five concentric 3D architectural portal ribs (`chamberPortals`) and a 3D perspective coordinate grid (`depthGrid`) receding into the chamber (`0.55x` background parallax speed).
  - Six high-DPI `THREE.CanvasTexture` 3D glass code slates (`01-write.ts` .. `06-multimodal.ts` at `1.0x` midground parallax speed), framed with `EdgesGeometry` borders that glide forward and illuminate when their corresponding capability is active or hovered.
  - Twelve floating 3D syntax token plates (`1.35x` foreground parallax speed) drifting between the code panels and the Core.
- **Code-to-Core Synaptic Compiler Filaments & Sculptural Capability Stations**:
  - Six curved 3D `TubeGeometry` compiler filaments (`slateBeamCurves` + `slatePulses`) carry compilation pulses from each 3D Code Slate into the Central Intelligence Core (`IcosahedronGeometry` + 3 counter-rotating gimbals), which routes energy along six waveguides to the six sculptural capability assemblies (`Write`, `Automate`, `Decide`, `Swedish + English`, `Memory`, `Vision and voice`).
- **Interactive Syntax-Highlighted Code Console (`[data-living-code-console]`)**:
  - Displays the active module's live syntax-highlighted TypeScript code (`tokenizeLine`) and links directly to the real AI Playground.

### Experience Two: `03B / THE AI ASSEMBLY LINE` (`[data-ai-assembly-line]`)

- **Stage 01 — Raw Multimodal Intake (`x = -3.1`)**:
  - Six separate 3D input pieces (`intakePieces`: Chat prompt, Image frame, Voice waveform, SV/EN locale, History thread, Memory fact) enter from scattered trajectories on the left and converge into the Intake Station as the user scrolls (`intakeFactor`).
- **Stage 02 — Structured Context, Memory & Model Routing (`x = 0`)**:
  - Three parallel 3D workflow conduits (`assemblyUpperCurve`, `tierBridgeCurve`, `assemblyLowerCurve`) with 9 synchronized traveling light packets connect Stage 01 through the central Context & Memory alignment station (`connectFactor`).
- **Stage 03/04 — Coherent Streaming Output Focal Point (`x = +3.1`)**:
  - Information synthesizes into the completed 3D Output Crystal (`tierCores[2]` + `outputFocalHalo` + 4 satellite nodes + 3D code architecture slates) which scales and illuminates (`outputFocus`) as the focal point of the scene before transitioning into `04 / THE BUILDER`.

---

## 4. Redesigned BudAI Loading & Intro Experience — "THE NAME COMES TO LIFE"

- **Phase 1 — The Opening (`p = 0.00..0.06`)**:
  - Opaque deep atmospheric backdrop (`#071520` → `#020205`) over the emerging 3D WebGL2 Neural Brain (`budai-neural-43f44c9`) with zero generic spinners and no immediate logo flash.
- **Phase 2 — The Name is Formed (`p = 0.06..0.44`)**:
  - Inside `.opening-identity` (`[data-opening-identity]`), the five letters `B`, `u`, `d`, `A`, `I` emerge sequentially letter-by-letter from depth (`translate3d` + `blur` → crisp focus) with a precision optical cursor (`.opening-identity-cursor`) and a restrained horizontal light sweep (`.opening-identity-sweep`).
- **Phase 3 — The Identity Settles (`p = 0.44..0.94`)**:
  - `BudAI` settles into full clarity with `AI` in signature cyan-lavender gradient, accompanied by a dimensional horizon line (`.opening-identity-horizon`) and `DEVELOPED BY STILLEDEV · SWEDEN`.
- **Phase 4 — Enter the Actual Website (`p = 0.94..1.00` + `revealing`)**:
  - The opening identity gently elevates and dissolves as the single persistent 3D Neural Brain completes its cortical crossing directly into the Hero brain pose (`#intelligence`), with session-based persistence (`sessionStorage["budai:cinematic-intro:v1"]`), keyboard `Esc` / `Skip intro` support, and `prefers-reduced-motion` bypass.

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
