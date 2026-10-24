/**
 * STILLEDEV — the editorial spine of the experience.
 *
 * Every claim here is verifiable in this repository or on github.com/SnusStille. There are no
 * invented clients, metrics, testimonials or revenue figures anywhere in this file, and the
 * site should never gain any: the work is young and the honesty is the brand.
 */

export type Project = {
  id: string;
  name: string;
  kind: string;
  kindSv: string;
  year: string;
  status: "live" | "preview" | "open-source" | "archive";
  headline: string;
  headlineSv: string;
  blurb: string;
  blurbSv: string;
  stack: string[];
  href: string;
  hrefLabel: string;
  repo?: string;
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "budai",
    name: "BudAI",
    kind: "AI product · design + engineering",
    kindSv: "AI-produkt · design + engineering",
    year: "2024 —",
    status: "preview",
    headline: "An AI that works in Swedish",
    headlineSv: "En AI som fungerar på svenska",
    blurb:
      "A work assistant for people and companies in Sweden and the Nordics: drafting, planning, analysis and automation in Swedish and English, with accounts, memory, history, vision, voice and export. Built end to end — product, interface, API, database, auth, admin, billing-ready waitlist.",
    blurbSv:
      "En arbetsassistent för privatpersoner och företag i Sverige och Norden: skrivning, planering, analys och automatisering på svenska och engelska, med konton, minne, historik, bild, röst och export. Byggd från ände till ände — produkt, gränssnitt, API, databas, auth, admin och väntelista.",
    stack: ["Next.js 14", "TypeScript", "Tailwind", "Supabase", "Claude API"],
    href: "/budai",
    hrefLabel: "Open the product site",
    repo: "https://github.com/SnusStille/budai-website",
    featured: true,
  },
  {
    id: "stilleaffe",
    name: "StilleAffe",
    kind: "Internal tool · sales operations",
    kindSv: "Internt verktyg · säljoperationer",
    year: "2026",
    status: "live",
    headline: "A sales desk that fits in a pocket",
    headlineSv: "En säljdashboard som får plats i fickan",
    blurb:
      "Private Swedish sales follow-up for Stille & Affe, version 7. Day, week and month targets, mood and rating capture, tags, an activity stream, an AI coach and statistics — with a command palette, keyboard-first flows, sound and haptic confirmation, and 13 permanent badges. Migrations run cleanly from both v5 and v6 tables without resetting stored goals.",
    blurbSv:
      "Privat svensk säljuppföljning för Stille & Affe, version 7. Dags-, vecko- och månadsmål, humör och rating, taggar, aktivitetsflöde, AI-coach och statistik — med kommandopalett, flöden byggda för tangentbordet, ljud och haptisk bekräftelse samt 13 varaktiga utmärkelser. Migreringar fungerar från både v5- och v6-tabeller utan att sparade mål nollställs.",
    stack: ["Next.js 15", "Supabase", "Server-side auth", "SQL migrations"],
    href: "https://stilleaffe.vercel.app",
    hrefLabel: "Open the live app",
    repo: "https://github.com/SnusStille/Stilleaffe",
  },
  {
    id: "eggheist",
    name: "Egg Heist",
    kind: "Game · systems engineering",
    kindSv: "Spel · systemutveckling",
    year: "2026",
    status: "open-source",
    headline: "93 scripts, one clean foundation",
    headlineSv: "93 skript, en ren grund",
    blurb:
      "A server-authoritative Roblox game: hatch collectible Egg Pals, build a base and vault, upgrade security, raid rival bases and extract the loot. The MAX branch is a rewrite into one implementation per system, no dead code, everything checked by automated verification.",
    blurbSv:
      "Ett serverauktoritativt Roblox-spel: kläck samlingsbara Egg Pals, bygg bas och valv, uppgradera säkerhet, gör räder mot rivalers baser och ta ut bytet. MAX-branchen är en omskrivning till en implementation per system, ingen död kod, allt verifierat automatiskt.",
    stack: ["Luau", "Rojo", "Automated checks"],
    href: "https://github.com/SnusStille/steal-a-egg",
    hrefLabel: "Read the source",
    repo: "https://github.com/SnusStille/steal-a-egg",
  },
  {
    id: "harvis",
    name: "Harvis",
    kind: "Rig · self-hosted agents",
    kindSv: "Rigg · självhostade agenter",
    year: "2026",
    status: "open-source",
    headline: "An assistant that lives on our own machines",
    headlineSv: "En assistent som bor på våra egna maskiner",
    blurb:
      "A maintained fork of OpenClaw — a self-hosted, MIT-licensed assistant runtime — kept as the studio's own agent rig: local devices, local channels, no third-party memory. The place where we learn what agent tooling costs in practice before we recommend it to anyone.",
    blurbSv:
      "En underhållen fork av OpenClaw — en självhostad, MIT-licensierad assistentruntime — som studions egen agentrigg: lokala enheter, lokala kanaler, inget minne hos en tredje part. Här lär vi oss vad agentverktyg faktiskt kostar innan vi rekommenderar dem till någon.",
    stack: ["TypeScript", "Docker", "Crates", "Self-hosted"],
    href: "https://github.com/SnusStille/Harvis",
    hrefLabel: "See the fork",
    repo: "https://github.com/SnusStille/Harvis",
  },
  {
    id: "stickyme",
    name: "Stickyme",
    kind: "Utility · small and self-contained",
    kindSv: "Verktyg · litet och självständigt",
    year: "2022",
    status: "archive",
    headline: "Where it all started being public",
    headlineSv: "Där arbetet först blev offentligt",
    blurb:
      "A small quality-of-life script: keep an action's text on screen until you clear it. Two hundred lines, one idea, still the best unit test for whether a feature is worth building at all.",
    blurbSv:
      "Ett litet QoL-skript: låt texten från en action ligga kvar på skärmen tills du rensar den. Tvåhundra rader, en idé — fortfarande det bästa testet på om en funktion är värd att bygga alls.",
    stack: ["Lua"],
    href: "https://github.com/SnusStille/Stickyme",
    hrefLabel: "Read the source",
    repo: "https://github.com/SnusStille/Stickyme",
  },
];

