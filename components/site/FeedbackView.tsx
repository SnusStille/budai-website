"use client";

import { ArrowUpRight, Check, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import PageHero from "./PageHero";
import FeedbackForm from "./FeedbackForm";
import { useLang } from "@/components/ui/LanguageContext";

export default function FeedbackView() {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <main id="main" tabIndex={-1} className="v2-main">
      <PageHero
        kicker={{ en: "FEEDBACK · HELP SHAPE BUDAI", sv: "FEEDBACK · PÅVERKA BUDAI" }}
        title={{ en: "Help build what matters next.", sv: "Hjälp till att bygga det som betyder mest." }}
        description={{ en: "Suggest an improvement, report a bug or request a feature. Concrete workflows and honest friction are more useful than generic praise.", sv: "Föreslå en förbättring, rapportera en bugg eller önska en funktion. Konkreta arbetsflöden och ärlig friktion är mer användbart än allmänna lovord." }}
      />
      <div className="v2-container v2-feedback-layout">
        <section className="v2-feedback-panel" aria-labelledby="feedback-form-title"><div className="v2-feedback-panel-heading"><MessageSquareText size={22} /><div><p className="v2-kicker">STILLEDEV · {sv ? "DIREKT FEEDBACK" : "DIRECT FEEDBACK"}</p><h2 id="feedback-form-title">{sv ? "Vad kan bli bättre?" : "What could be better?"}</h2></div></div><FeedbackForm /></section>
        <aside className="v2-feedback-aside">
          <section><p className="v2-kicker">01 · {sv ? "BRA FEEDBACK" : "USEFUL FEEDBACK"}</p><h2>{sv ? "Ge oss sammanhanget." : "Give us the context."}</h2><ul><li><Check size={14} />{sv ? "Vad du försökte åstadkomma" : "What you were trying to accomplish"}</li><li><Check size={14} />{sv ? "Vad du förväntade dig och vad som hände" : "What you expected and what happened"}</li><li><Check size={14} />{sv ? "Vilket arbetsflöde som skulle bli enklare" : "Which workflow would become easier"}</li><li><Check size={14} />{sv ? "Enhet och webbläsare för tekniska buggar" : "Device and browser for technical bugs"}</li></ul></section>
          <section><ShieldCheck size={21} /><h2>{sv ? "En verklig inkorg, utan dold backend." : "A real inbox, with no hidden backend."}</h2><p>{sv ? "Formuläret använder Stilledevs befintliga feedback-API. Om lagringen inte är tillgänglig får du ett ärligt fel och ett e-postalternativ — inget falskt lyckat skick." : "The form uses Stilledev’s existing feedback API. If storage is unavailable, you get an honest error and an email alternative—never a fake success state."}</p></section>
          <section><Mail size={21} /><h2>{sv ? "Föredrar du e-post?" : "Prefer email?"}</h2><p>{sv ? "Kontakta Stilledev direkt. Ingen ny e-postadress eller supportportal har hittats på." : "Contact Stilledev directly. No new email address or support portal has been invented."}</p><a href="mailto:Stilleinc@hotmail.com?subject=BudAI%20feedback" className="v2-text-link">Stilleinc@hotmail.com<ArrowUpRight size={14} /></a></section>
        </aside>
      </div>
    </main>
  );
}
