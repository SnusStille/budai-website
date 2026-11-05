## What changed

<!-- One sentence. Link the audit point ID if applicable (e.g. F6, B3). -->

## Why

<!-- Problem or risk being addressed. -->

## Verification

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:unit`
- [ ] `npm run build` (before e2e — the suite runs against `.next`)
- [ ] `npm run test:e2e`
- [ ] `npm run build` (final)

CI runs the same chain in `.github/workflows/ci.yml`.

## Checklist

- [ ] No invented numbers, customers, reviews, prices or launch dates
- [ ] Site copy is English with a working SV / EN switch
- [ ] No secrets, keys or `.env.local` committed
- [ ] Reduced-motion, Save-Data and BrainPoster fallbacks still work
- [ ] Playground, login, memory and API routes are unaffected (or changes are explained)
