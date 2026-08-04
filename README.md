# BudAI Website v3.0 — Final Edition

The official developer preview website for **BudAI** — an advanced AI platform built for Swedish companies.

> "BudAI is not another AI tool. BudAI is the future digital employee for Swedish companies."

Developed by **Stilledev**.

---

## What's Included

### 🧠 AI Playground
Fully interactive chat demo with 6 preset prompts and custom input. Features typing animation, confidence indicators, and realistic AI responses.

### 🎊 Premium Waitlist
Multi-field signup (name, email, company, industry, employees, interest) with confetti celebration and "Founding Companies" branding.

### 🛠️ Admin Dashboard (`/admin`)
Hidden admin panel with:
- Stats cards with animated counters
- Full user management table (approve/reject/delete)
- Activity chart
- Live system terminal logs
- Supabase-ready data layer

### 🖥️ Developer Mode
Toggle in navbar that transforms the site aesthetic.

### 🥚 Easter Eggs
- Type "budai" anywhere for console surprise
- Premium console branding on load

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000

# Admin dashboard
# → http://localhost:3000/admin
```

---

## Supabase Setup

1. Create a Supabase project
2. Create table `waitlist_users`:
   - `id` (uuid, primary key)
   - `name` (text)
   - `email` (text, unique)
   - `company` (text)
   - `industry` (text)
   - `employees` (text)
   - `interest` (text)
   - `access_status` (text, default: 'pending')
   - `created_at` (timestamp)
3. Update `.env.local` with your credentials
4. Uncomment Supabase code in `lib/data.ts`

---

## Deployment

```bash
npm run build
# Static export in dist/ — ready for Vercel
```

---

## License

© 2026 BudAI by Stilledev. All rights reserved.
