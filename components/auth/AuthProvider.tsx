"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";
import { LIMITS, type AccessTier, dayKey, limitFor } from "@/lib/limits";
import { getAuthCallbackUrl, getBrowserOrigin } from "@/lib/site";
import { friendlyAuthError } from "@/lib/authErrors";

type Usage = { messages: number; images: number; generations: number };

type AuthCtx = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  user: User | null;
  tier: AccessTier;
  isGuest: boolean;
  isMember: boolean;
  displayName: string | null;
  usage: Usage;
  limits: typeof LIMITS.guest | typeof LIMITS.member;
  remaining: { messages: number; images: number; generations: number };
  refreshUsage: () => Promise<void>;
  bumpUsage: (kind: "messages" | "images" | "generations", n?: number) => void;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string) => Promise<{ error?: string; ok?: boolean }>;
  signOut: () => Promise<void>;
  openAuth: (reason?: string) => void;
  closeAuth: () => void;
  authOpen: boolean;
  authReason: string | null;
  guestKey: string;
  authFlash: string | null;
  clearAuthFlash: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function getOrCreateGuestKey() {
  if (typeof window === "undefined") return "ssr";
  try {
    let k = localStorage.getItem("budai-guest-key");
    if (!k) {
      k = `g-${crypto.randomUUID()}`;
      localStorage.setItem("budai-guest-key", k);
    }
    return k;
  } catch {
    return `g-tmp-${Date.now()}`;
  }
}

function readAuthQuery(): { status: string | null; reason: string | null } {
  if (typeof window === "undefined") return { status: null, reason: null };
  try {
    const sp = new URLSearchParams(window.location.search);
    // also support hash query leftovers
    const hash = window.location.hash || "";
    const hashQ = hash.includes("?") ? hash.split("?")[1] : "";
    const hp = new URLSearchParams(hashQ);
    const status = sp.get("auth") || hp.get("auth");
    const reason = sp.get("reason") || hp.get("reason");
    return { status, reason };
  } catch {
    return { status: null, reason: null };
  }
}

