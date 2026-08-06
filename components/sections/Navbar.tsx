"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Cpu, Globe } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t.nav.capabilities, href: "#capabilities" },
    { label: t.nav.playground, href: "#playground" },
    { label: t.nav.terminal, href: "#terminal" },
    { label: t.nav.waitlist, href: "#waitlist" },
    { label: t.nav.roadmap, href: "#roadmap" },
    { label: t.nav.status, href: "#status" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-strong shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center overflow-hidden">
                <Cpu className="w-5 h-5 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan to-accent-purple opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan to-accent-purple opacity-20 animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Bud<span className="text-accent-cyan">AI</span>
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="relative px-4 py-2 text-sm text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5 group"
                >
                  {l.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-accent-cyan group-hover:w-4 transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <button
                  onClick={() => setLang("sv")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    lang === "sv"
                      ? "bg-accent-cyan/15 text-accent-cyan shadow-[0_0_12px_rgba(0,229,255,0.12)]"
                      : "text-muted hover:text-white"
                  }`}
                >
                  SV
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    lang === "en"
                      ? "bg-accent-cyan/15 text-accent-cyan shadow-[0_0_12px_rgba(0,229,255,0.12)]"
                      : "text-muted hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>

              <a
                href="#waitlist"
                className="relative px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl text-white overflow-hidden group"
              >
                <span className="relative z-10">{t.nav.requestAccess}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white">
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
            <div className="absolute inset-0 bg-background/98 backdrop-blur-2xl" onClick={() => setMobileOpen(false)} />
            <div className="relative pt-24 px-6 flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-lg text-white/80 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  {l.label}
                </motion.a>
              ))}

              {/* Mobile Language Switcher */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mt-4 px-4"
              >
                <Globe className="w-4 h-4 text-muted" />
                <button
                  onClick={() => setLang("sv")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    lang === "sv" ? "bg-accent-cyan/15 text-accent-cyan" : "text-muted"
                  }`}
                >
                  Svenska
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    lang === "en" ? "bg-accent-cyan/15 text-accent-cyan" : "text-muted"
                  }`}
                >
                  English
                </button>
              </motion.div>

              <motion.a
                href="#waitlist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setMobileOpen(false)}
                className="mt-4 px-5 py-3 text-center font-semibold bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl text-white"
              >
                {t.nav.requestAccess}
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
