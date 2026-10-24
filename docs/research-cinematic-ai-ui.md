# Research + audit notes — cinematic layer, Playground, Waitlist

Companion to the `/` film (`lib/cinema/*`) and the product route (`/budai`). Written so a future
reader can see *why* each external project was used or rejected, and which defects were found in
our own code by testing rather than by guessing.

## How the candidates were evaluated

Each repository was cloned shallowly and inspected for: actual dependency versions (compatibility
with this repo's Next 14.2 / React 18.3 / Tailwind 3), licence file and its terms, asset
redistribution rights, whether it is a whole app, a component registry or a demo, and which
specific technique transfers. Nothing was copied wholesale.

| Candidate | Licence | State | Verdict |
| --- | --- | --- | --- |
| `dilip-kumar-22/orbit` | MIT | Next + vanilla three.js | **Adopted as the engineering model**: native scroll → normalized progress → eased per-frame camera state, fixed canvas under semantic HTML, `EffectComposer` on a `HalfFloatType` + `samples: 4` target with `RenderPass → UnrealBloomPass → OutputPass → custom grade`, ACES tone mapping, `antialias: false` (MSAA comes from the render target), DPR capped at 2, simplex-displaced icosahedron with fresnel rim (only the rim is bright enough to bloom), OKLCH-authored palette converted once for CSS and GL, `visibilitychange` RAF stop, reduced motion = one static frame, try/catch → hide the canvas and serve the static site. |
| `AETumiApp/threejs-scroll-animation` | MIT | demo | **Adopted as the spec**: camera-chapter system keyed to sections, "no heavy work inside scroll events", clamp + normalize everything, DOM measurement out of hot loops, no per-frame allocation. Its QA list (reverse scroll reconstructs state, resize keeps the progress mapping, pinned sections release, no layout jump on load, native touch scroll) became the checklist in the README. |
| `synapvoid-cmd/the-urban-alpha` | **none** | Next 16, R3F 9, drei 10 | **Rejected** — no licence means all rights reserved, so no code may be copied; its stack requires React 19. Its one useful idea (pin a model in the frame and keep copy to one side) is reflected in Scene C's asymmetric layout. |
| `Rohithpranov07/Portfolio-cinematic` | **none** | R3F 9 + drei 10 + Spline scenes | **Rejected** — unlicensed, React 19-era, and its look depends on Spline-exported scenes (third-party runtime + hosted scene, no redistribution rights). |
| `haitham-kh/project-universe-` | MIT | Next 16 + R3F 9 + postprocessing + GSAP + Lenis, 471 MB | **Rejected as code** — framework/asset incompatible; retained as a compositional reference (scroll-pinned object against type). Its GLB assets are third-party branded and were not touched. |
| `Priyan120-dev/parallax-scrolling-Web` | — | 404 | **Unavailable** — repository not found at audit time; skipped. |
| `moazamdotdev/4chat` | Unlicense (public domain) | Next, ~12 k lines of AI-UI components | **Partially adopted.** Its `conversation` uses a scroll-area with smooth initial/resize behaviour; our playground already keeps a manual stick-to-bottom flag, so no change. Its composer patterns (attachment strip, model selector, suggestion chips) matched what `AIPlayground` already implements, except one: **queueing a prompt while a reply streams** — deferred, see below. |
| `vercel/ai` / `vercel/ai-elements` | Apache-2.0 | registry for Next 15 / React 19 / Tailwind v4 / `ai` v5 | **Not installed** — our app streams through our own `/api/playground` route handler with a custom `text/plain` protocol (`\u0000{json}` trailer carries memory/error) and its own markdown renderer; adopting the SDK would replace a working integration for cosmetics, which the brief forbids. Patterns checked against our feature list: `response`, `message`, `actions`, `sources`, `reasoning`, `context` (token meter), `prompt-input`. We already have copy/regenerate/edit/branch, credits meter, personas, dual compare, voice, vision, memory, history search, draft persistence. Missing on our side and worth a later pass: `reasoning`-style collapsible work-in-progress and follow-up suggestions. |
| `magicuidesign/magicui` | MIT | 250 registry components | **One technique adopted**: `animated-beam` (SVG path solved between two measured element rects, re-measured on resize, animated with `pathLength`) — rewritten as `components/cinema/Beams.tsx` for Scene E, where it draws the wiring between the five pipeline stages from the live layout instead of faking it with a gradient stub. The rest was deliberately not adopted: `marquee`, `word-rotate`, `shimmer-button`, `border-trail`, `number-ticker` are the "meaningless animation" the brief warns against, and the page already has one motion signature. |
| `animate-ui/animate-ui` | MIT + **Commons Clause** | registry, Tailwind v4 | **Rejected** — Commons Clause restricts redistribution/sale of the software itself, and its components assume Tailwind v4. Not worth a licence question for effects we don't need. |
| `motiondivision/motion` | MIT | vanilla + React | **No new dependency** — `framer-motion` (same authors) is already installed and its `MotionValue` path is exactly what DOM-side motion uses (`useInView`, `useReducedMotion`, `motion.path`). Note: importing from `framer-motion` rather than `motion/react` keeps one animation system on the page. |
| `greensock/GSAP` | "free" (Webflow) with plugin terms, `standard "no-charge" licence` | 1.1 MB | **Rejected** — a second timeline engine next to a scroll-derived camera model would fight it. ScrollTrigger's job here is done by `lib/cinema/scroll.ts` + `timeline.ts`, with no licence text to track and no extra bundle. |
| `darkroomengineering/lenis` | MIT | smooth-scroll hijack | **Tried, then removed** (it is no longer in `package.json`). It rewrites native scrolling, which breaks anchor jumps, keyboard scrolling and `find-in-page` predictability on a document-first page. Easing lives in the scroll *signal* instead: `damp()` on the value, never on the scrollbar. |
| `pmndrs/react-three-fiber` / `drei` | MIT | React 19-era for the versions that fit this look | **Rejected** — the reconciler's per-component React cost and the drei dependency surface buy nothing for seven procedurally built scenes; vanilla three.js with one imperative `world` keeps React out of the render loop entirely. |

## Defects found in our own code by auditing (and what was done)

1. **`/api/features` was prerendered at build time** (`○` in the route table), so `imageGeneration`,
   `vision` and the new model list were frozen at build and ignored runtime environment changes —
   a deployed site could not turn a capability on without a rebuild. Fixed with
   `export const dynamic = "force-dynamic"` (the convention `app/api/health` already used); the
   route is now `ƒ`. Verified by reading the route table and by changing env between build and run.
2. **`vision: true` was unconditional** — the flag claimed vision before the key that powers it
   existed. Now `vision` mirrors the presence of `ANTHROPIC_API_KEY`, and `chat` was added. The
   response is public and cacheable, so it must only say things that are true of the deployment.
3. **The Waitlist could report success while storing nothing**: `addWaitlistUser` fell back to an
   in-memory `mockUsers` array and `getWaitlistCount` returned `mockUsers.length` (five placeholder
   people), so an unconfigured deploy would tell visitors they were on a list of five. Now the mock
   path runs only under `NODE_ENV === "development"`, production throws `not_configured`, the form
   says so plainly in both languages, and the count returns `null` (badge hidden) rather than a
   number we cannot support. Real Supabase writes are unchanged.
4. **A mid-stream disconnect discarded the answer that had already arrived.** `readStream` let the
   reader's rejection skip finalisation, so the partial reply vanished into a generic error. Partial
   text is now committed and a "reply was cut short" warning is shown; retry context is preserved.
5. **A developer-facing message was shown to visitors**: a missing key produced
   "Playground is not configured. Set ANTHROPIC_API_KEY." on screen. 503 (and the same text in a
   body) now renders a neutral bilingual message, with the detail moved to `console.warn`.
6. **No model selection existed** (the brief listed "broken model selection"): the API had one
   env-configured model. Added `lib/playground/models.ts` — a server-side allowlist (`fast`,
   `quality`, `deep`) resolved from `ANTHROPIC_MODEL_FAST` / `ANTHROPIC_MODEL` /
   `ANTHROPIC_MODEL_DEEP`, published through `/api/features` as labels only, and a composer control
   that appears **only when the deployment can serve more than one tier**. Unknown/hostile ids
   (`"gpt-4"`, `123`, `undefined`, path strings) resolve to the default; verified by running the
   resolver under five env combinations and by POSTing bad payloads. No key ever reaches the browser.
7. **Two palettes on one site**: the product ran on neon `#00e5ff`/`#7c5cff` over `#020205` while the
   film introduced `#30c3ec` over `#02050c`. Unified at the token level — Tailwind `accent.*`,
   `background/surface/muted`, every `rgba()`/`rgb()` triple and roughly 200 literal colour values across 45 files, including
   `LoadingScreen`, `BudAILogo`, `opengraph-image` and `manifest.theme_color`. Layouts stay distinct
   (cinematic document vs. workspace), colour language is now one. The lavender accent was retuned
   to a cool periwinkle (also raising its text contrast from 4.69:1 to 10.05:1 on the void).
8. **ARIA fixes in existing sections**: the Journey stepper declared `role="listitem"` on buttons
   with `aria-pressed` (invalid combination, state silently dropped by AT) → now a labelled
   `role="group"` of toggle buttons; the Waitlist account-type switch claimed `role="tablist"`
   without tabpanels → `aria-pressed`; `LogoEasterEgg` cleared timers through a ref during cleanup →
   captured array; `VoiceOrb`'s effect dependency on `listen()` was intentionally excluded (adding it
   would reopen the microphone on every render) and now says so inline.
   `npx next lint` is clean repo-wide: no errors and no warnings (it had three warnings).

## Explicitly deferred, with reasons

- **Prompt queue while a reply streams** (from 4chat's composer). The input is currently disabled
  while busy, which is honest and simple; a queue means reworking send, stop, draft persistence and
  the credits flow in a 3 200-line component that cannot be visually verified here. Worth doing, not
  worth guessing at.
- **`reasoning`-style collapsible "working" panel** — needs a server change to emit thinking deltas;
  the current `AiActivity` states (thinking → reading image → typing) already cover the need cheaply.
- **Real analytics for the admin chart**: `ActivityChart` renders sample bars and is labelled
  "Mock sample / not live traffic" in the UI. Left as-is rather than silently presented as data.
- **`mockUsers` / `mockAnalytics`** remain in `lib/data.ts` as dev fixtures only. They must never be
  surfaced as clients, metrics or testimonials.
