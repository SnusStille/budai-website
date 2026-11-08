"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronRight, Hand, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import type { MascotGesture } from "@/components/sections/LabsMascot";

// Only load the shared Labs robot after the visitor has had a quiet arrival.
const LabsMascot = dynamic(() => import("@/components/sections/LabsMascot"), { ssr: false });
const HIDDEN = "budai:companion:hidden:v1";
const APPEARANCES = "budai:companion:appearances:v1";
const INTERACTED = "budai:companion:interacted:v1";
const messages = {
  en: [
    "Well, look who found us.",
    "Think it. Build it. BudAI.",
    "I'm not saying I can do everything... but have you tried asking?",
    "Less scrolling. More creating.",
    "Your next idea might be your best one.",
    "Something interesting is brewing in Labs. Still building, though.",
    "Hi! Ready when you are.",
  ],
  sv: [
    "Nämen, titta vem som hittade hit.",
    "Think it. Build it. BudAI.",
    "Jag säger inte att jag kan allt ... men har du provat att fråga?",
    "Mindre scrollande. Mer skapande.",
    "Din nästa idé kan vara din bästa.",
    "Något spännande gror i Labs. Vi bygger fortfarande, dock.",
    "Hej! Jag är redo när du är det.",
  ],
};

function readSession(key: string) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function writeSession(key: string, value: string) {
  try { sessionStorage.setItem(key, value); } catch { /* The controls still work in this page. */ }
}

