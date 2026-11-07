"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, Copy, SlidersHorizontal, Sparkles } from "lucide-react";

type Format = "plan" | "questions" | "ideas";

/** A real, deterministic client-side tool; it never claims to generate an AI response. */
function compose(goal: string, format: Format, sv: boolean) {
  const input = goal.trim() || (sv ? "[Beskriv ditt mål]" : "[Describe your goal]");
  const instructions: Record<Format, [string, string]> = {
    plan: ["Create a practical, step-by-step plan for this goal.", "Skapa en praktisk steg-för-steg-plan för detta mål."],
    questions: ["Ask the most useful questions before starting this work.", "Ställ de viktigaste frågorna innan arbetet påbörjas."],
    ideas: ["Suggest several distinct approaches and explain their trade-offs.", "Föreslå flera olika angreppssätt och beskriv deras avvägningar."],
  };
  return sv
    ? `Mål: ${input}\n\n${instructions[format][1]}\n\nSammanhang: [Lägg till relevant information]\nBegränsningar: [Lägg till krav eller ramar]`
    : `Goal: ${input}\n\n${instructions[format][0]}\n\nContext: [Add relevant information]\nConstraints: [Add requirements or limits]`;
}

export default function LabsSignalStudio({ sv }: { sv: boolean }) {
  const [goal, setGoal] = useState("");
  const [format, setFormat] = useState<Format>("plan");
  const [status, setStatus] = useState("");
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const output = compose(goal, format, sv);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setStatus(sv ? "Kopierat. Klistra in och anpassa texten där du vill." : "Copied. Paste and adapt the text wherever you like.");
    } catch {
      outputRef.current?.focus();
      outputRef.current?.select();
      setStatus(sv ? "Texten är markerad. Kopiera den manuellt." : "The text is selected. Copy it manually.");
    }
  };
  const formats: { id: Format; en: string; sv: string }[] = [
    { id: "plan", en: "Action plan", sv: "Handlingsplan" },
    { id: "questions", en: "Questions", sv: "Frågor" },
    { id: "ideas", en: "Ideas", sv: "Idéer" },
  ];
  return <section id="signal-studio" className="lab-signal-section lab-wrap" aria-labelledby="signal-title">
    <div className="lab-signal-intro"><div className="lab-eyebrow"><span /> {sv ? "ETT LITET EXPERIMENT" : "A SMALL EXPERIMENT"} <b> / 03 · INTERACTIVE</b></div><h2 id="signal-title">{sv ? <>Varje idé börjar<br /><em>med en signal.</em></> : <>Every idea starts<br /><em>with a signal.</em></>}</h2><p>{sv ? "En bra fråga är en bra början. Forma ett mål till ett tydligare underlag och ta det vidare dit du vill." : "A better question is a better starting point. Shape a goal into a clearer brief, then take it wherever you want."}</p><div className="lab-signal-meta"><span><Sparkles size={14} /> {sv ? "BYGGT FÖR ATT PROVA" : "MADE TO BE TRIED"}</span><span>{sv ? "LOKALT VERKTYG" : "LOCAL TOOL"}</span></div><p className="lab-signal-disclosure">{sv ? "Det här verktyget använder fasta mallar, inte AI. Texten stannar i din webbläsare tills du själv kopierar den." : "This tool uses fixed templates, not AI. Your text stays in your browser unless you copy it yourself."}</p></div>
    <div className="lab-signal-console"><div className="lab-console-top"><span><i /> SIGNAL COMPOSER</span><span>01 / LOCAL INTERACTION</span></div><div className="lab-console-inner"><div className="lab-console-caption"><SlidersHorizontal size={15} /><span>{sv ? "FRÅN TANKE TILL UNDERLAG" : "FROM THOUGHT TO BRIEF"}</span></div><label htmlFor="lab-signal-goal">{sv ? "Vad vill du åstadkomma?" : "What do you want to achieve?"}</label><textarea id="lab-signal-goal" value={goal} maxLength={220} onChange={e => { setGoal(e.target.value); setStatus(""); }} placeholder={sv ? "Till exempel: skapa en bättre rutin för kunduppföljning" : "For example: create a better customer follow-up routine"} rows={3} /><div className="lab-console-label"><span>{sv ? "VÄLJ RIKTNING" : "CHOOSE A DIRECTION"}</span><span>{goal.length} / 220</span></div><div className="lab-format-options" role="group" aria-label={sv ? "Välj riktning" : "Choose a direction"}>{formats.map(item => <button type="button" key={item.id} aria-pressed={format === item.id} onClick={() => { setFormat(item.id); setStatus(""); }}>{sv ? item.sv : item.en}</button>)}</div><label className="lab-output-label" htmlFor="lab-signal-output"><span>{sv ? "DITT UNDERLAG" : "YOUR STARTING BRIEF"}</span><span>↗</span></label><textarea id="lab-signal-output" ref={outputRef} value={output} readOnly rows={6} /><div className="lab-console-actions"><button type="button" onClick={copy}><Copy size={14} /> {sv ? "Kopiera underlaget" : "Copy the brief"}</button><a href={sv ? "/sv#playground" : "/#playground"}>{sv ? "Öppna BudAI Playground" : "Open BudAI Playground"} <ArrowRight size={14} /></a></div><p className="lab-copy-status" role="status">{status && <><Check size={13} /> {status}</>}</p></div></div>
  </section>;
}
