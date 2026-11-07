export type LocalizedText = {
  sv: string;
  en: string;
};

export type ProjectVisualKind = "budai" | "stilleaffe" | "second-brain" | "blueprint";

export type ProjectStatusTone = "live" | "preview" | "private";

export type ProjectVisibility = "public" | "private";

export interface StilledevProjectLink {
  label: LocalizedText;
  href: string;
  external?: boolean;
  kind?: "primary" | "github" | "secondary";
}

export interface StilledevProject {
  id: string;
  index: string;
  name: string;
  visibility: ProjectVisibility;
  category: LocalizedText;
  summary: LocalizedText;
  /** Verified architectural & engineering capabilities shown in the Architecture spec view. */
  architecture: {
    sv: string[];
    en: string[];
  };
  /** Only include when status is verified; omit or use "private" for internal/personal systems. */
  status?: {
    label: LocalizedText;
    tone: ProjectStatusTone;
  };
  visual: ProjectVisualKind;
  stack: string[];
  /** Verified working public links only. Omit or leave empty when a system is private. */
  links: StilledevProjectLink[];
  /** Shown when a project has no public URL so visitors never hit a dead link. */
  privateNote?: LocalizedText;
}

export type DomainSchematicKind =
  | "ai-pipeline"
  | "web-craft"
  | "saas-layers"
  | "workflow-nodes"
  | "rd-track";

export interface StilledevDomain {
  id: string;
  num: string;
  code: string;
  schematic: DomainSchematicKind;
  title: LocalizedText;
  description: LocalizedText;
  highlights: {
    sv: string[];
    en: string[];
  };
  playgroundPrompt?: LocalizedText;
}

export interface StilledevContactChannel {
  id: "email" | "website" | "github" | "linkedin";
  label: LocalizedText;
  value: string;
  href: string;
  external?: boolean;
  note: LocalizedText;
}

export interface StilledevInquiryTopic {
  id: "ai" | "webapp" | "partnership" | "product";
  label: LocalizedText;
  subject: LocalizedText;
  template: LocalizedText;
}

/**
 * Verified company specification for Stilledev (Enskild firma).
 * Optional registration fields are intentionally null until explicitly added —
 * populate any field below and the UI renders it automatically without layout changes.
 */
export const COMPANY_REGISTRY = {
  name: "Stilledev",
  legalForm: {
    sv: "Enskild firma",
    en: "Sole proprietorship (Enskild firma)",
  },
  founder: "Oliver Stille",
  scope: {
    sv: "Digital utveckling, AI och mjukvara",
    en: "Digital development, AI & software",
  },
  country: {
    sv: "Sverige",
    en: "Sweden",
  },
  languages: {
    sv: "Svenska & Engelska",
    en: "Swedish & English",
  },
  // Ready for future completion — never populated with placeholder or unverified numbers:
  orgNumber: null as string | null,
  fSkatt: null as string | null,
  vatNumber: null as string | null,
  registeredAddress: null as string | null,
} as const;

