"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mail, Sparkles, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import LabsMascot from "@/components/sections/LabsMascot";
import { readCompanionHidden, setCompanionHidden, COMPANION_VISIBILITY_EVENT } from "@/lib/companion/preferences";

const INTERACTED = "budai:companion:interacted:v2";
const APPEARANCES = "budai:companion:appearances:v2";

/** A discreet, occasional edge peek with a short, useful navigation menu. */
export default function BuilderCompanion({ phone = false }: { phone?: boolean }) {
  const { lang } = useLang();
  const sv = lang === "sv";
  const launcherRef = useRef<HTMLButtonElement>(null);
  const companionRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [blocked, setBlocked] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [appearances, setAppearances] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      setInteracted(sessionStorage.getItem(INTERACTED) === "1");
      setAppearances(Math.min(2, Math.max(0, Number(sessionStorage.getItem(APPEARANCES)) || 0)));
    } catch { /* session storage is optional */ }
    setHidden(readCompanionHidden());
    const timer = window.setTimeout(() => setReady(true), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sync = (event: Event) => {
      const nextHidden = (event as CustomEvent<boolean>).detail;
      setHidden(nextHidden);
      if (!nextHidden) {
        setReady(true);
        setInteracted(true);
        try { sessionStorage.setItem(INTERACTED, "1"); } catch { /* optional */ }
      }
    };
    window.addEventListener(COMPANION_VISIBILITY_EVENT, sync);
    return () => window.removeEventListener(COMPANION_VISIBILITY_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!ready || hidden) return;
    let frame = 0;
    let playgroundVisible = false;
    let footerVisible = false;
    const hero = phone ? document.querySelector(".phone-hero") : document.getElementById("intelligence");
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = document.activeElement;
        const editing = active instanceof HTMLElement && (active.matches("input, textarea, select") || active.isContentEditable);
        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]')).some(el => el.getClientRects().length > 0 && !el.closest("[data-builder-companion]"));
        const intro = document.documentElement.dataset.budaiIntro;
        const introActive = intro === "preparing" || intro === "playing";
        const heroBounds = phone ? hero?.getBoundingClientRect() : undefined;
        const phoneHeroSafe = !phone || (!!heroBounds && heroBounds.top >= 48 && heroBounds.bottom > 280);
        setBlocked((phone ? !phoneHeroSafe : playgroundVisible) || footerVisible || dialogs || editing || introActive || document.hidden ||
          document.documentElement.classList.contains("budai-focus") || document.documentElement.dataset.pgKeyboard === "open" ||
          !!document.querySelector(".phone-welcome[inert]"));
      });
    };
    const zones = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target.id === "playground") playgroundVisible = entry.isIntersecting;
        else footerVisible = entry.isIntersecting;
      }
      update();
    }, { threshold: 0 });
    const playground = document.getElementById("playground");
    const footer = phone ? document.querySelector(".phone-footer") : document.getElementById("continuation");
    if (playground) zones.observe(playground);
    if (footer) zones.observe(footer);
    const heroObserver = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: .1 });
    if (hero) heroObserver.observe(hero);
    const mutations = new MutationObserver(update);
    mutations.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["role", "aria-modal", "inert"] });
    mutations.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-budai-intro", "data-pg-keyboard"] });
    document.addEventListener("focusin", update); document.addEventListener("focusout", update); document.addEventListener("visibilitychange", update);
    if (phone) window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame); zones.disconnect(); heroObserver.disconnect(); mutations.disconnect();
      document.removeEventListener("focusin", update); document.removeEventListener("focusout", update); document.removeEventListener("visibilitychange", update);
      if (phone) window.removeEventListener("scroll", update);
    };
  }, [ready, hidden, phone]);

  useEffect(() => { if (blocked) setOpen(false); }, [blocked]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      if (!companionRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!ready || hidden || blocked || !heroVisible || open || interacted || appearances >= 2 || reducedMotion) return;
    const delay = appearances === 0 ? 4200 + Math.random() * 1600 : 90000 + Math.random() * 30000;
    const timer = window.setTimeout(() => {
      setOpen(false);
      setAppearances(current => {
        const next = current + 1;
        try { sessionStorage.setItem(APPEARANCES, String(next)); } catch { /* optional */ }
        return next;
      });
      const container = launcherRef.current?.closest<HTMLElement>(".builder-companion-quiet");
      container?.classList.remove("is-peeking");
      requestAnimationFrame(() => container?.classList.add("is-peeking"));
      window.setTimeout(() => container?.classList.remove("is-peeking"), 3600);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [ready, hidden, blocked, heroVisible, open, interacted, appearances, reducedMotion]);

  const takeControl = () => {
    setInteracted(true);
    try { sessionStorage.setItem(INTERACTED, "1"); } catch { /* optional */ }
  };
  const toggle = () => { takeControl(); setOpen(value => !value); };
  const dismiss = () => {
    setCompanionHidden(true);
    setOpen(false);
    document.querySelector<HTMLElement>(phone ? ".phone-jump" : ".hero-actions a")?.focus({ preventScroll: true });
  };

  if (!ready || hidden || blocked || typeof document === "undefined") return null;
  const menu = [
    { label: sv ? "Prova Playground" : "Try the Playground", detail: sv ? "Skriv, planera och utforska" : "Write, plan, and explore", href: phone ? "#phone-chat" : "#playground", icon: Sparkles },
    { label: sv ? "Utforska BudAI" : "Explore BudAI", detail: sv ? "Se vad arbetsytan innehåller" : "See what the workspace offers", href: "#capabilities", icon: ArrowUpRight },
    { label: sv ? "Kontakta Stilledev" : "Contact Stilledev", detail: sv ? "Frågor och projektförfrågningar" : "Questions and project enquiries", href: sv ? "/sv/contact" : "/contact", icon: Mail },
  ];

  return createPortal(
    <aside ref={companionRef} className={`builder-companion builder-companion-quiet ${phone ? "is-phone" : ""} ${interacted ? "has-interacted" : ""}`} aria-label={sv ? "BudAI-robot" : "BudAI robot"} data-builder-companion onKeyDown={event => { if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); launcherRef.current?.focus({ preventScroll: true }); } }}>
      <AnimatePresence initial={false}>
        {open && <motion.div ref={menuRef} className="companion-note companion-note-quiet" id="companion-note" role="dialog" aria-modal="false" aria-labelledby="companion-note-title" aria-describedby="companion-note-description"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? .1 : .18 }}>
          <div className="companion-note-top">
            <span><i /><span id="companion-note-title">{sv ? "VÄLJ NÄSTA STEG" : "WHERE TO NEXT?"}</span></span>
            <button type="button" onClick={() => { setOpen(false); launcherRef.current?.focus({ preventScroll: true }); }} aria-label={sv ? "Stäng menyn" : "Close menu"}><X size={16} /></button>
          </div>
          <p id="companion-note-description" className="companion-note-description">{sv ? "En snabb väg till rätt plats." : "A quick way to the right place."}</p>
          <nav className="companion-quick-links" aria-label={sv ? "Snabblänkar" : "Quick links"}>
            {menu.map(({ label, detail, href, icon: Icon }) => <a key={href} href={href} onClick={takeControl}>
              <Icon size={17} aria-hidden="true" />
              <span className="companion-link-copy"><b>{label}</b><small>{detail}</small></span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>)}
          </nav>
          <div className="companion-bottom"><span>BUDAI / STILLEDEV</span><button type="button" onClick={dismiss}>{sv ? "Dölj roboten" : "Hide robot"}</button></div>
        </motion.div>}
      </AnimatePresence>
      <button ref={launcherRef} type="button" className="companion-launcher companion-launcher-quiet" onClick={toggle} aria-expanded={open} aria-controls={open ? "companion-note" : undefined} aria-label={open ? (sv ? "Stäng snabbmenyn" : "Close BudAI menu") : (sv ? "Öppna BudAI-menyn" : "Open BudAI menu")}>
        <span className="companion-orbit" aria-hidden="true" /><span className="companion-bot"><LabsMascot companion staticOnly /></span>
        <span className="companion-tag" aria-hidden="true"><i /> {sv ? "TRYCK HÄR" : "CLICK ME"}</span>
      </button>
    </aside>, document.body,
  );
}
