# BudAI — Next-Level Experience & Living Intelligence Engine Overhaul

## 1. Git & Deployment Baseline Verification

- **Repository**: `https://github.com/SnusStille/budai-website`
- **Active Working Branch**: `arena/8029c3b2-budai-website` (branched from `main` commit `4d151cd`)
- **Deployment Root-Cause Investigation**:
  - Inspected Vercel deployment `7320440330` (`https://budai-website-ogow77ops-stilledev.vercel.app`, commit `46a9451`) and `7320578304` (`https://budai-website-lrm1p8ikd-stilledev.vercel.app`, commit `4d151cd`).
  - Confirmed that the previous `capability-engine.ts` retained the **same primary foreground 3D geometry** in both Capabilities scenes (a wireframe sphere on the left connected to 6 small icons on the right in Scene 1, and 3 wireframe spheres on circular pedestals in Scene 2), only adding faint background planes behind them.
  - Replaced both 3D scenes completely in `lib/experience/capability-engine.ts` and `lib/experience/world.ts` with entirely new 3D geometry, materials, camera dolly/pan choreography, and scroll-driven assembly.

---

## 2. GitHub Visual Component Research & License Audit

| Repository | SPDX License | Evaluated Patterns & Takeaways | How Applied in BudAI |
| --- | --- | --- | --- |
| `Dilip-kumar-22/orbit` | `MIT` | Inspected `src/scene.js`, `src/scroll.js`, `src/config.js`, and `src/shaders.js`: native passive scroll progress (`scrollY / max`) driving Z-axis camera travel (`zStart -> zEnd` with `easeInOut`), section-grade lighting shifts, `visibilitychange` loop pause, and `prefers-reduced-motion` single-frame fallback. | Applied in `lib/experience/capability-engine.ts` and `lib/experience/world.ts` for Z-axis camera dolly (`dollyZ`), dynamic `chamberLight` color/position grading, and reversible scroll-driven 3D assembly. |
| `vercel-labs/web-interface-guidelines` | `MIT` | Accessibility, focus-visible states, compositor-friendly `transform`/`opacity` animations, and `prefers-reduced-motion` compliance. | Applied across `.opening-identity`, `CapabilityMap.tsx`, `About.tsx`, and reduced-motion fallbacks. |
| `mrdoob/three.js` | `MIT` | `RoomEnvironment` PMREM lighting, `RoundedBoxGeometry`, `CatmullRomCurve3` + `TubeGeometry`, `EdgesGeometry`, `CanvasTexture` on 3D planes, and `CSS3DRenderer`. | Powers the single-world `world.ts`, `capability-engine.ts`, and `developer-room.ts` without extra runtime dependencies. |
| `pmndrs/react-three-fiber` & `pmndrs/drei` | `MIT` | Demand-driven frame loops, view-offset projection alignment, and glass/emissive material layering. | Applied directly in `world.ts` (`domViewOffset` / `worldUnitsPerPixel` and sleep-when-hidden GPU loop). |
| `greensock/GSAP` | Custom (`NOASSERTION`) — **not installed** | ScrollTrigger scrub math (`clamp`, `smoothstep`, reversible progress). | Implemented via zero-dependency deterministic math in `lib/experience/timeline.ts` and `lib/experience/scroll.ts`. |

---

## 3. Capabilities Overhaul: Two Unmistakably New 3D Scroll Experiences

### Experience One: `03A / THE INFINITE CODE CHAMBER` (`[data-infinite-code-chamber]`)

- **Complete Removal of Old Wireframe Sphere & 6-Icon Stack**:
  - Removed the old left-hand wireframe sphere (`coreGroup`) and 6 small right-hand icons (`moduleGroups`) completely.
