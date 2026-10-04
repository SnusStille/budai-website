# BudAI final preview update

## Product direction
Preserved Next.js 14, React, the dark/cyan identity, English/Swedish, stilledev attribution, Supabase authentication/history/memory, and the existing Anthropic integration. No new production dependencies.

- New original vector identity: open B / code branch and a softly blinking cursor. Shared navbar/chat mark, favicon, downloadable SVG and updated social card.
- Four purposeful areas: introduction, Playground, compact product/vision explanation, early access. Terminal, system status, roadmap, section dots, surprise notifications, floating widgets and blocking intro are no longer mounted on the landing page. Admin tooling is retained.
- Playground has four editable starter prompts, focused empty state, optional history, optional advanced controls, mobile full-screen, and optional output workspace rather than unsolicited panels.
- NDJSON streaming is opt-in on the existing API route; legacy/dual responses still work. Hidden memory metadata is buffered safely across provider chunks. Stop aborts the fetch and keeps partial text; thread switches invalidate stale responses.
- Code fences render during streaming, with copy success/error feedback. Regeneration and retry rebuild the correct history instead of duplicating questions.
- Scroll follows only near the bottom. Mobile Enter creates a newline; desktop Enter sends and Shift+Enter creates a newline. IME composition is respected. Fullscreen supports Escape and body scroll locking.
- Waitlist asks for name/email and optional business information; retains referral attribution and BUDAI-EARLY-10. No fake counter. No success state when Supabase is absent. Real success requires a successful database response.
- Local licensed variable fonts eliminate runtime/build Google Fonts requests. CSS-only ambient animation, reduced-motion support, accessible labels, and no added production dependencies.
- Cookie banner positioning fixed on mobile; compact navigation and genuine mobile menu.

## Validation (2026-10-04)
- `npm run build`: passed; all 13 static pages generated. Landing route: 13.9 kB / 203 kB first-load JS.
- `npm run lint`: passed without warnings.
- `npx tsc --noEmit`: passed.
- `node tests/stream.cjs`: passed incremental metadata stripping / Unicode / code-array tests.
- `node tests/preview.cjs`: passed in Chromium against the production build: navigation, prompt drafting, streamed response rendering, code blocks, regeneration context, full-screen/Escape, history, 503/retry, Swedish, unavailable waitlist, widths 320/390/768/1440, mobile menu, and no uncaught browser errors.
- `node tests/stream-browser.cjs`: local chunked HTTP fixture verifies incremental delivery and stopping a live response while preserving partial output.
- Desktop and mobile screenshots reviewed; no document horizontal overflow at tested widths.

Browser tests require a QA-only Playwright install and Chromium; `CHROMIUM_PATH` can point to a system browser. Stream tests use fixtures, not paid AI calls. The waitlist-unavailable test assumes a checkout without Supabase environment variables.

## Production verification still required
No production secrets were present in this checkout. Real Anthropic responses, logged-in Supabase sync, successful waitlist inserts, OAuth redirects, microphone permissions on physical iOS/Android, and memory persistence need verification using the production configuration. Existing database permissions and schemas must remain available. The implementation does not pretend these integrations have been tested end-to-end here.

Nothing has been deployed or pushed to main. The live Arena preview runs the production build on port 3000. Deploy this session branch through the existing deployment workflow when approved.
