"use client";
import { PenLine, ScanEye, Workflow, ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
export default function Capabilities() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const items = sv
    ? [
        [
          "Skriv & tänk",
          "Från första utkast till tydligare beslut. Mejl, idéer, analyser och sammanfattningar.",
        ],
        [
          "Se & prata",
          "Ge bilder sammanhang och formulera tankar med rösten. Bildanalys med konto; röst i webbläsare som stöds.",
        ],
        [
          "Förenkla & minns",
          "Planera återkommande arbete. Låt BudAI minnas relevant information när du själv väljer det.",
        ],
      ]
    : [
        [
          "Write & think",
          "From a first draft to a clearer decision. Emails, ideas, analysis, and summaries.",
        ],
        [
          "See & speak",
          "Give images context and put thoughts into words. Image analysis with an account; voice in supported browsers.",
        ],
        [
          "Simplify & remember",
          "Plan recurring work. Let BudAI remember useful context when you choose to.",
        ],
      ];
  return (
    <section id="capabilities" className="about-final site-width">
      <div className="about-intro">
        <div>
          <div className="eyebrow">LESS FRICTION. MORE POSSIBILITY.</div>
          <h2>
            {sv ? "Din tanke. Nästa steg." : "Your thinking. A step further."}
          </h2>
        </div>
        <p>
          {sv
            ? "BudAI byggs av stilledev i Sverige. Visionen är enkel: AI som gör riktigt arbete enklare — inte ännu ett verktyg att hantera."
            : "BudAI is being built by stilledev in Sweden. The vision is simple: AI that makes real work easier — not another tool to manage."}
        </p>
      </div>
      <div className="capability-row">
        {items.map(([title, body], i) => {
          const Icon = [PenLine, ScanEye, Workflow][i];
          return (
            <article key={title}>
              <span className="cap-number">0{i + 1}</span>
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          );
        })}
      </div>
      <a className="about-link" href="#playground">
        {sv
          ? "Mindre förklaring. Prova själv."
          : "Less explaining. More trying."}
        <ArrowUpRight size={16} />
      </a>
    </section>
  );
}
