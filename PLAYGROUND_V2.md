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

---

# Round 3 — Playground 2.3, Waitlist v3, Logo Lab

## Playground: everything that landed after v2.1

| Feature | Where | What it does |
| --- | --- | --- |
| Text selection actions | `MessageList.tsx` + `SELECTION_ACTIONS` | Highlight any passage in an answer and a floating bar appears: **explain / translate / improve / expand**, plus “save as note”. Runs straight into the composer. |
| Saved notes | `NotesPanel`, `localStore.ts` | Bookmark icon on every answer, or save a highlighted snippet. Notes panel searches, copies, deletes, clears and exports a `.md`. Stored locally (`budai-pg-notes-v1`), capped at 200. |
| Shareable chats | `lib/playground/share.ts`, `/playground/share` | The transcript is UTF-8/base64url-encoded into the link fragment — no server, no account. Read-only page with copy link, Markdown export and a waitlist CTA. Also in the palette (“Dela som länk”) and via the Web Share API on mobile. |
| Status rail extras | `PlaygroundApp.tsx` | Style and depth labels now read like the settings UI, next to persona, token estimate, context meter and last latency. |
| Ambient shell | `globals.css` (`pgx-aurora`) | Slow aurora wash inside the Playground shell, paused for `prefers-reduced-motion`. |

## Site-wide ⌘K palette

`components/ui/SitePalette.tsx`, mounted in `Providers`, opens with **⌘K / Ctrl+K**
anywhere except inside the Playground (which owns its own palette). Arrow keys +
Enter, Escape to close. It carries six quick tasks per language (they prefill the
Playground and scroll you to it), section jumps, language switch, copy link and
privacy. The navbar’s ⌘K hint is now a real button that opens it.

## Waitlist v3 — the 10% offer, everywhere

- **Count-up band**: 10% founding discount · 250 seats · 60 seconds to the first
  prompt · two languages. Numbers animate on first scroll into view.
- **Offer ticker**: an infinite marquee repeating the founding offer and the
  product’s best features (voice mode, compare, custom instructions).
- **Founding-seat map**: all 250 seats drawn as a grid; reserved ones glow, and
  your own seat lights up white with a pulse after you join.
- **FAQ**: six accordion answers about the discount, cost, access timing, data,
  teams and why the wave is capped.
- Everything above sits on top of the existing form, share row, timeline and toast
  — the structure of the section is unchanged.

## Logo Lab — `/logo`

A working lab, not a mockup. Six candidates (`components/logo/candidates.ts`),
each a self-contained animated SVG:

1. **Prism Core v3** — today’s mark with more depth and two orbits.
2. **Aperture N** — six blades breathing between open and closed.
3. **Orbital** — a core with three elliptical orbits and travelling electrons.
4. **Lattice** — a node net whose spokes fire outward in sequence.
5. **Waveform** — nine bars dancing, tied to voice mode.
6. **Monogram B** — geometric letterform with a circuit spine.

Size, backdrop, light/dark plate and motion are all switchable, and there are
real downloads: animated **SVG**, **PNG 1024**, copy source, shortlist up to four
finalists, vote, and **“test in the navigation”** — which swaps the navbar mark
in your browser only (`budai.logo.live`). The shipped Prism Core v2 stays the
default everywhere until a candidate wins.

> Nothing replaces Prism Core v2 until it is beaten. Vote in the lab (and tell me
> in the chat) and the winner goes everywhere: favicon, navbar, footer, OG card,
> loading screen.


---

# Round 4 — the Lattice mark ships everywhere

Chosen in the Logo Lab and promoted to production:

- **`components/ui/BudAILogo.tsx`** now draws the Lattice: six spokes firing
  outward from a glowing core, six heart nodes, twelve satellites on an outer
  ring, three orbital shells turning around it, the boot assembly and the rim
  sheen kept from the previous mark. `LATTICE_SPOKES` / `LATTICE_OUTER` /
  `LATTICE_LINKS` derive every coordinate in the 64×64 viewBox from one source,
  so no size ever drifts.
- **`public/favicon.svg`** redrawn as an animated Lattice (self-contained —
  gradients, dash drawing and the turning ring are all inline), which also feeds
  the PWA manifest icon.
- **`app/opengraph-image.tsx`** carries the simplified six-node Lattice (satori
  gets the ring, spokes, nodes and core, without the twelve outer satellites, so
  the mark still reads at 60px).
- Because the navbar, footer, hero stage, loading screen, auth modal, legal pages
  and admin all render `BudAILogo`, they switched together — no per-file edits.
- **`/logo`** keeps the whole candidate list for future re-votes. Lattice is
  badged “Vald”; the other five stay available as challengers, with the
  “test in the navigation” switch (`budai.logo.live`) still working for any of
  them in your browser only.

CSS lives in `app/globals.css` under `budai-lat-*`: `budai-lat-fire` (spoke draw),
`budai-lat-breathe` (node pulse), `budai-lat-blink` (satellites), `budai-lat-turn`
(ring), `budai-lat-hum` (links), plus a one-shot `budai-lat-assemble` on boot and
a full `prefers-reduced-motion` fallback.