export type Service = {
  id: string;
  title: string;
  titleSv: string;
  body: string;
  bodySv: string;
  facts: { k: string; v: string }[];
};

export const SERVICES: Service[] = [
  {
    id: "ai",
    title: "Intelligent software",
    titleSv: "Intelligent mjukvara",
    body:
      "LLM features that survive contact with real work: streaming answers, structured output, Swedish and English, guardrails, cost ceilings, and evals you can read.",
    bodySv:
      "LLM-funktioner som tål verkligt arbete: strömmande svar, strukturerad output, svenska och engelska, skyddsnät, kostnadstak och utvärderingar du kan läsa.",
    facts: [
      { k: "Models", v: "Claude · OpenAI · local" },
      { k: "Surface", v: "Chat · voice · vision" },
      { k: "Proof", v: "BudAI, live above" },
    ],
  },
  {
    id: "web",
    title: "Interfaces with physics",
    titleSv: "Gränssnitt med fysik",
    body:
      "Product UI that behaves like a designed object: type that carries hierarchy, motion with weight, state for every input, and a render loop that degrades instead of stuttering.",
    bodySv:
      "Produkt-UI som beter sig som ett formgivet objekt: typografi som bär hierarkin, rörelse med vikt, tillstånd för varje indata — och en render-loop som saktar ner i stället för att hacka.",
    facts: [
      { k: "Stack", v: "React · Next.js · Tailwind" },
      { k: "Depth", v: "three.js · GLSL · Canvas" },
      { k: "Baseline", v: "a11y + SSR + typecheck" },
    ],
  },
  {
    id: "automation",
    title: "Connected systems",
    titleSv: "Kopplade system",
    body:
      "The boring, valuable part: turn recurring work into playbooks, wire the half-empty databases together, and delete steps until the process is smaller than it was.",
    bodySv:
      "Den tråkiga, värdefulla delen: gör återkommande arbete till playbooks, koppla ihop halvtomma databaser, och ta bort steg tills processen är mindre än den var.",
    facts: [
      { k: "Data", v: "Postgres · Supabase" },
      { k: "Glue", v: "Edge functions · queues" },
      { k: "Output", v: "Fewer manual steps" },
    ],
  },
  {
    id: "care",
    title: "Built and kept",
    titleSv: "Byggt och underhållet",
    body:
      "One studio from brief to on-call. Nothing is thrown over a wall, so the thing you approved in design is the thing that is still running next year.",
    bodySv:
      "En studio från brief till beredskap. Inget kastas över en mur — det du godkände i formgivningen är det som fortfarande körs nästa år.",
    facts: [
      { k: "Handoffs", v: "Zero" },
      { k: "Admin", v: "Shipped with the product" },
      { k: "Docs", v: "In the repo" },
    ],
  },
];

/** A real function from this project — shown instead of decorative code. */
export const CODE_EXCERPT = `// lib/cinema/timeline.ts — every frame of this website is the output of one
// deterministic function of scroll. Verbatim, not decoration.

export function cameraAt(index: number, t: number, p: number, scenes: SceneId[] = SCENE_ORDER): CameraState {
  const keys = scenes.map((s) => CAMERA_KEYS[s]);
  const i = clamp(index, 0, keys.length - 2);
  const a = keys[i];
  const b = keys[i + 1];
  const e = smootherstep(t);
  // roll peaks mid-segment: the camera banks into the turn and settles out of it
  const bank = Math.sin(Math.PI * clamp01(t));
  return {
    pos: mixVec3(a.pos, b.pos, e),
    look: mixVec3(a.look, b.look, e),
    fov: lerp(a.fov, b.fov, e),
    roll: lerp(a.roll, b.roll, e) * 0.4 + (b.roll - a.roll) * 0.9 * bank,
    fog: lerp(a.fog, b.fog, e),
    scene: t < 0.5 ? a.scene : b.scene,
    p,
  };
}`;

export const MANIFEST = [
  {
    k: "Position",
    v: "One developer in Stockholm. No account managers, no hand-offs, no telephone game.",
    vSv: "En utvecklare i Stockholm. Inga kundansvariga, inga överlämningar, ingen lek i telefon.",
  },
  {
    k: "Method",
    v: "Art direction first, then architecture. The film and the database are designed in the same week.",
    vSv: "Art direction först, sedan arkitektur. Filmen och databasen designas i samma vecka.",
  },
  {
    k: "Restraint",
    v: "Fewer effects, better timing. Nothing on this page moves unless it is carrying meaning.",
    vSv: "Färre effekter, bättre tajming. Inget på den här sidan rör sig om det inte bär mening.",
  },
];
