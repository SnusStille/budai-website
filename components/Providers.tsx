"use client";

import { useCallback, useState } from "react";
import LoadingScreen from "@/components/effects/LoadingScreen";
import { LangProvider } from "@/components/ui/LanguageContext";
import CommandPalette from "@/components/ui/CommandPalette";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  // Stable callback — LoadingScreen must NOT re-run its effect every render
  // (inline () => setLoaded(true) was recreated each paint and could stall/restart).
  const handleLoaded = useCallback(() => setLoaded(true), []);

  return (
    <LangProvider>
      <LoadingScreen onComplete={handleLoaded} />
      <div
        className={loaded ? "opacity-100" : "opacity-0"}
        style={{
          transition: "opacity 0.4s ease",
          pointerEvents: loaded ? "auto" : "none",
        }}
        aria-hidden={!loaded}
      >
        {children}
      </div>
      <CommandPalette />
    </LangProvider>
  );
}