function scrubAuthQuery() {
  try {
    const u = new URL(window.location.href);
    u.searchParams.delete("auth");
    u.searchParams.delete("reason");
    // keep hash playground
    if (!u.hash || u.hash === "#") u.hash = "playground";
    window.history.replaceState({}, "", `${u.pathname}${u.search}${u.hash}`);
  } catch {
    /* */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isAuthConfigured();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [usage, setUsage] = useState<Usage>({ messages: 0, images: 0, generations: 0 });
  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | null>(null);
  const [guestKey, setGuestKey] = useState("g");
  const [authFlash, setAuthFlash] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    setGuestKey(getOrCreateGuestKey());
  }, []);

  // Surface callback errors / success from URL
  useEffect(() => {
    const { status, reason } = readAuthQuery();
    if (!status) return;
    if (status === "error") {
      const raw = reason ? decodeURIComponent(reason) : "";
      const human = friendlyAuthError(
        raw || "Sign-in failed. Try again in this browser.",
        "en"
      );
      setAuthFlash(human);
      setAuthOpen(true);
      setAuthReason(
        human ||
          "Sign-in must complete in the same browser where you started."
      );
    } else if (status === "ok") {
      setAuthFlash("signed-in");
    }
    scrubAuthQuery();
  }, []);

  const refreshUsage = useCallback(async () => {
    try {
      const q = new URLSearchParams({ day: dayKey() });
      const sb = createClient();
      let token: string | undefined;
      if (sb) {
        const { data } = await sb.auth.getSession();
        token = data.session?.access_token;
      }
      if (!token) q.set("guest", guestKey);
      const res = await fetch(`/api/usage?${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsage({
        messages: data.messages ?? 0,
        images: data.images ?? 0,
        generations: data.generations ?? 0,
      });
    } catch {
      /* offline / no table yet */
    }
  }, [guestKey]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (!configured) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    let unsub = () => {};

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (e) {
        console.warn("[auth] getSession", e);
      } finally {
        setReady(true);
      }

      const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
        setSession(s);
        if (event === "SIGNED_IN") {
          setAuthOpen(false);
          setAuthFlash("signed-in");
          // Ensure profile row exists (trigger may lag)
          try {
            if (s?.user) {
              await supabase.from("profiles").upsert({
                id: s.user.id,
                email: s.user.email,
                display_name:
                  s.user.user_metadata?.full_name ||
                  s.user.user_metadata?.name ||
                  s.user.email?.split("@")[0] ||
                  null,
                avatar_url: s.user.user_metadata?.avatar_url || null,
              });
            }
          } catch {
            /* */
          }
        }
        if (event === "SIGNED_OUT") {
          setUsage({ messages: 0, images: 0, generations: 0 });
        }
      });
      unsub = () => sub.subscription.unsubscribe();
    })();

    return () => unsub();
  }, [configured]);

  useEffect(() => {
    if (!ready) return;
    void refreshUsage();
  }, [ready, session?.user?.id, guestKey, refreshUsage]);

  // Refresh session periodically + on focus (expired token recovery)
  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    if (!supabase) return;

    const refresh = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[auth] session refresh", error.message);
          return;
        }
        setSession(data.session);
        if (data.session) {
          const exp = data.session.expires_at ? data.session.expires_at * 1000 : 0;
          if (exp && exp - Date.now() < 60_000) {
            await supabase.auth.refreshSession();
          }
        }
      } catch {
        /* */
      }
    };

    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => void refresh(), 5 * 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [configured]);

  const tier: AccessTier = session?.user ? "member" : "guest";
  const limits = LIMITS[tier];

  const remaining = useMemo(
    () => ({
      messages: Math.max(0, limitFor(tier, "messages") - usage.messages),
      images: Math.max(0, limitFor(tier, "images") - usage.images),
      generations: Math.max(0, limitFor(tier, "generations") - usage.generations),
    }),
    [tier, usage]
  );

  const bumpUsage = useCallback((kind: "messages" | "images" | "generations", n = 1) => {
    setUsage((u) => ({ ...u, [kind]: u[kind] + n }));
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return { error: "Sign-in is temporarily unavailable. Please try again later." };
    const origin = getBrowserOrigin();
    const redirectTo = getAuthCallbackUrl("/#playground");
    try {
      sessionStorage.setItem("budai-oauth-started", String(Date.now()));
      sessionStorage.setItem("budai-oauth-origin", origin);
    } catch {
      /* */
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
        skipBrowserRedirect: false,
      },
    });
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("provider is not enabled") || m.includes("unsupported provider")) {
        return {
          error:
            "Google sign-in is currently unavailable. Please use the magic-link email option, or try again later.",
        };
      }
      if (m.includes("popup") || m.includes("cancelled") || m.includes("canceled")) {
        return { error: "Google sign-in was cancelled." };
      }
      return {
        error:
          "Could not start Google sign-in. Please try email magic link, or try again in a moment.",
      };
    }
    return {};
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = createClient();
    if (!supabase) return { error: "Sign-in is temporarily unavailable. Please try again later." };
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return { error: "Enter a valid email address." };
    }
    // CRITICAL: emailRedirectTo must be on Supabase Redirect allowlist.
    // If not, Supabase falls back to Dashboard Site URL (often localhost) → ERR_CONNECTION_REFUSED.
    const emailRedirectTo = getAuthCallbackUrl("/#playground");
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: {
        emailRedirectTo,
        shouldCreateUser: true,
      },
    });
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("redirect") || m.includes("url")) {
        return {
          error:
            "Sign-in redirect is misconfigured. Please try again later, or contact support if this continues.",
        };
      }
      if (m.includes("rate") || m.includes("security")) {
        return {
          error: "Too many attempts. Please wait a minute and try again.",
        };
      }
      return {
        error: "Could not send the magic link. Check the email address and try again.",
      };
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    try {
      await supabase?.auth.signOut({ scope: "local" });
    } catch {
      /* */
    }
    setSession(null);
    setAuthFlash(null);
  }, []);

  const value: AuthCtx = {
    ready,
    configured,
    session,
    user: session?.user ?? null,
    tier,
    isGuest: !session?.user,
    isMember: !!session?.user,
    displayName:
      session?.user?.user_metadata?.full_name ||
      session?.user?.user_metadata?.name ||
      session?.user?.email ||
      null,
    usage,
    limits,
    remaining,
    refreshUsage,
    bumpUsage,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    openAuth: (reason) => {
      setAuthReason(reason ?? null);
      setAuthOpen(true);
    },
    closeAuth: () => {
      setAuthOpen(false);
      setAuthReason(null);
    },
    authOpen,
    authReason,
    guestKey,
    authFlash,
    clearAuthFlash: () => setAuthFlash(null),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth within AuthProvider");
  return c;
}