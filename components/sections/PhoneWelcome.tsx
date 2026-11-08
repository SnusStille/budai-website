"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Phone shell is selected server-side; policy navigation must reload the root layout. */

import { useEffect, useState } from "react";
import PhoneDesktopNotice from "@/components/sections/PhoneDesktopNotice";
import { ArrowDown, ArrowUpRight, Monitor, Sparkles } from "lucide-react";
import AIPlayground from "@/components/sections/AIPlayground";
import { BudAIWordmark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { openCookieSettings } from "@/lib/consent";

/** A small-screen home for the actual Playground; the rest of the site stays desktop-first. */
export default function PhoneWelcome({ normalizeLanguagePath = false }: { normalizeLanguagePath?: boolean }) {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const [noticeOpen, setNoticeOpen] = useState(true);
  useEffect(() => {
    try { if (sessionStorage.getItem("stilledev:desktop-notice:v1") === "seen") setNoticeOpen(false); } catch { /* storage is optional */ }
  }, []);
  const confirmNotice = () => {
    try { sessionStorage.setItem("stilledev:desktop-notice:v1", "seen"); } catch { /* dismissal still works for this visit */ }
    setNoticeOpen(false);
  };
  const changeLanguage = (next: "sv" | "en") => {
    setLang(next);
    // /sv is authoritative on reload. Leave it when English is explicitly chosen,
    // without remounting the Playground or discarding a draft or active stream.
    if (normalizeLanguagePath && next === "en" && (location.pathname === "/sv" || location.pathname.startsWith("/sv/"))) {
      const url = new URL(location.href);
      url.pathname = "/";
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  return (
    <>
    <div className="phone-welcome" inert={noticeOpen}>
      <header className="phone-header">
        <div className="phone-brand"><BudAIWordmark size="sm" /><span>by Stilledev</span></div>
        <div className="phone-languages" role="group" aria-label={sv ? "Välj språk" : "Choose language"}>
          <button type="button" onClick={() => changeLanguage("sv")} aria-pressed={sv}>SV</button>
          <button type="button" onClick={() => changeLanguage("en")} aria-pressed={!sv}>EN</button>
        </div>
      </header>

      <main id="main">
        <section className="phone-hero" aria-labelledby="phone-heading">
          <div className="phone-eyebrow"><span className="phone-live-dot" />{sv ? "PLAYGROUND I FICKAN" : "PLAYGROUND IN YOUR POCKET"}<Sparkles size={14} aria-hidden="true" /></div>
          <h1 id="phone-heading">{sv ? <>Stor sajt.<br /><span>Liten skärm.</span></> : <>Big site.<br /><span>Little screen.</span></>}</h1>
          <p className="phone-hero-copy">{sv
            ? "Playground får åka med i fickan. Resten av sajten behöver en dator – vår robot vägrar vika ihop hela kontoret till en mobil."
            : "Playground can come along in your pocket. The rest of the site needs a computer – our robot refuses to fold the whole office into a phone."}</p>
          <div className="phone-desktop-notice">
            <div className="phone-monitor" aria-hidden="true"><Monitor size={24} strokeWidth={1.5} /></div>
            <div><strong>{sv ? "Dator behövs för resten" : "Computer needed for the rest"}</strong><span>{sv ? "Men du kan chatta här, direkt." : "But you can chat right here."}</span></div>
          </div>
          <a className="phone-jump" href="#playground">{sv ? "Öppna Playground" : "Open Playground"}<ArrowDown size={17} aria-hidden="true" /></a>
          <div className="phone-hero-foot"><span>{sv ? "INGEN STOR SKÄRM? INGEN PANIK." : "NO BIG SCREEN? NO BIG DEAL."}</span><span>01 / 01</span></div>
        </section>

        <div className="phone-playground-wrap">
          <AIPlayground phoneOnly />
        </div>
      </main>
      <footer className="phone-footer">
        <div className="phone-footer-top"><div><strong>BudAI</strong><span> {sv ? "av" : "by"} Stilledev</span></div><a href="#phone-heading" aria-label={sv ? "Tillbaka till toppen" : "Back to top"}><ArrowUpRight size={17} aria-hidden="true" /></a></div>
        <p>{sv ? "Byggd för stora idéer. Och nu även små skärmar." : "Built for big ideas. And now, little screens too."}</p>
        <div className="phone-footer-links">
          <a href="/legal/privacy">{sv ? "Integritet" : "Privacy"}</a>
          <a href="/legal/terms">{sv ? "Villkor" : "Terms"}</a>
          <a href="/legal/cookies">Cookies</a>
          <button type="button" onClick={openCookieSettings}>{sv ? "Cookieinställningar" : "Cookie settings"}</button>
        </div>
      </footer>
    </div>
    {noticeOpen && <PhoneDesktopNotice sv={sv} changeLanguage={changeLanguage} onConfirm={confirmNotice} />}
    </>
  );
}
