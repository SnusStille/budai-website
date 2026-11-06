"use client";

export type Lang = "sv" | "en";

export const translations = {
  sv: {
    nav: {
      capabilities: "Förmågor",
      playground: "Playground",
      terminal: "Terminal",
      waitlist: "Väntelista",
      roadmap: "Roadmap",
      status: "Status",
      requestAccess: "Begär åtkomst",
      developedBy: "Utvecklad av",
    },
    hero: {
      badge: "Utvecklarförhandsvisning",
      title1: "AI som tar",
      title2: "arbetet vidare",
      titleAccent: "Sverige",
      words: [],
      subtitle:
        "Byggd i Sverige för riktigt vardagsarbete. Skriv, analysera, planera och gör rörig kontext till konkret handling på svenska och engelska — prova gratis direkt i Playground.",
      ctaPrimary: "Öppna Playground",
      ctaSecondary: "Gå med i väntelistan",
    },
    capabilities: {
      badge: "Förmågor",
      title: "Byggd för",
      titleHighlight: "riktigt arbete",
      subtitle:
        "Skriv, automatisera, besluta och växla språk — samma yta du testar live i Playground.",
    },
    playground: {
      badge: "Live Playground",
      title: "Gör något av",
      titleHighlight: "din nästa idé.",
      subtitle:
        "En riktig AI-arbetsyta: chatt, historik, minne, bildanalys och röst. Prova som gäst eller logga in gratis.",
      placeholder: "Skriv din fråga till BudAI…",
      online: "Online — Utvecklarförhandsvisning",
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
      title: "Gå med i",
      titleHighlight: "väntelistan",
      subtitle:
        "Bli tidig — privatperson eller bolag. Vi hör av oss när betalplanerna är redo.",
      individualTab: "Privatperson",
      companyTab: "Företag",
      namePlaceholder: "Fullständigt namn",
      emailPlaceholder: "E-postadress",
      companyPlaceholder: "Företagsnamn",
      industryPlaceholder: "Välj bransch",
      employeesPlaceholder: "Antal anställda",
      interestPlaceholder: "Vad behöver du AI till?",
      submit: "Begär åtkomst",
      successTitle: "Du är med.",
      successPre: "Vi har lagt till",
      successPost: "på väntelistan.",
      errorMsg: "Något gick fel — prova igen om en stund?",
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
      text: "Nödvändig lagring för sajten. Anonym analys laddas bara om du accepterar.",
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
      capabilities: "Capabilities",
      playground: "Playground",
      terminal: "Terminal",
      waitlist: "Waitlist",
      roadmap: "Roadmap",
      status: "Status",
      requestAccess: "Request access",
      developedBy: "Developed by",
    },
    hero: {
      badge: "Developer Preview",
      title1: "AI that moves",
      title2: "work forward",
      titleAccent: "Sweden",
      words: [],
      subtitle:
        "Built in Sweden for real everyday work. Write, analyze, plan, and turn messy context into clear action in Swedish and English — free to try in the live Playground right now.",
      ctaPrimary: "Open Playground",
      ctaSecondary: "Join the waitlist",
    },
    capabilities: {
      badge: "Capabilities",
      title: "Built for",
      titleHighlight: "real work",
      subtitle:
        "Draft, automate, decide, and switch languages — the same surface you test live in the Playground.",
    },
    playground: {
      badge: "Live Playground",
      title: "Make something of",
      titleHighlight: "your next idea.",
      subtitle:
        "A real AI workspace: chat, history, memory, image analysis and voice. Try as a guest or sign in free.",
      placeholder: "Message BudAI…",
      online: "Online — Developer Preview",
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
      title: "Join the",
      titleHighlight: "waitlist",
      subtitle:
        "Get in early — individual or company. We'll be in touch when paid plans are ready.",
      individualTab: "Individual",
      companyTab: "Company",
      namePlaceholder: "Full name",
      emailPlaceholder: "Email address",
      companyPlaceholder: "Company name",
      industryPlaceholder: "Select industry",
      employeesPlaceholder: "Number of employees",
      interestPlaceholder: "What do you need AI for?",
      submit: "Request access",
      successTitle: "You're in.",
      successPre: "We added",
      successPost: "to the waitlist.",
      errorMsg: "Something went wrong — try again in a moment?",
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
      text: "Essential storage for the site. Anonymous analytics loads only if you accept.",
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
