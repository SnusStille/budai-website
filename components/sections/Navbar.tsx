"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bot, ArrowRight } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Playground", href: "#playground" },
  { label: "Capabilities", href: "#capabilities" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPlayground = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.getElementById("playground");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
                <Bot className="w-5 h-5 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan to-accent-purple opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-500" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Bud<span className="text-accent-cyan">AI</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/70 uppercase tracking-wider">Beta</span>
            </a>

            <div className="hidden lg:flex items-center gap-2">
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
              <button
                onClick={scrollToPlayground}
                className="relative px-5 py-2.5 text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white transition-colors flex items-center gap-2"
              >
                Try BudAI
                <ArrowRight className="w-4 h-4 text-accent-cyan" />
              </button>
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
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={scrollToPlayground}
                className="mt-4 px-5 py-3 text-center font-semibold bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl text-white flex justify-center items-center gap-2"
              >
                Try BudAI <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
