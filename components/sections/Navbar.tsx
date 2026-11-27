"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, Bell, ArrowUpRight, MessageSquareText } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import BudAIWordmark from "@/components/ui/BudAIWordmark";
import BudAILogo from "@/components/ui/BudAILogo";
import LangSwitcher from "@/components/ui/LangSwitcher";
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
  const pathname = usePathname();
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
    { label: t.nav.roadmap, href: "#roadmap", id: "roadmap" },
  ];

  const isLinkActive = (id: string) => active === id;

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
          <div className="flex items-center justify-between h-14 lg:h-16 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-6">
            <div className="flex items-center gap-3">
            <Link
              href="/"
              data-budai-logo
              className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 rounded-lg"
              aria-label="BudAI home"
              onClick={(e) => {
                if (window.location.pathname === "/" || window.location.pathname === "/sv") {
                  e.preventDefault();
                  if (window.scrollY > 300) window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                }
                (e.currentTarget as HTMLElement).blur();
                window.dispatchEvent(new CustomEvent("budai:logo-click", { detail: { el: e.currentTarget } }));
              }}
            >
              <span className="transition-transform duration-300 group-active:scale-95 group-hover:scale-105 inline-flex">
                <BudAILogo size="sm" animated mode={busy ? "thinking" : "idle"} />
              </span>
              <span className="flex flex-col leading-none">
                <BudAIWordmark className="nav-wordmark" />
                <span className="mt-1 hidden sm:flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-white/30">
                  by <span className="text-accent-cyan/80 font-semibold tracking-[0.14em]">Stilledev</span>
                </span>
              </span>
            </Link>
            </div>

            <div className="hidden lg:flex items-center justify-center gap-0.5">
              {links.map((l) => {
                const isActive = isLinkActive(l.id);
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "location" : undefined}
                    title={l.id === "labs" ? (lang === "sv" ? "Labs · under utveckling" : "Labs · under development") : undefined}
                    className={`relative whitespace-nowrap px-2.5 xl:px-3.5 py-2 text-sm rounded-lg transition-colors ${l.id === "labs" ? "nav-labs-link" : isActive ? "text-white" : l.id === "playground" ? "text-accent-cyan hover:text-white hover:bg-white/5" : "text-muted hover:text-white hover:bg-white/5"}`}
                  >
                    {l.id === "labs" ? <span className="nav-labs-chip"><i aria-hidden="true" />{l.label}<ArrowUpRight size={12} aria-hidden="true" /></span> : l.label}
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-accent-cyan transition-all duration-300 ${
                        isActive ? "w-5 opacity-100 shadow-[0_0_8px_rgba(0,229,255,0.6)]" : "w-0 opacity-0"
                      }`}
                    />
                  </a>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2 lg:justify-self-end">
              {/* Shared language switcher — same dropdown style as Labs */}
              <LangSwitcher variant="dropdown" />

              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("budai:whats-new"))}
                aria-label={lang === "sv" ? "Vad är nytt" : "What's new"}
                className="relative rounded-full p-1.5 text-white/60 transition-colors hover:text-white"
              >
                <Bell className="h-[15px] w-[15px]" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent-cyan" />
              </button>
              <a
                href={lang === "sv" ? "/sv/labs" : "/labs"}
                className="hidden xl:inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium text-accent-cyan/90 border border-accent-cyan/20 bg-accent-cyan/[0.05] transition-all hover:border-accent-cyan/40 hover:bg-accent-cyan/10 hover:text-accent-cyan"
              >
                Labs
                <ArrowUpRight size={11} />
              </a>
              <a href="#waitlist" className="btn-primary whitespace-nowrap !px-4 !py-2 text-[13px]">
                <span>{t.nav.requestAccess}</span>
              </a>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {/* Shared language switcher (pill variant for mobile) */}
              <LangSwitcher variant="pill" labsContext={false} />
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
                  className={`px-4 py-3.5 text-lg rounded-xl transition-colors ${isLinkActive(l.id) ? "text-white bg-white/5 border border-accent-cyan/20" : "text-white/80 hover:text-white hover:bg-white/5"}`}
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.a
                href={lang === "sv" ? "/sv/labs" : "/labs"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.04 }}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3.5 text-lg rounded-xl transition-colors nav-labs-mobile"
              >
                <span className="nav-labs-chip"><i aria-hidden="true" />Labs<ArrowUpRight size={15} aria-hidden="true" /></span>
              </motion.a>

              <div className="flex items-center gap-3 mt-4 px-4">
                <Globe className="w-4 h-4 text-muted" />
                <LangSwitcher variant="pill" />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3 px-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new Event("budai:whats-new"));
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/85 hover:text-white"
                >
                  <Bell className="h-3.5 w-3.5 text-accent-cyan" />
                  {lang === "sv" ? "Vad är nytt" : "What's new"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new Event("budai:feedback"));
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#82dce6]/25 bg-gradient-to-r from-[#82dce6]/[.09] to-white/[.025] px-3.5 py-2 text-xs font-medium text-white/90 transition-colors hover:border-[#82dce6]/45 hover:text-white"
                >
                  <MessageSquareText className="h-3.5 w-3.5 text-[#91e2e8]" aria-hidden="true" />
                  {lang === "sv" ? "Skicka feedback" : "Send feedback"}
                </button>
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
