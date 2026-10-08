# Polish-pass — BudAI (utvecklarförhandsvisning)

Detta dokument sammanfattar den stora finish-omgången på BudAI-sajten. Grundprincipen har
varit **att inte bygga om**: befintlig layout, navigering, sektioner, känsla och fungerande
funktioner är orörda. Allt nedan är finish, konsekvens, tillgänglighet, prestanda och
buggfixar ovanpå den befintliga produkten.

## 1. Nya sidor och states

| Fil | Vad den gör |
| --- | --- |
| `app/error.tsx` | Riktig 500-sida med återförsök + "tillbaka till Playground", felreferens och hopfällbar teknisk detalj. Fungerar utanför `Providers` (ingen `useLang`). |
| `app/not-found.tsx` | Varumärkt 404 med logotyp och tydliga vägar tillbaka. |
| `app/s/[id]/page.tsx` | Delade konversationer: riktig `generateMetadata` (titel, `noindex`, OG-bild), assisterad avatar, gradient-glow och CTA. |
| `app/s/[id]/loading.tsx` | Skelett som matchar den färdiga sidan — ingen "popp"-känsla vid laddning. |
| `app/admin/loading.tsx` | Skelett för kontrollcentret: sidopanel, statistik-kort, tabellrader. |
| `app/admin/layout.tsx` | Titel `Control Center · BudAI`, `noindex, nofollow`. |
| `app/legal/[slug]/layout.tsx` | Riktiga titlar, beskrivningar och canonical för varje juridisksida. |
| `app/apple-icon.tsx` | Genererad PNG-ikon (180×180) för iOS hemskärm — Apple ignorerar SVG. |
| `app/_icon/AppIconArt.tsx` | Delad ikonritning (privat mapp) som ger Apple-, PWA- och maskable-ikoner ur samma design. |
| `app/icon-192`, `app/icon-512` | PNG-ikoner för installation som PWA (refereras i `manifest.ts`). |

Okänd slug under `/legal/*` ger nu **404** istället för att tyst visa integritetspolicyn.

## 2. Mikrointeraktioner och känsla

- **Composer (Playground):** textfältet är skrivbart medan BudAI svarar ("keep typing"-hint),
  skicka-knappen är fortsatt spärrad tills svaret är klart.
- **BuddyCard:** auto-hide pausar vid hover och tangentbordsfokus (progressbaren speglar det),
  och kortet göms medan cookie-baren är öppen så de aldrig staplas på mobil.
- **BackToTop:** göms över Playground och när cookie-baren är öppen, `rAF`-throttlad scroll.
- **LoadingScreen:** 3,2 s (1,4 s vid `prefers-reduced-motion`), riktig hoppa-över-knapp.
- **CookieConsent** skickar nu `budai:cookie-bar` så att annan flytande UI kan anpassa sig.

## 3. Tillgänglighet

- Exakt **en `<h1>`** per sida (laddningsskärmens ordmärke var tidigare en andra `<h1>`).
- Rubrikhierarki rättad i footern (`h4` → `h3`, hoppade över `h3`).
- Roadmap/Journey: expanderbart innehåll låg inuti en `<button>` — nu korrekt
  `button` + panel med `aria-expanded` / `aria-controls`; ringarna är riktiga knappar
  med `aria-pressed`; autoplay pausar även vid tangentbordsfokus.
- 12 knappar saknade `type="button"` (risk för oavsiktlig submit) — åtgärdat.
- Ikon-knappar utan namn (byt namn, stoppa svar, tumme upp/ner, röst) har nu `aria-label`
  och lägesmarkering (`aria-pressed`).
- Toaster i Playground: `role="status"`, `aria-live` och `pointer-events-none` (blockerar
  inte längre klick på mobil). Feedback-formulärets fel har `role="alert"`.
- `aria-current="location"` i navigeringen, `role="status"` på statuspilen,
  `aria-hidden` på ren dekoration (glows, ikoner, punktlistor).
- Fokusringar, fokusfällning och scroll-lås i alla dialoger (juridik, feedback, auth, kommandopalett).
- Juridiska sidor skrivs ut rent (egen `@media print`-stil) — vitt papper, svart text, ingen dekor.

## 4. Prestanda och kodhygien

