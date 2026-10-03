"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

export default function SiteNav({
  variant = "marketing",
}: {
  variant?: "marketing" | "app";
}) {
  const { lang, setLang, t } = useLang();
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const compact = variant === "app";

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/playground", label: t.nav.playground, key: "playground" },
    { href: "/waitlist", label: t.nav.waitlist, key: "waitlist" },
    { href: "/about", label: t.nav.about, key: "about" },
  ];

  const isActive = (href: string) =>
    href === "/playground" ? path.startsWith("/playground") : path === href;

  const cta =
    path.startsWith("/playground") || path.startsWith("/about")
      ? { href: "/waitlist", label: t.nav.joinWaitlist, solid: false }
      : path.startsWith("/waitlist")
        ? { href: "/playground", label: t.nav.tryBudai, solid: true }
        : { href: "/playground", label: t.nav.tryBudai, solid: true };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-white/[0.06] ${
          compact
            ? "h-12 bg-[#09090b]/90 backdrop-blur-xl"
            : "h-14 bg-[#09090b]/80 backdrop-blur-xl"
        }`}
      >
        <div className="h-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group" aria-label="BudAI home">
            <BudAILogo size="sm" animated />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Bud<span className="text-accent-cyan">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5" aria-label="Primary">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  className={`relative px-3 py-1.5 text-[13px] rounded-lg transition-colors ${
                    active ? "text-white" : "text-white/45 hover:text-white"
                  } ${l.key === "playground" ? "font-medium" : ""}`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-px bg-accent-cyan/80" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center p-0.5 rounded-full bg-white/[0.04] border border-white/[0.07]"
              role="group"
              aria-label="Language"
            >
              {(["en", "sv"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  className={`min-w-[2.2rem] px-2 py-1 text-[10px] font-semibold tracking-wide rounded-full transition-colors ${
                    lang === code ? "bg-white text-zinc-950" : "text-white/45 hover:text-white"
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>

            <Link
              href={cta.href}
              className={`hidden sm:inline-flex items-center h-8 px-3.5 rounded-full text-[12px] font-semibold transition-colors ${
                cta.solid
                  ? "bg-white text-zinc-950 hover:bg-zinc-100"
                  : "border border-white/12 text-white/80 hover:text-white hover:border-white/25"
              }`}
            >
              {cta.label}
            </Link>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#09090b]/96 backdrop-blur-xl"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div className="relative pt-20 px-6 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  className={`px-4 py-3.5 text-lg rounded-xl ${
                    isActive(l.href) ? "text-white bg-white/[0.05]" : "text-white/70"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 px-4 mt-4">
                {(["en", "sv"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full ${
                      lang === code ? "bg-white text-zinc-950" : "text-white/45 border border-white/10"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
              <Link
                href={cta.href}
                className="mt-4 mx-4 h-11 rounded-full bg-white text-zinc-950 text-sm font-semibold flex items-center justify-center"
              >
                {cta.label}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
