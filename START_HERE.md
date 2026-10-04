# START HERE — BudAI website (v2 polish)

This zip is the full source of the BudAI site after the **V2 polish**: the new
**B-mark** identity, a rebuilt intro screen, a living background, a simpler
Playground, a shorter About and a sharper 10% waitlist.

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

## 3. Routes

| Route | What it is |
| --- | --- |
| `/` | The product first: Hero → Playground → short intro → Waitlist → Footer |
| `/playground` | The Playground on its own route (same app, full attention) |
| `/about` | Four short answers: what, why, vision, where we are now |
| `/waitlist` | The 10% launch offer and email capture (`BUDAI-EARLY-10`) |
| `/logo` | Logo Lab — all candidates, downloads, vote, live trial (noindex) |
| `/playground/share` | Read-only shared conversation (transcript lives in the link) |
| `/legal/*` | Privacy, terms, cookies, GDPR |
| `/admin` | Waitlist control centre (password gated) |

Navigation and footer links resolve correctly from every route.

## 4. Where the new work lives

**Brand — the B-mark**
- `components/ui/BudAILogo.tsx` — stem + two bowls + orbiting node; the three
  strokes draw themselves on mount, the node speeds up while BudAI thinks.
- `public/favicon.svg` — standalone animated version (also the PWA icon).
- `app/opengraph-image.tsx` — the B-mark and the new "Try BudAI right now" card.
- `components/effects/IntroScreen.tsx` + `components/effects/introScript.ts` —
  the flash-free intro, gated by an inline script before first paint.
- `components/effects/SiteAmbient.tsx` — the living backdrop (pure CSS).
- `components/logo/candidates.ts` + `components/logo/LogoLab.tsx` +
  `app/logo/page.tsx` — the lab with all six candidates, SVG/PNG download,
  shortlist, vote and "test in the navigation" (`budai.logo.live`).
- `components/logo/LiveMark.tsx` — what the navbar renders.

**Playground** (`components/playground/`)
- `PlaygroundApp.tsx` — orchestrator: streaming, personas, compare, voice,
  variants, transforms, notes, share links, palettes, overflow menu.
- `MessageList.tsx` — variant switcher (v1/v2/v3), transform chips, and the
  **text-selection toolbar** (explain / translate / improve / expand / save note).
- `Composer.tsx` — slash commands, attachments, "Improve" pill, voice button.
- `VoiceMode.tsx` — hands-free dialog: continuous speech recognition, mic level
  orb, auto TTS.
- `Panels.tsx` — inspector (sandboxed live preview of HTML/CSS/SVG), prompt
  library, gallery, notes, command palette, shortcuts.
- `Tour.tsx` — first-visit guided tour (replay: ⌘K → "Rundtur").
- `lib/playground/share.ts` — conversation → base64url link,
  rendered read-only at `/playground/share`.
- `lib/playground/localStore.ts` — conversations, settings, notes in localStorage.

**Site**
- `components/ui/SitePalette.tsx` — ⌘K palette for the whole site.
- `components/sections/Waitlist.tsx` — "Get early access to BudAI." with a gold
  **10% off at launch** pill, a seat bar that lights up your seat after you join,
  and the `BUDAI-EARLY-10` code in the success state.
- `components/sections/AIPlayground.tsx` — a small header and the full app; no
  feature wall between the visitor and the product.
- `components/sections/Hero.tsx` — mark, wordmark, one line, two buttons and four
  prompt starters that prefill the composer.
- `components/sections/AboutBudAI.tsx` — four short answers: what, why, vision,
  where we are now.
- `PLAYGROUND_V2.md` — full changelog, newest round last (V2 polish).

## 5. Keyboard map

| Keys | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | command palette (site-wide; the Playground has its own) |
| `Enter` / `Shift+Enter` | send / new line |
| `/` | slash commands in the composer |
| `⌘E` | export conversation as Markdown |
| `⇧/` | shortcut sheet |
| `↑` in empty composer | recall the previous prompt |
| `Esc` | close panels, voice mode, tour |

## 6. Known preview limits

- The local preview has no AI key by default, so live generation is off until
  you add `ANTHROPIC_API_KEY`.
- Voice mode needs a Chromium-based browser (Web Speech API).
- Everything user-side (conversations, notes, settings, votes) lives in
  `localStorage` — no database required to test the interface.

---

Byggt i Kista, Stockholm · Stilledev
