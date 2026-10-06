# BudAI v0.93 — Go Live

App **3.2.0** · preview **v0.93 · 93%**.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Environment

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | `https://stilledev.se` |
| `NEXT_PUBLIC_SUPABASE_URL` | waitlist | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | waitlist | |
| `ANTHROPIC_API_KEY` | playground | server-only |
| `ANTHROPIC_MODEL` | optional | default Claude Sonnet |
| `ADMIN_PASSWORD` | optional | server-only; if unset, admin login is locked |

## Admin

Restricted to **Stille** only. Password never shown on the login UI.  
Set `ADMIN_PASSWORD` in `.env.local` for local development or in the deployment environment for production. There is no default key.

## Waitlist 10%

Code `BUDAI-EARLY-10` — subtle hero chip, Buddy popup, waitlist perks + success copy.

## Playground

- **Single** default · Dual · Concise  
- **Inspirera / Surprise** beside Send  
- Answer language = site language (optional 🌐 override)  
- Starter chips · regenerate · copy · share · stop  

## Brand

- Logo: **circular Neural Orb** (2D motion only)  
- Font: Plus Jakarta Sans  
- OG: `/og.png`  
- Tab hide: `Stilledev.se · BudAI`

## Product wedge

> AI work assistant for Sweden — write, automate, think faster (SV & EN).

## Build

```bash
npm run lint && npm run build
```

## Supabase

Run `supabase/schema.sql` and/or `supabase/MIGRATION_v2.sql` if not already applied.


## Optional SQL v3

`supabase/MIGRATION_v3.sql` — playground_conversations / memory / events (for future accounts). Public demo uses localStorage today.
