"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Globe2, Menu, X } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSv = lang === "sv";

  const links = [
    { label: t.nav.playground, href: "#playground" },
    { label: isSv ? "Om BudAI" : "About BudAI", href: "#about" },
    { label: t.nav.waitlist, href: "#waitlist" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}
      >
        <div className="site-nav-inner">
          <a href="#home" className="site-brand" aria-label="BudAI home">
            <BudAILogo size="sm" animated={false} />
            <span className="site-brand-word">Bud<span>AI</span></span>
            <span className="site-brand-by">by Stilledev</span>
          </a>

          <nav className="site-nav-links" aria-label={isSv ? "Huvudmeny" : "Main navigation"}>
            {links.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <div className="site-nav-actions">
            <div className="language-switch" role="group" aria-label={isSv ? "Välj språk" : "Choose language"}>
              {(["en", "sv"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={lang === code}
                  onClick={() => setLang(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#waitlist" className="nav-cta">
              <span>{t.nav.requestAccess}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="mobile-menu-button"
              aria-label={mobileOpen ? (isSv ? "Stäng meny" : "Close menu") : (isSv ? "Öppna meny" : "Open menu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="mobile-nav-backdrop"
              onClick={closeMenu}
              aria-label={isSv ? "Stäng meny" : "Close menu"}
            />
            <motion.nav
              id="mobile-navigation"
              aria-label={isSv ? "Mobilmeny" : "Mobile navigation"}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mobile-nav-panel"
            >
              <div className="mobile-nav-title">
                <span>{isSv ? "Upptäck BudAI" : "Explore BudAI"}</span>
                <Globe2 className="h-4 w-4" />
              </div>
              {links.map((link) => (
                <a key={link.href} href={link.href} onClick={closeMenu} className="mobile-nav-link">
                  {link.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ))}
              <div className="mobile-language-row">
                <span>{isSv ? "Språk" : "Language"}</span>
                <div className="language-switch" role="group" aria-label={isSv ? "Välj språk" : "Choose language"}>
                  {(["en", "sv"] as const).map((code) => (
                    <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <a href="#waitlist" onClick={closeMenu} className="button-primary mobile-nav-cta">
                <span>{t.nav.requestAccess}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
