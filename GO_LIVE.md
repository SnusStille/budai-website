# BudAI v0.92 — Launch

```bash
unzip BudAI-Launch.zip && cd budai-website
npm install
cp .env.example .env.local   # fill keys
npm run build
```

**Env:** `NEXT_PUBLIC_SITE_URL`, Supabase URL + anon, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_ADMIN_PASSWORD`

**SQL once:** `supabase/schema.sql` if waitlist table missing.

Push → Vercel → stilledev.se. Protect `/admin` in production.
