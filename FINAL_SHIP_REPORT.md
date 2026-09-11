# BudAI · Final Ship Report — v4.2.1 (“Lumen + Playground WOW”)

**Date:** 2026-09-11  
**Package:** `4.2.1`  
**Product badge:** `v0.93 · 93%`  
**Build:** `npm run lint` clean · `npm run build` green  
**Live target:** https://stilledev.se

---

## What changed in this pass (visible delta)


### Logo — **Lumen** (full redesign)
- Circle mark (not monogram): luminous core + three neural petals + open brand ring
- Soft 2D glow / breathe only — no 3D, no stacked logos
- New `favicon.svg` matching the mark

### Playground WOW
- **Inspirera / Surprise** — dice control next to send + empty-state CTA; picks a strong prompt and auto-runs
- **Cinematic thinking** — pulse ring, shimmer card, neural bars while waiting
- **Answer language EN|SV** pill on the mode strip (independent of UI language)
- Stronger dual-pick cards + send glow

### Brand & language
- **Signal logo** (circle + core + notch) on all surfaces + `favicon.svg`
- **English always default** — SV only if user saved `budai-lang=sv`
- **Navbar language control** redesigned: EN-first pill, gradient active state (desktop + mobile)
- **“Developed by”** pure white in navbar
- Tab title remains clean: `Stilledev.se · BudAI`

### Hero
- **No rotating words** — static two-line headline + Sweden/Nordics accent
- Single product mark via `AICore` (no stacked double logo)
- Clear CTAs: Playground primary · Waitlist secondary
- Subtle 10% early-access chip (not loud)

### Playground (priority surface)
- **6 capability cards** (gen card only when image API keyed):
  1. See an image  
  2. Speak  
  3. Remember me  
  4. Create  
  5. Analyze  
  6. **Plan my day** (new)
- Stronger empty-state cards (icon tiles + blurbs)
- Premium shell chrome / shadows
- Single mode default · answer language SV|EN · honest image-gen soon/hide via `/api/features`
- Dual pickable answers + markdown code blocks (prior ship, kept)

### Terminal
- Full **dual-pane redesign**: live shell + metrics side rail + signal bars
- Honest footer (Claude · preview · Supabase · GDPR · v0.93)
- Replay / copy chrome, LIVE badge, clock

### Rest of site
- **Loading screen** — orbital rings, clearer steps, Nordic tagline
- **Vision** — belief pillars use `SpotlightCard`
- **Status** — pulse on operational services
- **Capabilities** — FAQ under cards; playground deep-link
- Waitlist / Footer logo sizing polish

---

## What did NOT change (architecture preserved)
- Routes, APIs, Supabase auth, waitlist, admin gate, playground streaming
- No fake image generation without `OPENAI_API_KEY`
- Admin password never rendered on page
- Soft 10% early access · code `BUDAI-EARLY-10`

---

## Env vars (Vercel / production)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `https://stilledev.se` |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes for admin Chats** | Server only — never `NEXT_PUBLIC_` |
| `ANTHROPIC_API_KEY` | **Yes for Playground** | Claude inference |
| `ADMIN_PASSWORD` or app secret | Soft | Gate still uses known Stille secret in app flow |
| `OPENAI_API_KEY` | Optional | Enables image gen; omit = Coming soon UI |
| `OPENAI_IMAGE_MODEL` | Optional | e.g. `dall-e-3` if using OpenAI images |

---

## Supabase Dashboard (must-do for auth)

1. **Site URL** = `https://stilledev.se` (not localhost)
2. **Redirect URLs** allowlist both:
   - `https://stilledev.se/auth/callback`
   - `http://localhost:3000/auth/callback` (dev)
3. **Google provider** (if used): enable in Supabase Auth  
   - Google Cloud OAuth client → Authorized redirect URI =  
     `https://YOUR_PROJECT.supabase.co/auth/v1/callback`  
   - JS origins: app origin + Supabase
4. Email templates / magic link will follow Site URL if redirect not allowlisted — fix Site URL first

---

## SQL to paste (if not already applied)

Run in Supabase SQL editor, in order if missing:

1. `supabase/MIGRATION_v4_product.sql`
2. `supabase/v5_playground_hardening.sql`
3. `supabase/v6_admin_reads.sql`

All additive — do not wipe existing tables/data.

---

## Admin
- Path: `/admin`
- Password: **never shown on page** (Stille-only). Session value remains the established secret.
- **Chats** tab needs `SUPABASE_SERVICE_ROLE_KEY` + v6 indexes for conversation list.

---

## Push checklist (you)

1. Unzip / sync `BudAI-Launch.zip` into your git repo (or copy `budai-website` source)
2. `git add` · commit · push to GitHub → Vercel auto-deploy (or connect repo)
3. Set **all env vars** above on Vercel → Redeploy
4. Supabase: Site URL + redirect allowlist + Google if needed
5. Paste SQL v4→v6 if not applied
6. Smoke test:
   - Guest → Playground chat (EN default)
   - Switch SV/EN pill
   - Magic link / Google login (same browser for PKCE)
   - Waitlist submit
   - `/admin` → Chats tab
   - Image attach (vision) works; Create image shows soon without OpenAI key
7. Confirm production URL is **https://stilledev.se** (not sandbox)

---

## ZIP
- Path: `/home/user/BudAI-Launch.zip`
- Excludes: `node_modules`, `.next`, caches, secrets / real `.env`
- Includes: source, config, SQL, `.env.example`, this report

---

## Honest limits
- Image generation is **not** Claude — needs OpenAI (or other) key or stays disabled
- Terminal is an **illustration**, not a live shell
- Status metrics are **preview targets**, not a live SRE dashboard
- Magic-link finishing in a different browser than start always fails PKCE — same browser required
