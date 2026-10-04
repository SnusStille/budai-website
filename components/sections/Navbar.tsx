"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Command, Globe2, Menu, X } from "lucide-react";
import BudAILogo, { BudAIWordmark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSv = lang === "sv";

  const links = [
    { label: t.nav.playground, href: "#playground", id: "playground" },
    { label: isSv ? "Om BudAI" : "About BudAI", href: "#about", id: "about" },
    { label: t.nav.waitlist, href: "#waitlist", id: "waitlist" },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["home", "playground", "about", "waitlist"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry?.target?.id) setActive(visibleEntry.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
            <BudAILogo size="sm" animated={scrolled} motion="idle" />
            <span className="site-brand-word">
              Bud<span>AI</span>
            </span>
            <span className="site-brand-by">by Stilledev</span>
          </a>

          <nav className="site-nav-links" aria-label={isSv ? "Huvudmeny" : "Main navigation"}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={active === link.id ? "is-active" : ""}
                aria-current={active === link.id ? "true" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="site-nav-actions">
            <span className="nav-kbd-hint hidden xl:inline-flex" aria-hidden>
              <Command className="h-3 w-3" />
              <span className="font-mono text-[10px]">⌘K</span>
            </span>
            <div className="language-switch" role="group" aria-label={isSv ? "Välj språk" : "Choose language"}>
              {(["en", "sv"] as const).map((code) => (
                <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#waitlist" className="nav-cta">
              <span>{t.nav.requestAccess}</span>
              <span className="nav-cta-badge">10%</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="mobile-menu-button"
              aria-label={mobileOpen ? (isSv ? "Stäng meny" : "Close menu") : isSv ? "Öppna meny" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <span className="nav-progress" aria-hidden>
          <span className="nav-progress-fill" style={{ transform: `scaleX(${progress})` }} />
        </span>
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
              <div className="mobile-nav-brand">
                <BudAIWordmark size="sm" variant="dark" />
              </div>
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
                <span>{isSv ? "Gå med — lås 10 %" : "Join — lock in 10%"}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
