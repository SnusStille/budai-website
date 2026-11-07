import { Plus } from "lucide-react";

const NOTES = [
  { number: "01", tag: "HUMAN / AI", title: { en: "Where should an assistant stop?", sv: "Var bör en assistent stanna?" }, text: { en: "Useful assistance should make the next decision clearer, not quietly make it for you. How might review and handoff stay visible?", sv: "Bra assistans gör nästa beslut tydligare, utan att fatta det i tysthet. Hur kan granskning och överlämning förbli synliga?" } },
  { number: "02", tag: "CONTEXT / MEMORY", title: { en: "What makes context useful?", sv: "Vad gör sammanhang användbart?" }, text: { en: "A useful workspace needs the right context, not simply more of it. What should be kept, surfaced or forgotten as work changes?", sv: "En användbar arbetsyta behöver rätt sammanhang, inte bara mer av det. Vad bör sparas, visas eller glömmas när arbetet förändras?" } },
  { number: "03", tag: "INTERACTION / DESIGN", title: { en: "Can an interface think with you?", sv: "Kan ett gränssnitt tänka med dig?" }, text: { en: "Beyond a chat box, a thoughtful interface can help people shape, inspect and revise an idea. What interactions make that process feel natural?", sv: "Bortom ett chattfönster kan ett genomtänkt gränssnitt hjälpa människor att forma, granska och ändra en idé. Vilka interaktioner gör det naturligt?" } },
];

export default function LabsQuestions({ sv }: { sv: boolean }) {
  return <section id="research" className="lab-research lab-wrap" aria-labelledby="research-title">
    <div className="lab-research-layout">
      <div className="lab-research-intro">
        <div className="lab-eyebrow"><span /> {sv ? "TANKAR ATT UTFORSKA" : "QUESTIONS WORTH EXPLORING"} <b> / 04 · NOTES</b></div>
        <h2 id="research-title">{sv ? <>Frågor före<br /><em>färdiga svar.</em></> : <>Questions before<br /><em>answers.</em></>}</h2>
        <p>{sv ? "Några idéer som formar vad Labs kan bli. Det här är öppna frågor och designriktningar, inte publicerade forskningsresultat." : "A few ideas shaping what Labs could become. These are open questions and design directions, not published research findings."}</p>
        <div className="lab-research-art" aria-hidden="true"><span>LABS / FIELD NOTES</span><span>THINK · TEST · BUILD</span></div>
      </div>
      <div className="lab-research-content">
        <div className="lab-research-index"><span>{sv ? "ÖPPNA FRÅGOR" : "OPEN QUESTIONS"}</span><span>01 — 03</span></div>
        <div className="lab-notes">{NOTES.map(note => <details className="lab-note" key={note.number}><summary><span className="lab-note-index">{note.number} / {note.tag}</span><span className="lab-note-title">{sv ? note.title.sv : note.title.en}</span><span className="lab-note-plus"><Plus size={18} /></span></summary><p>{sv ? note.text.sv : note.text.en}</p></details>)}</div>
        <div className="lab-research-foot"><span>STILLEDEV / LABS</span><span>{sv ? "IDÉER I RÖRELSE" : "IDEAS IN MOTION"}</span></div>
      </div>
    </div>
  </section>;
}
