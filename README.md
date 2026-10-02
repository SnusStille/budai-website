# BudAI — Playground Edition

The product site for **BudAI**, the AI work assistant for Sweden. One page, one job:
**let a visitor test BudAI immediately, understand what it is, and join the waitlist.**

> Built on an AI-first foundation. Not a dashboard. Not a landing page. A product you can try.

Developed by **Stilledev** · Live: [stilledev.se](https://stilledev.se)

---

## Page structure

| Order | Anchor | What it does |
|---|---|---|
| 1 | `#playground` | "Här kan du testa BudAI" — the live AI chat is the home experience. Full-viewport shell, empty state with example prompts, typing/streaming, workspace, history, voice, images |
| 2 | `#budai` | What BudAI is — for individuals / for business, live capability preview, real limits, plus the FAQ (`#faq`) |
| 3 | `#vision` | Built for the way we work — three beliefs and the 5-step path |
| 4 | `#waitlist` | Founding access — individual or company, validation, success + referral link, invite code |
| 5 | Footer | Anchors, socials, legal (inline modal), language switcher |

Auth, admin (`/admin`) and legal pages (`/legal/[slug]`) are unchanged.
Everything is bilingual (SV / EN) through `lib/i18n.ts` + `LanguageContext` (default EN).

### Removed in this edition

The old "developer showcase" sections were deleted instead of hidden: Terminal, System Status,
Timeline, Hero, Capabilities, BuddyCard, Command Palette, Toast Stack, Focus Mode, Loading Screen,
Surprise toasts, Stockholm Clock, AICore, CodeBackground, Keyboard Hint, Marker Underline, Signature.
`⌘K` now belongs to the Playground alone (shortcuts) instead of colliding with a global palette.

---

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + Framer Motion (design tokens + motion live in `app/globals.css`)
- **Supabase** (auth, waitlist, playground conversations/memory, admin)
- **Anthropic Claude** (`/api/playground`, `/api/playground/generate-image`)
- **Vercel Analytics**

---

## Quick start

```bash
npm install
cp .env.example .env.local   # add Supabase + Anthropic keys
npm run dev                  # → http://localhost:3000 · admin at /admin
```

Without Supabase keys the waitlist falls back to in-memory mock data (the UI hides the counter
rather than showing a mock number). Without `ANTHROPIC_API_KEY` the playground returns an honest
error bubble.

---

## Environment variables

See `.env.example` for the full list:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For waitlist | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For waitlist | Supabase anon key |
| `ANTHROPIC_API_KEY` | For playground | Claude API key (server-only) |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Recommended | Admin panel password |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical URL (default `https://stilledev.se`) |
| `ANTHROPIC_MODEL` | Optional | Model override |

---

## Supabase setup

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Put URL + anon key in `.env.local`
4. (Optional) tighten RLS for production

---

## Playground

**Guests** get 12 messages/day, 2 saved conversations, no images and no memory.
**Members** (Google/email sign-in) get 80 messages/day, 15 images, 8 generations, 40 conversations
and long-term memory. Limits live in `lib/limits.ts` and are enforced server-side
(`/api/playground`, `/api/playground/usage`).

Shortcuts: `Enter` send · `Shift+Enter` newline · `⌘/Ctrl+N` new chat · `⌘/Ctrl+E` export ·
`⌘/Ctrl+B` workspace · `⌘/Ctrl+K` shortcuts · `Esc` close topmost layer.

```
components/sections/AIPlayground.tsx   # orchestrator: state, API calls, limits, layout
components/playground/                 # presentational pieces
  ChatEmptyState.tsx                   # "What can BudAI help you with?" + example prompts
  ChatMessageRow.tsx                   # bubbles, actions, dual options, images, error + retry
  ThinkingBubble.tsx                   # thinking → streaming preview with caret
  ChatComposer.tsx                     # auto-growing input, tools, send/stop, attach, mic
  ChatSidebar.tsx                      # history: search, new/temporary chat, grouped by date
  WorkspacePanel.tsx                   # desktop panel + mobile sheet for long answers
  presets.ts                           # example prompts, intents, "surprise me", helpers
  markdown.tsx                         # safe, dependency-free markdown renderer
```

---

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint (next/core-web-vitals)
npx tsc --noEmit # type check
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

## Project structure

```
app/
  page.tsx              # the single landing page (playground → budai → vision → waitlist)
  layout.tsx            # fonts, metadata, JSON-LD, providers
  api/playground/       # Claude chat, image generation, usage
  api/usage|features|admin/
  admin/                # waitlist control center
  auth/callback/        # Supabase OAuth callback → back to #playground
  legal/[slug]/         # privacy, terms, cookies, GDPR
components/
  sections/             # landing sections (Navbar, PlaygroundIntro, AIPlayground, WhatIsBudAI,
                        #  Vision, Waitlist, Footer)
  playground/           # chat UI pieces
  auth/                 # AuthProvider, AuthModal, hash handling
  admin/ ui/ effects/   # admin widgets, shared primitives, ambient effects
lib/                    # i18n, limits, data layer, playground stores, utils
supabase/schema.sql
```

---

## Notes for contributors

- Keep `#playground` on the page — the OAuth callback and the skip link both target it.
- `next.config.js` intentionally omits `X-Frame-Options` (the site is previewed in an iframe).
- Design tokens and every animation live in `app/globals.css`; `prefers-reduced-motion` is
  respected in one consolidated block — add new motion there.
- Don't reintroduce a global `⌘K` handler or a `/` key binding: the Playground owns those keys.
- No invented metrics, users or testimonials. If the backend can't produce a number, don't show it.

---

## License

© 2026 BudAI by Stilledev. All rights reserved.