- Typsnitt: metric-matchad fallback (`adjustFontFallback`) → mindre layoutskifte (CLS).
- `StatusPill` slutar polla `/api/health` i bakgrundsflik och pingar direkt vid återkomst.
- Immutable cache-headers på `/_next/static/*`, veckocache på varumärkesbilder, HSTS i produktion.
- 8 oanvända importer borttagna, 6 dubbletter där svensk och engelsk text var identisk sammanslagna.
- Borttagna döda filer: `CodeBackground`, `KeyboardHint`, `MarkerUnderline`, `StockholmClock`,
  `useMousePosition`, `useScrollReveal`, `productStore`, `playgroundStore`.
- Alla animationer respekterar `prefers-reduced-motion` (både globalt och per komponent).

## 5. Verifierat

- `npm run build` — grön, `/` ca 40 kB / 235 kB first load JS.
- `npm run lint` — **0 varningar, 0 fel**.
- SSR-kontroll: en `h1`, inga dubblerade id, alla `<img>` har `alt`, inga knappar utan `type`.
- Rutter: `/`, `/admin`, `/legal/{privacy,terms,cookies,gdpr}` = 200 · okänd slug/sida = 404 ·
  `/s/<uuid>` = 404 för okänt id · `sitemap.xml`, `robots.txt`, `manifest.webmanifest`,
  `og.png`, `apple-icon` = 200.

## 5b. Kontroller i sista rundan

- `tsc --noEmit` — 0 typfel.
- Manifestet har nu PNG-ikoner i 192/512 (installationsprompt i Chrome/Android).
- Dokumentationens påståenden (röst, export, lokalt minne, bildgenerering) verifierade mot koden.

## 5c. Rundan "allt ännu bättre" (API + formulär)

- **API-härdning:** `lib/requestGuard.ts` ger en delad rate limiter som rensar utgångna poster
  (playground-routens tidigare `Map` växte utan gräns), säker JSON-läsning (`null`/arrayer ger
  inte längre 500) och klient-IP bakom proxy.
- **Rate limit på publika skrivningar:** `/api/feedback` 10 per timme och IP, `/api/share`
  20 per timme och IP. Svarar 429 med tydligt meddelande.
- **Feedback-dialogen:** specifika fel (429 vs nätverk), Cmd/Ctrl+Enter skickar, teckenräknare,
  fokus i textfältet när dialogen öppnas, aria-label på fältet, stängknappen översatt.
- **Dela tråd:** 429/503 visar egna meddelanden. Om klippboken är blockerad visas ändå
  "Länken är skapad" i stället för ett felmeddelande.
- **Typkontroll:** `tsc --noEmit` körs rent, ESLint med `--max-warnings=0` rent.

## 5d. Säkerhet och SEO (runda 3)

- **Admin-inloggning:** max 10 försök per IP och 15 minuter (brute-force-skydd), `Cache-Control: no-store`,
  säker JSON-läsning. Admin-sidan visar nu "Too many attempts" i stället för felaktigt "Wrong password".
- **robots.txt:** `/api/` är nu uteslutet från crawling (tidigare bara `/admin`).

**Kända risker att besluta om (ändrade inte, för att inte bryta befintliga installationer):**
- `NEXT_PUBLIC_ADMIN_PASSWORD` accepteras som legacy-fallback. Prefixet gör att värdet kan hamna i klientbundeln
  om någon refererar det i klientkod. Sätt `ADMIN_PASSWORD` och ta bort den gamla variabeln.
- Admin-nyckeln sparas i `sessionStorage` (`budai_admin_key`). Det är acceptabelt för ett internt verktyg men
  innebär att en XSS-sårbarhet skulle kunna läsa nyckeln.
- Rate limit använder klient-IP från `x-forwarded-for`. Saknas headern delas bucketen "unknown", vilket
  bland annat betyder att admin-inloggningen kan låsas globalt i 15 minuter av någon som missbrukar den.
  Bakom en proxy (t.ex. Vercel) är detta inte ett problem.

## 6. Kvar att göra innan bred lansering

- Sätt `NEXT_PUBLIC_SITE_URL` till produktionsdomänen (canonical, sitemap, OG).
- Aktivera `X-Frame-Options: SAMEORIGIN` när sajten **inte** längre ska kunna bäddas in i iframe
  (förhandsvisningen kräver att den är avstängd).
- Fyll på `public/audio/budai-reward.mp3` om du vill ha en egen ljudsting i easter egget —
  annars används den inbyggda synten.
