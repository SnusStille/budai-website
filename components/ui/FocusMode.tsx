"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import { useToast } from "@/components/ui/ToastStack";

/**
 * Press F (outside inputs) to dim chrome.
 * Status via stacked toast — same corner as other notices.
 */
export default function FocusMode() {
  const { lang } = useLang();
  const { push } = useToast();
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable)
        return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setOn((v) => {
          const next = !v;
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
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("budai-focus");
    };
  }, [lang, push]);

  // silence unused if needed
  void on;
  return null;
}
