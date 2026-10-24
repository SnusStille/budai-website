"use client";

import { LangProvider } from "@/components/ui/LanguageContext";
import CommandPalette from "@/components/ui/CommandPalette";
import { ToastProvider } from "@/components/ui/ToastStack";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import AuthHashHandler from "@/components/auth/AuthHashHandler";
import LoadingScreen from "@/components/effects/LoadingScreen";
import LenisScroll from "@/components/ui/LenisScroll";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>
        <ToastProvider>
          <AuthHashHandler />
          <LenisScroll />
          <LoadingScreen />
          {children}
          <CommandPalette />
          <AuthModal />
        </ToastProvider>
      </AuthProvider>
    </LangProvider>
  );
}
