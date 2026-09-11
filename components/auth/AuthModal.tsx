"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLang } from "@/components/ui/LanguageContext";
import { LIMITS } from "@/lib/limits";

export default function AuthModal() {
  const {
    authOpen,
    closeAuth,
    authReason,
    signInWithGoogle,
    signInWithEmail,
    configured,
    authFlash,
    clearAuthFlash,
  } = useAuth();
  const { lang } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!authOpen) {
      setSent(false);
      setErr(null);
      setBusy(false);
    }
  }, [authOpen]);

  useEffect(() => {
    if (authFlash && authFlash !== "signed-in" && authOpen) {
      setErr(authFlash);
    }
  }, [authFlash, authOpen]);

  const onGoogle = async () => {
    setBusy(true);
    setErr(null);
    const r = await signInWithGoogle();
    if (r.error) {
      setErr(r.error);
      setBusy(false);
    }
    // OAuth redirects away — keep busy if no error
  };

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setBusy(true);
    setErr(null);
    const r = await signInWithEmail(email);
    setBusy(false);
    if (r.error) setErr(r.error);
    else setSent(true);
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            aria-label="Close"
            onClick={() => {
              clearAuthFlash();
              closeAuth();
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/[0.1] bg-[#0a0a12] p-6 sm:p-8 shadow-[0_0_80px_rgba(0,229,255,0.12)] max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={() => {
                clearAuthFlash();
                closeAuth();
              }}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-5">
              <BudAILogo size="lg" animated />
            </div>
            <h2 className="text-xl font-bold text-white text-center tracking-tight mb-1">
              {lang === "sv" ? "Din BudAI" : "Your BudAI"}
            </h2>
            <p className="text-sm text-muted text-center mb-5 leading-relaxed">
              {authReason ||
                (lang === "sv"
                  ? "Logga in för minne, historik, bilder och högre gränser."
                  : "Sign in for memory, history, images, and higher limits.")}
            </p>

            {!configured && (
              <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {lang === "sv"
                  ? "Auth är inte konfigurerad (Supabase URL/key saknas)."
                  : "Auth is not configured (missing Supabase URL/key)."}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-5 text-[11px]">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                <div className="text-muted mb-1">{lang === "sv" ? "Gäst" : "Guest"}</div>
                <div className="text-white font-medium">
                  {LIMITS.guest.messagesPerDay} {lang === "sv" ? "msg/dag" : "msg/day"}
                </div>
              </div>
              <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.06] p-3">
                <div className="text-accent-cyan mb-1">{lang === "sv" ? "Konto" : "Account"}</div>
                <div className="text-white font-medium">
                  {LIMITS.member.messagesPerDay} {lang === "sv" ? "msg/dag" : "msg/day"}
                </div>
              </div>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-accent-cyan mx-auto mb-3" />
                <p className="text-sm text-white mb-1">
                  {lang === "sv" ? "Kolla din e-post" : "Check your email"}
                </p>
                <p className="text-xs text-muted leading-relaxed px-2">
                  {lang === "sv"
                    ? "Öppna länken i samma webbläsare. Länken ska gå till den domän du är på nu (stilledev.se eller localhost) — inte en gammal localhost-länk."
                    : "Open the link in this same browser. It should open the domain you’re on now (stilledev.se or localhost) — discard old localhost emails."}
                </p>
                <p className="text-xs text-accent-cyan mt-2">{email}</p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={busy || !configured}
                  onClick={() => void onGoogle()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm font-semibold text-white hover:bg-white/[0.07] disabled:opacity-40 mb-3"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {busy
                    ? lang === "sv"
                      ? "Öppnar Google…"
                      : "Opening Google…"
                    : lang === "sv"
                      ? "Fortsätt med Google"
                      : "Continue with Google"}
                </button>

                <div className="relative my-4 text-center text-[10px] text-muted uppercase tracking-wider">
                  <span className="bg-[#0a0a12] px-2 relative z-[1]">
                    {lang === "sv" ? "eller e-post" : "or email"}
                  </span>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-white/[0.06]" />
                </div>

                <form onSubmit={onEmail} className="space-y-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === "sv" ? "din@epost.se" : "you@email.com"}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40"
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    disabled={busy || !configured}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {lang === "sv" ? "Skicka magisk länk" : "Send magic link"}
                  </button>
                </form>
              </>
            )}

            {err && (
              <div className="mt-3 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-100 flex gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            )}

            <p className="mt-4 text-[10px] text-muted/55 leading-relaxed text-center">
              {lang === "sv"
                ? "Tips: slutför alltid Google/e-postinloggning i samma webbläsare och enhet där du startade."
                : "Tip: always finish Google/email login in the same browser and device where you started."}
            </p>

            <button
              type="button"
              onClick={() => {
                clearAuthFlash();
                closeAuth();
              }}
              className="mt-4 w-full text-center text-xs text-muted hover:text-white"
            >
              {lang === "sv" ? "Fortsätt som gäst" : "Continue as guest"}
            </button>

            <p className="mt-4 flex items-start gap-2 text-[10px] text-muted/60 leading-relaxed">
              <Shield className="w-3 h-3 shrink-0 mt-0.5 text-accent-cyan/70" />
              {lang === "sv"
                ? "Vi delar aldrig dina chattar. Minne och historik är privata under ditt konto (RLS)."
                : "We never share your chats. Memory and history are private under your account (RLS)."}
            </p>
            <p className="mt-2 text-center text-[10px] text-muted/40 inline-flex items-center justify-center gap-1 w-full">
              <Sparkles className="w-3 h-3" /> BudAI · Stilledev
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
