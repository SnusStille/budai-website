# BudAI — developer preview site

Landing site and live Playground for **BudAI**, an AI work assistant for Sweden and the Nordics (individuals and companies). Built by Stilledev.

## Stack

Next.js 14 (App Router) · Tailwind · Supabase (auth, waitlist, history) · Anthropic API (chat, vision).

## Sections

Hero → Playground → Capabilities → Waitlist → Roadmap → Vision → Footer. Admin dashboard at `/admin` (gated).

## Run locally

```bash
cp .env.example .env.local   # fill in Supabase + Anthropic keys
npm install
npm run dev                  # http://localhost:3000
npm run build                # production build
```

Run the SQL files in `supabase/` in order (schema, then MIGRATION_v2 … v7). Set `ADMIN_PASSWORD` (server-only) to unlock `/admin`.

Never commit `.env.local`. If it was ever pushed, run `git rm --cached .env.local` and rotate the keys.

© 2026 BudAI by Stilledev. All rights reserved.
