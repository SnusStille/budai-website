# BudAI v5.1.0 — Final Master Pass

## PLAYGROUND
- **Workspace panel** (desktop split + mobile sheet): long/structured/code answers open a dedicated side surface with Copy, Download `.md`, Improve, Edit-in-chat
- Auto-open Workspace on desktop for worthy replies; manual **Workspace** button on messages
- **Tools drawer** (`+`) on composer: Image, Voice, PDF soon, Image gen soon/live
- **Drag & drop** images onto composer
- Message actions: Copy, Regenerate, **Continue**, Workspace
- New Chat clears workspace/tools/attach/gen
- Dual-pick can open Workspace

## LOGO — "Nodal" (FINAL)
- Ring + dual dialogue arcs + luminous core + signal bead
- Dark/light variants, wordmark helper
- Favicon + all BudAILogo call sites (single component)

## GOOGLE LOGIN
- Code path already correct (OAuth → `/auth/callback` → playground)
- Human errors + AUTH_SETUP / **GOOGLE_LOGIN_SETUP.md** manual steps
- Cannot enable provider without your Google Client ID/Secret

## BUILD
`npm run lint` + `npm run build` must pass.

## YOUR ACTIONS
1. Follow GOOGLE_LOGIN_SETUP.md
2. Vercel env (see .env.example)
3. Supabase Site URL + redirects
4. Redeploy

## v5.2.0 — Living logo + Playground parity (2026-09-12)

### Logo — Nodal Live (sitewide)
- Rotating dashed ring, counter-rotating dialogue arcs, orbiting signal bead, pulsing core
- CSS keyframes sped up for visible motion at navbar sizes
- `animated` default **true**; all call sites forced animated (Navbar, Footer, Playground, Capabilities, BuddyCard, Admin, legal, AICore)
- Favicon SVG with SMIL motion matching the mark

### Playground — competitor-parity (honest)
- **Intent strip**: Chat / Research / Create / Analyze / 2 angles — steers API tone via prompt prefix (no fake backends)
- Model status pill: BudAI Core · v0.93 · live
- **Keyboard shortcuts** ⌘K palette, ⌘N new chat, ⌘E export .md, ⌘B workspace, Esc close
- **Export thread** as Markdown
- Message actions: Continue, Share/copy, thumbs up/down (local)
- Empty state: LIVE badge, larger logo, stronger headline
- Composer shell + message enter animations
- Concise toggle retained; answer EN|SV retained

### Still manual on deploy
- Google OAuth: see `GOOGLE_LOGIN_SETUP.md` (Supabase callback URL)
- Admin chats: `SUPABASE_SERVICE_ROLE_KEY` on Vercel
- Image gen: needs `OPENAI_API_KEY` or stays “coming soon”

