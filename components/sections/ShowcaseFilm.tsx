"use client";

import { Film } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** Only shown when a real showcase asset is configured; never renders a broken empty player. */
export default function ShowcaseFilm() {
  const url = process.env.NEXT_PUBLIC_BUDAI_SHOWCASE_VIDEO_URL;
  const { lang } = useLang();
  if (!url) return null;
  const sv = lang === "sv";

  return (
    <section className="showcase-film-section" aria-labelledby="showcase-film-title">
      <div className="showcase-film-heading">
        <span><Film size={14} aria-hidden="true" /> BUDAI / {sv ? "I KORTHET" : "IN A MINUTE"}</span>
        <h2 id="showcase-film-title">{sv ? "Se BudAI i arbete." : "See BudAI in action."}</h2>
        <p>{sv ? "En snabb rundtur i arbetsytan och hur du kan använda den." : "A quick walkthrough of the workspace and what you can do with it."}</p>
      </div>
      <div className="showcase-film-frame">
        <video src={url} controls playsInline preload="metadata" aria-label={sv ? "BudAI-produktvisning" : "BudAI product showcase"} />
        <span className="showcase-film-caption">{sv ? "PRODUKTVISNING" : "PRODUCT WALKTHROUGH"}</span>
      </div>
    </section>
  );
}
