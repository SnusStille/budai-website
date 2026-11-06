"use client";

import { MotionConfig } from "framer-motion";
import { LangProvider } from "@/components/ui/LanguageContext";
import CommandPalette from "@/components/ui/CommandPalette";
import { ToastProvider } from "@/components/ui/ToastStack";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import AuthHashHandler from "@/components/auth/AuthHashHandler";
import type { Lang } from "@/lib/i18n";

export default function Providers({ children, initialLang }: { children: React.ReactNode; initialLang?: Lang }) {
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider initialLang={initialLang}>
        <AuthProvider>
          <ToastProvider>
            <AuthHashHandler />
            {children}
            <CommandPalette />
            <AuthModal />
          </ToastProvider>
        </AuthProvider>
      </LangProvider>
    </MotionConfig>
  );
}
