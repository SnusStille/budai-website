"use client";

import { MotionConfig } from "framer-motion";
import { LangProvider, useLang } from "@/components/ui/LanguageContext";
import { ToastProvider } from "@/components/ui/ToastStack";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import AuthHashHandler from "@/components/auth/AuthHashHandler";

function LocalizedSkipLink() {
  const { lang } = useLang();
  return (
    <a href="#playground" className="skip-link">
      {lang === "sv" ? "Hoppa till Playground" : "Skip to the Playground"}
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
            {children}
            <AuthModal />
          </ToastProvider>
        </AuthProvider>
      </LangProvider>
    </MotionConfig>
  );
}
