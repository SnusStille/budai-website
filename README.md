# BudAI — Developer Preview

AI work assistant for Sweden. Write, plan, and think faster in Swedish and English.

Live: [stilledev.se](https://stilledev.se)

> Playground is the product. The site is a gateway.

---

## Run in VS Code

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Playground: [http://localhost:3000/playground](http://localhost:3000/playground)

Without `ANTHROPIC_API_KEY` the Playground still loads and returns a graceful offline message.  
Without Supabase the waitlist falls back to in-memory mock data. Auth stays closed.

Optional keys in `.env.local`:

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Supabase (waitlist + auth + memory)
- Anthropic Claude (Playground)

---

## Routes

| Path | Purpose |
|---|---|
| `/` | Gateway → product |
| `/playground` | BudAI itself |
| `/waitlist` | Founding members · 10% at launch (`BUDAI-EARLY-10`) |
| `/about` | Short product note |
| `/admin` | Waitlist control center |
| `/legal/*` | Privacy, terms, cookies, GDPR |

---

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

© 2026 BudAI by Stilledev. All rights reserved.
