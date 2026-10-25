"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, Bell } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo from "@/components/ui/BudAILogo";
import { subscribeJourney } from "@/lib/experience/scroll";


export default function Navbar() {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setBusy(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener("budai:busy", on);
    return () => window.removeEventListener("budai:busy", on);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");
  const { lang, setLang, t } = useLang();
  const mobileMenu = useRef<HTMLDivElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => subscribeJourney((frame) => {
    setScrolled(frame.y > 40);
    setActive(frame.active);
  }), []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const toggle = menuToggle.current;
    const wide = window.matchMedia("(min-width: 1024px)");
    const focusable = () => [toggle, ...Array.from(mobileMenu.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [])].filter((element): element is HTMLElement => !!element);
    mobileMenu.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setMobileOpen(false); }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const onWide = () => { if (wide.matches) setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      toggle?.focus({ preventScroll: true });
    };
  }, [mobileOpen]);

  const links = [
    { label: t.nav.playground, href: "#playground", id: "playground" },
    { label: t.nav.capabilities, href: "#capabilities", id: "capabilities" },
    { label: lang === "sv" ? "Byggaren" : "Builder", href: "#about", id: "about" },
    { label: t.nav.waitlist, href: "#waitlist", id: "waitlist" },
    { label: t.nav.roadmap, href: "#roadmap", id: "roadmap" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`site-navigation fixed top-0 left-0 right-0 z-[60] transition-all duration-400 ${
          scrolled
            ? "glass-strong shadow-lg shadow-black/30 border-b border-white/[0.07] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[4.5rem] lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <a
              href="#"
              data-budai-logo
              className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 rounded-lg"
              aria-label="BudAI home"
              onClick={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).blur();
                if (window.scrollY > 300) window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                // Progressive easter egg: every click advances the sequence (see LogoEasterEgg)
                window.dispatchEvent(new CustomEvent("budai:logo-click", { detail: { el: e.currentTarget } }));
              }}
            >
              <span className="transition-transform duration-300 group-active:scale-95 group-hover:[transform:perspective(260px)_rotateY(16deg)_scale(1.08)] inline-flex">
                <BudAILogo size="sm" animated mode={busy ? "thinking" : "idle"} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="nav-wordmark">Bud<span>AI</span></span>
                <span className="mt-1.5 hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 sm:flex">
                  DEVELOPED BY <b className="font-bold text-accent-cyan [text-shadow:0_0_12px_rgba(0,229,255,0.55)]">STILLEDEV</b>
                </span>
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-0.5">
              {links.map((l) => {
                const isActive = active === l.id;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className={`relative px-3.5 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? "text-white"
                        : l.id === "playground"
                          ? "text-accent-cyan hover:text-white hover:bg-white/5"
                          : "text-muted hover:text-white hover:bg-white/5"
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

            <div className="hidden lg:flex items-center gap-2.5 lg:justify-self-end">
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
                onClick={() => window.dispatchEvent(new Event("budai:whats-new"))}
                aria-label={lang === "sv" ? "Vad är nytt" : "What's new"}
                className="relative rounded-full border border-white/[0.08] p-2 text-white/70 transition-colors hover:border-accent-cyan/40 hover:text-white"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-cyan" />
              </button>
              <a href="#playground" className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent-cyan/40">
                Playground
              </a>
              <a href="#waitlist" className="btn-primary !px-5 !py-2.5 text-sm">
                <span>{t.nav.requestAccess}</span>
              </a>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex items-center rounded-full border border-white/[0.08] bg-black/40 p-0.5" role="group" aria-label="Language">
                {(["en", "sv"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${lang === code ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white" : "text-muted/70"}`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
              <a href="#playground" className="rounded-full bg-accent-cyan px-3.5 py-1.5 text-xs font-semibold text-[#020205]">
                {lang === "sv" ? "Prova" : "Try"}
              </a>
              <button
              ref={menuToggle}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="fixed inset-0 z-[55] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-[#020205]/95 backdrop-blur-2xl"
              onClick={() => setMobileOpen(false)}
            />
            <div ref={mobileMenu} id="mobile-navigation" role="navigation" aria-label="Mobile navigation" className="relative pt-24 px-6 flex flex-col gap-1 max-h-screen overflow-y-auto pb-10">
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
