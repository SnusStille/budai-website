"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { LangProvider } from "@/components/ui/LanguageContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthHashHandler from "@/components/auth/AuthHashHandler";
import AuthModal from "@/components/auth/AuthModal";
import { ToastProvider } from "@/components/ui/ToastStack";
import CookieConsent from "@/components/ui/CookieConsent";
import type { Lang } from "@/lib/i18n";

/** The phone gets the real product providers, without the desktop loading journey or navigation. */
export default function MobileProviders({ children, initialLang }: { children: ReactNode; initialLang: Lang }) {
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider initialLang={initialLang}>
        <AuthProvider>
          <ToastProvider>
            <AuthHashHandler />
            {children}
            <CookieConsent forceDocumentNavigation />
            <AuthModal />
          </ToastProvider>
        </AuthProvider>
      </LangProvider>
    </MotionConfig>
  );
}
