"use client";
import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
export default function Navbar() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const links = [
    ["playground", "Playground"],
    ["capabilities", lang === "sv" ? "Om BudAI" : "About BudAI"],
  ];
  return (
    <header className="product-nav">
      <nav className="site-width nav-inner" aria-label="Main navigation">
        <a href="#" className="brand-lockup" aria-label="BudAI home">
          <BudAILogo />
          <span>
            BudAI<span className="brand-byline">developed by stilledev</span>
          </span>
        </a>
        <div className="nav-links">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <button
            className="language-toggle"
            onClick={() => setLang(lang === "en" ? "sv" : "en")}
            aria-label={
              lang === "en" ? "Switch to Swedish" : "Byt till engelska"
            }
          >
            {lang.toUpperCase()} <span>⌄</span>
          </button>
          <a href="#waitlist" className="nav-cta">
            {lang === "sv" ? "Få tidig tillgång" : "Get early access"}
            <ArrowUpRight size={15} />
          </a>
          <button
            className="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-navigation" className="mobile-navigation">
          {[
            ...links,
            [
              "waitlist",
              lang === "sv"
                ? "Tidig tillgång · 10% rabatt"
                : "Early access · 10% off",
            ],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
