# BudAI Product v4 — Launch report

**Package:** `4.0.0` · **Site preview:** still **v0.93 · 93%**  
**Build:** `npm run lint` ✅ · `npm run build` ✅  
**ZIP:** `/home/user/BudAI-Launch.zip` (no `node_modules`, `.next`, secrets)

---

## What shipped

### Real product Playground
- Guest try path with daily limits vs signed-in higher limits
- **Auth:** Google OAuth + email magic link (Supabase) + **Continue as guest**
- Cloud conversation history (members) · limited local history (guests)
- **Auto long-term memory** (`[[MEMORY:]]` stripped server-side) · view / delete / clear
- Image attach + Claude vision (members)
- Image generation via OpenAI when `OPENAI_API_KEY` is set — **honest 501 otherwise**
- Voice input via Web Speech API with listening UI
- Modes: Single (default) · Dual · Concise · Image mode toggle
- Mobile-first composer (attach · mic · send)

### Site productization
- `AuthProvider` + `AuthModal` wired in root `Providers`
- Buddy dog popup **removed**
- Vision attribution → **Stilledev S mark** (no dog photo)
- Capabilities **WOW**: product pills + live typewriter stage + FAQ under cards
- Admin **Platform** tab: real counters when v4 tables exist (profiles, conversations, memories, msgs today)
- Aperture Node logo + favicon
- Optional `middleware.ts` for Supabase session refresh
- `.env.example` updated (OpenAI, service role, Anthropic, Supabase)

### Limits (enforced UX + API)

| Tier   | Messages/day | Vision | Image gen | Memory / cloud history |
|--------|-------------:|-------:|----------:|------------------------|
| Guest  | 12           | 0      | 0         | no                     |
| Member | 80           | 15     | 8         | yes                    |

---

## SQL you must run

**File:** `supabase/MIGRATION_v4_product.sql`  
Supabase → SQL Editor → paste/run entire file.

Creates: `profiles`, `conversations`, `messages`, `memories`, `usage_daily`, `usage_guest_daily`, `platform_events` + RLS + `handle_new_user` trigger.

Also keep existing `schema.sql` (+ v2 if already applied). v3 is optional/legacy vs v4 product tables.

### Auth providers (Dashboard)
1. Authentication → Providers → **Google** + **Email**
2. Redirect URLs:
   - `https://stilledev.se/auth/callback`
   - `http://localhost:3000/auth/callback`
   - Arena preview origin `/auth/callback` if testing there

---

## Env keys

```bash
NEXT_PUBLIC_SITE_URL=https://stilledev.se
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # preferred for usage counters / admin aggregates
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514   # optional
OPENAI_API_KEY=                     # image gen only; omit = 501
OPENAI_IMAGE_MODEL=                 # optional
NEXT_PUBLIC_ADMIN_PASSWORD=         # optional override; UI never shows the key
```

Admin access key (Stille-only, **never shown on page**): still `Daylightshere76` unless env overrides.

---

## Architecture notes

- Thread messages ≠ long-term `memories` ≠ conversation list
- Guests: `localStorage` guest key + local history (max 2)
- Members: Supabase rows under RLS; Bearer token on API routes
- Image gen never fakes pixels without OpenAI
- Phone/SMS auth deferred (needs Twilio)

---

## Standing product rules preserved

- Single mode default · site lang + 🌐 · soft 10% · admin pw secret  
- v0.93 / 93% marketing copy · no fake device private data  
- No invented features · performance-conscious effects  

---

## Deploy checklist

1. Unzip → `npm install`
2. Fill `.env.local` from `.env.example`
3. Run `MIGRATION_v4_product.sql`
4. Enable Google + Email auth + redirect URLs
5. `npm run build && npm start` (or Vercel)
6. Smoke: guest chat limit toast → sign-in → memory → attach image → (optional) gen image

---

## Deferred / next

- Phone auth (Twilio)
- Storage bucket for large media CDN
- Service-role admin-only counters (stricter RLS)
- Package version is **4.0.0**; bump site badge only when you want to leave v0.93