- **3D Z-Axis Architectural Code Tunnel & Living Code Wall**:
  - Seven concentric 3D rectangular portal arches (`chamberPortals` at `0.52x` parallax speed) with glowing corner brackets, floor/ceiling perspective blueprint rails (`chamberRails`), and a central Z-axis runway beam (`runwayCurve`).
  - Six large, high-contrast 3D glass Code Monoliths (`2.24 x 1.30` `RoundedBoxGeometry` slabs + `768 x 440` `CanvasTexture` with illuminated active code line highlights and sweeping laser scan bars) arrayed along the left and right chamber walls.
- **Living Code Wall -> 3D Blueprint Component Assembly**:
  - As the visitor scrolls (`dollyZ = lerp(0.15, 2.65, p)`), the active 3D Code Monolith glides into the foreground left focal zone while 4 compiler projection beams (`compilerBeamCurves`) project across the aisle into a large **3D Assembled Blueprint Interface Component (`blueprintAssemblies[0..5]`)** on the right (`Bilingual Document UI`, `4-Stage Playbook Board`, `Decision Matrix Dashboard`, `Dual-Pane Bilingual UI`, `Context Vault Interface`, `Optical & Voice Studio`) with 3D extruded sub-cards floating in depth.

### Experience Two: `03B / THE AI ASSEMBLY LINE` (`[data-ai-assembly-line]`)

- **Complete Removal of Old 3 Pedestal Spheres**:
  - Removed the 3 wireframe spheres on hexagonal pedestals completely.
- **4-Stage Architectural Intelligence-to-Output Pipeline**:
  - **Stage 01 (`x = -3.65 to -2.25`)**: Six labeled 3D multimodal input tiles (`01 CHAT PROMPT`, `02 VISION IMAGE`, `03 VOICE STREAM`, `04 2 ANGLES`, `05 AUTO MEMORY`, `06 PLAYBOOK`) converge through a rectangular 3D Intake Scanner Gate (`intakeGateGroup`) with an active vertical laser scan plane.
  - **Stage 02 (`x = -0.45`)**: A 3-deck rectangular 3D Glass Context & Routing Matrix Rack (`matrixRackGroup`) where 9 3D data blocks (`matrixCells`) snap from scattered positions into an ordered 3x3 grid as scroll progresses (`matrixFactor`).
  - **Stage 03 (`x = -0.45 to +2.55`)**: Four parallel 3D synthesis conduits (`conduitCurves`) carry dimensional 3D UI building blocks (`conduitPulses`) rightward.
  - **Stage 04 (`x = +2.55`)**: A monumental 3D Assembled Product Output Showcase (`outputShowcaseGroup`: `2.34 x 1.48` 3D application interface + 4 exploded-to-assembled 3D UI component layers including a 3D Mobile Companion App frame) physically locks together as `assemblyProgress` scrubs from `0` to `1`.

---

## 4. Post-Playground Narrative: "FROM THOUGHT TO REALITY" (`#about` / `developer-room.ts`)

- **Leaving the Abstract Brain for Tangible Creations**:
  - In `lib/experience/developer-room.ts` and `components/sections/About.tsx`, scrolling through `04 / FROM THOUGHT TO REALITY · THE BUILDER` (`builderProgress: 0 -> 1`) drives `room.update(builderProgress, time)`:
    1. **Left 3D Creation Assembly (`websiteAssemblyGroup`)**: Four separate 3D website & dashboard building blocks (`Website Nav Bar`, `Hero Interface Card`, `Analytics Card`, `KPI Chart Card`) fly in from exploded 3D coordinates and lock together in front of the live Website & Analytics Dashboard display.
    2. **Center Display (`ProgressiveEditor`)**: Real CSS3D projected IDE composing the TypeScript source code in sync with scroll.
    3. **Right 3D Creation Assembly (`mobileAssemblyGroup`)**: A 3D Smartphone chassis (`1.28 x 2.24`) and 3 floating mobile UI cards converge and snap into a completed Mobile Interface alongside the 4-step Structured Workflow display.
    4. **Dynamic Studio Illumination**: Studio lighting (`cyanLamp`, `fillLamp`, `deskLamp`) brightens and clarifies as the creations lock into place.

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
