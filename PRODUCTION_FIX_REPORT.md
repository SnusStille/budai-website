# Production fix report — Auth + Playground (2026-09-11)

## Critical: why magic links hit localhost

**Not a Next.js hardcode.** Code uses `window.location.origin` for `emailRedirectTo`.

**Root cause:** Supabase Dashboard **Site URL** is still `http://localhost:3000`.  
When the redirect URL is missing from the allowlist (or email is old), Supabase **falls back to Site URL** → browser opens localhost → `ERR_CONNECTION_REFUSED`.

### You must do (5 minutes)

1. Supabase → **Authentication → URL Configuration**
2. **Site URL** = `https://stilledev.se` (no trailing slash)
3. **Redirect URLs** add:
   - `https://stilledev.se/**`
   - `https://stilledev.se/auth/callback`
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
4. Delete old magic-link emails; request a **new** link from https://stilledev.se
5. Vercel env: `NEXT_PUBLIC_SITE_URL=https://stilledev.se` → redeploy

Full steps: **`AUTH_SETUP.md`**

---

## Critical: Google “provider is not enabled”

**Root cause:** Google provider is **disabled** or missing Client ID/Secret in Supabase.  
Code cannot enable Google for you.

### You must do

1. Google Cloud → OAuth Web client  
   - Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`  
2. Supabase → Authentication → Providers → **Google → Enable**  
   - Paste Client ID + Secret → Save  

UI now shows this exact guidance if the API returns `provider is not enabled`.

---

## Code changes in this pass

| Area | Change |
|------|--------|
| `lib/site.ts` | Env-aware site + auth callback helpers |
| `AuthProvider` | `getAuthCallbackUrl()`, better Google/email errors |
| `/auth/callback` | Hardened origin (x-forwarded-host), secure cookies, no localhost trap on Vercel production |
| `AuthHashHandler` | Hash token sessions (`#access_token=`) |
| `next.config.js` | `microphone=(self)` so voice works |
| Logo | **Pulse Orbit** final mark + favicon |
| Vision | Story path Sweden → Nordics → World (not 4 flat cards) |
| Playground | Copy + Regenerate on assistant messages |
| Docs | `AUTH_SETUP.md`, this report |

---

## NEW SUPABASE SQL

No destructive schema required for auth.  
If not applied yet:

- `supabase/MIGRATION_v4_product.sql`
- `supabase/MIGRATION_v5_playground_hardening.sql`

Auth is **configuration**, not SQL.

---

## After you change Supabase + redeploy

Test on **https://stilledev.se**:

1. Guest chat → New chat → switch history  
2. Email magic link → lands on **stilledev.se** signed in  
3. Google login (after provider enable)  
4. Refresh → still signed in  
5. Logout → login again  
6. Memory panel / temporary chat  
7. Mobile drawer New chat  

Then same on localhost (Site URL stays production; localhost stays on Redirect allowlist).

---

## Vercel variables checklist

```
NEXT_PUBLIC_SITE_URL=https://stilledev.se
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...   # optional
```
