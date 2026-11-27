/**
 * Stilledev Labs — Service categories
 *
 * Defines the five primary service areas, each with:
 * - bilingual labels, descriptions, and starter prompts
 * - AI-relevant context (what questions to ask for this category)
 * - icon key (rendered as SVG geometric marks, no emoji)
 * - Order reflects the customer funnel: websites → apps → games → custom → AI
 */
export type ServiceCategory =
  | "website"
  | "webapp"
  | "app"
  | "game"
  | "custom"
  | "ai_automation"
  | "unsure";

export interface ServiceDef {
  id: ServiceCategory;
  icon: "globe" | "layout" | "device" | "gamepad" | "code" | "sparkles" | "help";
  labelSv: string;
  labelEn: string;
  shortSv: string;
  shortEn: string;
  descSv: string;
  descEn: string;
  startersSv: string[];
  startersEn: string[];
  /** System prompt injection — category-specific questions for BudAI to focus on */
  promptContextSv: string;
  promptContextEn: string;
}

export const SERVICES: ServiceDef[] = [
  {
    id: "website",
    icon: "globe",
    labelSv: "Webbplats",
    labelEn: "Website",
    shortSv: "Hemsidor & webbutveckling",
    shortEn: "Websites & web development",
    descSv: "Professionella hemsidor, landningssidor, e-handel och portfolior – snabba, moderna och sökmotoroptimerade.",
    descEn: "Professional websites, landing pages, e-commerce and portfolios – fast, modern, and search-engine optimized.",
    startersSv: [
      "Jag behöver en ny hemsida till mitt företag",
      "Jag vill bygga en modern portfolio-sajt",
      "Jag behöver en e-handelslösning",
      "Min nuvarande hemsida behöver uppdateras",
    ],
    startersEn: [
      "I need a new website for my business",
      "I want to build a modern portfolio site",
      "I need an e-commerce solution",
      "My current website needs a redesign",
    ],
    promptContextSv: "Kunden är intresserad av en webbplats. Fråga om: företagets verksamhet, målgrupp, befintlig domän/varumärke, viktiga funktioner (kontaktformulär, bokning, betalning, flerspråkighet), designexempel de gillar, budgetintervall, om SEO/tillgänglighet är viktigt, deadline.",
    promptContextEn: "The customer is interested in a website. Ask about: their business, target audience, existing domain/brand, key features (contact form, booking, payments, multilingual), design references they like, budget range, whether SEO/accessibility matters, deadline.",
  },
  {
    id: "webapp",
    icon: "layout",
    labelSv: "Webbapplikation",
    labelEn: "Web Application",
    shortSv: "SaaS, dashboards & system",
    shortEn: "SaaS, dashboards & systems",
    descSv: "Kompletta webbapplikationer, adminpaneler, SaaS-plattformar, bokningssystem och kundportaler.",
    descEn: "Complete web applications, admin panels, SaaS platforms, booking systems and customer portals.",
    startersSv: [
      "Jag vill bygga en SaaS-tjänst",
      "Jag behöver ett internt adminverktyg",
      "Jag vill ha ett bokningssystem",
      "Jag behöver ett kunddashboard",
    ],
    startersEn: [
      "I want to build a SaaS product",
      "I need an internal admin tool",
      "I need a booking system",
      "I need a customer dashboard",
    ],
    promptContextSv: "Kunden vill ha en webbapplikation. Fråga om: användartyper (admin/kund), autentisering, viktigaste features i MVP, databehov, integrationer med andra system, skalbarhet, befintlig teknisk stack, budget och tidsram.",
    promptContextEn: "The customer wants a web application. Ask about: user roles (admin/customer), authentication, core MVP features, data needs, third-party integrations, scalability requirements, existing tech stack, budget and timeline.",
  },
  {
    id: "game",
    icon: "gamepad",
    labelSv: "Spelutveckling & Scripts",
    labelEn: "Game Scripts & Development",
    shortSv: "FiveM, Roblox & spelprojekt",
    shortEn: "FiveM, Roblox & game projects",
    descSv: "Lua-scripts för FiveM/GTA V, Luau-script för Roblox, spelmekaniker, plugins, optimering och felsökning av befintlig kod.",
    descEn: "Lua scripts for FiveM/GTA V, Luau scripts for Roblox, game mechanics, plugins, optimization and debugging of existing code.",
    startersSv: [
      "Jag behöver ett custom script till min FiveM-server",
      "Jag vill utveckla något i Roblox",
      "Jag behöver hjälp med Lua-felsökning",
      "Jag vill ha ett unikt inventory-system",
    ],
    startersEn: [
      "I need a custom script for my FiveM server",
      "I want to build something in Roblox",
      "I need help debugging Lua code",
      "I want a custom inventory system",
    ],
    promptContextSv: "Kunden är intresserad av spelrelaterad utveckling (FiveM/Roblox/Lua). Fråga om: specifikt spel eller plattform (FiveM, RageMP, Roblox, etc.), framework (ESX, QBCore, vRP, custom), befintliga scripts, önskade funktioner, prestanda/optimering, serverstorlek, om de har tillgång till server, budget och deadline. VAR SPECIALLT NOGA MED: FiveM/Lua-användare har ofta en mycket specifik teknisk kontext – förstå vilka ramverk de använder innan du ger råd.",
    promptContextEn: "The customer is interested in game development (FiveM/Roblox/Lua). Ask about: specific game or platform (FiveM, RageMP, Roblox, etc.), framework (ESX, QBCore, vRP, custom), existing scripts, desired features, performance/optimization, server size, whether they have server access, budget and deadline. PAY SPECIAL ATTENTION: FiveM/Lua users often have very specific technical context – understand which framework they're using before giving advice.",
  },
  {
    id: "app",
    icon: "device",
    labelSv: "App & Mobil",
    labelEn: "Apps & Mobile",
    shortSv: "Mobilanpassade applikationer",
    shortEn: "Mobile-first applications",
    descSv: "Mobilanpassade webbappar, progressiva appar (PWA) och plattformsoberoende lösningar.",
    descEn: "Mobile-optimized web apps, progressive apps (PWA) and cross-platform solutions.",
    startersSv: [
      "Jag vill utveckla en mobilapp",
      "Jag behöver en PWA",
      "Min befintliga app behöver förbättras",
    ],
    startersEn: [
      "I want to develop a mobile app",
      "I need a PWA",
      "My existing app needs improvement",
    ],
    promptContextSv: "Kunden vill ha en app. Fråga om: plattform (iOS, Android, PWA/båda), användningsfall offline/online, push-notiser, målgrupp, integrationer med hårdvara (kamera, GPS), befintlig backend, lanseringsmål, budget.",
    promptContextEn: "The customer wants an app. Ask about: platform (iOS, Android, PWA/both), offline/online usage, push notifications, target audience, hardware integrations (camera, GPS), existing backend, launch goals, budget.",
  },
  {
    id: "custom",
    icon: "code",
    labelSv: "Skräddarsydd kod",
    labelEn: "Custom Software",
    shortSv: "Specialbyggda system & integrationer",
    shortEn: "Custom systems & integrations",
    descSv: "Specialbyggda system, API:er, databaser, automation, integrationer mellan tjänster och skräddarsydd kod.",
    descEn: "Custom systems, APIs, databases, automation, service integrations and tailored code.",
    startersSv: [
      "Jag behöver en integration mellan två system",
      "Jag vill automatisera ett arbetsflöde",
      "Jag behöver en anpassad databaslösning",
      "Jag behöver hjälp med en API-lösning",
    ],
    startersEn: [
      "I need an integration between two systems",
      "I want to automate a workflow",
      "I need a custom database solution",
      "I need help with an API solution",
    ],
    promptContextSv: "Kunden vill ha specialbyggd mjukvara. Fråga om: vilka system som ska integreras, datakällor, befintlig infrastruktur, säkerhetskrav, förväntad belastning, vem som använder systemet, långsiktiga mål.",
    promptContextEn: "The customer wants custom software. Ask about: which systems to integrate, data sources, existing infrastructure, security requirements, expected load, who uses the system, long-term goals.",
  },
  {
    id: "ai_automation",
    icon: "sparkles",
    labelSv: "AI & Automation",
    labelEn: "AI & Automation",
    shortSv: "AI-lösningar och smarta arbetsflöden",
    shortEn: "AI solutions & smart workflows",
    descSv: "AI-drivna funktioner, chattbottar, innehållsgenerering, bildbehandling och automatiserade arbetsflöden.",
    descEn: "AI-powered features, chatbots, content generation, image processing and automated workflows.",
    startersSv: [
      "Jag vill integrera AI i min produkt",
      "Jag behöver automatisera något med AI",
      "Jag vill bygga en AI-chatt",
      "Jag behöver hjälp med RAG/LLM",
    ],
    startersEn: [
      "I want to integrate AI into my product",
      "I need to automate something with AI",
      "I want to build an AI chatbot",
      "I need help with RAG/LLM",
    ],
    promptContextSv: "Kunden vill ha AI-lösningar. Fråga om: användningsfall, vilken AI-kompetens som behövs (text, bild, tal, data), data de har, sekretesskrav, modellpreferenser, kostnadsförväntningar, hur resultatet ska integreras.",
    promptContextEn: "The customer wants AI solutions. Ask about: use case, which AI capability is needed (text, image, speech, data), their data, privacy requirements, model preferences, cost expectations, how results will be integrated.",
  },
  {
    id: "unsure",
    icon: "help",
    labelSv: "Osäker?",
    labelEn: "Not sure?",
    shortSv: "Beskriv din idé så hjälper jag dig",
    shortEn: "Describe your idea and I'll help you",
    descSv: "Vet du inte riktigt vad du behöver än? Beskriv din idé eller ditt problem så hjälper jag dig att hitta rätt väg.",
    descEn: "Not sure what you need yet? Describe your idea or problem and I'll help you find the right path.",
    startersSv: [
      "Jag har en idé men vet inte var jag ska börja",
      "Kan du hjälpa mig förstå vad jag behöver?",
    ],
    startersEn: [
      "I have an idea but don't know where to start",
      "Can you help me understand what I need?",
    ],
    promptContextSv: "Kunden är osäker på vad de behöver. Börja med att förstå deras övergripande mål – vad vill de åstadkomma, vilket problem löser de, vilken bransch är de i? Hjälp dem att kategorisera projektet genom att ställa öppna frågor.",
    promptContextEn: "The customer is unsure what they need. Start by understanding their high-level goal – what do they want to achieve, what problem are they solving, what industry are they in? Help them categorize the project through open questions.",
  },
];

export function getServiceById(id: ServiceCategory): ServiceDef | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** Map to database enum value */
export function serviceCategoryToDbEnum(id: ServiceCategory): string {
  const map: Record<ServiceCategory, string> = {
    website: "website",
    webapp: "web_application",
    app: "mobile_app",
    game: "game_development",
    custom: "integration",
    ai_automation: "ai_service",
    unsure: "unknown",
  };
  return map[id];
}
