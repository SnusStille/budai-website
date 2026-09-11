# BudAI Auth Setup — Production (stilledev.se) + Localhost

This file fixes the two production failures:

1. **Magic link → `localhost refused to connect`**
2. **Google → `Unsupported provider: provider is not enabled`**

Both are **Supabase Dashboard / Google Cloud configuration** issues. Code already sends the correct `window.location.origin` callback. Without dashboard allowlists + Site URL, Supabase ignores our redirect and falls back to localhost.

---

## A. Fix magic links pointing at localhost (REQUIRED)

### Root cause
Supabase **Authentication → URL Configuration → Site URL** defaults to `http://localhost:3000`.  
If `emailRedirectTo` is missing from **Redirect URLs**, Supabase rewrites the email link to **Site URL** → users open localhost → `ERR_CONNECTION_REFUSED`.

### Do this in Supabase Dashboard

1. Open your project → **Authentication** → **URL Configuration**
2. Set **Site URL** to exactly:
   ```
   https://stilledev.se
   ```
   (no trailing slash)
3. Under **Redirect URLs**, add **all** of these (Save after):
   ```
   https://stilledev.se/**
   https://stilledev.se/auth/callback
   https://www.stilledev.se/**
   https://www.stilledev.se/auth/callback
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```
4. Optional previews (if you use Vercel preview URLs):
   ```
   https://*-YOUR-VERCEL-PROJECT.vercel.app/**
   ```
5. **Authentication → Providers → Email**
   - Enable Email
   - Confirm email / magic link enabled (OTP)
6. Request a **new** magic link from https://stilledev.se (old emails still contain localhost).

### Vercel env (Production + Preview)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://stilledev.se` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (server only) |
| `ANTHROPIC_API_KEY` | playground |
| `OPENAI_API_KEY` | optional image gen |

Redeploy after changing env.

---

## B. Fix Google “provider is not enabled” (REQUIRED)

### Root cause
The error means **Google provider is off** in Supabase, or Client ID/Secret are empty. Code cannot invent Google credentials.

### 1) Google Cloud Console

1. https://console.cloud.google.com/ → create/select a project  
2. **APIs & Services → OAuth consent screen**  
   - User type: External (or Internal if Workspace)  
   - App name: BudAI  
   - Support email: yours  
   - Authorized domains: `stilledev.se` and `supabase.co`  
3. **Credentials → Create credentials → OAuth client ID**  
   - Application type: **Web application**  
   - Name: BudAI Supabase  
   - **Authorized JavaScript origins:**
     ```
     https://stilledev.se
     http://localhost:3000
     https://YOUR_PROJECT.supabase.co
     ```
   - **Authorized redirect URIs** (critical — Supabase callback, NOT your app):
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     ```
     Copy exact URI from Supabase → Authentication → Providers → Google (shown in UI).
4. Copy **Client ID** and **Client Secret**

### 2) Supabase Dashboard

1. **Authentication → Providers → Google**  
2. **Enable** Google  
3. Paste Client ID + Client Secret  
4. Save  

### 3) Test

- https://stilledev.se → Playground → Sign in → Google  
- Should return to `https://stilledev.se/auth/callback` then Playground signed-in  

---

## C. How code chooses redirect (no hardcode)

| Environment | Redirect base |
|-------------|---------------|
| Browser on stilledev.se | `https://stilledev.se` (`window.location.origin`) |
| Browser on localhost:3000 | `http://localhost:3000` |
| Server fallback | `NEXT_PUBLIC_SITE_URL` → else `VERCEL_URL` → else production |

Callback path always: `/auth/callback?next=/#playground`

---

## D. Email template tip (optional)

Supabase → Authentication → Email Templates → Magic Link  

Confirm the CTA uses `{{ .ConfirmationURL }}` (default). Do not hardcode localhost in custom HTML.

---

## E. Checklist after deploy

- [ ] Site URL = `https://stilledev.se`  
- [ ] Redirect allowlist includes production + localhost callbacks  
- [ ] Google provider enabled with real Client ID/Secret  
- [ ] Google redirect URI = `https://xxx.supabase.co/auth/v1/callback`  
- [ ] Vercel `NEXT_PUBLIC_SITE_URL=https://stilledev.se`  
- [ ] New magic link from production (discard old emails)  
- [ ] Incognito test: email login + Google + refresh + logout  

---

## F. Still broken?

| Symptom | Likely cause |
|---------|----------------|
| Link opens localhost | Site URL still localhost OR old email |
| `provider is not enabled` | Google toggle off / empty secrets |
| `redirect_uri_mismatch` | Google Cloud missing Supabase callback URI |
| Session lost on refresh | Cookies blocked / wrong domain / middleware |
| Works local not prod | Vercel env missing Supabase keys |
