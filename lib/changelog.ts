// E6: an honest, indexable changelog. Dated entries describe work that is
// actually in this repository. Undated entries (date: "") are a snapshot of
// the current developer preview, not a claim about a historical release.
// Never invent a release date, a cadence promise or a customer metric here.
export type ChangeType = "new" | "improved" | "fixed";
export type Change = { type: ChangeType; en: string; sv: string };
export type Entry = {
  id: string;
  date: string;
  title: string;
  titleSv: string;
  items: string[];
  itemsSv: string[];
  changes?: Change[];
};

export function entryChanges(entry: Entry): Change[] {
  return entry.changes ?? entry.items.map((en, index) => ({ type: "improved", en, sv: entry.itemsSv[index] ?? en }));
}

export const CHANGELOG: Entry[] = [
  {
    id: "2026-11-07-stilledev-evolution",
    date: "2026-11-07",
    title: "Stilledev website evolution V2",
    titleSv: "Stilledev webbplatsevolution V2",
    items: [
      "A shorter, product-led homepage with a company-first Stilledev identity, an actual BudAI interface capture and direct paths into the working Playground.",
      "New supporting experiences: a dedicated BudAI page, Projects / Labs, public roadmap, searchable Knowledge Center, About page and functional feedback portal.",
      "A redesigned changelog with release types and dates, clearer social metadata, updated sitemap and a consistent bilingual navigation and footer.",
      "Responsive layouts, keyboard-accessible tabs and menus, reduced-motion fallbacks and a lighter neural-core presentation replace the long multi-chapter homepage sequence.",
      "The system indicator now reports only website reachability, rather than implying unverified provider or database health.",
    ],
    itemsSv: [
      "En kortare, produktledd startsida med en företagsfokuserad Stilledev-identitet, en verklig BudAI-gränssnittsbild och direkt vägar till den fungerande Playgrounden.",
      "Nya stödsidor: en egen BudAI-sida, Projekt / Labs, publik roadmap, sökbart Kunskapscenter, Om-sida och fungerande feedbackportal.",
      "Omdesignad ändringslogg med release-typer och datum, tydligare social metadata, uppdaterad sajtkarta samt enhetlig tvåspråkig navigation och sidfot.",
      "Responsiva layouter, tangentbordsanpassade flikar och menyer, reducerad rörelse och en lättare neuralkärna ersätter startsidans långa kapitelsekvens.",
      "Statusindikatorn visar nu bara webbplatsens svar, utan att antyda overifierad hälsa hos leverantörer eller databas.",
    ],
    changes: [
      { type: "new", en: "A shorter, product-led homepage with a company-first Stilledev identity, an actual BudAI interface capture and direct paths into the working Playground.", sv: "En kortare, produktledd startsida med en företagsfokuserad Stilledev-identitet, en verklig BudAI-gränssnittsbild och direkt vägar till den fungerande Playgrounden." },
      { type: "new", en: "New supporting experiences: a dedicated BudAI page, Projects / Labs, public roadmap, searchable Knowledge Center, About page and functional feedback portal.", sv: "Nya stödsidor: en egen BudAI-sida, Projekt / Labs, publik roadmap, sökbart Kunskapscenter, Om-sida och fungerande feedbackportal." },
      { type: "improved", en: "A redesigned changelog with release types and dates, clearer social metadata, updated sitemap and a consistent bilingual navigation and footer.", sv: "Omdesignad ändringslogg med release-typer och datum, tydligare social metadata, uppdaterad sajtkarta samt enhetlig tvåspråkig navigation och sidfot." },
      { type: "improved", en: "Responsive layouts, keyboard-accessible tabs and menus, reduced-motion fallbacks and a lighter neural-core presentation replace the long multi-chapter homepage sequence.", sv: "Responsiva layouter, tangentbordsanpassade flikar och menyer, reducerad rörelse och en lättare neuralkärna ersätter startsidans långa kapitelsekvens." },
      { type: "fixed", en: "The system indicator now reports only website reachability, rather than implying unverified provider or database health.", sv: "Statusindikatorn visar nu bara webbplatsens svar, utan att antyda overifierad hälsa hos leverantörer eller databas." },
    ],
  },
  {
    id: "2026-11-06-fas1",
    date: "2026-11-06",
    title: "FAS1: security, honesty and CI",
    titleSv: "FAS1: säkerhet, ärlighet och CI",
    items: [
      "Server logs are one line of bounded JSON with a random request id — never prompts, message bodies, emails, IP addresses or keys.",
      "The Vercel mirror domain is noindexed so only the canonical domain is indexed; preview deployments still work.",
      "All 13 stable Playwright specs now run in CI on every push.",
      "Consent-first analytics, a nonce-based Content Security Policy and a server-only database client using the service role key.",
      "Clearer wording for daily limits, one social preview image, and an environment-variable checker with setup docs.",
      "New pages: “How your data is handled” and this changelog, replacing the modal-only What's new link.",
    ],
    itemsSv: [
      "Serverloggar är en rad begränsad JSON med slumpmässigt request-id — aldrig promptar, meddelandeinnehåll, e-post, IP-adresser eller nycklar.",
      "Vercels spegeldomän markeras med noindex så att bara den kanoniska domänen indexeras; förhandsvisningsdeployeringar fungerar fortfarande.",
      "Alla 13 stabila Playwright-specar körs nu i CI vid varje push.",
      "Samtyckesstyrd analys, nonce-baserad Content Security Policy och en serverbaserad databasklient med service role-nyckeln.",
      "Tydligare formuleringar om dygnsgränser, en enda social förhandsbild och en miljövariabelkontroll med installationsdokumentation.",
      "Nya sidor: ”Så hanteras dina data” och denna ändringslogg, som ersätter länken ”Vad är nytt” som bara öppnade en modal.",
    ],
  },
  {
    id: "preview-playground",
    date: "",
    title: "In the preview: Playground",
    titleSv: "I förhandsvisningen: Playground",
    items: [
      "Streaming replies in Swedish and English with Writer, Analyst, Coder and Translator personas.",
      "Memory you control, thread history and image analysis for signed-in accounts. Daily limits are shown in the usage meter.",
      "Open guest preview with no signup; guest conversations, drafts and routines stay in your browser.",
      "Voice dictation, reusable {{field}} routines, Workspace drafts and one command palette (⌘K).",
      "Export to Markdown, PDF, Word or a read-only share link; message feedback with explicit consent.",
    ],
    itemsSv: [
      "Strömmande svar på svenska och engelska med personligheterna Skribent, Analytiker, Kodare och Översättare.",
      "Minne du styr, trådhistorik och bildanalys för inloggade konton. Dygnsgränserna visas i användningsmätaren.",
      "Öppen gästförhandsvisning utan registrering; gästens samtal, utkast och rutiner stannar i webbläsaren.",
      "Röstdiktering, återanvändbara {{fält}}-rutiner, Workspace-utkast och en enda kommandopalett (⌘K).",
      "Export till Markdown, PDF, Word eller en skrivskyddad delningslänk; återkoppling på meddelanden med uttryckligt samtycke.",
    ],
  },
  {
    id: "preview-worlds",
    date: "",
    title: "In the preview: 3D worlds & Builder",
    titleSv: "I förhandsvisningen: 3D-världar & Builder",
    items: [
      "The Impossible Workshop and The Atlas of Possibility: connected 3D capability and route architecture.",
      "Six-channel signal patchbay, three Atlas terraces and a direct “Try ↗” launch from the 3D viewport.",
      "3D Builder studio with progressive TypeScript composition and dual preview displays.",
      "Adaptive graphics quality, one shared 3D world instance, and reduced-motion and WebGL fallbacks.",
    ],
    itemsSv: [
      "Den Omöjliga Verkstaden och Möjligheternas Atlas: sammanhängande 3D-arkitektur för förmågor och vägval.",
      "Signalpatchbay med sex kanaler, tre Atlas-terrasser och direktstart (”Prova ↗”) från 3D-vyn.",
      "3D Builder-studio med progressiv TypeScript-komposition och dubbla förhandsvisningsskärmar.",
      "Anpassad grafikkvalitet, en delad 3D-världsinstans samt fallbacks för reducerad rörelse och WebGL.",
    ],
  },
];
