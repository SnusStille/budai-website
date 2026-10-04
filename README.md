# BudAI Website — Preview

**BudAI** is an AI work assistant for Swedish and English — and this is its site.
`stilledev.se` opens straight into the **Playground**: no marketing gateway, no
account required, the product is the front page.

Developed by **Stilledev** · Live: [stilledev.se](https://stilledev.se)

---

## What this build is

- **The Playground is home.** `/` renders the product itself; `/playground`
  permanently redirects there so old links keep working.
- **The mark — "Signal B"**: one unbroken line that rises from a base node, folds
  into the two bowls of a B and opens at the top like a bud. Four nodes are the
  network; a light travels the line while BudAI is generating. It reads as a B
  down to 16px. Judge it at **`/logo`** — every size, state, surface and
  placement on one page.
- **Alive by construction**: the navbar mark and the ambient background both
  listen to a single `budai:brain` event that the Playground emits while a
  response streams, so the whole site leans in when the AI works.
- **Living background**: three slow aurora fields, a drifting grid, a handful of
  code fragments BudAI actually speaks (`const response = await budai.generate()`),
  a sparse node sketch and a faint grain film. Pure CSS, behind everything,
  trimmed on mobile, paused for `prefers-reduced-motion`.
- **Empty Playground**: "What are you working on?" / "Ask BudAI anything." and
  exactly four starters — write, explain, brainstorm, plan.
- **Waitlist**: "Be first to use BudAI." with a clearly visible 10% launch
  discount, a reserved code on success, and no fake numbers — the counter only
  appears when there is real data behind it.
- **About**: three answers (what, why, where we are now) and a way back into the
  product.

## Quality gate

```
npm run lint     # 0 warnings
npm run build    # 20 routes, all static where they can be
npx tsc --noEmit # clean
npm run prune:css  # safe dead-CSS removal (postcss)
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | The Playground — the product, and the front page |
| `/about` | What BudAI is, why, and where it is now |
| `/waitlist` | Early access + the 10% launch discount |
| `/logo` | Logo Lab: the mark in every size, state and surface |
| `/playground` | Redirects to `/` |
| `/playground/share` | Shared conversation view |
| `/admin` | Internal waitlist admin (Supabase) |
| `/legal/*` | Privacy, terms, cookies, GDPR |
| `/opengraph-image` | Social card, drawn from the same tokens as the site |


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
