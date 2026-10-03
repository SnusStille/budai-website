/**
 * Playbooks — short, practical guides for getting something real out of BudAI.
 *
 * Every playbook exists to do one thing: send a visitor back to the Playground
 * with a prompt they can paste. No filler, no invented numbers, no promises.
 */

export type Bi = { sv: string; en: string };

export type PlaybookStep = {
  title: Bi;
  body: Bi;
  prompt?: Bi;
};

export type Playbook = {
  slug: string;
  tag: Bi;
  minutes: number;
  title: Bi;
  subtitle: Bi;
  outcome: Bi;
  steps: PlaybookStep[];
  tips: Bi[];
  avoid: Bi[];
  next: string[];
};

export const PLAYBOOKS: Playbook[] = [
  {
    slug: "skriva-mejl",
    tag: { sv: "Skriva", en: "Writing" },
    minutes: 3,
    title: { sv: "Skriv ett professionellt mejl", en: "Write a professional email" },
    subtitle: {
      sv: "Från lösa anteckningar till ett mejl du vågar skicka — på under en minut.",
      en: "From loose notes to an email you are happy to send — in under a minute.",
    },
    outcome: {
      sv: "Ett färdigt mejl med ämnesrad, tydlig struktur och en avslutning som leder till handling.",
      en: "A finished email with a subject line, clear structure and a closing that leads to action.",
    },
    steps: [
      {
        title: { sv: "Ge BudAI sammanhanget, inte bara ämnet", en: "Give BudAI the context, not just the topic" },
        body: {
          sv: "Skriv vem du skriver till, vad du vill uppnå och vilken ton du är ute efter. Tre rader räcker — då slipper du förklara i efterhand.",
          en: "Say who you are writing to, what you want to achieve and the tone you are after. Three lines is enough — that way you do not have to fix it afterwards.",
        },
        prompt: {
          sv: "Skriv ett mejl till en kund som är sen med en betalning. Målet är att få betalt utan att låta arg. Ton: professionell och vänlig. Max 120 ord.",
          en: "Write an email to a customer who is late paying an invoice. The goal is to get paid without sounding angry. Tone: professional and friendly. Max 120 words.",
        },
      },
      {
        title: { sv: "Låt BudAI välja struktur", en: "Let BudAI pick the structure" },
        body: {
          sv: "Be om ämnesrad, brödtext och nästa steg som tre tydliga delar. Då är mejlet lättare att skumma — och lättare att svara på.",
          en: "Ask for subject line, body and next step as three clear parts. The email becomes easier to skim — and easier to reply to.",
        },
        prompt: {
          sv: "Dela upp svaret i: ämnesrad, brödtext (max 3 stycken), och ett tydligt nästa steg med datum.",
          en: "Split the answer into: subject line, body (max 3 paragraphs), and one clear next step with a date.",
        },
      },
      {
        title: { sv: "Be om två varianter och välj", en: "Ask for two variants and choose" },
        body: {
          sv: "BudAI kan ge dig två förslag i samma svar — ett formellt och ett varmare. Välj det som passar mottagaren, eller be om en tredje.",
          en: "BudAI can give you two options in one answer — one formal and one warmer. Pick the one that fits the reader, or ask for a third.",
        },
        prompt: {
          sv: "Ge mig två versioner: en kort och formell, en varmare med samma innehåll. Jag väljer.",
          en: "Give me two versions: one short and formal, one warmer with the same content. I will choose.",
        },
      },
      {
        title: { sv: "Fortsätt i samma konversation", en: "Keep going in the same conversation" },
        body: {
          sv: "När mejlet är skickat: be BudAI skriva uppföljningen, eller översätta svaret till engelska. Kontexten finns redan kvar i tråden.",
          en: "Once the email is sent: ask BudAI to draft the follow-up, or translate the reply into English. The context is already in the thread.",
        },
      },
    ],
    tips: [
      {
        sv: "Skriv på svenska och be om engelska i samma prompt — BudAI byter språk mitt i utan att tappa tonen.",
        en: "Write in Swedish and ask for English in the same prompt — BudAI switches language mid-thread without losing tone.",
      },
      {
        sv: "Klistra in det mejl du fick och be om ett svar: ”svara på detta, men kortare och tydligare”.",
        en: "Paste the email you received and ask for a reply: “answer this, but shorter and clearer”.",
      },
      {
        sv: "Tryck ⌘E i Playground för att exportera tråden om du vill spara mejlet i ditt eget system.",
        en: "Press ⌘E in the Playground to export the thread if you want to keep the email in your own system.",
      },
    ],
    avoid: [
      {
        sv: "Undvik att skicka utan att läsa. BudAI skriver snabbt, men du känner mottagaren.",
        en: "Avoid sending without reading. BudAI writes fast, but you know the reader.",
      },
      {
        sv: "Undvik att be om ”perfekt ton” utan att säga vilken ton. Ge ett exempel på hur du brukar skriva.",
        en: "Avoid asking for a “perfect tone” without saying which tone. Give an example of how you normally write.",
      },
    ],
    next: ["analysera-text", "tva-forslag"],
  },
  {
    slug: "analysera-text",
    tag: { sv: "Analys", en: "Analysis" },
    minutes: 4,
    title: { sv: "Analysera en text", en: "Analyze a text" },
    subtitle: {
      sv: "Långt underlag in, tydlig sammanfattning och nästa steg ut.",
      en: "Long material in, a clear summary and next steps out.",
    },
    outcome: {
      sv: "En sammanfattning du kan skicka vidare, plus risker och konkreta nästa steg.",
      en: "A summary you can forward, plus risks and concrete next steps.",
    },
    steps: [
      {
        title: { sv: "Bestäm vad du letar efter", en: "Decide what you are looking for" },
        body: {
          sv: "Ber du om ”sammanfatta” får du en sammanfattning. Ber du om risker, beslut eller otydligheter får du något du kan agera på.",
          en: "Ask to “summarize” and you get a summary. Ask about risks, decisions or gaps and you get something you can act on.",
        },
        prompt: {
          sv: "Läs texten nedan och ge mig: 1) tre punkter som texten faktiskt säger, 2) vad som är otydligt eller saknas, 3) tre konkreta nästa steg med ägare.\n\n[Klistra in texten här]",
          en: "Read the text below and give me: 1) three things the text actually says, 2) what is unclear or missing, 3) three concrete next steps with owners.\n\n[Paste the text here]",
        },
      },
      {
        title: { sv: "Lägg till bilden i stället för att skriva av den", en: "Attach the image instead of retyping it" },
        body: {
          sv: "Bifoga en skärmbild, ett diagram eller ett fotat dokument direkt i skrivfältet. BudAI läser bilden och svarar på innehållet.",
          en: "Attach a screenshot, a chart or a photo of a document straight into the composer. BudAI reads the image and answers on the content.",
        },
        prompt: {
          sv: "Här är en skärmbild av rapporten. Sammanfatta siffrorna och peka ut avvikelsen som sticker ut mest.",
          en: "Here is a screenshot of the report. Summarize the numbers and point out the outlier that stands out most.",
        },
      },
      {
        title: { sv: "Be om samma sak i två längder", en: "Ask for the same thing in two lengths" },
        body: {
          sv: "En version på fem punkter till dig, en på tre meningar till teamet. Samma underlag, två mottagare.",
          en: "One version in five bullets for you, one in three sentences for the team. Same source material, two audiences.",
        },
      },
      {
        title: { sv: "Spara som dokument i Workspace", en: "Save it as a document in Workspace" },
        body: {
          sv: "Öppna svaret i Workspace (⌘B) när det är något du ska fortsätta jobba i — då blir långt svar ett dokument i stället för en chattrad.",
          en: "Open the answer in Workspace (⌘B) when it is something you will keep working on — a long answer becomes a document instead of a chat message.",
        },
      },
    ],
    tips: [
      {
        sv: "Be explicit om format: ”tabell med kolumnerna risk, sannolikhet, åtgärd”.",
        en: "Be explicit about format: “table with the columns risk, likelihood, action”.",
      },
      {
        sv: "Skicka in ett första stycke, få strukturen, klistra in resten. Bra för riktigt långa texter.",
        en: "Send the first paragraph, get the structure, then paste the rest. Good for really long texts.",
      },
      {
        sv: "Ber du om siffror: be BudAI citera raden den hämtade siffran från.",
        en: "If you ask about numbers: ask BudAI to quote the line the number came from.",
      },
    ],
    avoid: [
      {
        sv: "Undvik att lita på summeringar av avtal utan att kontrollera originaltexten.",
        en: "Avoid trusting summaries of contracts without checking the original text.",
      },
      {
        sv: "Undvik att klistra in personuppgifter du inte får dela. Maska namn och nummer först.",
        en: "Avoid pasting personal data you are not allowed to share. Mask names and numbers first.",
      },
    ],
    next: ["skriva-mejl", "tva-forslag"],
  },
  {
    slug: "tva-forslag",
    tag: { sv: "Beslut", en: "Decisions" },
    minutes: 3,
    title: { sv: "Få två förslag och välj", en: "Get two options and choose" },
    subtitle: {
      sv: "När du inte vill ha ett svar — utan två att jämföra innan du bestämmer.",
      en: "For when you do not want one answer — you want two to compare before deciding.",
    },
    outcome: {
      sv: "Två genomarbetade alternativ sida vid sida, och ett beslut du kan motivera.",
      en: "Two finished alternatives side by side, and a decision you can justify.",
    },
    steps: [
      {
        title: { sv: "Be om alternativ, inte om hjälp", en: "Ask for alternatives, not for help" },
        body: {
          sv: "Skriv ”ge mig två alternativ” och beskriv skillnaden du är ute efter: kort/lång, formell/varm, billig/dyr, snabb/grundlig.",
          en: "Write “give me two options” and describe the difference you want: short/long, formal/warm, cheap/expensive, fast/thorough.",
        },
        prompt: {
          sv: "Föreslå två upplägg för ett kundmöte på 30 minuter. A: strikt agenda med tidsatta punkter. B: lösare samtal med tre frågor. Motivera kort varför man väljer vilket.",
          en: "Propose two structures for a 30-minute customer meeting. A: strict agenda with timed items. B: looser conversation around three questions. Briefly justify when to pick which.",
        },
      },
      {
        title: { sv: "Välj i Playground — inte i huvudet", en: "Choose in the Playground — not in your head" },
        body: {
          sv: "Svarsalternativen visas som A och B. Välj det ena, så fortsätter tråden därifrån och du slipper förklara om.",
          en: "The options show up as A and B. Pick one and the thread continues from there — no re-explaining.",
        },
      },
      {
        title: { sv: "Be om en tredje när båda är fel", en: "Ask for a third when both are wrong" },
        body: {
          sv: "”Ingen av dem — gör en tredje som är kortare än A men varmare än B.” Det är så du får det du faktiskt vill ha.",
          en: "“Neither — make a third that is shorter than A but warmer than B.” That is how you get what you actually want.",
        },
      },
      {
        title: { sv: "Lås beslutet skriftligt", en: "Lock the decision in writing" },
        body: {
          sv: "Avsluta med: ”sammanfatta beslutet i tre meningar och vad som händer härnäst”. Då finns underlaget kvar i historiken.",
          en: "Finish with: “summarize the decision in three sentences and what happens next”. The reasoning stays in your history.",
        },
      },
    ],
    tips: [
      {
        sv: "Be alltid om en kort motivering per alternativ — den är ofta mer användbar än alternativet.",
        en: "Always ask for a short rationale per option — it is often more useful than the option itself.",
      },
      {
        sv: "Använd korta svar med tidsgräns: ”max 80 ord per alternativ”.",
        en: "Use short answers with a limit: “max 80 words per option”.",
      },
      {
        sv: "Vill du jämföra över tid? Döp konversationen i historiken så hittar du tillbaka.",
        en: "Comparing over time? Name the conversation in the history rail so you can find it again.",
      },
    ],
    avoid: [
      {
        sv: "Undvik att be om tio alternativ. Två bra slår tio halvfärdiga.",
        en: "Avoid asking for ten options. Two good ones beat ten half-finished.",
      },
      {
        sv: "Undvik att låta BudAI välja åt dig när beslutet är ditt.",
        en: "Avoid letting BudAI decide for you when the decision is yours.",
      },
    ],
    next: ["skriva-mejl", "analysera-text"],
  },
];

export function getPlaybook(slug: string) {
  return PLAYBOOKS.find((p) => p.slug === slug);
}
