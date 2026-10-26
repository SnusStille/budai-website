# BudAI — 3D Experience Rebuild, Post-Playground Scroll Bug Fix & Loading Screen Polish

## 1. Builder Inspection & Technical Benchmark Reuse

Before rebuilding the Capabilities experiences, we inspected the existing **Builder (`#about`)** experience across:
- `components/experience/WorldStage.tsx`
- `components/experience/ProgressiveEditor.tsx`
- `lib/experience/code.ts`
- `lib/experience/developer-room.ts`
- `lib/experience/world.ts`

### Why Builder Feels Visually Convincing
1. **Physical 3D Studio Hardware & Lighting (`developer-room.ts`)**:
   - Uses solid `RoundedBoxGeometry` and `MeshStandardMaterial` surfaces (`alloy #253447`, `graphite #111b29`, `rubber #090f17`) with glowing cyan/lavender/emerald trim strips and three 3D `PointLight`s (`cyanLamp`, `fillLamp`, `deskLamp`) casting specular highlights across curved monitor bezels, mounting stems, and architectural wall slats — rather than thin additive wireframe lines floating in empty space.
2. **Deterministic, Scroll-Synchronized Progressive Code Writing (`ProgressiveEditor.tsx` + `lib/experience/code.ts`)**:
   - Instead of static textures, Builder calculates a deterministic character budget from scroll progress (`codeCharactersAt(progress)`), progressively typing real TypeScript source code character-by-character with line numbers, syntax highlighting, an active-line highlight bar, and a live optical cursor (`▌`) that reverses identically when scrolling back up.
3. **Clean Side-Monitor Synchronization (`developer-room.ts`)**:
   - We also cleaned up the Builder flanking monitors so they progressively render the Website Analytics Dashboard (`leftDisplay`) and Workflow & Mobile Interface (`rightDisplay`) directly on the physical 3D monitors as `builderProgress` (`0 -> 1`) advances, removing the floating wireframe overlays that previously sat in front of the side screens.

---

## 2. Root-Cause Analysis & Fix: Post-Playground Scroll Flicker / Jump Bug

### Symptom
When reaching the Playground (`#playground`) and scrolling further down into Capabilities (`#capabilities`), the visual stage flickered and jumped horizontally/vertically back and forth for roughly one second.

### Root Causes Identified
1. **`engineCenter` & `camera.setViewOffset` Frustum Swing During `chapter = 2.0 -> 3.0` (`lib/experience/world.ts`)**:
   - As `chapter` advanced from `2.0` (`#playground`, camera at `[24, 3.2, -3]` looking at `[24, 1, -16]`) to `3.0` (`#capabilities`, camera at `[49, 3.5, -18]` looking at `[48, 1, -32]`), `capabilities` (`addEnvironment(2)`) was parked at a fixed world position `(48, 0, -32)`.
   - Between `chapter = 2.10` and `2.25`, `[data-capability-viewport]` entered the viewport (`inWindow = true`, `engine.root.visible = true`), while `capWeight = smooth(clamp((1 - Math.abs(frame.chapter - 3) - 0.25) / 0.75))` was still **`0`**. Because `if (targetRect && inWindow && capWeight > 0.001)` did not run while `capWeight === 0`, `engine.root` appeared unscaled and unaligned on the far right of the screen.
   - Then, as `chapter` crossed `2.25 -> 3.0`, `projected.copy(engineCenter).project(camera)` projected `(48, 1.4, -32)` from a camera still travelling from `x = 28` to `x = 49`. That produced a large negative horizontal pixel offset (`offset.x ≈ -900px` shrinking to `+180px`) multiplied by `capWeight` (`0 -> 1`), causing `offset.x * capWeight` to swing `-250px` left and then `+180px` right over ~1 second of scrolling.
2. **Discontinuous `targetRect` Switch at `morph = 0.05` (`lib/experience/world.ts`)**:
   - `const targetRect = morph > 0.05 ? accessRect : engineRect;` snapped the view-offset target in a single frame from `[data-capability-viewport]` (right column) to `[data-access-architecture]` (centered lower stage) when `morph` crossed `0.05`.
3. **Per-Frame JS Opacity Fighting an `800ms` CSS Transition (`app/experience.css` + `lib/experience/world.ts`)**:
   - `.universe-world` had `transition: opacity 800ms ease;` in CSS while `world.ts` set `host.style.opacity = String(opacity)` on every scroll frame.
4. **Late Lazy Initialization of `WorldStage.tsx` (`components/experience/WorldStage.tsx`)**:
   - `near` only flipped `true` at `frame.chapter > 2.08 || (frame.sections.playground ?? 0) > 0.65`, so `import("@/lib/experience/world")` and `createWorld()` often finished right as `#capabilities` entered the viewport, flashing `.capability-drawing-fallback` before `html[data-world-state="ready"]` hid it.

