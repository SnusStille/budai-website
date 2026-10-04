# BudAI Website — Launch Edition

The official developer preview website for **BudAI** — the AI work assistant for Sweden. Write, automate, and think faster in Swedish and English.

> "BudAI is not another AI tool. BudAI is the future of digital work for Sweden."

Developed by **Stilledev** · Live: [stilledev.se](https://stilledev.se)

---

## What's new in this build (V2 polish)

- **New brand — the B-mark**: one letterform, two arcs and a node in orbit, with
  a subtle draw-on animation. Shipped in the navbar, footer, hero, intro screen,
  favicon and the OG card. The lab at **`/logo`** keeps every challenger
  (download SVG/PNG, shortlist, vote, try one live in the navbar).
- **Intro screen back**: mark, `INITIALIZING BUDAI… → READY`, skippable, shown
  once per session and never for `prefers-reduced-motion`. Unhidden before the
  first paint, so it never flashes in over the page.
- **Living background**: three slow aurora fields, a drifting grid and a faint
  grain film — pure CSS, all behind the content, all paused for reduced motion.
- **Home is a gateway**: mark, one line, two buttons, four prompt starters — then
  the Playground. No feature wall.
- **Playground, simplified**: status pill, `SV | EN`, New chat, panel toggle and
  one overflow menu instead of eleven icon buttons. Memory and the fake-metrics
  Insights panel are gone from the public UI, so “balanced” no longer shows twice.
- **About BudAI**: four short answers — what, why, vision, where we are now.
- **Waitlist**: “Get early access to BudAI.” with a gold **10% off at launch**
  pill, a seat bar, and the `BUDAI-EARLY-10` code on success.

New to the repo? Read **`START_HERE.md`** first — it covers install, env vars,
where every new file lives and the keyboard map. Full changelog in
**`PLAYGROUND_V2.md`**.

---

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + Framer Motion
- **Supabase** (waitlist + admin)
- **Anthropic Claude** (AI Playground)
- **Vercel Analytics**

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in Supabase + Anthropic keys

# 3. Develop
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin
```

---

## Environment Variables

See `.env.example` for the full list:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For waitlist | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For waitlist | Supabase anon key |
| `ANTHROPIC_API_KEY` | For playground | Claude API key (server-only) |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Recommended | Admin panel password |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical URL (default `https://stilledev.se`) |
| `ANTHROPIC_MODEL` | Optional | Model override |

Without Supabase keys the waitlist falls back to in-memory mock data.  
Without `ANTHROPIC_API_KEY` the playground returns a graceful offline message.

---

## Supabase Setup

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Put URL + anon key in `.env.local`
4. (Optional) tighten RLS for production

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve production build
npm run lint       # ESLint (next/core-web-vitals)
npm run prune:css  # optional: drop CSS rules no source file references
```

---

## Deploy (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Add the environment variables from `.env.example`
4. Deploy → point `stilledev.se` to the project

```bash
npm run build   # must pass locally before shipping
```

---

## Project Structure

```
app/                  # Next.js App Router
  page.tsx            #   /          Playground front and centre, then intro + waitlist
  playground/         #   /playground  the Playground on its own route
  about/              #   /about       four short answers
  waitlist/           #   /waitlist    10% offer + email capture
  logo/               #   /logo        Logo Lab (noindex)
  playground/share/   #   /playground/share  read-only shared conversation
  api/playground/     # Claude-backed playground endpoint
  admin/              # Waitlist control center
  legal/[slug]/       # Privacy, terms, cookies, GDPR
components/
  playground/         # Composer, MessageList, Panels, Sidebar, VoiceMode, Tour
  sections/           # Hero, AIPlayground, AboutBudAI, Waitlist, Navbar, Footer
  logo/               # LiveMark, LogoLab, candidates
  effects/            # SiteAmbient, IntroScreen (boot), LoadingScreen
  ui/                 # Shared UI primitives
  admin/              # Admin dashboard widgets
lib/                  # data layer, i18n, playground stores
scripts/              # prune-css.js
supabase/             # SQL schema
```

---

## Features

- **Playground first** — the home page opens with the product, not a pitch deck
- Bilingual UI (SV / EN)
- Streaming answers, personas, compare, voice mode, answer variants
- Saved notes, shareable read-only conversations, live HTML/CSS/SVG preview
- **No account needed** to try it; an account adds cloud history and memory
- Waitlist with the **10% at launch** offer (`BUDAI-EARLY-10`)
- Admin panel (`/admin`)
- Command palette (⌘K), guided first-visit tour
- SEO: metadata, OG image, sitemap, robots
- Accessibility: single h1 per page, reduced-motion, focus rings, aria labels

---

## License

© 2026 BudAI by Stilledev. All rights reserved.
