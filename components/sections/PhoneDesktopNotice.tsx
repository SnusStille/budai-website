"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Monitor, Sparkles } from "lucide-react";
import LabsMascot from "@/components/sections/LabsMascot";

/** An acknowledgement, not an access restriction: Playground remains usable on phones. */
export default function PhoneDesktopNotice({ sv, changeLanguage, onConfirm }: {
  sv: boolean;
  changeLanguage: (language: "sv" | "en") => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirm.current?.focus({ preventScroll: true });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialog.current) return;
      const controls = Array.from(dialog.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    };
    const keepFocus = (event: FocusEvent) => {
      if (dialog.current && !dialog.current.contains(event.target as Node)) confirm.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", trap);
    document.addEventListener("focusin", keepFocus);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", trap);
      document.removeEventListener("focusin", keepFocus);
    };
  }, []);

  return (
    <div className="desktop-notice-overlay">
      <div ref={dialog} className="desktop-notice" role="dialog" aria-modal="true" aria-labelledby="desktop-notice-title" aria-describedby="desktop-notice-description">
        <div className="desktop-notice-top">
          <span>STILLEDEV <i /> {sv ? "EN LITEN NOTIS" : "A LITTLE HEADS-UP"}</span>
          <div className="phone-languages" role="group" aria-label={sv ? "Välj språk" : "Choose language"}>
            <button type="button" onClick={() => changeLanguage("sv")} aria-pressed={sv}>SV</button>
            <button type="button" onClick={() => changeLanguage("en")} aria-pressed={!sv}>EN</button>
          </div>
        </div>
        <div className="desktop-notice-art" aria-hidden="true">
          <div className="desktop-notice-orbit orbit-one" /><div className="desktop-notice-orbit orbit-two" />
          <div className="desktop-notice-screen"><Monitor size={42} strokeWidth={1.15} /><Sparkles size={15} className="desktop-notice-spark" /></div>
          <div className="desktop-notice-mascot"><LabsMascot staticOnly /></div>
          <span className="desktop-notice-coordinate">01 / BIGGER PICTURE</span>
        </div>
        <div className="desktop-notice-body">
          <p className="desktop-notice-kicker">{sv ? "DET FINNS MER ATT SE" : "THERE'S MORE TO SEE"}</p>
          <h2 id="desktop-notice-title">{sv ? <>Du missar <em>helheten.</em></> : <>You&apos;re missing the <em>bigger picture.</em></>}</h2>
          <p id="desktop-notice-description">{sv ? "Stilledev upplevs bäst på dator. Hela sajten behöver en större skärm – men Playground kan du använda här på mobilen." : "Stilledev is best experienced on desktop. The full site needs a bigger screen – but you can still use Playground right here on your phone."}</p>
          <div className="desktop-notice-card">
            <div><span>{sv ? "DATORUPPLEVELSE" : "DESKTOP EXPERIENCE"}</span><strong>{sv ? "Rekommenderas" : "Recommended"}</strong></div>
            <p><b>100%</b> {sv ? "av sajten tillgänglig" : "of the site available"}</p>
            <small>Labs · Builder · Playground <span>✳</span></small>
            <small className="desktop-notice-labs">{sv ? "Labs är under utveckling" : "Labs is under development"}</small>
          </div>
          <button ref={confirm} className="desktop-notice-confirm" type="button" onClick={onConfirm}>{sv ? "Jag förstår, fortsätt" : "I understand, continue"}<ArrowRight size={18} aria-hidden="true" /></button>
          <p className="desktop-notice-after">{sv ? "PLAYGROUND ÄR REDO PÅ MOBILEN" : "PLAYGROUND IS READY ON MOBILE"} <span>↗</span></p>
        </div>
      </div>
    </div>
  );
}
