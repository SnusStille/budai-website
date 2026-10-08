"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import { useToast } from "@/components/ui/ToastStack";

/**
 * Press F (outside inputs) to dim chrome.
 * Status via stacked toast — same corner as other notices.
 */
export default function FocusMode() {
  const { lang } = useLang();
  const { push } = useToast();
  const on = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Never hijack keys with modifiers, held keys, or typing in a field.
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      if (e.key !== "f" && e.key !== "F") return;
      if (window.getSelection()?.toString()) return;
      e.preventDefault();
      const next = !on.current;
      on.current = next;
      document.documentElement.classList.toggle("budai-focus", next);
      push({
        icon: "info",
        title: next
          ? lang === "sv"
            ? "Fokusläge på"
            : "Focus mode on"
          : lang === "sv"
            ? "Fokusläge av"
            : "Focus mode off",
        body: next
          ? lang === "sv"
            ? "Chrome nedtonad. Tryck F igen."
            : "Chrome dimmed. Press F again."
          : undefined,
        duration: 2800,
      });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("budai-focus");
    };
  }, [lang, push]);

  return null;
}
