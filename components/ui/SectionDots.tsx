"use client";

import { useEffect, useState } from "react";
import { CHAPTERS, type ChapterId } from "@/lib/experience/timeline";
import { subscribeJourney } from "@/lib/experience/scroll";
import { useLang } from "./LanguageContext";

export default function SectionDots() {
  const [active, setActive] = useState<ChapterId>("intelligence");
  const [visible, setVisible] = useState(false);
  const { lang } = useLang();
  useEffect(() => subscribeJourney((frame) => { setActive(frame.active); setVisible(frame.y > frame.height * .55); }), []);
  return (
    <nav className={`chapter-rail ${visible ? "is-visible" : ""}`} aria-label={lang === "sv" ? "Kapitelnavigering" : "Chapter navigation"}>
      {CHAPTERS.slice(1).map((chapter) => <a href={`#${chapter.id}`} key={chapter.id} aria-label={`Go to ${chapter.label}`} aria-current={active === chapter.id ? "location" : undefined}><span>{chapter.label}</span><b>{chapter.number}</b><i /></a>)}
    </nav>
  );
}
