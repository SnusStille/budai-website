"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo from "@/components/ui/BudAILogo";

const SECTION_IDS = ["playground", "budai", "vision", "waitlist"] as const;

/**
 * Minimal product nav: Playground first, then the story, then the waitlist.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string>("playground");
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* Scroll spy — deterministic: the section owning a line at 30% of the viewport wins.
     Rects are cached and re-measured on resize / late mounts so scrolling never forces layout. */
  useEffect(() => {
    let rects: { id: string; top: number; bottom: number }[] = [];
    let raf = 0;

    const measure = () => {
      const next: { id: string; top: number; bottom: number }[] = [];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        next.push({ id, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY });
      }
      if (next.length) rects = next;
    };

    const pick = () => {
      if (!rects.length) measure();
      if (!rects.length) return;
      const line = window.scrollY + window.innerHeight * 0.3;
      let current = rects[0].id;
      for (const r of rects) if (line >= r.top - 120) current = r.id;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = rects[rects.length - 1].id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        pick();
      });
    };
    const onResize = () => {
      measure();
      pick();
    };

    measure();
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // The Playground is dynamically imported and changes height once it mounts.
    const t1 = window.setTimeout(onResize, 700);
    const t2 = window.setTimeout(onResize, 1800);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lang]);

  const links = [
    { label: t.nav.playground, href: "#playground", id: "playground" },
    { label: t.nav.product, href: "#budai", id: "budai" },
    { label: t.nav.vision, href: "#vision", id: "vision" },
    { label: t.nav.waitlist, href: "#waitlist", id: "waitlist" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "border-b border-white/[0.07] bg-[#04040a]/85 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]">
            <a href="#playground" className="group flex items-center gap-2.5" aria-label="BudAI">
              <span className="inline-flex transition-transform group-active:scale-95">
                <BudAILogo size="sm" animated />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[19px] font-bold tracking-tight text-white">
                  Bud<span className="text-accent-cyan">AI</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[10px] tracking-wide text-muted/70">
                  {t.nav.developedBy} <span className="text-white/70">Stilledev</span>
                </span>
              </span>
              <span className="preview-tag ml-1 hidden lg:inline-flex">{t.nav.preview}</span>
            </a>

            <div className="hidden items-center gap-0.5 md:flex">
              {links.map((l) => {
                const isActive = active === l.id;
                return (
                  <a
                    key={l.id}
                    href={l.href}
                    className={`relative px-3 py-2 text-[13px] transition-colors ${
                      isActive ? "text-white" : "text-muted hover:text-white"
                    }`}
                  >
                    {l.label}
                    <span
                      className={`absolute inset-x-2 -bottom-[2px] h-px origin-left bg-gradient-to-r from-accent-cyan/80 to-accent-purple/50 transition-transform duration-300 ease-expo ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center rounded-full border border-white/[0.08] bg-black/40 p-0.5"
                role="group"
                aria-label={t.nav.language}
              >
                {(["en", "sv"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-wide transition-all ${
                      lang === code
                        ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                        : "text-muted/70 hover:text-white"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>

              <a
                href="#waitlist"
                className="btn-primary hidden !px-4 !py-2 text-[13px] sm:inline-flex lg:!px-5"
              >
                <span>{t.nav.requestAccess}</span>
              </a>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="rounded-lg p-2 text-white transition-colors hover:bg-white/[0.06] md:hidden"
                aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex max-h-screen flex-col gap-1 overflow-y-auto px-5 pb-10 pt-24">
              {links.map((l, i) => (
                <motion.a
                  key={l.id}
                  href={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3.5 text-[17px] transition-colors ${
                    active === l.id
                      ? "border border-accent-cyan/20 bg-white/[0.05] text-white"
                      : "text-white/75 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {l.label}
                </motion.a>
              ))}

              <a
                href="#waitlist"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-4 !py-3.5 text-center"
              >
                <span>{t.nav.requestAccess}</span>
              </a>
              <a
                href="#playground"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-xl border border-white/[0.08] px-4 py-3 text-center text-[14px] text-white/80 transition-colors hover:border-accent-cyan/30 hover:text-white"
              >
                {t.intro.backToPlayground}
              </a>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
                <span className="preview-tag">{t.nav.preview}</span>
                <div
                  className="flex items-center rounded-full border border-white/[0.08] bg-black/40 p-0.5"
                  role="group"
                  aria-label={t.nav.language}
                >
                  {(["en", "sv"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      aria-pressed={lang === code}
                      className={`rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-wide transition-all ${
                        lang === code
                          ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                          : "text-muted/70 hover:text-white"
                      }`}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
