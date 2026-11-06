"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Command, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";

const LINKS = [
  { id: "budai", en: "BudAI", sv: "BudAI", href: "/budai" },
  { id: "labs", en: "Labs", sv: "Lab", href: "/labs" },
  { id: "changelog", en: "What’s new", sv: "Vad är nytt", href: "/changelog" },
  { id: "roadmap", en: "Roadmap", sv: "Roadmap", href: "/roadmap" },
  { id: "knowledge", en: "Knowledge", sv: "Kunskap", href: "/knowledge" },
  { id: "about", en: "About", sv: "Om oss", href: "/about" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [busy, setBusy] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onBusy = (event: Event) => setBusy(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("budai:busy", onBusy);
    return () => window.removeEventListener("budai:busy", onBusy);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const toggleButton = toggle.current;
    const first = menu.current?.querySelector<HTMLElement>("a[href]");
    first?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = [
        toggleButton,
        ...Array.from(menu.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []),
      ].filter((item): item is HTMLElement => Boolean(item));
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem?.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1100px)");
    const onDesktop = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      toggleButton?.focus({ preventScroll: true });
    };
  }, [open]);

  const languageSwitcher = (mobile = false) => (
    <div className={`v2-language ${mobile ? "v2-language-mobile" : ""}`} role="group" aria-label={sv ? "Språk" : "Language"}>
      {(["en", "sv"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={lang === code ? "is-active" : ""}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <header className={`site-navigation v2-nav ${scrolled || open ? "is-scrolled" : ""}`}>
        <div className="v2-nav-inner">
          <Link
            href="/"
            className="v2-brand"
            aria-label="Stilledev home"
            data-budai-logo
            onClick={(event) => window.dispatchEvent(new CustomEvent("budai:logo-click", { detail: { el: event.currentTarget } }))}
          >
            <StilledevMark size={27} />
            <span>STILLEDEV</span>
            <i aria-hidden="true" />
            <small>{sv ? "PROGRAMVARA & AI" : "SOFTWARE & AI"}</small>
          </Link>

          <nav className="v2-nav-links" aria-label={sv ? "Huvudnavigation" : "Main navigation"}>
            {LINKS.map((link) => {
              const active = pathname === link.href || (link.href === "/budai" && (pathname === "/" || pathname === "/sv"));
              return (
                <Link key={link.id} href={link.href} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>
                  {sv ? link.sv : link.en}
                </Link>
              );
            })}
          </nav>

          <div className="v2-nav-actions">
            {languageSwitcher()}
            <button
              type="button"
              className="v2-command"
              aria-label={sv ? "Öppna kommandopalett" : "Open command palette"}
              title={sv ? "Kommandopalett (⌘K)" : "Command palette (⌘K)"}
              onClick={() => window.dispatchEvent(new Event("budai:command-palette"))}
            >
              <Command size={13} aria-hidden="true" /><span>K</span>
            </button>
            <Link href="/#playground" className="v2-nav-cta">
              <BudAILogo size="xs" animated mode={busy ? "thinking" : "idle"} />
              <span>{sv ? "Prova BudAI" : "Try BudAI"}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="v2-nav-mobile-actions">
            {languageSwitcher(true)}
            <Link href="/#playground" className="v2-mobile-try">{sv ? "Prova" : "Try"}</Link>
            <button
              ref={toggle}
              type="button"
              className="v2-menu-toggle"
              aria-label={open ? (sv ? "Stäng meny" : "Close menu") : (sv ? "Öppna meny" : "Open menu")}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="v2-mobile-menu" id="mobile-navigation" ref={menu} role="navigation" aria-label={sv ? "Mobilnavigation" : "Mobile navigation"}>
          <div className="v2-mobile-menu-inner">
            <p>{sv ? "UTFORSKA STILLEDEV" : "EXPLORE STILLEDEV"}</p>
            {LINKS.map((link, index) => {
              const active = pathname === link.href || (link.href === "/budai" && (pathname === "/" || pathname === "/sv"));
              return (
                <Link key={link.id} href={link.href} className={active ? "is-active" : ""} onClick={() => setOpen(false)}>
                  <span>0{index + 1}</span>{sv ? link.sv : link.en}<ArrowUpRight size={18} />
                </Link>
              );
            })}
            <div className="v2-mobile-menu-bottom">
              <button type="button" onClick={() => { setOpen(false); window.dispatchEvent(new Event("budai:command-palette")); }}>
                <Command size={15} />{sv ? "Kommandopalett" : "Command palette"}<kbd>⌘K</kbd>
              </button>
              <a href="mailto:Stilleinc@hotmail.com">Stilleinc@hotmail.com<ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