### Fixes Implemented
- **Camera-Target Anchoring During Entry (`lib/experience/world.ts`)**:
  - For `chapter < 3`, `capabilities.position` and `engineCenter` track `(pose.target[0], 0, pose.target[2])` and `(pose.target[0], 1.4, pose.target[2])` (locking to `(48, 0, -32)` for `chapter >= 3`), keeping `engineCenter` dead-center in front of the camera at a constant `14.2`-unit distance throughout the `#playground -> #capabilities` transition.
  - Replaced the non-monotonic `capWeight` bell curve with `capWeight = smooth(clamp((3.85 - frame.chapter) / 0.65))`, which is `1.0` across the entire `#playground -> #capabilities` approach and smoothly releases to `0` when transitioning from `#capabilities` into `#about` (Builder).
- **Smooth `targetRect` Interpolation (`lib/experience/world.ts`)**:
  - Replaced `morph > 0.05 ? accessRect : engineRect` with continuous `lerp` across `left`, `top`, `width`, and `height` between `engineRect` and `accessRect`.
- **Removed Competing CSS Opacity Transition (`app/experience.css`)**:
  - Removed `transition: opacity 800ms ease` from `.universe-world` so `world.ts` controls opacity directly on each frame without lag.
- **Earlier Pre-Warming After Hero (`components/experience/WorldStage.tsx`)**:
  - `setNear(true)` triggers at `frame.chapter > 1.15 || (frame.sections.signal ?? 0) > 0.55 || (frame.sections.playground ?? 0) > 0.02` (while still remaining `false` at `scrollY = 0` on Hero), so `data-world-state="ready"` is already active before `#capabilities` enters the viewport.

---

## 3. Capabilities 3D Rebuild (Builder-Caliber Techniques)

### Experience A — `03A / THE INFINITE CODE CHAMBER` (`lib/experience/capability-engine.ts` & `components/experience/CapabilityMap.tsx`)
- **Physical 3D Studio Architecture**:
  - Built with the same `RoundedBoxGeometry` + `MeshStandardMaterial` (`alloy`, `graphite`, `darkFloorMat`) and 3D `PointLight` studio lighting as Builder (`developer-room.ts`), featuring an architectural floor with illuminated cyan/lavender depth rails and vertical studio wall slats.
- **6 Dual-Monitor Physical Workstations (`01` Write, `02` Workflows, `03` Research, `04` Bilingual SV/EN, `05` Memory, `06` Vision & Voice)**:
  - Each station pairs a **Left Physical 3D Code Monitor** (`TS 01-write.tsx` .. `06-multimodal.tsx`) with a **Right Physical 3D Component Preview Monitor** (`PROPOSAL COMPOSER`, `PLAYBOOK PIPELINE`, `DECISION MATRIX`, `SV / EN BRIDGE`, `RLS CONTEXT VAULT`, `VISION & VOICE`) connected by a lower illuminated waveguide bridge rail.
  - Both 3D monitors use power-of-two `1024 × 512` `CanvasTexture`s with `generateMipmaps = true`, `THREE.LinearMipmapLinearFilter`, and `anisotropy = 8` for crisp, alias-free typography.
  - As the visitor scrolls through `#capabilities`, the active station glides to the front hero plane (`z = +0.55`) while the remaining 5 stations form a receding 3D perspective corridor behind it.
  - Both the 3D Code Monitor and the synchronized DOM `[data-living-code-console]` progressively type TypeScript code character-by-character with a live cursor (`▌`) while the adjacent 3D Component Monitor builds its UI cards, charts, and telemetry in lockstep.

### Experience B — `03B / THE AI ASSEMBLY LINE` (`lib/experience/capability-engine.ts` & `components/sections/Capabilities.tsx`)
- **Panoramic 3-Stage Physical Studio Creation Pipeline**:
  - Set on a `9.4 × 3.4` `RoundedBoxGeometry` architectural deck with dual illuminated conveyor tracks and 4 physical 3D modular slabs gliding from left to right as `assemblyProgress` advances:
    1. **Stage 01 (`x = -2.85`) — `01 · MULTIMODAL INPUT STREAM`**: Progressively types incoming Prompt, Vision AST, and Voice signals.
    2. **Stage 02 (`x = -0.05`) — `02 · AI CODE & SCHEMA SYNTHESIS`**: Progressively writes the `BudAI.synthesize({...})` TypeScript architecture schema.
    3. **Stage 03 (`x = +2.80`) — `03 · ASSEMBLED PRODUCT (LIVE)`**: Reveals the completed `BudAI Enterprise Portal · Live` interface with its header navigation, `ARR & VELOCITY` chart card, and `VERIFIED MODULES` checklist.

---

## 4. Loading Screen Perfection (`components/effects/LoadingScreen.tsx`, `app/experience.css`, `lib/experience/brain.ts`)
- Replaced the rectangular card border around `.opening-identity-stage` with a borderless radial optical depth halo (`radial-gradient(ellipse 66% 58% at 50% 50%, rgba(2, 6, 14, 0.92) 0%, ...)`) so the `BudAI` letterforms (`B-u-d-A-I`), optical cursor, specular light sweep, and `DEVELOPED BY STILLEDEV · SWEDEN` horizon float cleanly inside the 3D neural brain before emerging into the interactive Hero pose.
