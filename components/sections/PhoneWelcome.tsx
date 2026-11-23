"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Phone shell is selected server-side; policy navigation must reload the root layout. */

import { useEffect, useRef, useState } from "react";
import PhoneDesktopNotice from "@/components/sections/PhoneDesktopNotice";
import CompanionRestore from "@/components/ui/CompanionRestore";
import BuilderCompanion from "@/components/sections/BuilderCompanion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import AIPlayground from "@/components/sections/AIPlayground";
import PhoneStudio from "@/components/sections/PhoneStudio";
import { BudAIWordmark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { openCookieSettings } from "@/lib/consent";

/** A small-screen home for the actual Playground; the rest of the site stays desktop-first. */
export default function PhoneWelcome({ normalizeLanguagePath = false }: { normalizeLanguagePath?: boolean }) {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [ambientMotion, setAmbientMotion] = useState(false);
  const noticeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setAmbientMotion(!connection?.saveData);
  }, []);
  const confirmNotice = () => {
    setNoticeOpen(false);
    requestAnimationFrame(() => noticeButton.current?.focus({ preventScroll: true }));
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
    <div className="phone-welcome" inert={noticeOpen} data-motion={ambientMotion ? "on" : "off"}>
      <header className="phone-header">
        <div className="phone-brand"><BudAIWordmark size="sm" /><span>by Stilledev</span></div>
        <div className="phone-languages" role="group" aria-label={sv ? "Välj språk" : "Choose language"}>
          <button type="button" onClick={() => changeLanguage("sv")} aria-pressed={sv}>SV</button>
          <button type="button" onClick={() => changeLanguage("en")} aria-pressed={!sv}>EN</button>
        </div>
      </header>

      <main id="main">
        <section className="phone-hero" aria-labelledby="phone-heading">
          <div className="phone-hero-art" aria-hidden="true">
            <svg viewBox="0 0 360 240" fill="none" className="phone-core">
              <defs><radialGradient id="phone-core-light"><stop stopColor="#9ceafa" stopOpacity=".42"/><stop offset="1" stopColor="#4c9fbd" stopOpacity="0"/></radialGradient><linearGradient id="phone-core-line" x1="42" y1="41" x2="315" y2="217" gradientUnits="userSpaceOnUse"><stop stopColor="#84d7e8"/><stop offset="1" stopColor="#8b8cd1" stopOpacity=".32"/></linearGradient></defs>
              <circle cx="180" cy="120" r="100" fill="url(#phone-core-light)"/>
              <g className="phone-core-orbit" stroke="url(#phone-core-line)">
                <ellipse cx="180" cy="120" rx="137" ry="56" transform="rotate(-17 180 120)" opacity=".36"/>
                <ellipse cx="180" cy="120" rx="104" ry="76" transform="rotate(35 180 120)" opacity=".28"/>
                <path d="M62 166 115 95 177 62 244 88 300 54M65 75l59 65 65 43 74-55 45 35" opacity=".25"/>
              </g>
              <path d="m180 54 54 30 11 59-47 45-58-9-28-54 24-53z" stroke="url(#phone-core-line)" strokeOpacity=".7" fill="#0b2535" fillOpacity=".32"/>
              <path d="m180 54 6 61 48-31m-48 31 59 28m-59-28 12 73m-12-73-46 64m46-64-74 10m74-10-50-43" stroke="#9bdfee" strokeOpacity=".22"/>
              <circle cx="186" cy="115" r="6" fill="#c9f8ff"/><circle cx="186" cy="115" r="17" stroke="#a7eff8" strokeOpacity=".25"/>
              <g fill="#a4eaf3"><circle cx="115" cy="95" r="2"/><circle cx="244" cy="88" r="2"/><circle cx="198" cy="188" r="2"/><circle cx="124" cy="140" r="2"/><circle cx="263" cy="128" r="2"/></g>
            </svg>
            <span>BUDAI / SIGNAL 01</span><span>STILLEDEV · SWEDEN</span>
          </div>
          <div className="phone-eyebrow"><span className="phone-live-dot" />{sv ? "BUDAI · UTVECKLARFÖRHANDSVISNING" : "BUDAI · DEVELOPER PREVIEW"}</div>
          <h1 id="phone-heading" tabIndex={-1}>{sv ? <>AI som tar<br /><span>arbetet vidare.</span></> : <>AI that moves<br /><span>work forward.</span></>}</h1>
          <p className="phone-hero-copy">{sv
            ? "BudAI är Stilledevs AI-arbetsyta för idéer, texter och beslut. Prova direkt på svenska eller engelska."
            : "BudAI is Stilledev’s AI workspace for ideas, writing and decisions. Try it in Swedish or English."}</p>
          <div className="phone-hero-actions">
            <a className="phone-jump" href="#phone-chat">{sv ? "Öppna Playground" : "Open Playground"}<ArrowDown size={17} aria-hidden="true" /></a>
            <a className="phone-explore-link" href="#phone-discover">{sv ? "Utforska studion" : "Explore the studio"}<ArrowDown size={15} aria-hidden="true" /></a>
          </div>
          <nav className="phone-quick-nav" aria-label={sv ? "Gå direkt till" : "Jump directly to"}>
            <span>{sv ? "UTFORSKA" : "EXPLORE"}</span>
            <a href="#capabilities">{sv ? "Förmågor" : "Capabilities"}</a>
            <a href="#phone-access-title">{sv ? "Paket" : "Plans"}</a>
            <a href={sv ? "/sv/labs" : "/labs"}>Labs <ArrowUpRight size={12} aria-hidden="true" /></a>
          </nav>
          <div className="phone-hero-foot"><span>{sv ? "FRÅN TANKE TILL HANDLING" : "FROM THOUGHT TO ACTION"}</span><button ref={noticeButton} type="button" className="phone-desktop-notice" onClick={() => setNoticeOpen(true)}>{sv ? "Om 3D-resan" : "About the 3D journey"} <ArrowUpRight size={13} /></button></div>
        </section>

        <div className="phone-playground-wrap">
          <AIPlayground phoneOnly />
        </div>
        <PhoneStudio />
      </main>
      <footer className="phone-footer">
        <div className="phone-footer-top"><div><strong>BudAI</strong><span> {sv ? "av" : "by"} Stilledev</span></div><a href="#phone-heading" aria-label={sv ? "Tillbaka till toppen" : "Back to top"}><ArrowUpRight size={17} aria-hidden="true" /></a></div>
        <p>{sv ? "Byggd för stora idéer. Och nu även små skärmar." : "Built for big ideas. And now, little screens too."}</p>
        <div className="phone-footer-links">
          <a href={sv ? "/sv/labs" : "/labs"}>Labs</a>
          <a href={sv ? "/sv/contact" : "/contact"}>{sv ? "Kontakt" : "Contact"}</a>
          <a href="/legal/privacy">{sv ? "Integritet" : "Privacy"}</a>
          <a href="/legal/terms">{sv ? "Villkor" : "Terms"}</a>
          <a href="/legal/cookies">Cookies</a>
          <CompanionRestore phone />
          <button type="button" onClick={openCookieSettings}>{sv ? "Cookieinställningar" : "Cookie settings"}</button>
        </div>
      </footer>
    </div>
    {noticeOpen && <PhoneDesktopNotice sv={sv} changeLanguage={changeLanguage} onConfirm={confirmNotice} />}
    {!noticeOpen && <BuilderCompanion phone />}
    </>
  );
}
