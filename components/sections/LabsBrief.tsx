"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** A local-only starting point, not an AI-generated or submitted proposal. */
export default function LabsBrief() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [need, setNeed] = useState("");
  const [audience, setAudience] = useState("");
  const [outcome, setOutcome] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const fields = [
    { id: "need", number: "01", label: sv ? "Vad vill du lösa?" : "What would you like to solve?", placeholder: sv ? "Beskriv behovet eller problemet" : "Describe the need or problem", value: need, set: setNeed },
    { id: "audience", number: "02", label: sv ? "Vem är det för?" : "Who is it for?", placeholder: sv ? "Till exempel kunder, kollegor eller dig själv" : "For example customers, colleagues or yourself", value: audience, set: setAudience },
    { id: "outcome", number: "03", label: sv ? "Vad skulle ett bra resultat vara?" : "What would a good outcome look like?", placeholder: sv ? "Beskriv vad du vill kunna göra" : "Describe what you want to be able to do", value: outcome, set: setOutcome },
  ];
  const hasContent = fields.some(field => field.value.trim());
  const brief = fields.map(field => `${field.label}\n${field.value.trim() || "—"}`).join("\n\n");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };
  return <section className="labs-brief" aria-labelledby="labs-brief-title">
    <div className="labs-brief-intro">
      <span className="labs-section-label">03 / {sv ? "IDÉVERKSTAD" : "IDEA WORKSHOP"}</span>
      <h2 id="labs-brief-title">{sv ? <>En idé börjar<br /><em>med en fråga.</em></> : <>An idea starts<br /><em>with a question.</em></>}</h2>
      <p>{sv ? "Tre enkla frågor hjälper dig att sätta ord på en idé. Börja var du vill – du behöver inte ha alla svar." : "Three simple questions help you put an idea into words. Start anywhere – you don’t need all the answers."}</p>
      <div className="labs-brief-privacy"><span aria-hidden="true" />{sv ? "Bara i din webbläsare · ingenting skickas automatiskt" : "Only in your browser · nothing is sent automatically"}</div>
      <p className="labs-brief-disclaimer">{sv ? "Texten sparas inte och försvinner när du lämnar eller laddar om sidan. Kopiera den om du vill behålla den." : "Your text is not saved and will be lost if you leave or reload this page. Copy it if you want to keep it."}</p>
    </div>
    <div className="labs-brief-workspace">
      <div className="labs-brief-topline"><span>STILLEDEV / WORKSPACE</span><span>{sv ? "LOKALT UTKAST" : "LOCAL DRAFT"}</span></div>
      <div className="labs-brief-fields">{fields.map(field => <label key={field.id} htmlFor={`labs-brief-${field.id}`}>
        <span className="labs-brief-field-heading"><b>{field.number}</b>{field.label}</span>
        <textarea id={`labs-brief-${field.id}`} rows={2} disabled={!ready} maxLength={700} value={field.value} placeholder={field.placeholder} onChange={e => { field.set(e.target.value); setCopyState("idle"); }} />
      </label>)}</div>
      <div className="labs-brief-output">
        <div className="labs-brief-output-header"><span>{sv ? "DITT UTKAST" : "YOUR DRAFT"}</span><span>01 — 03</span></div>
        {hasContent ? <pre>{brief}</pre> : <p>{sv ? "Ditt utkast växer fram här medan du skriver." : "Your draft takes shape here as you write."}</p>}
        <button type="button" onClick={copy} disabled={!hasContent}>{copyState === "copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}{copyState === "copied" ? (sv ? "Kopierat" : "Copied") : (sv ? "Kopiera utkast" : "Copy draft")}</button>
        <p className="labs-brief-copy-status" role="status">{copyState === "error" ? (sv ? "Kopiering misslyckades. Markera och kopiera texten ovan manuellt." : "Could not copy. Select and copy the text above manually.") : copyState === "copied" ? (sv ? "Utkastet har kopierats." : "Draft copied.") : ""}</p>
      </div>
      <a className="labs-brief-contact" href={sv ? "/sv/contact" : "/contact"}>{sv ? "Vill du diskutera idén? Kontakta oss" : "Want to discuss your idea? Contact us"} <ArrowUpRight size={16} aria-hidden="true" /></a>
      <p className="labs-brief-contact-note">{sv ? "Klistra in utkastet i kontaktformuläret om du vill dela det." : "Paste your draft into the contact form if you want to share it."}</p>
    </div>
  </section>;
}
