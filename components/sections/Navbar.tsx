"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, Command } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import StockholmClock from "@/components/ui/StockholmClock";
import BudAILogo from "@/components/ui/BudAILogo";

const SECTION_IDS = [
  "capabilities",
  "playground",
  "terminal",
  "waitlist",
  "roadmap",
  "status",
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");
  const { lang, setLang, t } = useLang();
  const ratios = useRef<Record<string, number>>({});
  const logoClicks = useRef<number[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Reliable scroll-spy: pick section with highest intersection ratio near viewport center
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (!els.length) {
      // Sections may mount late (dynamic) — retry shortly
      const t = setTimeout(() => setActive((a) => a), 400);
      return () => clearTimeout(t);
    }

    ratios.current = {};
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.current[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
        }
        let best = "";
        let bestR = 0;
        for (const id of SECTION_IDS) {
          const r = ratios.current[id] ?? 0;
          if (r > bestR) {
            bestR = r;
            best = id;
          }
        }
        // Fallback: scroll position based if ratios all zero
        if (bestR < 0.05) {
          const mid = window.scrollY + window.innerHeight * 0.35;
          let closest = "";
          let dist = Infinity;
          for (const id of SECTION_IDS) {
            const el = document.getElementById(id);
            if (!el) continue;
            const d = Math.abs(el.offsetTop - mid);
            if (d < dist) {
              dist = d;
              closest = id;
            }
          }
          if (closest) setActive(closest);
        } else if (best) {
          setActive(best);
        }
      },
      {
        // Center-weighted band so only one section "owns" the indicator
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.7, 1],
      }
    );

    els.forEach((el) => observer.observe(el));

    // Also update on scroll for edge cases (fast scroll / dynamic mount)
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight * 0.35;
      let closest = "";
      let dist = Infinity;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (mid >= top - 80 && mid <= bottom + 40) {
          const d = Math.abs(top - mid);
          if (d < dist) {
            dist = d;
            closest = id;
          }
        }
      }
      if (closest) setActive(closest);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [lang, mobileOpen]);

  const links = [
    { label: t.nav.capabilities, href: "#capabilities", id: "capabilities" },
    { label: t.nav.playground, href: "#playground", id: "playground" },
    { label: t.nav.terminal, href: "#terminal", id: "terminal" },
    { label: t.nav.waitlist, href: "#waitlist", id: "waitlist" },
    { label: t.nav.roadmap, href: "#roadmap", id: "roadmap" },
    { label: t.nav.status, href: "#status", id: "status" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "glass-strong shadow-lg shadow-black/30 border-b border-white/[0.07] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
            <a
              href="#"
              className="flex items-center gap-2.5 group"
              aria-label="BudAI home"
              onClick={(e) => {
                // Surprise #3 — triple-click logo within 1.2s
                const now = Date.now();
                logoClicks.current = [...logoClicks.current, now].filter((ts) => now - ts < 1200);
                if (logoClicks.current.length >= 3) {
                  e.preventDefault();
                  logoClicks.current = [];
                  window.dispatchEvent(new Event("budai:logo-secret"));
                }
              }}
            >
              <span className="transition-transform group-active:scale-95 inline-flex">
                <BudAILogo size="sm" animated />
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight">
                  Bud<span className="text-accent-cyan">AI</span>
                </span>
                <span className="text-[10px] tracking-wide">
                  <span className="text-white font-medium">{t.nav.developedBy}</span>{" "}
                  <span className="text-accent-cyan group-hover:text-white transition-colors">Stilledev</span>
                </span>
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-0.5">
              {links.map((l) => {
                const isActive = active === l.id;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className={`relative px-3.5 py-2 text-sm rounded-lg transition-colors ${
                      isActive ? "text-white" : "text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {l.label}
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-accent-cyan transition-all duration-300 ${
                        isActive ? "w-5 opacity-100 shadow-[0_0_8px_rgba(0,229,255,0.6)]" : "w-0 opacity-0"
                      }`}
                    />
                  </a>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2.5">
              <StockholmClock className="hidden xl:inline-flex" />
              <div
                className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/[0.08] shadow-inner"
                role="group"
                aria-label="Language"
              >
                {(["en", "sv"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`relative min-w-[2.6rem] px-3 py-1.5 text-[11px] font-semibold tracking-wide rounded-full transition-all ${
                      lang === code
                        ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white shadow-[0_0_16px_rgba(0,229,255,0.25)]"
                        : "text-muted/70 hover:text-white"
                    }`}
                  >
                    {code === "en" ? "EN" : "SV"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
                  )
                }
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-muted/60 hover:text-white border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] transition-all"
                aria-label="Open command palette"
              >
                <Command className="w-3 h-3" />K
              </button>

              <a href="#waitlist" className="btn-primary !px-5 !py-2.5 text-sm">
                <span>{t.nav.requestAccess}</span>
              </a>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-background/98 backdrop-blur-2xl"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative pt-24 px-6 flex flex-col gap-1 max-h-screen overflow-y-auto pb-10">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3.5 text-lg rounded-xl transition-colors ${
                    active === l.id
                      ? "text-white bg-white/5 border border-accent-cyan/20"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </motion.a>
              ))}

              <div className="flex items-center gap-3 mt-4 px-4">
                <Globe className="w-4 h-4 text-muted" />
                <div className="flex p-0.5 rounded-full bg-black/40 border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={`px-4 py-2 text-sm font-semibold rounded-full ${
                      lang === "en"
                        ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                        : "text-muted"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("sv")}
                    className={`px-4 py-2 text-sm font-semibold rounded-full ${
                      lang === "sv"
                        ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                        : "text-muted"
                    }`}
                  >
                    Svenska
                  </button>
                </div>
              </div>

              <a
                href="#waitlist"
                onClick={() => setMobileOpen(false)}
                className="mt-4 btn-primary !py-3.5 text-center"
              >
                <span>{t.nav.requestAccess}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
