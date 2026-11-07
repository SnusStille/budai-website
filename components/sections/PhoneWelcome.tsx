"use client";

import { useState } from "react";
import { ArrowDownRight, Monitor } from "lucide-react";
import { StilledevMark } from "@/components/ui/BudAILogo";
import "@/app/phone-welcome.css";

export default function PhoneWelcome({ initialLang = "sv" }: { initialLang?: "sv" | "en" }) {
  const [lang, setLang] = useState(initialLang);
  const sv = lang === "sv";
  return <main id="main" className="phone-welcome" lang={lang}>
    <div className="phone-shell">
      <header className="phone-header"><span className="phone-brand"><StilledevMark size={25} /><span>STILLEDEV<span className="phone-brand-dot">.</span></span></span><div className="phone-lang" role="group" aria-label={sv ? "Språk" : "Language"}><button type="button" aria-pressed={sv} onClick={() => setLang("sv")}>SV</button><button type="button" aria-pressed={!sv} onClick={() => setLang("en")}>EN</button></div></header>
      <section className="phone-content" aria-labelledby="phone-title"><div className="phone-eyebrow"><span /> STILLEDEV / {sv ? "FEL BRANCH" : "WRONG BRANCH"} <b>01</b></div><div className="phone-visual" aria-hidden="true"><div className="phone-grid" /><div className="phone-ring phone-ring-one" /><div className="phone-ring phone-ring-two" /><div className="phone-core"><Monitor size={37} strokeWidth={1.1} /><i /></div><span>DESKTOP / CONNECTION</span></div><h1 id="phone-title">{sv ? <>Hoppsan.<br /><em>Fel branch.</em></> : <>Oops.<br /><em>Wrong branch.</em></>}</h1><p>{sv ? "Du och jag är på olika brancher just nu. Playground och resten av sidan väntar på en större skärm — öppna stilledev.se på din dator för att läsa mer om Stilledev och AI:n." : "You and I are on different branches right now. Playground and the rest of the site are waiting on a bigger screen — open stilledev.se on your computer to learn more about Stilledev and the AI."}</p><div className="phone-desktop-note"><Monitor size={17} /><span>{sv ? "BÄST PÅ DATOR" : "BEST ON DESKTOP"}</span><ArrowDownRight size={15} /></div>
      </section>
      <footer className="phone-footer"><span>STILLEDEV / SWEDEN</span><span>{sv ? "VI SES PÅ DATORN" : "SEE YOU ON DESKTOP"} ↗</span></footer>
    </div>
  </main>;
}