/** A quiet companion, not a chat window. Never sits over the working Playground. */
export default function BuilderCompanion({ phone = false }: { phone?: boolean }) {
  const { lang } = useLang();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const gestureSequence = useRef(0);
  const automaticSequence = useRef(0);
  const sv = lang === "sv";
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [blocked, setBlocked] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [automatic, setAutomatic] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [appearances, setAppearances] = useState(0);
  const [message, setMessage] = useState(0);
  const [gesture, setGesture] = useState<MascotGesture | null>(null);
  const [greetingAnnouncement, setGreetingAnnouncement] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setReducedMotion(media.matches); if (media.matches) setGesture(null); };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setHidden(readSession(HIDDEN) === "1");
    setInteracted(readSession(INTERACTED) === "1");
    setAppearances(Math.min(2, Math.max(0, Number(readSession(APPEARANCES)) || 0)));
    // Avoid competing with the intro, consent and the first moments of a visit.
    const timer = window.setTimeout(() => setReady(true), 7000);
    return () => window.clearTimeout(timer);
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
        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]'))
          .some(el => el.getClientRects().length > 0);
        const intro = document.documentElement.dataset.budaiIntro;
        const introActive = intro === "preparing" || intro === "playing";
        // On phones the companion sits in the hero's clear upper-right space;
        // it leaves before that space scrolls into the actual Playground.
        const phoneHeroSafe = !phone || (!!hero && hero.getBoundingClientRect().bottom > 280);
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

  useEffect(() => {
    if (phone || !ready || hidden || blocked || !heroVisible || open || interacted || appearances >= 2 || reducedMotion) return;
    const delay = appearances === 0 ? 5000 + Math.random() * 3000 : 120000 + Math.random() * 60000;
    const timer = window.setTimeout(() => {
      setMessage(Math.floor(Math.random() * messages.en.length));
      setAutomatic(true); setOpen(true);
      setAppearances(current => { const next = current + 1; writeSession(APPEARANCES, String(next)); return next; });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [ready, hidden, blocked, heroVisible, open, interacted, appearances, phone, reducedMotion]);

  useEffect(() => {
    if (!open || !automatic || blocked) return;
    const timer = window.setTimeout(() => { setOpen(false); setAutomatic(false); }, 11000);
    return () => window.clearTimeout(timer);
  }, [open, automatic, blocked]);

  // A tiny non-verbal hello about every 30 seconds, only while the companion is
  // actually available. It does not open a bubble, make sound or steal focus.
  useEffect(() => {
    if (!ready || hidden || blocked || reducedMotion) return;
    const timer = window.setInterval(() => {
      automaticSequence.current += 1;
      setGesture({ id: ++gestureSequence.current, kind: automaticSequence.current % 2 ? "hello" : "wink" });
    }, 30000);
    return () => window.clearInterval(timer);
  }, [ready, hidden, blocked, reducedMotion]);
  useEffect(() => {
    if (!gesture) return;
    const timer = window.setTimeout(() => setGesture(null), 2700);
    return () => window.clearTimeout(timer);
  }, [gesture]);

  const takeControl = () => { setInteracted(true); setAutomatic(false); writeSession(INTERACTED, "1"); };
  const toggle = () => { takeControl(); setOpen(current => !current); };
  const sayHello = () => {
    takeControl(); setMessage(messages.en.length - 1); setGreetingAnnouncement(true);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setGesture({ id: ++gestureSequence.current, kind: "hello" });
  };
  const minimize = () => { takeControl(); setOpen(false); launcherRef.current?.focus({ preventScroll: true }); };
  const dismiss = () => {
    writeSession(HIDDEN, "1"); setHidden(true); setOpen(false);
    document.querySelector<HTMLElement>(phone ? ".phone-jump" : ".hero-actions a")?.focus({ preventScroll: true });
  };
  if (!ready || hidden || blocked || typeof document === "undefined") return null;

  return createPortal(
    <aside className={`builder-companion ${phone ? "is-phone" : ""}`} aria-label={sv ? "BudAI-kompanjon" : "BudAI companion"} data-builder-companion onKeyDown={event => { if (event.key === "Escape" && open) { event.stopPropagation(); minimize(); } }}>
      {open && <div className="companion-note" id="companion-note" onPointerEnter={takeControl} onFocus={takeControl}>
        <div className="companion-note-top"><span><i /> {sv ? "EN LITEN TANKE" : "A LITTLE THOUGHT"}</span><button type="button" onClick={minimize} aria-label={sv ? "Minimera BudAI" : "Minimize BudAI"}><X size={16} /></button></div>
        <p className="companion-message">{messages[lang][message]}</p>
        <div className="companion-signature">Think it. Build it. <b>BudAI.</b></div>
        <a href="#playground" className="companion-action" onClick={() => { takeControl(); setOpen(false); }}>{sv ? "Öppna Playground" : "Enter Playground"}<ArrowUpRight size={15} aria-hidden="true" /></a>
        <div className="companion-interactions">
          <button type="button" onClick={sayHello}><Hand size={14} aria-hidden="true" />{sv ? "Säg hej" : "Say hi"}</button>
          <button type="button" onClick={() => { takeControl(); setGreetingAnnouncement(false); setMessage(current => (current + 1) % messages.en.length); }}>{sv ? "En tanke till" : "Another thought"}<ChevronRight size={13} aria-hidden="true" /></button>
        </div>
        <div className="companion-bottom"><span>BUDAI / STILLEDEV</span><button type="button" onClick={dismiss}>{sv ? "Dölj för besöket" : "Hide for this visit"}</button></div>
        <span className="sr-only" role="status">{greetingAnnouncement ? messages[lang][messages.en.length - 1] : ""}</span>
      </div>}
      <button ref={launcherRef} type="button" className="companion-launcher" onClick={toggle} aria-expanded={open} aria-controls={open ? "companion-note" : undefined} aria-label={open ? (sv ? "Minimera BudAI-kompanjonen" : "Minimize BudAI companion") : (sv ? "Möt BudAI-kompanjonen" : "Meet the BudAI companion")}>
        <span className="companion-orbit" aria-hidden="true" /><span className="companion-bot"><LabsMascot companion gesture={gesture} /></span>
        {gesture?.kind === "hello" && <span className="companion-hello" aria-hidden="true">{sv ? "HEJ!" : "HI!"} <span>✳</span></span>}
        <span className="companion-tag" aria-hidden="true"><i /> BUDAI <span> / {sv ? "SÄG HEJ" : "SAY HI"}</span></span>
      </button>
    </aside>, document.body,
  );
}
