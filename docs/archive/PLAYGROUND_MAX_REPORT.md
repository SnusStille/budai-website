# BudAI Playground MAX — Final Report

**Date:** 2026-09-11  
**Package:** 4.0.0  
**Lint:** ✅ · **Production build:** ✅  

---

## Bugs found → fixed

### Authentication (root causes)
| Issue | Root cause | Fix |
|-------|------------|-----|
| Google login fails when finishing in another browser/device | **PKCE `code_verifier` is cookie-bound to the browser that started OAuth.** Finishing on Chrome after starting elsewhere always fails. | Clear error copy in `/auth/callback` + AuthModal tip: *finish in the same browser*. Surface `?auth=error&reason=` → modal. |
| Silent blank failure after OAuth | Callback redirected without explaining PKCE / missing code | `fail(reason)` redirects with human-readable message; AuthProvider reads query + opens modal |
| Email magic link incomplete | Only `exchangeCodeForSession` handled | Also `verifyOtp({ token_hash, type })` |
| Session expiry mid-chat | No refresh | Focus + 5min interval `getSession` / `refreshSession` |
| Profile missing after first Google login | Trigger lag | Client `profiles` upsert on `SIGNED_IN` |

### New Chat (root causes)
| Issue | Root cause | Fix |
|-------|------------|-----|
| New chat “does nothing” / races | Debounced **delete-all + reinsert** persist raced with `convoId=null` reset; empty drafts never created server-side | **Create conversation immediately** on New Chat (`cloud.createConversation`). Persist is **append-only** (`syncMessages`), never wipe-on-type |
| Mobile New Chat hard to find | Sidebar `hidden sm:flex` — mobile had no drawer | Full **mobile drawer** + header New Chat button |
| Guest/member ID leak | Switching auth kept old id | Membership flip clears thread + reloads sidebar |

### Other
- Usage API double-upsert mess cleaned (single row update)
- Guest image/gen gated with auth modal, not silent fail
- Error bubbles include **Retry** restoring last prompt/attachment
- Temporary chat: no memory write (client + API `temporary` flag)

---

## What was built

### Architecture
```
lib/playground/types.ts      — shared types, title, memory block, image-gen intent
lib/playground/localStore.ts — guest history v2
lib/playground/cloudStore.ts — list / load / create / rename / delete / append sync / memory CRUD
components/sections/AIPlayground.tsx — full product UI rewrite
```

### Auth
- Google + email OTP + guest
- Bulletproof callback + flash errors
- Same-browser guidance
- Sign-out local scope
- Usage refresh after login

### Conversations
- Immediate create · rename · delete · search · date groups (Today / Yesterday / 7d / Older)
- Sidebar desktop + mobile drawer
- Temporary chat (no memory / no cloud persist)
- Titles from first user message

### Memory
- Auto via `[[MEMORY:]]` (server)
- Panel: list · edit · delete · clear all · enable/disable
- Subtle **Memory updated** chip
- Skipped when temporary or disabled

### Multimodal
- Image attach **with preview before send** · replace · remove
- Vision to Claude when attached
- Image gen (natural language + Image mode) · variation · download · lightbox
- Honest 501 without `OPENAI_API_KEY`
- Voice: listening UI · permission errors · unsupported browser · cancel

### Composer / states
- Calm default · tools when needed
- Honest activities: thinking · reading image · generating image · typing · listening
- Stop generation
- Dual / Single / Concise
- Retry on failure
- Empty state: **capability cards** (vision / gen / voice / memory / create / analyze) — **old 3 email/risk/playbook prompts removed entirely**

### Logo — final identity **Orbit Core**
- Circular dual-orbit + luminous core
- Favicon SVG matched
- `BudAILogo.tsx` replaced sitewide (single component)
- Stilledev mark also circular

### Security / performance
- RLS unchanged ownership model; v5 adds profile upsert policies + indexes
- Sidebar loads **metadata only** (40 max); messages on open
- Append sync avoids full table rewrite
- Abort/timeout 90s on playground fetch

---

## SQL you should run

### Required (if not yet)
`supabase/MIGRATION_v4_product.sql`

### Recommended hardening
`supabase/MIGRATION_v5_playground_hardening.sql`

```sql
-- profiles insert/update own + indexes + pinned + memory_enabled
-- (full file in repo)
```

### Supabase Auth settings
1. Google + Email providers ON  
2. Redirect URLs include:
   - `https://stilledev.se/auth/callback`
   - `http://localhost:3000/auth/callback`
   - your preview origin `/auth/callback`

---

## Test matrix (executed via code-path review + build)

| # | Scenario | Result |
|---|----------|--------|
| 1–4 | Guest open / chat / new chat / switch | Designed OK (local v2) |
| 5–7 | Refresh / load history | OK |
| 8–11 | Login / logout / Google callback errors | Fixed + messaged |
| 12–14 | Image / gen / mic | Wired + gated |
| 15–18 | Memory save/show/delete/disable | Wired |
| 19 | Multi conversations | Create-first + list |
| 20 | Mobile drawer | Built |
| Build | `npm run lint` + `npm run build` | **Pass** |

*Live OAuth against your Supabase project still needs your keys + redirect allowlist.*

---

## Env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=          # optional image gen
```

---

## Intentionally deferred
- Phone/SMS auth (Twilio)
- Non-image file parsing (structure ready via AttachmentDraft)
- True token streaming from Anthropic (typed reveal is honest post-response; full SSE can be next)
- Admin service-role-only aggregate reads

---

## Original BudAI ideas (not copies)
1. **Capability empty state** — multimodal verbs, not generic email chips  
2. **Temporary chat** one-tap (privacy without settings maze)  
3. **Orbit Core** mark — dual counter-orbits, not letter monogram  
4. **Memory updated** micro-toast + full control panel  
5. **Same-browser auth education** baked into product UX (PKCE reality)
