"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Compass, Eye, FlaskConical, Hand, Layers3, Lightbulb, Mail, X } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";
import { useLang } from "@/components/ui/LanguageContext";
import LabsMascot, { type MascotGesture } from "@/components/sections/LabsMascot";
import { readCompanionHidden, setCompanionHidden, COMPANION_VISIBILITY_EVENT } from "@/lib/companion/preferences";

// The lightweight fallback is ready immediately; LabsMascot loads Three.js only when needed.
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
    "One eye on the details.",
    "Hi! Ready when you are.",
  ],
  sv: [
    "Nämen, titta vem som hittade hit.",
    "Think it. Build it. BudAI.",
    "Jag säger inte att jag kan allt ... men har du provat att fråga?",
    "Mindre scrollande. Mer skapande.",
    "Din nästa idé kan vara din bästa.",
    "Något spännande gror i Labs. Vi bygger fortfarande, dock.",
    "Ett öga på detaljerna.",
    "Hej! Jag är redo när du är det.",
  ],
};

const starters = [
  { en: "Plan my week", sv: "Planera min vecka", enPrompt: "Help me plan my week. Ask me about my priorities first.", svPrompt: "Hjälp mig planera min vecka. Fråga först om mina prioriteringar." },
  { en: "Write a message", sv: "Skriv ett meddelande", enPrompt: "Help me write a clear, friendly message. Ask me what it should say.", svPrompt: "Hjälp mig skriva ett tydligt och vänligt meddelande. Fråga vad det ska handla om." },
  { en: "Untangle an idea", sv: "Red ut en idé", enPrompt: "Help me turn a rough idea into clear next steps. Ask me to describe it first.", svPrompt: "Hjälp mig göra en lös idé till tydliga nästa steg. Be mig beskriva den först." },
] as const;

