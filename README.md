# BudAI — Playground Edition

The product site for **BudAI**, the AI work assistant for Sweden. One page, one job:
**let a visitor test BudAI immediately, understand what it is, and join the waitlist.**

> Built on an AI-first foundation. Not a dashboard. Not a landing page. A product you can try.

Developed by **Stilledev** · Live: [stilledev.se](https://stilledev.se)

---

## Page structure

| Order | Anchor | What it does |
|---|---|---|
| 1 | `#playground` | "Här kan du testa BudAI" — the live AI chat is the home experience. Full-viewport shell, empty state with example prompts, streaming answers, workspace, history, voice, images |
| 2 | `#budai` | What BudAI is — who it is for, how an answer is built (live typing demo), the real guest/member limits table, preview disclosure, plus the FAQ (`#faq`) |
| 3 | `#vision` | Built for the way we work — manifesto, three principles, the Sweden → Nordics → world path, the live/in-progress/exploring status card, pull quote |
| 4 | `#waitlist` | Founding access — the pitch, three steps and three benefits beside the form; individual or company, validation, success + referral link, invite code |
| 5 | Footer | Brand block with a back-to-Playground action, link groups, legal (inline modal), preview note |

### Deep pages

| Route | What it is |
|---|---|
| `/roadmap` | The honest status page: live now, in progress, exploring, how we prioritize. Linked from the product section and the footer |
| `/playbooks/[slug]` | Three practical guides — write an email, analyze a text, get two options. Each step has a copyable prompt that feeds the composer; every page links back to `#playground` |
| `/admin` | Unchanged operations view (own grid/glass styling) |
| `/legal/[slug]` | Unchanged legal pages |

Everything is bilingual (SV / EN) through `lib/i18n.ts` + `LanguageContext` (default EN),
and the copy rule is simple: **nothing invented.** No fake users, no fake counters, no promised dates.
The preview says what it is and the roadmap says what is not finished.

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
- **Self-hosted fonts** — Plus Jakarta Sans + JetBrains Mono as variable woff2 in `app/fonts/`
  (SIL OFL, licenses included), loaded through `next/font/local`

### Design system

`app/globals.css` is the single source of truth: identity colors, hairlines, elevation,
radii and the easing tokens, plus one fluid type scale (`--fs-display` … `--fs-micro`).
Tailwind exposes the same tokens as new utilities (`text-h2`, `rounded-card`, `shadow-lift`,
`ease-expo`, `max-w-shell`…) without overriding any Tailwind default.

Reusable primitives: `eyebrow`, `fig`, `kbd`, `card` / `card-hover` / `card-edge`, `sheen`,
`panel`, `hairline`, `chip`, `btn-primary` / `btn-ghost` / `btn-quiet` / `icon-btn`,
`status-dot`, `preview-tag`, `link-arrow`, `meter`, `field`, `input-shell`, `aurora`,
`scroll-cue`, `pg-*` (playground motion). All animation is disabled in one
`prefers-reduced-motion` block.

The `preview-tag`, `fig` build stamp and the honesty notes in the hero, limits card, footer and
`/roadmap` are intentional: this site should read as **a preview of a real product**, not as a
finished launch. Keep them when editing copy.

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
  roadmap/              # public status page
  playbooks/[slug]/     # three guides with copyable prompts (static params)
  layout.tsx            # fonts, metadata, JSON-LD, providers
  api/playground/       # Claude chat, image generation, usage
  api/usage|features|admin/
  admin/                # waitlist control center
  auth/callback/        # Supabase OAuth callback → back to #playground
  legal/[slug]/         # privacy, terms, cookies, GDPR
components/
  sections/             # landing sections (Navbar, PlaygroundIntro, AIPlayground,
                        #  ProductStory, Vision, Waitlist, Footer, RoadmapView)
  playground/           # chat UI pieces
  playbooks/            # playbook reader
  auth/                 # AuthProvider, AuthModal, hash handling
  admin/ ui/ effects/   # admin widgets, shared primitives, ambient effects
lib/                    # i18n, limits, data layer, playbooks, playground stores, utils
supabase/schema.sql
```

---

## Notes for contributors

- Keep `#playground` on the page — the OAuth callback and the skip link both target it.
- `next.config.js` intentionally omits `X-Frame-Options` (the site is previewed in an iframe).
- Design tokens and every animation live in `app/globals.css`; `prefers-reduced-motion` is
  respected in one consolidated block — add new motion there.
- Don't reintroduce a global `⌘K` handler or a `/` key binding: the Playground owns those keys.
- Keep the preview framing: badges (`preview-tag`), the build stamp in the hero, the honesty note
  in the limits card, the footer preview note and `/roadmap`. This site should look like a real
  product that is *previewed inline* — never like a finished launch and never like "coming soon".
- New sections use the shared primitives (`eyebrow` + a `fig` number, `card`, `hairline`, one
  `aurora` bloom per section at most) and add copy to `lib/i18n.ts` in **both** languages.
- Playbooks are plain data in `lib/playbooks.ts`; adding one is a matter of adding an object and a
  slug to `app/sitemap.ts`. Every playbook must end with a way back to `#playground`.
- No invented metrics, users or testimonials. If the backend can't produce a number, don't show it.

---

## License

© 2026 BudAI by Stilledev. All rights reserved.
