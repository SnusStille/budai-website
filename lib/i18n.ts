"use client";

export type Lang = "sv" | "en";

/**
 * All narrative copy for the focused product site:
 * Playground (home) → What is BudAI → Vision → Waitlist.
 *
 * Playground-internal micro copy lives in the playground components
 * (it is UI-state heavy), everything else lives here.
 *
 * `sv` and `en` must keep identical keys — `useTranslation` returns a union,
 * so a missing key is a type error.
 *
 * Rule for this site: nothing invented. No fake users, no fake counters,
 * no promised dates. The roadmap describes what the code does today,
 * what is being refined, and what we are exploring.
 */
export const translations = {
  sv: {
    nav: {
      playground: "Playground",
      product: "Produkten",
      vision: "Vision",
      waitlist: "Väntelistan",
      requestAccess: "Gå med i väntelistan",
      developedBy: "Utvecklad av",
      openMenu: "Öppna meny",
      closeMenu: "Stäng meny",
      language: "Språk",
      preview: "Preview",
    },
    intro: {
      badge: "Utvecklarförhandsvisning",
      badgeLive: "Testa direkt — inget konto krävs",
      title1: "AI som tar",
      title2: "arbetet vidare",
      subtitle:
        "BudAI är AI-arbetsassistenten byggd i Sverige. Prova den live här nedanför — skriv, planera, analysera och automatisera på svenska och engelska.",
      trustFree: "Gästläge gratis",
      trustLang: "Svenska & engelska",
      trustPrivacy: "GDPR-tänk",
      scrollHint: "Scrolla för att förstå BudAI",
      backToPlayground: "Tillbaka till Playground",
      buildLabel: "build",
      liveLabel: "Fungerar i den här förhandsvisningen",
      liveItems: [
        "Chatt på svenska & engelska",
        "Röst och bildanalys",
        "Historik, export och Workspace",
        "Minne för inloggade medlemmar",
      ],
      honestNote:
        "Förhandsvisning: svaren kan bli fel och gränserna är medvetet låga. I gästläget sparas dina konversationer endast i din egen webbläsare.",
    },
    playground: {
      badge: "AI Playground",
      title: "Prata med",
      titleHighlight: "BudAI",
      subtitle:
        "En riktig AI-yta: chatt, historik, minne, bildanalys och röst. Gästläge fritt — konto låser mer.",
      placeholder: "Skriv till BudAI…",
      online: "Online — Utvecklarförhandsvisning",
      thinking: "Tänker…",
      analyzing: "BudAI analyserar…",
      confidence: "konfidens",
    },
    what: {
      badge: "Vad är BudAI?",
      title: "En assistent för",
      titleHighlight: "riktigt arbete",
      subtitle:
        "BudAI är en AI-arbetsassistent för privatpersoner och bolag i Norden. Du skriver, planerar, analyserar och automatiserar i samma yta — på svenska eller engelska.",
      individualsLabel: "Privatpersoner",
      individualsBody:
        "Skriv, planera, lär och organisera vardagen — utan att drunkna i verktyg och abonnemang.",
      businessLabel: "Företag",
      businessBody:
        "Utkast, beslut, playbooks och supportflöden — en gemensam yta för hela teamet.",
      stageLabel: "Så känns det",
      stageLive: "live produkt · inte en mock",
      openPlayground: "Testa i Playground",
      faqTitle: "Vanliga frågor",
      flowTitle: "Så byggs ett svar",
      flowBody:
        "Samma pipeline oavsett om du skriver ett mejl, analyserar en text eller ber om två förslag att välja mellan.",
      flow1Title: "Förstår uppsåtet",
      flow1Body:
        "BudAI läser din text, ditt språk och din kontext — och väljer läge: ett svar, ett utkast eller två alternativ.",
      flow2Title: "Arbetar i klartext",
      flow2Body:
        "Svaret strömmas in medan det skrivs, med rubriker, listor och kod i rätt format — så att du ser arbetet, inte bara resultatet.",
      flow3Title: "Lämnar över till dig",
      flow3Body:
        "Kopiera, fortsätt, gör om — eller öppna svaret i Workspace där långa utkast blir ett dokument du jobbar vidare i.",
      limitsTitle: "Riktiga gränser",
      limitsBody:
        "Förhandsvisningen är begränsad med flit, så att den håller för alla som testar. Det här är exakt vad som gäller:",
      limitsGuest: "Gäst",
      limitsMember: "Medlem",
      limitsDaily: "meddelanden / dag",
      limitsImages: "bilder",
      limitsGenerations: "genereringar",
      limitsHistory: "sparade konversationer",
      limitsMemory: "Långtidsminne",
      limitsMemoryGuest: "Avstängt — allt stannar i din webbläsare",
      limitsMemoryMember: "På — BudAI kommer ihåg dina preferenser",
      limitsReset: "Gränserna nollställs varje dag (UTC).",
      previewTitle: "Riktig produkt — visad som en förhandsvisning",
      previewBody:
        "Det du testar här är samma kod som ska lanseras: riktig modell, riktig väntelista, riktiga gränser. Det som saknas är puts, inte påhitt.",
    },
    vision: {
      badge: "Vår vision",
      title: "AI-arbete med",
      titleHighlight: "svensk ryggrad",
      subtitle:
        "BudAI är inte ytterligare ett generiskt AI-verktyg. Det är en övertygelse om hur arbete kan kännas — smartare, snabbare, mer mänskligt — från Sverige och ut.",
      pathLabel: "Resan",
      weBelieve: "Vi tror",
      manifestoTitle: "Arbete ska inte börja med en tom prompt",
      manifestoBody:
        "De flesta AI-verktyg låter dig prata med en modell. Vi bygger en arbetsyta: den känner igen språket du skriver på, minns hur du vill ha det, och lämnar över något du faktiskt kan använda — ett mejl, ett beslut, ett dokument.",
      b1Title: "Byggt för hur vi arbetar",
      b1Body:
        "Arbete är inte en chattrad. Det är utkast, beslut, uppföljning och språk som ska hålla. BudAI börjar i flödet — inte bredvid det.",
      b2Title: "Framtiden för digitalt arbete",
      b2Body:
        "Nästa steg är inte fler verktyg. Det är en assistent som förstår sammanhanget, talar ditt språk och gör det tunga jobbet innan du ens bett om det.",
      b3Title: "Tillit är en funktion",
      b3Body:
        "Nordisk tillit byggs med transparens: tydliga gränser, inga påhittade siffror, svar du kan granska och en ärlig bild av vad som är klart.",
      roadmapTitle: "Vad som är live i den här förhandsvisningen",
      roadmapBody:
        "Vi visar hellre det som fungerar än det vi lovar. Så här ser läget ut just nu:",
      roadmapLive: "Live nu",
      roadmapWip: "På gång",
      roadmapNext: "Utforskar vi",
      liveItems: [
        "Chatt med riktig modell på svenska och engelska",
        "Två svarsförslag att välja mellan",
        "Röst och bildanalys",
        "Historik, export och Workspace",
        "Väntelista med early access och referral",
      ],
      wipItems: [
        "Minne som följer med mellan konversationer",
        "Fler språk, tonlägen och mallar",
        "Delade ytor för team",
      ],
      nextItems: [
        "Integration mot kalender, mejl och dokument",
        "Arbete i kalkylark och rapporter",
        "Fördjupning för svenska verksamheter",
      ],
      quote:
        "”Vi bygger inte hype. Vi bygger en arbetsyta som respekterar nordisk tillit — och skalas utan att tappa den.”",
      quoteAuthor: "BudAI · Sverige",
    },
    waitlist: {
      badge: "Early access",
      title: "Bli en av de första",
      titleHighlight: "att använda BudAI",
      subtitle:
        "Vi öppnar BudAI i vågor. Skriv upp dig så hör vi av oss när det är din tur — och du låser 10 % vid lansering.",
      individualTab: "Privatperson",
      companyTab: "Företag",
      namePlaceholder: "Namn",
      emailPlaceholder: "Din e-postadress",
      companyPlaceholder: "Företagsnamn",
      industryPlaceholder: "Bransch (valfritt)",
      employeesPlaceholder: "Antal anställda (valfritt)",
      interestLabel: "Vad vill du använda BudAI till?",
      interestOptional: "valfritt",
      referralToggle: "Har du en referenskod?",
      referralPlaceholder: "Referenskod",
      submit: "Skriv upp mig",
      submitting: "Skickar…",
      trustLine: "Ingen spam. Ett mejl när din access öppnas. Avsluta när du vill.",
      benefit1Title: "10 % vid lansering",
      benefit1Body: "Koden BUDAI-EARLY-10 knyts till din e-post direkt.",
      benefit2Title: "Tidig access",
      benefit2Body: "Du får testa nya förmågor innan alla andra.",
      benefit3Title: "Direktkontakt",
      benefit3Body: "Rak linje till teamet som bygger BudAI.",
      statWaiting: "på väntelistan",
      statWaves: "öppnas i vågor",
      statLaunch: "siktar på lansering",
      discountBadge: "10 % early access",
      discountHint: "Koden låses när du går med och gäller vid lansering.",
      discountCodeLabel: "Din early-access-kod",
      successTitle: "Du är med.",
      successPre: "Vi har lagt till",
      successPost: "på väntelistan.",
      successNote: "10 % early access är låst. Vi hör av oss med nästa steg.",
      foundingActive: "Founding member · 10 %",
      shareHint: "Tips: dela din länk — referral sparas i din anmälan.",
      tryPlayground: "Testa BudAI medan du väntar",
      errorMsg: "Något gick fel — prova igen om en stund?",
      emailInvalid: "Fyll i en giltig e-postadress.",
      stepsTitle: "Så går det till",
      step1Title: "Du skriver upp dig",
      step1Body:
        "Namn och e-post räcker. Företag lägger till bransch och storlek så att vi kan prioritera rätt våg.",
      step2Title: "Vi öppnar i vågor",
      step2Body:
        "Accessen släpps i omgångar. Din kod BUDAI-EARLY-10 låses direkt och gäller vid lansering.",
      step3Title: "Du får nyckeln",
      step3Body:
        "Ett mejl med din inbjudan — plus en länk du kan dela, där referral sparas i din anmälan.",
      formTitle: "Be om access",
      formNote: "Tar ungefär 20 sekunder. Ingen betalning, inget kort.",
    },
    footer: {
      tagline:
        "AI-arbetsassistenten för Sverige och Norden — skriv, automatisera och tänk snabbare.",
      product: "Produkt",
      company: "Företag",
      legal: "Juridik",
      contact: "Kontakt",
      pricing: "Prissättning",
      rights: "© 2026 BudAI av Stilledev. Alla rättigheter förbehållna.",
      built: "Byggt med passion i Sverige",
      previewNote:
        "Den här sajten är en förhandsvisning av BudAI. Funktioner, gränser och texter kan ändras innan lansering.",
      backToTop: "Till toppen",
    },
    cookie: {
      title: "Vi använder cookies",
      text: "Nödvändiga cookies för sajten. Analys endast med ditt samtycke.",
      accept: "Acceptera",
      decline: "Avböj",
      more: "Läs mer",
    },
  },
  en: {
    nav: {
      playground: "Playground",
      product: "Product",
      vision: "Vision",
      waitlist: "Waitlist",
      requestAccess: "Join the waitlist",
      developedBy: "Developed by",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
      preview: "Preview",
    },
    intro: {
      badge: "Developer preview",
      badgeLive: "Try it now — no account needed",
      title1: "AI that moves",
      title2: "work forward",
      subtitle:
        "BudAI is the AI work assistant built in Sweden. Try it live right below — write, plan, analyze, and automate in Swedish and English.",
      trustFree: "Free guest mode",
      trustLang: "Swedish & English",
      trustPrivacy: "GDPR-minded",
      scrollHint: "Scroll to understand BudAI",
      backToPlayground: "Back to Playground",
      buildLabel: "build",
      liveLabel: "Working in this preview",
      liveItems: [
        "Chat in Swedish & English",
        "Voice and image analysis",
        "History, export and Workspace",
        "Memory for signed-in members",
      ],
      honestNote:
        "Preview: answers can be wrong and the limits are deliberately low. In guest mode your conversations stay in your own browser.",
    },
    playground: {
      badge: "AI Playground",
      title: "Talk to",
      titleHighlight: "BudAI",
      subtitle:
        "A real AI surface: chat, history, memory, image analysis, and voice. Guest mode free — account unlocks more.",
      placeholder: "Message BudAI…",
      online: "Online — Developer Preview",
      thinking: "Thinking…",
      analyzing: "BudAI is analyzing…",
      confidence: "confidence",
    },
    what: {
      badge: "What is BudAI?",
      title: "One assistant for",
      titleHighlight: "real work",
      subtitle:
        "BudAI is an AI work assistant for people and companies in the Nordics. You write, plan, analyze, and automate in the same surface — in Swedish or English.",
      individualsLabel: "Individuals",
      individualsBody:
        "Write, plan, learn, and organize everyday work — without drowning in tools and subscriptions.",
      businessLabel: "Businesses",
      businessBody:
        "Drafts, decisions, playbooks, and support flows — one shared surface for the team.",
      stageLabel: "How it feels",
      stageLive: "live product · not a mock",
      openPlayground: "Try it in the Playground",
      faqTitle: "Common questions",
      flowTitle: "How an answer is built",
      flowBody:
        "The same pipeline whether you write an email, analyze a document, or ask for two options to choose from.",
      flow1Title: "Reads the intent",
      flow1Body:
        "BudAI reads your text, your language and your context — then picks a mode: one answer, one draft, or two options.",
      flow2Title: "Works in the open",
      flow2Body:
        "The reply streams in as it is written, with headings, lists and code formatted properly — so you see the work, not just the result.",
      flow3Title: "Hands it back to you",
      flow3Body:
        "Copy, continue, redo — or open the answer in Workspace, where a long draft becomes a document you can keep working in.",
      limitsTitle: "Real limits",
      limitsBody:
        "The preview is limited on purpose, so it holds up for everyone who tries it. This is exactly what applies:",
      limitsGuest: "Guest",
      limitsMember: "Member",
      limitsDaily: "messages / day",
      limitsImages: "images",
      limitsGenerations: "generations",
      limitsHistory: "saved conversations",
      limitsMemory: "Long-term memory",
      limitsMemoryGuest: "Off — everything stays in your browser",
      limitsMemoryMember: "On — BudAI remembers your preferences",
      limitsReset: "Limits reset every day (UTC).",
      previewTitle: "A real product, shown as a preview",
      previewBody:
        "What you test here is the same code that will launch: a real model, a real waitlist, real limits. What is missing is polish — not invention.",
    },
    vision: {
      badge: "Our vision",
      title: "AI work with",
      titleHighlight: "a Swedish spine",
      subtitle:
        "BudAI is not another generic AI tool. It is a belief about how work can feel — smarter, faster, more human — from Sweden outward.",
      pathLabel: "The path",
      weBelieve: "We believe",
      manifestoTitle: "Work should not start with an empty prompt",
      manifestoBody:
        "Most AI tools let you talk to a model. We are building a work surface: it recognizes the language you write in, remembers how you like things, and hands back something you can actually use — an email, a decision, a document.",
      b1Title: "Built for the way we work",
      b1Body:
        "Work is not a chat thread. It is drafts, decisions, follow-ups and language that has to hold. BudAI starts inside the flow — not next to it.",
      b2Title: "The future of digital work",
      b2Body:
        "The next step is not more tools. It is an assistant that understands the context, speaks your language, and does the heavy lifting before you ask.",
      b3Title: "Trust is a feature",
      b3Body:
        "Nordic trust is built on transparency: clear limits, no invented numbers, answers you can inspect and an honest picture of what is ready.",
      roadmapTitle: "What is live in this preview",
      roadmapBody:
        "We would rather show what works than promise what does not. Here is where things stand:",
      roadmapLive: "Live now",
      roadmapWip: "In progress",
      roadmapNext: "Exploring",
      liveItems: [
        "Chat with a real model in Swedish and English",
        "Two answer options to choose between",
        "Voice and image analysis",
        "History, export and Workspace",
        "Waitlist with early access and referrals",
      ],
      wipItems: [
        "Memory that follows you between conversations",
        "More languages, tones and templates",
        "Shared surfaces for teams",
      ],
      nextItems: [
        "Integrations with calendar, email and documents",
        "Work in spreadsheets and reports",
        "Depth for Swedish businesses",
      ],
      quote:
        "“We are not building hype. We are building a work surface that respects Nordic trust — and scales without losing it.”",
      quoteAuthor: "BudAI · Sweden",
    },
    waitlist: {
      badge: "Early access",
      title: "Be one of the first",
      titleHighlight: "to use BudAI",
      subtitle:
        "We open BudAI in waves. Add your email and we will reach out when it is your turn — and you lock 10% at launch.",
      individualTab: "Individual",
      companyTab: "Company",
      namePlaceholder: "Name",
      emailPlaceholder: "Your email address",
      companyPlaceholder: "Company name",
      industryPlaceholder: "Industry (optional)",
      employeesPlaceholder: "Employees (optional)",
      interestLabel: "What would you use BudAI for?",
      interestOptional: "optional",
      referralToggle: "Have a referral code?",
      referralPlaceholder: "Referral code",
      submit: "Join the waitlist",
      submitting: "Submitting…",
      trustLine: "No spam. One email when your access opens. Unsubscribe anytime.",
      benefit1Title: "10% at launch",
      benefit1Body: "Code BUDAI-EARLY-10 is tied to your email instantly.",
      benefit2Title: "Early access",
      benefit2Body: "Try new capabilities before anyone else.",
      benefit3Title: "Direct line",
      benefit3Body: "Straight to the team building BudAI.",
      statWaiting: "on the waitlist",
      statWaves: "opening in waves",
      statLaunch: "targeting launch",
      discountBadge: "10% early access",
      discountHint: "The code locks when you join and applies at launch.",
      discountCodeLabel: "Your early-access code",
      successTitle: "You're in.",
      successPre: "We added",
      successPost: "to the waitlist.",
      successNote: "10% early access is locked. We'll reach out with next steps.",
      foundingActive: "Founding member · 10%",
      shareHint: "Tip: share your link — referrals are saved with your signup.",
      tryPlayground: "Try BudAI while you wait",
      errorMsg: "Something went wrong — try again in a moment?",
      emailInvalid: "Please enter a valid email address.",
      stepsTitle: "How it works",
      step1Title: "You sign up",
      step1Body:
        "Name and email is enough. Companies add industry and size so we can prioritize the right wave.",
      step2Title: "We open in waves",
      step2Body:
        "Access is released in rounds. Your code BUDAI-EARLY-10 locks immediately and applies at launch.",
      step3Title: "You get the key",
      step3Body:
        "An email with your invite — plus a link you can share, where referrals are saved with your signup.",
      formTitle: "Request access",
      formNote: "Takes about 20 seconds. No payment, no card.",
    },
    footer: {
      tagline:
        "The AI work assistant for Sweden and the Nordics — write, automate, and think faster.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      contact: "Contact",
      pricing: "Pricing",
      rights: "© 2026 BudAI by Stilledev. All rights reserved.",
      built: "Built with passion in Sweden",
      previewNote:
        "This site is a preview of BudAI. Features, limits and copy may change before launch.",
      backToTop: "Back to top",
    },
    cookie: {
      title: "We use cookies",
      text: "Essential cookies for the site. Analytics only with your consent.",
      accept: "Accept",
      decline: "Decline",
      more: "Learn more",
    },
  },
};

export function useTranslation(lang: Lang) {
  return translations[lang];
}
