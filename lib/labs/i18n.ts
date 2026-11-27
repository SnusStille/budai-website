"use client";

export type Lang = "sv" | "en";

/**
 * Stilledev Labs translations — centralized dictionary.
 * Every user-visible string in Labs lives here. Add new keys to both languages.
 */
export const labsTranslations = {
  sv: {
    // Header / Navigation
    nav: {
      stilledev: "Stilledev",
      labs: "Labs",
      newChat: "Ny konversation",
      history: "Historik",
      backToSite: "Tillbaka till Stilledev",
      close: "Stäng",
    },
    // Welcome screen
    welcome: {
      greeting: "Berätta om din idé.",
      subtitle: "Jag är BudAI, Olivers intelligenta konsult. Jag hjälper dig att utforska ditt projekt, identifiera risker och avgöra om det är värt att bygga — innan vi skriver en rad kod.",
      honest: "Ärlig feedback. Inga säljpitcher. Bara en riktig teknisk bedömning.",
      assistant: "Driven av Claude · Utvecklad av Oliver Stille",
    },
    // Starter prompts
    starters: [
      "Jag har en idé till en webbapp",
      "Jag vill bygga en AI-tjänst",
      "Jag har en befintlig produkt som behöver förbättras",
      "Jag behöver automatisera något i mitt företag",
      "Jag vill sälja något online",
      "Jag är inte säker på vad jag behöver — kan du hjälpa mig?",
    ],
    // Chat interface
    chat: {
      placeholder: "Beskriv din idé, ditt problem eller din fråga…",
      send: "Skicka",
      typing: "BudAI tänker",
      newMessage: "Nytt meddelande",
      scrollToBottom: "Scrolla till botten",
    },
    // History panel
    history: {
      title: "Dina konversationer",
      empty: "Inga tidigare konversationer. Ditt första projekt kommer att sparas här.",
      startNew: "Starta en ny konversation",
      viewSite: "Besök stilledev.se",
      delete: "Ta bort",
    },
    // Contact form
    contact: {
      title: "Lämna dina kontaktuppgifter",
      subtitle: "Oliver kommer att granska din projektbeskrivning och höra av sig personligen för att diskutera nästa steg.",
      name: "Ditt namn",
      email: "E-postadress",
      phone: "Telefon (valfritt)",
      company: "Företag (valfritt)",
      preferredContact: "Hur vill du bli kontaktad?",
      contactEmail: "E-post",
      contactPhone: "Telefon",
      contactMeeting: "Digitalt möte",
      submit: "Skicka kontaktuppgifter",
      submitting: "Skickar…",
      nameRequired: "Vänligen ange ditt namn (minst 2 tecken).",
      emailRequired: "Vänligen ange en giltig e-postadress.",
      successTitle: "Tack!",
      successMessage: "Dina kontaktuppgifter har sparats. Oliver kommer att höra av sig personligen inom kort.",
      detectedTitle: "Redo att ta nästa steg?",
      detectedMessage: "Det verkar som du är intresserad av att prata vidare. Lämna dina uppgifter så kontaktar Oliver dig.",
      privacyNote: "Dina uppgifter delas aldrig med tredje part. Används endast för att kontakta dig om detta projekt.",
    },
    // Errors
    errors: {
      sendFailed: "Kunde inte skicka meddelandet. Försök igen.",
      networkError: "Nätverksfel. Kontrollera din anslutning och försök igen.",
      rateLimited: "För många meddelanden på kort tid. Vänta en stund innan du försöker igen.",
      dbUnavailable: "Tjänsten är för närvarande otillgänglig. Försök igen senare.",
      sessionExpired: "Sessionen har upphört. Ladda om sidan för att starta en ny konversation.",
    },
    // Disclaimer / Footer
    footer: {
      disclaimer: "BudAI är en AI-assistent. Slutliga beslut och offerter görs alltid av Oliver personligen.",
      poweredBy: "Driven av Claude",
    },
    // Admin labels (used in admin panel for Labs projects)
    admin: {
      title: "Stilledev Labs — Projektöversikt",
      stats: {
        total: "Totalt",
        new: "Nya",
        active: "Pågående",
        qualified: "Kvalificerade",
        meeting: "Möte",
      },
      search: "Sök namn, e-post, projekt…",
      allStatuses: "Alla statusar",
      sortBy: {
        updated: "Senast aktiv",
        priority: "Prioritet",
        created: "Senast skapad",
      },
      noProjects: "Inga projekt än. När besökare chattar med BudAI och lämnar sina kontaktuppgifter dyker projekten upp här.",
      loading: "Laddar…",
      conversationCount: (n: number) => `${n} meddelanden`,
    },
    // Status labels
    status: {
      new_inquiry: "Ny förfrågan",
      conversation_active: "Pågående",
      needs_review: "Behöver granskas",
      qualified: "Kvalificerat",
      meeting_requested: "Möte önskas",
      quote_sent: "Offert skickad",
      accepted: "Accepterat",
      declined: "Avböjt",
      completed: "Avslutat",
    },
    category: {
      website: "Webbplats",
      web_application: "Webbapplikation",
      mobile_app: "Mobilapp",
      ai_service: "AI-tjänst",
      automation: "Automation",
      ecommerce: "E-handel",
      booking_system: "Bokningssystem",
      saas_platform: "SaaS-plattform",
      integration: "Integration",
      consulting: "Konsultation",
      other: "Övrigt",
      unknown: "Okänd",
    },
  },
  en: {
    // Header / Navigation
    nav: {
      stilledev: "Stilledev",
      labs: "Labs",
      newChat: "New chat",
      history: "History",
      backToSite: "Back to Stilledev",
      close: "Close",
    },
    // Welcome screen
    welcome: {
      greeting: "Tell me about your idea.",
      subtitle: "I'm BudAI, Oliver's intelligent consultant. I'll help you explore your project, identify risks, and determine if it's worth building — before we write a single line of code.",
      honest: "Honest feedback. No sales pitches. Just a real technical assessment.",
      assistant: "Powered by Claude · Built by Oliver Stille",
    },
    // Starter prompts
    starters: [
      "I have an idea for a web app",
      "I want to build an AI service",
      "I have an existing product that needs improvement",
      "I need to automate something in my business",
      "I want to sell something online",
      "I'm not sure what I need — can you help?",
    ],
    // Chat interface
    chat: {
      placeholder: "Describe your idea, problem, or question…",
      send: "Send",
      typing: "BudAI is thinking",
      newMessage: "New message",
      scrollToBottom: "Scroll to bottom",
    },
    // History panel
    history: {
      title: "Your conversations",
      empty: "No previous conversations. Your first project will be saved here.",
      startNew: "Start a new conversation",
      viewSite: "Visit stilledev.se",
      delete: "Delete",
    },
    // Contact form
    contact: {
      title: "Leave your contact details",
      subtitle: "Oliver will review your project brief and reach out personally to discuss next steps.",
      name: "Your name",
      email: "Email address",
      phone: "Phone (optional)",
      company: "Company (optional)",
      preferredContact: "How would you like to be contacted?",
      contactEmail: "Email",
      contactPhone: "Phone",
      contactMeeting: "Digital meeting",
      submit: "Send contact details",
      submitting: "Sending…",
      nameRequired: "Please enter your name (at least 2 characters).",
      emailRequired: "Please enter a valid email address.",
      successTitle: "Thank you!",
      successMessage: "Your contact details have been saved. Oliver will reach out personally shortly.",
      detectedTitle: "Ready for the next step?",
      detectedMessage: "It seems you're interested in talking further. Leave your details and Oliver will contact you.",
      privacyNote: "Your details are never shared with third parties. Used only to contact you about this project.",
    },
    // Errors
    errors: {
      sendFailed: "Could not send message. Please try again.",
      networkError: "Network error. Check your connection and try again.",
      rateLimited: "Too many messages in a short time. Please wait a moment before trying again.",
      dbUnavailable: "The service is currently unavailable. Please try again later.",
      sessionExpired: "Session expired. Reload the page to start a new conversation.",
    },
    // Disclaimer / Footer
    footer: {
      disclaimer: "BudAI is an AI assistant. Final decisions and quotes are always made by Oliver personally.",
      poweredBy: "Powered by Claude",
    },
    // Admin labels
    admin: {
      title: "Stilledev Labs — Project Overview",
      stats: {
        total: "Total",
        new: "New",
        active: "Active",
        qualified: "Qualified",
        meeting: "Meeting",
      },
      search: "Search name, email, project…",
      allStatuses: "All statuses",
      sortBy: {
        updated: "Last active",
        priority: "Priority",
        created: "Recently created",
      },
      noProjects: "No projects yet. When visitors chat with BudAI and leave contact details, projects will appear here.",
      loading: "Loading…",
      conversationCount: (n: number) => `${n} messages`,
    },
    // Status labels
    status: {
      new_inquiry: "New inquiry",
      conversation_active: "Active",
      needs_review: "Needs review",
      qualified: "Qualified",
      meeting_requested: "Meeting requested",
      quote_sent: "Quote sent",
      accepted: "Accepted",
      declined: "Declined",
      completed: "Completed",
    },
    category: {
      website: "Website",
      web_application: "Web application",
      mobile_app: "Mobile app",
      ai_service: "AI service",
      automation: "Automation",
      ecommerce: "E-commerce",
      booking_system: "Booking system",
      saas_platform: "SaaS platform",
      integration: "Integration",
      consulting: "Consulting",
      other: "Other",
      unknown: "Unknown",
    },
  },
} as const;

export type LabsTranslation = (typeof labsTranslations)[Lang];

export function useLabsTranslation(lang: Lang): LabsTranslation {
  return labsTranslations[lang];
}
