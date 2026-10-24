# STILLEDEV — studio site + BudAI

Two experiences, one repository:

- **`/`** — the STILLEDEV studio experience: a scroll-driven 3D film in seven scenes (Arrival → Premise →
  Intelligence → Construction → Systems → Selected work → Contact). Real-time WebGL, no video files.
- **`/budai`** — the BudAI product landing with the live playground, waitlist, capabilities, roadmap,
  admin-gated sharing and every anchor it had before (`#playground`, `#capabilities`, `#waitlist`, `#about`, `#roadmap`).

`/admin`, `/legal/[slug]`, `/s/[id]`, `/auth/callback` and all `/api/*` routes are unchanged.
Supabase auth redirects (`magic link`) now return to `/budai#playground`.

## Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind · three.js 0.169 (vanilla, no react-three-fiber) ·
Supabase (auth, waitlist, history, feedback) · Anthropic API (chat, vision, image) ·
self-hosted Fontsource variable faces (Archivo, Plus Jakarta Sans, JetBrains Mono — no third-party font request).

## The cinematic layer

| Path | Role |
| --- | --- |
| `lib/cinema/timeline.ts` | Pure, framework-free timeline: scroll → camera keyframes → deterministic scene state. Unit-checkable, no DOM. |
| `lib/cinema/scroll.ts` | One rAF loop publishing an eased scroll signal to every subscriber. Native scrolling, keyboard and anchor jumps stay intact. |
| `lib/cinema/world.ts` | The single persistent three.js scene: morphing logotype point cloud, core, architecture, lattice, project mounts. All geometry procedural — zero downloaded assets. |
| `lib/cinema/shaders.ts` · `mark.ts` · `tokens.ts` | GLSL pairs, wordmark → point sampling, OKLCH palette converted once so CSS and GL cannot drift. |
| `lib/cinema/bus.ts` | DOM ↔ GL events (intro progress, hovered project, paused). |
| `lib/cinema/content.ts` | All scene copy and project data. Every claim is traceable to this repo or `github.com/SnusStille` — no invented clients, metrics or testimonials. |
| `components/cinema/` | `Stage` (poster + lazy canvas + grade), `Chrome` (film leader, chapter rail, studio nav), `StudioFooter`, `scenes/*`. |

Guarantees the layer is built around: the page is semantic HTML first, so it is readable, crawlable and
navigable with WebGL missing, scripting off (`@media (scripting: none)`) or reduced motion requested; the
canvas fades in only when the world is live; rendering pauses when the tab is hidden; quality (DPR cap,
point counts, bloom) degrades per device and on sustained frame loss.

## Run locally

```bash
cp .env.example .env.local   # fill in Supabase + Anthropic keys
npm install
npm run dev                  # http://localhost:3000
npm run build                # production build (this is also the lint/typecheck gate: no test runner exists)
```

Run the SQL files in `supabase/` in order (schema, then MIGRATION_v2 … v7). Set `ADMIN_PASSWORD`
(server-only) to unlock `/admin`.

Never commit `.env.local`. If it was ever pushed, run `git rm --cached .env.local` and rotate the keys.

## Verifying by hand

1. `/` on a laptop: the logotype should assemble during the 2.3 s leader, then tear apart as you scroll.
   `Esc` or the Skip button dismisses the leader immediately.
2. Scroll fast to the bottom and back up to the top: the camera must land in the same place for the same
   scroll offset, with no flicker or layout jump.
3. `/#intelligence`, `/#works`, `/budai#playground` — deep links land on the right chapter.
4. DevTools → Rendering → *Emulate prefers-reduced-motion: reduced*: still frames, all content visible, no leader.
5. DevTools → Network → throttled/offline after first paint, and with JavaScript disabled: the text of all
   seven scenes plus the footer remain available.
6. A phone (or narrow window, portrait): the layout re-composes instead of shrinking — bigger display type,
   single-column panels, the chapter rail hidden, touch scroll native.

© 2026 Stilledev · BudAI. All rights reserved.
