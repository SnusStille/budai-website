# Final pre-release audit — 9 Nov 2026

## Fixed in this pass
- [x] **Phones could not open /contact, /sv/contact or /admin** (phone gate replaced them
  with the PhoneWelcome screen). Contact + admin are functional pages with responsive
  layouts, so they now render on phones; the desktop-marketing gate is unchanged for
  the homepage/Labs showcase (existing tested behaviour).
- [x] Swedish footer Contact link went to the English /contact -> now /sv/contact.
- [x] Admin SEO overrides were stored but never used -> root metadata now reads
  seo_title/seo_description/og_image from site_settings (fail-safe to code defaults,
  900ms timeout, rendering never depends on the DB).
- [x] Announcement links were unvalidated -> server now only accepts relative (/...)
  or https:// links; the public config endpoint also strips anything else.
- [x] Docs/env drift: README + ENVIRONMENT stopped at migration v12 and the new
  Resend vars were undocumented -> updated to v13/v14; .env.example and
  `npm run check:env` now include RESEND_API_KEY / EMAIL_FROM / ADMIN_NOTIFICATION_EMAIL.
- [x] Removed dead avatar eye spans from BotAvatar.

## Verified, no action needed
- All homepage anchors exist (#playground #capabilities #about #roadmap #waitlist
  #stilledev-labs); legal slugs match sitemap/footer; images have alt (decorative
  lightbox alt="" is intentional); OG image exists; 404/error pages exist.
- Typecheck, lint, production build, secret scan: green. Route smoke tests incl.
  phone user-agent: green (see release notes).

## Still owner-only
- Apply MIGRATION_v13 + v14 in Supabase; add Resend keys for emails; confirm
  org.nr/VAT for publication; real-device pass on iPhone/Android.
