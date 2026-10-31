"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type Language = "sv" | "en";
const workflows = {
  sv: [
    { label: "Planera veckan", intent: "analyze", prompt: "Hjälp mig planera veckan. Prioritera mina uppgifter, föreslå en realistisk ordning och lämna plats för pauser. Fråga om det som saknas.\n\nMina uppgifter: " },
    { label: "Mötesanteckningar → nästa steg", intent: "analyze", prompt: "Gör mina mötesanteckningar till en kort sammanfattning och en lista med nästa steg. Hitta inte på ansvariga eller datum; markera det som saknas.\n\nAnteckningar: " },
    { label: "Skriv ett mejl", intent: "create", prompt: "Skriv ett tydligt och vänligt mejl utifrån mina anteckningar. Ge mig en ämnesrad och ett färdigt utkast. Fråga om viktig information saknas.\n\nAnteckningar: " },
    { label: "Jämför alternativ", intent: "analyze", prompt: "Jämför alternativen nedan med fördelar, risker och öppna frågor. Ge en preliminär rekommendation och markera dina antaganden.\n\nAlternativ och mål: " },
  ],
  en: [
    { label: "Plan the week", intent: "analyze", prompt: "Help me plan my week. Prioritize my tasks, suggest a realistic order and leave room for breaks. Ask for missing details.\n\nMy tasks: " },
    { label: "Meeting notes → next steps", intent: "analyze", prompt: "Turn my meeting notes into a short summary and next steps. Do not invent owners or dates; mark what is missing.\n\nNotes: " },
    { label: "Write an email", intent: "create", prompt: "Write a clear, friendly email from my notes. Give me a subject line and a ready-to-use draft. Ask if important details are missing.\n\nNotes: " },
    { label: "Compare options", intent: "analyze", prompt: "Compare the options below, including benefits, risks and open questions. Give a preliminary recommendation and identify your assumptions.\n\nOptions and goal: " },
  ],
} as const;

export default function SignalWorkflows({ lang, onSelect }: { lang: Language; onSelect: (prompt: string, intent: string) => void }) {
  const sv = lang === "sv";
  const [showExample, setShowExample] = useState(false);
  return (
    <div className="signal-workflows" data-signal-workflows>
      <div className="signal-workflows-heading">
        <div><span>01 / SIGNAL → ACTION</span><h4>{sv ? "Börja med något ofärdigt." : "Start with something unfinished."}</h4></div>
        <button type="button" onClick={() => setShowExample(!showExample)} aria-expanded={showExample} aria-controls="signal-example">
          {showExample ? (sv ? "Dölj exempel" : "Hide example") : (sv ? "Se ett exempel" : "See an example")} <ArrowRight size={14} />
        </button>
      </div>
      {showExample && <div id="signal-example" className="signal-example">
        <div><span>{sv ? "ANTECKNINGAR" : "NOTES"}</span><p>{sv ? "Kundmöte · offert nästa vecka · behöver bekräfta omfattning" : "Client meeting · proposal next week · confirm scope"}</p></div>
        <div className="signal-example-output"><span>{sv ? "UTKAST · FÖRBERETT EXEMPEL" : "DRAFT · PREPARED EXAMPLE"}</span><p>{sv ? "Hej! Tack för ett bra möte. Jag återkommer med en offert nästa vecka. Kan vi först bekräfta omfattningen?" : "Hi! Thanks for a great meeting. I’ll follow up with a proposal next week. Could we first confirm the scope?"}</p></div>
      </div>}
      <p className="signal-workflows-label">{sv ? "Välj en startpunkt och lägg till ditt eget underlag" : "Choose a starting point and add your own context"}</p>
      <div className="signal-workflows-list">
        {workflows[lang].map((flow) => <button key={flow.label} type="button" onClick={() => onSelect(flow.prompt, flow.intent)}>{flow.label}<ArrowRight size={14} /></button>)}
      </div>
    </div>
  );
}
