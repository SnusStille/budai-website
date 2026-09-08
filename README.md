# BudAI Website — Launch Edition

The official developer preview website for **BudAI** — an advanced AI platform built for Swedish companies and individuals.

> "BudAI is not another AI tool. BudAI is the future of digital work for Sweden."

Developed by **Stilledev** · Live: [stilledev.se](https://stilledev.se)

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
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint (next/core-web-vitals)
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
app/                  # Next.js App Router pages + API
  api/playground/     # Claude-backed playground endpoint
  admin/              # Waitlist control center
  legal/[slug]/       # Privacy, terms, cookies, GDPR
components/
  sections/           # Landing page sections
  effects/            # Canvas / motion effects
  ui/                 # Shared UI primitives
  admin/              # Admin dashboard widgets
lib/                  # data layer, i18n, utils
supabase/             # SQL schema
```

---

## Features

- Bilingual UI (SV / EN)
- Interactive AI Playground with conversation memory
- Live terminal visualization
- Founding-member waitlist (individual + company)
- System status dashboard
- Admin panel (`/admin`)
- Command palette (⌘K)
- SEO: metadata, sitemap, robots
- Accessibility: reduced-motion, focus rings, aria labels

---

## License

© 2026 BudAI by Stilledev. All rights reserved.
