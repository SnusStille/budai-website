# Google Login — exact setup for BudAI (stilledev.se)

> **Status (product UI):** Google button is **disabled** with label **“Available on launch” / “Vid launch”**.  
> Magic-link email remains the live sign-in path. Re-enable the button in `AuthModal` + restore `signInWithGoogle` in `AuthProvider` after the steps below are done.


Email magic link already works in code.  
**Google fails until you enable it in Supabase + Google Cloud.**  
No Client ID/Secret can be invented in the repo.

---

## STEP 1 — Open Google Cloud

1. Go to: https://console.cloud.google.com/  
2. Select or create a project (e.g. `BudAI` / `Stilledev`)

---

## STEP 2 — OAuth consent screen

1. **APIs & Services → OAuth consent screen**  
2. User type: **External** (or Internal if Workspace-only)  
3. App name: `BudAI`  
4. User support email: your email  
5. Developer contact: your email  
6. **Authorized domains** add:
   - `stilledev.se`
   - `supabase.co`
7. Save → continue through scopes (default is fine for login)  
8. Add test users if app is in **Testing** mode

---

## STEP 3 — Create OAuth client

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**  
2. Application type: **Web application**  
3. Name: `BudAI Supabase`

### Authorized JavaScript origins

```
https://stilledev.se
https://www.stilledev.se
http://localhost:3000
```

Also add your Supabase project host:

```
https://YOUR_PROJECT_REF.supabase.co
```

(Find `YOUR_PROJECT_REF` in Supabase → Project Settings → API → Project URL)

### Authorized redirect URIs — **critical**

Paste **exactly** this (from Supabase Google provider panel, same pattern):

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

⚠️ This is the **Supabase** callback, **not** `https://stilledev.se/auth/callback`.

4. Create → copy **Client ID** and **Client Secret**

---

## STEP 4 — Enable Google in Supabase

1. https://supabase.com/dashboard → your BudAI project  
2. **Authentication → Providers → Google**  
3. **Enable** toggle ON  
4. Paste:
   - **Client ID**
   - **Client Secret**
5. Save  

Optional: leave “Skip nonce check” off unless you hit a specific nonce bug.

---

## STEP 5 — Supabase URL config (same as magic link)

**Authentication → URL Configuration**

**Site URL:**

```
https://stilledev.se
```

**Redirect URLs** (all of these):

```
https://stilledev.se/**
https://stilledev.se/auth/callback
https://www.stilledev.se/**
https://www.stilledev.se/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

Save.

---

## STEP 6 — Vercel environment variables

Vercel → Project → **Settings → Environment Variables** → Production:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://stilledev.se` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (admin chats) |
| `ANTHROPIC_API_KEY` | playground |

**You do NOT put Google Client ID/Secret in Vercel** — they live only in Supabase Provider settings.

Redeploy after env changes.

---

## STEP 7 — Test

1. Incognito → https://stilledev.se  
2. Playground → **Sign in** → **Continue with Google**  
3. Pick account → should return to `#playground` signed in  
4. Refresh page → still signed in  
5. Logout → guest again  

Also test on `http://localhost:3000` after `npm run dev` (origins must include localhost).

---

## STEP 8 — If it still fails

| Symptom | Fix |
|---------|-----|
| “Google sign-in is currently unavailable” | Provider OFF or empty Client ID/Secret in Supabase |
| `redirect_uri_mismatch` | Google Cloud missing `https://xxx.supabase.co/auth/v1/callback` |
| Lands on localhost | Site URL still localhost — set to `https://stilledev.se` |
| Works once then loses session | Check middleware + cookies; HTTPS only on prod |
| PKCE / code verifier | Finish OAuth in **same browser** that started it |

App UI never shows raw Supabase JSON — see `lib/authErrors.ts`.

---

## Code path (already implemented)

- `signInWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: "google", redirectTo: origin/auth/callback?... })`  
- Callback: `app/auth/callback/route.ts` exchanges code → session cookies  
- Redirect back to `/#playground`

No further code is required once Dashboard credentials are correct.
