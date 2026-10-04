"use client";

export type Lang = "sv" | "en";

export const translations = {
  sv: {
    nav: {
      capabilities: "Om BudAI",
      playground: "Playground",
      waitlist: "Väntelista",
      requestAccess: "Gå med",
      developedBy: "Byggt av",
    },
    hero: {
      badge: "Tidig förhandsvisning",
      title1: "AI för hur",
      title2: "du jobbar.",
      titleAccent: "Sverige",
      words: [],
      subtitle:
        "BudAI är en AI-arbetsassistent för att skriva, tänka, skapa och komma vidare i vardagens uppgifter — på svenska och engelska. Testa förhandsvisningen och hjälp oss forma det som kommer härnäst.",
      ctaPrimary: "Testa BudAI",
      ctaSecondary: "Lås 10 % early access",
    },
    capabilities: {
      badge: "Vad är BudAI?",
      title: "Byggd för",
      titleHighlight: "arbetsdagar på riktigt",
      subtitle:
        "Skriv, tänk, skapa och förenkla flöden — en AI-arbetsassistent i tidig utveckling.",
    },
    playground: {
      badge: "Interaktiv förhandsvisning",
      title: "Testa",
      titleHighlight: "BudAI",
      subtitle:
        "Ett komplett arbetsbord: strömmande svar, roller, promptbibliotek, minne, röst och bilder. Börja utan konto.",
      placeholder: "Skriv till BudAI…",
      online: "Tidig förhandsvisning",
      thinking: "Tänker…",
      analyzing: "BudAI analyserar…",
      confidence: "konfidens",
    },
    terminal: {
      badge: "Illustration",
      title: "Så känns",
      titleHighlight: "infrastrukturen",
      subtitle:
        "En stiliserad förhandsvisning — inte en live-shell. Den riktiga motorn testar du i Playground ovan.",
      copy: "Kopiera",
      copied: "Kopierat!",
      prompt: "budai@stilledev:~",
    },
    waitlist: {
      badge: "Early access",
      title: "BudAI byggs vidare.",
      titleHighlight: "Kom med tidigt.",
      subtitle:
        "Skriv upp dig för uppdateringar och besked när nästa preview öppnar. BudAI utvecklas fortfarande — vi delar mer när det finns något nytt att prova.",
      individualTab: "Mig själv",
      companyTab: "Mitt team",
      namePlaceholder: "Ditt namn",
      emailPlaceholder: "E-postadress",
      submit: "Gå med i väntelistan",
      successTitle: "Du är med på väntelistan.",
      successPre: "Vi har sparat anmälan för",
      successPost: ".",
      successNote: "Vi skickar uppdateringar när det finns mer att prova. BudAI är fortfarande under utveckling.",
    },
    status: {
      badge: "Preview-status",
      title: "Byggstatus",
      titleHighlight: "v0.93",
      subtitle:
        "Ärlig översikt över utvecklarförhandsvisningen — inte ett produktions-SRE-dashboard. Siffror speglar preview-mål.",
      serviceHealth: "Preview-hälsa",
      allOperational: "Preview igång",
      platformMetrics: "Målmetrik",
      uptime: "Tillgänglighet",
      response: "Svarsmål",
      dataCenters: "Regioner",
      security: "Säkerhet",
      developmentProgress: "Utveckling",
      coreSystems: "Mot lansering",
    },
    footer: {
      rights: "© 2026 BudAI av Stilledev. Alla rättigheter förbehållna.",
      built: "Byggt med passion i Sverige",
    },
    cookie: {
      title: "Vi använder cookies",
      text: "Nödvändiga cookies för sajten. Analys endast med ditt samtycke.",
      accept: "Acceptera",
      decline: "Avböj",
      more: "Läs mer",
    },
    buddy: {
      title: "Buddys lilla gnista",
      text: "Buddy är den tysta inspirationen bakom BudAI — en lojal vän vars namn blev en del av historien.",
    },
  },
  en: {
    nav: {
      capabilities: "About BudAI",
      playground: "Playground",
      waitlist: "Waitlist",
      requestAccess: "Join waitlist",
      developedBy: "Built by",
    },
    hero: {
      badge: "Early preview",
      title1: "AI for the way",
      title2: "you work.",
      titleAccent: "Sweden",
      words: [],
      subtitle:
        "BudAI is an AI work assistant for writing, thinking, creating, and moving everyday work forward — in Swedish and English. Try the preview and help shape what comes next.",
      ctaPrimary: "Try BudAI",
      ctaSecondary: "Lock in 10% early access",
    },
    capabilities: {
      badge: "What is BudAI?",
      title: "Built for",
      titleHighlight: "real workdays",
      subtitle:
        "Write, think, create, and simplify workflows — an AI work assistant still in development.",
    },
    playground: {
      badge: "Interactive preview",
      title: "Try",
      titleHighlight: "BudAI",
      subtitle:
        "A full workbench: streaming answers, personas, a prompt library, memory, voice and images. Start without an account.",
      placeholder: "Message BudAI…",
      online: "Early preview",
      thinking: "Thinking…",
      analyzing: "BudAI is analyzing…",
      confidence: "confidence",
    },
    terminal: {
      badge: "Illustration",
      title: "How the stack",
      titleHighlight: "feels",
      subtitle:
        "A stylized preview — not a live shell. The real engine is the Playground above.",
      copy: "Copy",
      copied: "Copied!",
      prompt: "budai@stilledev:~",
    },
    waitlist: {
      badge: "Early access",
      title: "BudAI is taking shape.",
      titleHighlight: "Come along early.",
      subtitle:
        "Join for updates and hear when the next preview opens. BudAI is still in development — we’ll share more when there is something new to try.",
      individualTab: "Myself",
      companyTab: "My team",
      namePlaceholder: "Your name",
      emailPlaceholder: "Email address",
      submit: "Join the waitlist",
      successTitle: "You’re on the waitlist.",
      successPre: "We saved the signup for",
      successPost: ".",
      successNote: "We’ll share updates when there is more to try. BudAI is still in development.",
    },
    status: {
      badge: "Preview status",
      title: "Build status",
      titleHighlight: "v0.93",
      subtitle:
        "An honest view of the developer preview — not a production SRE board. Figures reflect preview targets.",
      serviceHealth: "Preview health",
      allOperational: "Preview live",
      platformMetrics: "Target metrics",
      uptime: "Availability",
      response: "Response goal",
      dataCenters: "Regions",
      security: "Security",
      developmentProgress: "Development",
      coreSystems: "Toward launch",
    },
    footer: {
      rights: "© 2026 BudAI by Stilledev. All rights reserved.",
      built: "Built with passion in Sweden",
    },
    cookie: {
      title: "We use cookies",
      text: "Essential cookies for the site. Analytics only with your consent.",
      accept: "Accept",
      decline: "Decline",
      more: "Learn more",
    },
    buddy: {
      title: "Buddy's little spark",
      text: "Buddy is the quiet inspiration behind BudAI — a loyal friend whose name became part of the story.",
    },
  },
};

export function useTranslation(lang: Lang) {
  return translations[lang];
}