export const FOUNDER_PROFILE = {
  name: "Oliver Stille",
  role: {
    sv: "Grundare · Stilledev",
    en: "Founder · Stilledev",
  },
  base: {
    sv: "Sverige · Internationell inriktning",
    en: "Sweden · International scope",
  },
  headline: {
    line1: "Oliver Stille.",
    line2: {
      sv: "Grundare bakom Stilledev.",
      en: "Founder behind Stilledev.",
    },
  },
  paragraphs: {
    sv: [
      "Jag driver Stilledev och bygger egna digitala produkter, webbapplikationer och AI-drivna verktyg. Med över tio års erfarenhet av mjukvaruutveckling — och de senaste två åren med fokus på BudAI — kombinerar jag teknik, produktdesign och företagande under ett och samma tak.",
      "Det som driver mig är hela kedjan från första skiss och systemarkitektur till en färdig produkt som faktiskt används i vardagen. Med Sverige som bas bygger jag lösningar som fungerar naturligt på både svenska och engelska, med tydlig ambition att nå ut internationellt.",
    ],
    en: [
      "I run Stilledev and build independent digital products, web applications, and AI-driven tools. With over ten years of writing software — and the past two focused closely on BudAI — I combine engineering, product design, and entrepreneurship under one roof.",
      "What motivates me is taking an idea all the way from initial concept and architecture to shipped, dependable software. Based in Sweden, I build products that work naturally in both Swedish and English, designed from day one to scale internationally.",
    ],
  },
  workflow: [
    {
      step: "01",
      title: { sv: "Koncept", en: "Concept" },
      detail: { sv: "Problem, struktur & riktning", en: "Problem framing & direction" },
      spec: {
        sv: "Tydlig avgränsning av kärnproblemet, användarflöden och gränssnittsstruktur på svenska och engelska innan första raden produktionskod skrivs.",
        en: "Defining the core problem, user journeys, and interface hierarchy in Swedish and English before writing production code.",
      },
      outputs: {
        sv: ["Produktstruktur", "UX-flöde", "Teknisk avgränsning"],
        en: ["Product scope", "UX flow", "System boundaries"],
      },
    },
    {
      step: "02",
      title: { sv: "Arkitektur", en: "Architecture" },
      detail: { sv: "Typsäker kod, data & AI", en: "Type-safe code, data & AI" },
      spec: {
        sv: "Fullstack-implementation med Next.js, strikt TypeScript, Supabase/Postgres med radnivåsäkerhet (RLS) och strömmande AI-integrationer.",
        en: "Full-stack implementation with Next.js, strict TypeScript, Supabase/Postgres row-level security, and streaming AI pipelines.",
      },
      outputs: {
        sv: ["Next.js + TS", "Supabase RLS", "Strömmande AI-API"],
        en: ["Next.js + TS", "Supabase RLS", "Streaming AI API"],
      },
    },
    {
      step: "03",
      title: { sv: "Färdig produkt", en: "Shipped product" },
      detail: { sv: "Design, drift & vidareutveckling", en: "Design, deployment & iteration" },
      spec: {
        sv: "Responsiv finish, automatiserade webbläsartester, CSP-säkerhet, driftsättning och löpande förbättringar utifrån verklig användning.",
        en: "Responsive polish, automated browser testing, strict CSP headers, cloud deployment, and continuous iteration from real usage.",
      },
      outputs: {
        sv: ["Playwright E2E", "CSP & säkerhet", "Molndrift"],
        en: ["Playwright E2E", "CSP & security", "Cloud deploy"],
      },
    },
  ],
  metrics: [
    {
      value: "10+",
      label: { sv: "år av kodande", en: "years of code" },
    },
    {
      value: "02",
      label: { sv: "år med BudAI", en: "years on BudAI" },
    },
    {
      value: "SV / EN",
      label: { sv: "Sverige → Internationellt", en: "Sweden → International" },
    },
  ],
  stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Claude API", "Three.js / WebGL"],
  principles: {
    sv: [
      "Från första koncept till driftsatt produkt",
      "Integritet och kontroll över egen data",
      "Byggt i Sverige med internationell räckvidd",
    ],
    en: [
      "From first concept to shipped software",
      "Privacy first and user-controlled data",
      "Built in Sweden for international use",
    ],
  },
} as const;

