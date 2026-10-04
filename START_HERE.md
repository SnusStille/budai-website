# START HERE — BudAI website (Lattice build)

This zip is the full source of the BudAI site as of the **Lattice** release:
new logo everywhere, Playground 2.3, Waitlist v3 and the Logo Lab.

Everything runs on Next.js 14. Nothing is generated or hidden — clone, install,
run.

---

## 1. Get it running (2 minutes)

```bash
npm install          # Node 18.17+ or 20+ recommended
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

Production check:

```bash
npm run build && npm run start
```

> `node_modules/` and `.next/` are intentionally **not** in the zip — `npm install`
> recreates them, and shipping them would add hundreds of MB.

## 2. Environment variables

Copy `.env.example` → `.env.local` and fill in what you need:

| Variable | Needed for | Without it |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | live AI answers in the Playground (`/api/playground`) | the Playground UI works fully, but answers return a "no key configured" notice |
| `ANTHROPIC_MODEL` | which Claude model answers | falls back to the built-in default |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | waitlist storage, accounts, admin | the waitlist form still validates, but nothing is stored |
| `NEXT_PUBLIC_SITE_URL` | OG/metadata base URL | falls back to localhost |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | `/admin` gate | admin stays locked |

## 3. Where the new work lives

**Logo — "Lattice"** (chosen in the lab, now shipped)
- `components/ui/BudAILogo.tsx` — the mark: six spokes, node ring, orbital
  shells, boot sequence. `LATTICE_*` constants hold every coordinate.
- `public/favicon.svg` — standalone animated version (also the PWA icon).
- `app/opengraph-image.tsx` — simplified six-node mark on the social card.
- `components/logo/candidates.ts` + `components/logo/LogoLab.tsx` +
  `app/logo/page.tsx` — the lab with all six candidates, SVG/PNG download,
  shortlist, vote and "test in the navigation" (`budai.logo.live`).
- `components/logo/LiveMark.tsx` — what the navbar renders.

**Playground 2.3** (`components/playground/`)
- `PlaygroundApp.tsx` — orchestrator: streaming, personas, compare, voice,
  variants, transforms, notes, share, status rail, palettes.
- `MessageList.tsx` — variant switcher (v1/v2/v3), transform chips, and the
  **text-selection toolbar** (explain / translate / improve / expand / save note).
- `Composer.tsx` — slash commands, attachments, "Improve" pill, voice button.
- `VoiceMode.tsx` — hands-free dialog: continuous speech recognition, mic level
  orb, auto TTS.
- `Panels.tsx` — inspector (sandboxed live preview of HTML/CSS/SVG), memory,
  prompt library, gallery, notes, command palette, shortcuts.
- `Tour.tsx` — first-visit guided tour (replay: ⌘K → "Rundtur").
- `lib/playground/share.ts` — conversation → base64url link,
  rendered read-only at `/playground/share`.
- `lib/playground/localStore.ts` — conversations, settings, notes in localStorage.

**Site**
- `components/ui/SitePalette.tsx` — ⌘K palette for the whole site.
- `components/sections/Waitlist.tsx` — 10% founding offer: count-up band, offer
  ticker, 250-seat map (your seat lights up after joining), FAQ.
- `components/sections/AIPlayground.tsx` — the "powers belt": seven cards that
  drop a demo prompt into the composer.
- `PLAYGROUND_V2.md` — full changelog of every round (v2 → v2.3 → Lattice).

## 4. Keyboard map

| Keys | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | command palette (site-wide; the Playground has its own) |
| `Enter` / `Shift+Enter` | send / new line |
| `/` | slash commands in the composer |
| `⌘E` | export conversation as Markdown |
| `⇧/` | shortcut sheet |
| `↑` in empty composer | recall the previous prompt |
| `Esc` | close panels, voice mode, tour |

## 5. Known preview limits

- The local preview has no AI key by default, so live generation is off until
  you add `ANTHROPIC_API_KEY`.
- Voice mode needs a Chromium-based browser (Web Speech API).
- Everything user-side (conversations, notes, settings, votes) lives in
  `localStorage` — no database required to test the interface.

---

Byggt i Kista, Stockholm · Stilledev
