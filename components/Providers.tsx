"use client";

import { LangProvider } from "@/components/ui/LanguageContext";
import LoadingScreen from "@/components/effects/LoadingScreen";
import CommandPalette from "@/components/ui/CommandPalette";
import { ToastProvider } from "@/components/ui/ToastStack";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import AuthHashHandler from "@/components/auth/AuthHashHandler";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <LoadingScreen />
      <AuthProvider>
        <ToastProvider>
          <AuthHashHandler />
          {children}
          <CommandPalette />
          <AuthModal />
        </ToastProvider>
      </AuthProvider>
    </LangProvider>
  );
}