export const STILLEDEV_DOMAINS: StilledevDomain[] = [
  {
    id: "ai-engineering",
    num: "01",
    code: "ai.systems · llm · memory",
    schematic: "ai-pipeline",
    title: {
      sv: "AI-utveckling & AI-integrationer",
      en: "AI development & integrations",
    },
    description: {
      sv: "Praktiska AI-lösningar byggda kring moderna språkmodeller — strömmande assistenter, kontext- och minneshantering, bild- och röststöd samt genomtänkta integrationer i befintliga system.",
      en: "Practical AI systems built around modern language models — streaming assistants, user-controlled memory, multimodal input, and dependable integrations into real workflows.",
    },
    highlights: {
      sv: ["Strömmande svar & verktygsanrop", "Kontrollerat kontextminne", "Tvåspråkiga flöden (SV / EN)"],
      en: ["Streaming responses & tool use", "User-controlled context memory", "Bilingual workflows (SV / EN)"],
    },
    playgroundPrompt: {
      sv: "Skissa en teknisk arkitektur för en AI-integration i en befintlig webbapplikation med strömmande svar, dataskydd och tydlig felhantering.",
      en: "Outline a clean technical architecture for integrating a streaming AI assistant into a web application with data privacy and resilient error handling.",
    },
  },
  {
    id: "web-applications",
    num: "02",
    code: "web.app · nextjs · typescript",
    schematic: "web-craft",
    title: {
      sv: "Webbplatser & webbapplikationer",
      en: "Websites & web applications",
    },
    description: {
      sv: "Snabba, responsiva webbplatser och fullstack-applikationer med fokus på tydlig typografi, hög prestanda, säker arkitektur och gränssnitt som känns genomarbetade i varje detalj.",
      en: "Fast, responsive websites and full-stack web applications crafted with clean typography, strong performance, secure server architecture, and refined interaction.",
    },
    highlights: {
      sv: ["Next.js, React & TypeScript", "Responsiv & tillgänglig design", "Subtila 3D- & rörelsedetaljer"],
      en: ["Next.js, React & TypeScript", "Responsive, accessible UI", "Restrained 3D & motion craft"],
    },
  },
  {
    id: "saas-products",
    num: "03",
    code: "product.saas · auth · data",
    schematic: "saas-layers",
    title: {
      sv: "Digitala produkter & SaaS",
      en: "Digital products & SaaS",
    },
    description: {
      sv: "Utveckling av kompletta mjukvaruprodukter från grunden — autentisering, rollstyrda vyer, databasscheman med strikt behörighet och skalbar molndrift.",
      en: "End-to-end software products engineered from the ground up — authentication, role-based workspaces, row-level data security, and resilient cloud deployment.",
    },
    highlights: {
      sv: ["Supabase & Postgres-arkitektur", "Rollbaserad åtkomst & säkerhet", "Från MVP till produktionsmiljö"],
      en: ["Supabase & Postgres architecture", "Role-based access & security", "From early concept to production"],
    },
  },
  {
    id: "automation-workflows",
    num: "04",
    code: "workflow.automate · signal",
    schematic: "workflow-nodes",
    title: {
      sv: "Automatisering & smarta arbetsflöden",
      en: "Automation & smart workflows",
    },
    description: {
      sv: "Verktyg som minskar manuellt dubbelarbete genom att strukturera indata, sammanfatta beslutsunderlag och koppla ihop återkommande steg till pålitliga processer.",
      en: "Tools that reduce manual overhead by structuring raw input, surfacing clear trade-offs, and turning recurring tasks into repeatable, auditable steps.",
    },
    highlights: {
      sv: ["Beslutsstöd & sammanfattningar", "Strukturerade handlingsplaner", "Tidsbesparande vardagsrutiner"],
      en: ["Decision support & synthesis", "Structured action plans", "Time-saving operational routines"],
    },
  },
  {
    id: "labs-rd",
    num: "05",
    code: "labs.rd · experiments",
    schematic: "rd-track",
    title: {
      sv: "Egna experiment & produktutveckling",
      en: "Independent R&D & product lab",
    },
    description: {
      sv: "Stilledev Labs fungerar även som ett eget utvecklingslabb där nya produktidéer, gränssnittskoncept och tekniska prototyper testas, förfinas och lanseras steg för steg.",
      en: "Stilledev Labs also serves as an internal product lab where new software ideas, interface concepts, and technical prototypes are tested, refined, and shipped.",
    },
    highlights: {
      sv: ["Egna produkter under eget varumärke", "Iterativ utveckling i öppen preview", "Långsiktigt fokus på kvalitet"],
      en: ["In-house software ventures", "Iterative public previews", "Long-term focus on craft"],
    },
  },
];

/**
 * Stilledev Projects registry.
 * To add a new project later, append an object to STILLEDEV_PROJECTS below.
 * Set `visual: "blueprint"` (or add a dedicated preset) and include only verified links.
 */
