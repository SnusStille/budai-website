"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Command, Globe2, Menu, X } from "lucide-react";
import LiveMark from "@/components/logo/LiveMark";
import { useLang } from "@/components/ui/LanguageContext";

/** Minimal nav: the product, who we are, and how to get in early. Nothing else. */
export default function Navbar() {
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSv = lang === "sv";

  const links = [
    { label: "Playground", href: "/" },
    { label: isSv ? "Om BudAI" : "About", href: "/about" },
    { label: isSv ? "Väntelista" : "Waitlist", href: "/waitlist" },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
      <div className="site-nav-inner">
        <Link href="/" className="site-brand" aria-label="BudAI — home">
          <LiveMark size="sm" />
          <span className="site-brand-word">
            Bud<span>AI</span>
          </span>
          <span className="site-brand-tag">{isSv ? "PREVIEW" : "PREVIEW"}</span>
        </Link>

        <nav className="site-nav-links" aria-label={isSv ? "Huvudmeny" : "Main navigation"}>
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "is-active" : ""}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-nav-actions">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("budai:palette"))}
            className="nav-kbd-hint hidden xl:inline-flex"
            title={isSv ? "Snabbkommandon (⌘K)" : "Quick actions (⌘K)"}
            aria-label={isSv ? "Öppna snabbkommandon" : "Open quick actions"}
          >
            <Command className="h-3 w-3" />
            <span className="font-mono text-[10px]">⌘K</span>
          </button>

          <div className="language-switch" role="group" aria-label={isSv ? "Välj språk" : "Choose language"}>
            {(["en", "sv"] as const).map((code) => (
              <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <Link href="/waitlist" className="nav-cta hidden sm:inline-flex">
            <span>{isSv ? "Early access" : "Early access"}</span>
            <span className="nav-cta-badge">10%</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="mobile-menu-button lg:hidden"
            aria-label={mobileOpen ? (isSv ? "Stäng meny" : "Close menu") : isSv ? "Öppna meny" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <span className="site-nav-progress" aria-hidden>
        <span style={{ transform: `scaleX(${progress})` }} />
      </span>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="site-nav-mobile"
            aria-label={isSv ? "Mobilmeny" : "Mobile menu"}
          >
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                {link.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setLang(lang === "sv" ? "en" : "sv");
              }}
              className="mobile-nav-link"
            >
              <span className="inline-flex items-center gap-2">
                <Globe2 className="h-4 w-4" />
                {lang === "sv" ? "English" : "Svenska"}
              </span>
              <span className="font-mono text-[11px] uppercase text-white/40">{lang}</span>
            </button>
            <Link href="/waitlist" className="button-primary mobile-nav-cta" onClick={() => setMobileOpen(false)}>
              {isSv ? "Early access — 10 %" : "Early access — 10%"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
