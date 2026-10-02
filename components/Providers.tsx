"use client";

import { LangProvider } from "@/components/ui/LanguageContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import AuthHashHandler from "@/components/auth/AuthHashHandler";

/**
 * App shell providers.
 * No intro/loading screen: stilledev.se opens directly into the Playground.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>
        <AuthHashHandler />
        {children}
        <AuthModal />
      </AuthProvider>
    </LangProvider>
  );
}