export const STILLEDEV_PROJECTS: StilledevProject[] = [
  {
    id: "budai",
    index: "01",
    name: "BudAI",
    visibility: "public",
    category: {
      sv: "AI-assistent & digital arbetsplattform",
      en: "AI assistant & digital workspace",
    },
    summary: {
      sv: "Tvåspråkig AI-arbetsyta byggd i Sverige för skrivande, analys, planering och automatisering på svenska och engelska — med live Playground, röst, bildanalys och minne du själv styr.",
      en: "Bilingual AI workspace built in Sweden for writing, analysis, planning, and automation in Swedish and English — featuring a live Playground, voice, vision, and user-controlled memory.",
    },
    architecture: {
      sv: [
        "Progressiv SSE-strömning med modellval och avbrytbara svar i realtid",
        "Användarstyrt kontextminne, röstinmatning och multimodal bildanalys",
        "Strikt per-request CSP-nonce, serverstyrd kvotering och Supabase PKCE-auth",
        "Sammanhängande WebGL- och CSS3D-upplevelse med fallback för reducerad rörelse",
      ],
      en: [
        "Progressive SSE token streaming with live cancellation and model tiering",
        "User-controlled context memory, voice dictation, and multimodal vision",
        "Per-request CSP nonces, server-owned rate limiting, and Supabase PKCE auth",
        "Continuous WebGL + CSS3D spatial stage with full reduced-motion fallback",
      ],
    },
    status: {
      label: {
        sv: "Developer Preview · Live",
        en: "Developer Preview · Live",
      },
      tone: "preview",
    },
    visual: "budai",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude API", "WebGL"],
    links: [
      {
        label: { sv: "Prova BudAI", en: "Try BudAI" },
        href: "#playground",
        kind: "primary",
      },
      {
        label: { sv: "GitHub", en: "GitHub" },
        href: "https://github.com/SnusStille/budai-website",
        external: true,
        kind: "github",
      },
    ],
  },
  {
    id: "stilleaffe",
    index: "02",
    name: "StilleAffe",
    visibility: "public",
    category: {
      sv: "Dashboard & försäljningsverktyg",
      en: "Sales dashboard & performance tool",
    },
    summary: {
      sv: "Rollanpassad sälj- och uppföljningsplattform för dagligt fokus och ledarskap — med dags-, vecko- och månadsmål, prognoser utifrån faktiska arbetsdagar, aktivitetsflöde och datagrundad AI-coachning.",
      en: "Role-tailored sales tracking and coaching dashboard built for daily execution — with daily, weekly, and monthly targets, workday-calibrated forecasts, activity streams, and data-grounded AI nudges.",
    },
    architecture: {
      sv: [
        "Separata rollvyer för säljare (mål & fokus) och chef (överblick & stöd)",
        "Arbetstidskalibrerade prognoser på dags-, vecko- och månadsnivå",
        "Servervaliderad autentisering och strukturerad datalagring i Supabase",
        "Datagrundad AI-coachning kopplad direkt till faktisk aktivitetsrytm",
      ],
      en: [
        "Dedicated role workspaces for Seller (daily focus) and Manager (team support)",
        "Workday-calibrated pace forecasting across daily, weekly, and monthly goals",
        "Server-authenticated session gate backed by structured Supabase storage",
        "Data-grounded AI coaching nudges tied directly to real activity metrics",
      ],
    },
    status: {
      label: {
        sv: "Live · Privat arbetsyta",
        en: "Live · Private workspace",
      },
      tone: "live",
    },
    visual: "stilleaffe",
    stack: ["Next.js", "TypeScript", "Supabase", "Server Auth", "AI Coach"],
    links: [
      {
        label: { sv: "Öppna StilleAffe", en: "Open StilleAffe" },
        href: "https://stilleaffe.vercel.app",
        external: true,
        kind: "primary",
      },
      {
        label: { sv: "GitHub", en: "GitHub" },
        href: "https://github.com/SnusStille/Stilleaffe",
        external: true,
        kind: "github",
      },
    ],
  },
  {
    id: "annas-second-brain",
    index: "03",
    name: "Anna's Second Brain",
    visibility: "private",
    category: {
      sv: "Personlig AI-driven organisations- & kunskapsplattform",
      en: "Personal AI-driven organization & knowledge platform",
    },
    summary: {
      sv: "Skräddarsydd plattform för personlig struktur och kunskapshantering där anteckningar, idéer, uppgifter och kontext vävs samman med AI-stöd för snabb återblick och tydliga prioriteringar.",
      en: "Custom personal knowledge and organization system connecting notes, ideas, tasks, and long-term context with AI synthesis for fast recall and clear everyday priorities.",
    },
    architecture: {
      sv: [
        "Strukturerad kunskapsgraf som kopplar samman anteckningar, uppgifter och kontext",
        "AI-assisterad syntes för sammanfattningar, prioritering och snabb återhämtning",
        "Skräddarsytt arbetsflöde utformat för daglig personlig överblick utan brus",
        "Privat enanvändarmiljö med full kontroll över personlig information",
      ],
      en: [
        "Structured knowledge graph linking notes, active tasks, and long-term context",
        "AI-assisted synthesis for clear summaries, recall, and daily prioritization",
        "Custom low-friction interface tailored for calm everyday organization",
        "Private single-tenant environment keeping personal data strictly isolated",
      ],
    },
    status: {
      label: {
        sv: "Dedikerat system",
        en: "Dedicated system",
      },
      tone: "private",
    },
    visual: "second-brain",
    stack: ["AI Knowledge Base", "Structured Context", "Workflows", "Web App"],
    links: [],
    privateNote: {
      sv: "Privat plattform · ingen publik länk",
      en: "Private platform · no public link",
    },
  },
];

