"use client";

import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { LangProvider, useLang } from "@/components/ui/LanguageContext";
import { ToastProvider } from "@/components/ui/ToastStack";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import AuthHashHandler from "@/components/auth/AuthHashHandler";
import SitePalette from "@/components/ui/SitePalette";
import IntroScreen from "@/components/effects/IntroScreen";

function LocalizedSkipLink() {
  const { lang } = useLang();
  const pathname = usePathname();
  const onHome = pathname === "/";
  return (
    <a href={onHome ? "#playground" : "#main-content"} className="skip-link">
      {lang === "sv" ? "Hoppa till innehållet" : "Skip to content"}
    </a>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <LocalizedSkipLink />
        <AuthProvider>
          <ToastProvider>
            <AuthHashHandler />
            <IntroScreen />
            {children}
            <AuthModal />
            <SitePalette />
          </ToastProvider>
        </AuthProvider>
      </LangProvider>
    </MotionConfig>
  );
}
