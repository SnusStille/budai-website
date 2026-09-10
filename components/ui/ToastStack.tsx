"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, MapPin, Trophy, Heart, Tag, X, Info } from "lucide-react";

export type ToastIcon = "spark" | "pin" | "trophy" | "heart" | "tag" | "info";

export type StackToast = {
  id: string;
  icon?: ToastIcon;
  title: string;
  body?: string;
  duration?: number;
};

type Ctx = {
  push: (t: Omit<StackToast, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

const ICONS = {
  spark: Sparkles,
  pin: MapPin,
  trophy: Trophy,
  heart: Heart,
  tag: Tag,
  info: Info,
};

/** Global stacked toasts — same corner, stack downward. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<StackToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<StackToast, "id"> & { id?: string }) => {
      const id = t.id || `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = t.duration ?? 4500;
      setToasts((prev) => {
        // keep max 5 stacked
        const next = [...prev.filter((x) => x.id !== id), { ...t, id, duration }];
        return next.slice(-5);
      });
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  // Bridge legacy window events
  useEffect(() => {
    const onPush = (e: Event) => {
      const d = (e as CustomEvent).detail as Omit<StackToast, "id"> | undefined;
      if (d?.title) push(d);
    };
    window.addEventListener("budai:toast", onPush as EventListener);
    return () => window.removeEventListener("budai:toast", onPush as EventListener);
  }, [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        className="fixed top-20 right-3 sm:right-4 z-[70] flex flex-col gap-2 pointer-events-none w-[min(320px,calc(100vw-1.5rem))]"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.icon || "info"];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto rounded-xl border border-white/[0.1] bg-[#0c0c14]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] px-3.5 py-3 flex gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent-cyan" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white leading-snug">{t.title}</p>
                  {t.body && (
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.body}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="p-1 rounded-md text-muted/50 hover:text-white shrink-0 self-start"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    return {
      push: (t: Omit<StackToast, "id">) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("budai:toast", { detail: t }));
        }
        return "";
      },
      dismiss: () => {},
    };
  }
  return ctx;
}