export const INQUIRY_TOPICS: StilledevInquiryTopic[] = [
  {
    id: "ai",
    label: { sv: "AI & integration", en: "AI & integration" },
    subject: {
      sv: "Förfrågan: AI-utveckling / integration — Stilledev",
      en: "Inquiry: AI development / integration — Stilledev",
    },
    template: {
      sv: "Hej Oliver,\n\nJag vill gärna diskutera ett AI- eller integrationsprojekt med Stilledev.\n\nKort om behovet:\n",
      en: "Hi Oliver,\n\nI would like to discuss an AI or integration project with Stilledev.\n\nBrief context:\n",
    },
  },
  {
    id: "webapp",
    label: { sv: "Webbapp / SaaS", en: "Web app / SaaS" },
    subject: {
      sv: "Förfrågan: Webbapplikation / digital produkt — Stilledev",
      en: "Inquiry: Web application / digital product — Stilledev",
    },
    template: {
      sv: "Hej Oliver,\n\nVi tittar på att bygga eller vidareutveckla en webbapplikation / digital produkt.\n\nKort om projektet:\n",
      en: "Hi Oliver,\n\nWe are looking to build or evolve a web application / digital product.\n\nProject overview:\n",
    },
  },
  {
    id: "partnership",
    label: { sv: "Samarbete", en: "Partnership" },
    subject: {
      sv: "Samarbetsförfrågan — Stilledev",
      en: "Partnership inquiry — Stilledev",
    },
    template: {
      sv: "Hej Oliver,\n\nJag hör av mig angående ett möjligt tekniskt eller affärsmässigt samarbete.\n\nBakgrund:\n",
      en: "Hi Oliver,\n\nReaching out regarding a potential technical or business partnership.\n\nContext:\n",
    },
  },
  {
    id: "product",
    label: { sv: "BudAI / Produkt", en: "BudAI / Product" },
    subject: {
      sv: "Fråga kring BudAI / Stilledev Labs",
      en: "Question regarding BudAI / Stilledev Labs",
    },
    template: {
      sv: "Hej Oliver,\n\nJag har en fråga eller feedback kring BudAI / Stilledev Labs:\n",
      en: "Hi Oliver,\n\nI have a question or feedback regarding BudAI / Stilledev Labs:\n",
    },
  },
];

export const CONTACT_CHANNELS: StilledevContactChannel[] = [
  {
    id: "email",
    label: { sv: "E-post", en: "Email" },
    value: "Stilleinc@hotmail.com",
    href: "mailto:Stilleinc@hotmail.com",
    note: {
      sv: "Direktkontakt för uppdrag, samarbeten och frågor",
      en: "Direct line for projects, partnerships & inquiries",
    },
  },
  {
    id: "website",
    label: { sv: "Webbplats", en: "Website" },
    value: "stilledev.se",
    href: "https://stilledev.se",
    external: true,
    note: {
      sv: "Stilledev & BudAI i produktion",
      en: "Stilledev & BudAI in production",
    },
  },
  {
    id: "github",
    label: { sv: "GitHub", en: "GitHub" },
    value: "github.com/SnusStille",
    href: "https://github.com/SnusStille",
    external: true,
    note: {
      sv: "Öppen källkod och publika repos",
      en: "Open-source repositories & code",
    },
  },
  {
    id: "linkedin",
    label: { sv: "LinkedIn", en: "LinkedIn" },
    value: "Oliver Stille",
    href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/",
    external: true,
    note: {
      sv: "Professionell profil och nätverk",
      en: "Professional profile & network",
    },
  },
];
