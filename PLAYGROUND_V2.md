# BudAI Playground v2 — what changed

A big pass on the whole site with the Playground as the centre of gravity, plus a
brand-new logo, a rebuilt waitlist around the **10% founding offer**, and a new
hero, navbar, about section and footer.

## 1. New logo — “Prism Core”

`components/ui/BudAILogo.tsx` is a complete rewrite. One gem-cut hexagonal prism,
a living core, three orbital rings turning in real 3D (CSS `perspective` +
`rotateX/rotateY/rotateZ`, no WebGL), satellites riding the rings, a light sheen
sweeping the glass, and floating motes. Every dimension derives from
`--logo-size` and every timing from `--logo-tempo`, so the same component serves
a 26px avatar and a 260px hero stage.

- Variants: `dark`, `light`, `mono`.
- Motion modes: `idle`, `thinking`, `alert` (the Playground sets `thinking`
  while the model is answering).
- `BudAIWordmark` got an animated gradient “AI”.
- `public/favicon.svg` redrawn to match.
- Used everywhere: navbar, hero stage, playground header/avatars/empty state,
  footer, admin, legal pages, auth modal, loading screen.

## 2. Playground — a full workbench

**Engine**
- Real **token streaming** from `/api/playground` (Anthropic `.stream()`), with
  the memory tag filtered out of the live view.
- New request knobs: `persona`, `style`, `effort`, `dual`, `stream`.
- Server-side prompt builder for six personas and five response styles.
- Honest 503 handling when `ANTHROPIC_API_KEY` is missing — the UI stays usable.

**Interface**
- Sidebar with search, pins, rename, delete, temporary chats and account state.
- Composer with `/` slash commands (arrow keys + Enter), response-style and
  depth pickers, persona switcher, attachment chips, live token estimate,
  rotating placeholders, drag & drop.
- Messages with avatars, timestamps, latency and model, streaming caret,
  thinking steps + progress bar, and a full action row: copy, regenerate,
  thumbs, read aloud (TTS), open in panel, branch, copy as quote, delete.
- **Compare mode** — two answers side by side, pick one.
- **Improve** — rewrites your draft prompt with the model before you send.
- Follow-up chips under the last answer (shorter, example, deeper, checklist,
  challenge, translate).
- Prompt library (15 templates, five categories), ⌘K command palette,
  keyboard shortcuts sheet, memory panel, insights (words, tokens, latency,
  cost estimate), gallery, inspector panel, lightbox, accent themes, sound,
  reduce-motion, first-visit tips.
- Voice in (SpeechRecognition) and out (SpeechSynthesis); images and text/code
  files as attachments.
- Guests get localStorage history (5 chats); members get Supabase history +
  memory.

## 3. Waitlist — the 10% offer, front and centre

- Headline “The first 10% get early access”, stat chips, live waitlist count.
- Four perks, founding code (`FOUNDING10` tag on every signup), personal invite
  code + referral link with copy buttons.
- Success state shows the code, the invite link and a shortcut into the
  Playground. Interest chips + individual/team switch are saved as tags.

## 4. Rest of the site

- **Hero**: live animated product stage that types real answers, floating
  capability notes, a feature strip, and `10%` on the waitlist CTA.
- **Navbar**: scroll progress bar, active-section underline, ⌘K hint, 10% badge.
- **About**: scroll-revealed capability cards + “Inside the Playground” grid.
- **Footer**: closing CTA, status pill, shortcut list, back-to-top.
- **OG/Twitter card** generated at `/opengraph-image` from the site tokens.

## 5. Verification

- `npx tsc --noEmit` clean.
- `npm run build` clean (all 13 routes).
- Live dev server + HTTP checks on `/`, `/opengraph-image`.

## Supabase

No schema change is required for the new UI. Every extra setting (accent, sound,
streaming, personas, pins, tips) lives in `localStorage`; the founding tag and
interest are stored in existing columns (`tags`, `discount_code`, `source`).