const companionModes = [
  { icon: Compass, en: "Discover", sv: "Upptäck", eyebrowEn: "THE STILLEDEV WORLD", eyebrowSv: "STILLEDEVS VÄRLD", textEn: "Meet BudAI: a Swedish-built workspace for turning everyday work into clear next steps.", textSv: "Möt BudAI: en svenskbyggd arbetsyta som gör vardagsarbete till tydliga nästa steg.", href: "#intelligence", ctaEn: "Start exploring", ctaSv: "Börja utforska", emote: "hello" as const },
  { icon: Layers3, en: "What I build", sv: "Det jag bygger", eyebrowEn: "PRODUCT CAPABILITIES", eyebrowSv: "PRODUKTENS FÖRMÅGOR", textEn: "Explore the real capabilities and see how the Builder brings ideas into a working flow.", textSv: "Utforska de faktiska förmågorna och se hur Builder för idéer vidare till ett arbetsflöde.", href: "#capabilities", ctaEn: "Explore capabilities", ctaSv: "Utforska förmågor", emote: "think" as const },
  { icon: FlaskConical, en: "Stilledev Labs", sv: "Stilledev Labs", eyebrowEn: "EXPERIMENTS IN PROGRESS", eyebrowSv: "EXPERIMENT PÅGÅR", textEn: "A peek at the studio’s evolving experiments. Labs is still under development.", textSv: "En glimt av studions experiment under utveckling. Labs är fortfarande under arbete.", href: "labs", ctaEn: "Visit Labs", ctaSv: "Besök Labs", emote: "celebrate" as const },
  { icon: Mail, en: "Let's collaborate", sv: "Samarbeta", eyebrowEn: "A HUMAN NEXT STEP", eyebrowSv: "NÄSTA STEG TILLSAMMANS", textEn: `Have a thoughtful idea or a question? Write directly to ${CONTACT_EMAIL}.`, textSv: `Har du en genomtänkt idé eller fråga? Skriv direkt till ${CONTACT_EMAIL}.`, href: CONTACT_MAILTO, ctaEn: "Write to Stilledev", ctaSv: "Skriv till Stilledev", emote: "wink" as const },
] as const;

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
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [modeIndex, setModeIndex] = useState(0);
  const [automatic, setAutomatic] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [appearances, setAppearances] = useState(0);
  const [message, setMessage] = useState(0);
  const [gesture, setGesture] = useState<MascotGesture | null>(null);
  const [manualGesture, setManualGesture] = useState(false);
  const [announcedMessage, setAnnouncedMessage] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setReducedMotion(media.matches); if (media.matches) setGesture(null); };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setHidden(readCompanionHidden());
    setInteracted(readSession(INTERACTED) === "1");
    setAppearances(Math.min(2, Math.max(0, Number(readSession(APPEARANCES)) || 0)));
    // Avoid competing with the intro, consent and the first moments of a visit.
    const timer = window.setTimeout(() => setReady(true), 7000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sync = (event: Event) => {
      const nextHidden = (event as CustomEvent<boolean>).detail;
      setHidden(nextHidden);
      if (!nextHidden) {
        setReady(true);
        setInteracted(true);
        writeSession(INTERACTED, "1");
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
        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]'))
          .some(el => el.getClientRects().length > 0);
        const intro = document.documentElement.dataset.budaiIntro;
        const introActive = intro === "preparing" || intro === "playing";
        // On phones the companion sits in the hero's clear upper-right space;
        // it leaves before that space scrolls into the actual Playground.
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

  // Do not reopen a stale bubble after a dialog, scroll into the Playground,
  // background tab, or focus mode. The visitor can always open it again.
  useEffect(() => {
    if (blocked) { setOpen(false); setAutomatic(false); setIdeasOpen(false); }
  }, [blocked]);

  useEffect(() => {
    if (phone || !ready || hidden || blocked || !heroVisible || open || interacted || appearances >= 2 || reducedMotion) return;
    const delay = appearances === 0 ? 5000 + Math.random() * 3000 : 120000 + Math.random() * 60000;
    const timer = window.setTimeout(() => {
      setMessage(Math.floor(Math.random() * (messages.en.length - 2)));
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
      setManualGesture(false);
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
  const toggle = () => { takeControl(); setOpen(current => { if (!current) setModeIndex(0); return !current; }); };
  const chooseMode = (index: number) => {
    if (index < 0 || index >= companionModes.length) return;
    takeControl(); setModeIndex(index); setIdeasOpen(false); setManualGesture(false);
    if (!reducedMotion) setGesture({ id: ++gestureSequence.current, kind: companionModes[index].emote });
  };
  const stepMode = (direction: -1 | 1) => chooseMode(modeIndex + direction);
  const sayHello = () => {
    takeControl(); setMessage(messages.en.length - 1); setAnnouncedMessage(messages.en.length - 1); setManualGesture(true);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setGesture({ id: ++gestureSequence.current, kind: "hello" });
  };
  const wink = () => {
    takeControl(); setMessage(messages.en.length - 2); setAnnouncedMessage(messages.en.length - 2); setManualGesture(true);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setGesture({ id: ++gestureSequence.current, kind: "wink" });
  };
  const minimize = () => { takeControl(); setOpen(false); setIdeasOpen(false); launcherRef.current?.focus({ preventScroll: true }); };
  const startIdea = (prompt: string) => {
    takeControl();
    const accepted = window.dispatchEvent(new CustomEvent("budai:prompt", { detail: prompt, cancelable: true }));
    // Playground protects an existing draft. A rejected replacement leaves us here.
    if (!accepted) return;
    setOpen(false); setIdeasOpen(false);
    document.getElementById(phone ? "phone-chat" : "playground")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };
  const dismiss = () => {
    setCompanionHidden(true); setOpen(false); setIdeasOpen(false);
    document.querySelector<HTMLElement>(phone ? ".phone-jump" : ".hero-actions a")?.focus({ preventScroll: true });
  };
  const currentMode = companionModes[modeIndex];
  const modeHref = currentMode.href === "labs" ? (sv ? "/sv/labs" : "/labs") : currentMode.href;
  if (!ready || hidden || blocked || typeof document === "undefined") return null;

  return createPortal(
    <aside className={`builder-companion ${phone ? "is-phone" : ""}`} aria-label={sv ? "BudAI-kompanjon" : "BudAI companion"} data-builder-companion onKeyDown={event => { if (event.key === "Escape" && open) { event.stopPropagation(); minimize(); } }}>
      <AnimatePresence initial={false}>
      {open && <motion.div
        className="companion-note" id="companion-note" onPointerEnter={takeControl} onFocus={takeControl}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="companion-note-top"><span><i /> {sv ? "DIN DIGITALA GUIDE" : "YOUR DIGITAL GUIDE"}</span><button type="button" onClick={minimize} aria-label={sv ? "Minimera BudAI" : "Minimize BudAI"}><X size={16} /></button></div>
        <section className="companion-mode-panel" data-mode={modeIndex} aria-live="polite" aria-atomic="true">
          <div className="companion-mode-meta"><span>{String(modeIndex + 1).padStart(2, "0")} / {String(companionModes.length).padStart(2, "0")}</span><span>{sv ? currentMode.eyebrowSv : currentMode.eyebrowEn}</span></div>
          <div className="companion-mode-heading"><currentMode.icon size={17} aria-hidden="true" /><h3>{sv ? currentMode.sv : currentMode.en}</h3></div>
          <p>{sv ? currentMode.textSv : currentMode.textEn}</p>
          <a href={modeHref} className="companion-mode-action" onClick={() => { takeControl(); setOpen(false); }}>{sv ? currentMode.ctaSv : currentMode.ctaEn}<ArrowUpRight size={14} aria-hidden="true" /></a>
          <div className="companion-mode-controls">
            <button type="button" onClick={() => stepMode(-1)} disabled={modeIndex === 0} aria-label={sv ? "Föregående läge" : "Previous mode"}><ArrowLeft size={14} aria-hidden="true" />{sv ? "Tillbaka" : "Back"}</button>
            <div role="group" aria-label={sv ? "Välj ett läge" : "Choose a mode"} className="companion-mode-dots">
              {companionModes.map((item, index) => <button type="button" key={item.en} aria-label={sv ? item.sv : item.en} aria-pressed={index === modeIndex} onClick={() => chooseMode(index)} />)}
            </div>
            <button type="button" onClick={() => stepMode(1)} disabled={modeIndex === companionModes.length - 1} aria-label={sv ? "Nästa läge" : "Next mode"}>{sv ? "Nästa" : "Next"}<ArrowRight size={14} aria-hidden="true" /></button>
          </div>
        </section>
        <p className="companion-message">{messages[lang][message]}</p>
        <div className="companion-signature">Think it. Build it. <b>BudAI.</b></div>
        <a href={phone ? "#phone-chat" : "#playground"} className="companion-action" onClick={() => { takeControl(); setOpen(false); }}>{sv ? "Öppna Playground" : "Enter Playground"}<ArrowUpRight size={15} aria-hidden="true" /></a>
        <button type="button" className="companion-ideas-toggle" aria-expanded={ideasOpen} aria-controls={ideasOpen ? "companion-ideas" : undefined} onClick={() => { takeControl(); setIdeasOpen(current => !current); }}><Lightbulb size={14} aria-hidden="true" />{sv ? "Ge mig en start" : "Give me a starting point"}<ChevronRight className={ideasOpen ? "is-open" : ""} size={14} aria-hidden="true" /></button>
        {ideasOpen && <div id="companion-ideas" className="companion-ideas">
          <p>{sv ? "Öppnas som ett redigerbart utkast. Inget skickas automatiskt." : "Opens as an editable draft. Nothing is sent automatically."}</p>
          {starters.map(idea => <button type="button" key={idea.en} onClick={() => startIdea(sv ? idea.svPrompt : idea.enPrompt)}>{sv ? idea.sv : idea.en}<ArrowUpRight size={13} aria-hidden="true" /></button>)}
        </div>}
        <div className="companion-interactions">
          <button type="button" onClick={sayHello}><Hand size={14} aria-hidden="true" />{sv ? "Säg hej" : "Say hi"}</button>
          <button type="button" onClick={wink}><Eye size={14} aria-hidden="true" />{sv ? "Blinka" : "Wink"}</button>
          <button type="button" aria-label={sv ? "En tanke till" : "Another thought"} onClick={() => { takeControl(); setAnnouncedMessage(null); setMessage(current => (current + 1) % messages.en.length); }}>{sv ? "Nästa" : "Next"}<ChevronRight size={13} aria-hidden="true" /></button>
        </div>
        <div className="companion-bottom"><span>BUDAI / STILLEDEV</span><button type="button" onClick={dismiss}>{sv ? "Dölj för besöket" : "Hide for this visit"}</button></div>
        <span className="sr-only" role="status">{announcedMessage !== null ? messages[lang][announcedMessage] : ""}</span>
      </motion.div>}
      </AnimatePresence>
      <button ref={launcherRef} type="button" className="companion-launcher" onClick={toggle} aria-expanded={open} aria-controls={open ? "companion-note" : undefined} aria-label={open ? (sv ? "Minimera BudAI-kompanjonen" : "Minimize BudAI companion") : (sv ? "Möt BudAI-kompanjonen" : "Meet the BudAI companion")}>
        <span className="companion-orbit" aria-hidden="true" /><span className="companion-bot"><LabsMascot companion gesture={gesture} /></span>
        {manualGesture && gesture?.kind === "hello" && <span key={gesture.id} className="companion-hello" aria-hidden="true">{sv ? "HEJ!" : "HI!"} <span>✳</span></span>}
        <span className="companion-tag" aria-hidden="true"><i /> BUDAI <span> / {sv ? "SÄG HEJ" : "SAY HI"}</span></span>
      </button>
    </aside>, document.body,
  );
}
