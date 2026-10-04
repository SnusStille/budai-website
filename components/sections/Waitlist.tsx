"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BadgePercent, Check, Copy, Mail, Sparkles } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { addWaitlistUser, getWaitlistCount } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";
import type { Lang } from "@/lib/i18n";

/** The launch discount reserved for everyone on the list. */
const DISCOUNT_CODE = "BUDAI-EARLY-10";

const copy = {
  sv: {
    badge: "Tidig åtkomst",
    title: "Bli först att använda BudAI.",
    lede: "Gå med i listan för tidig åtkomst och få 10 % rabatt när BudAI lanseras.",
    email: "din@epost.se",
    emailLabel: "E-postadress",
    submit: "Gå med i väntelistan",
    discount: "10 % rabatt vid lansering",
    noSpam: "Ingen spam. Bara uppdateringar om BudAI.",
    countPrefix: "med i listan",
    successTitle: "Du är med.",
    successNote: "Din rabatt på 10 % vid lansering är reserverad.",
    codeLabel: "Din kod",
    copyCode: "Kopiera kod",
    copied: "Kopierad",
    nextTitle: "Vad händer nu?",
    nextBody:
      "Vi bygger BudAI i öppenhet och släpper in fler i taget. Du får ett mejl när din plats är redo — ingen betalning, inget kort.",
    backToPlayground: "Till Playground",
    errorInvalid: "Kontrollera e-postadressen och försök igen.",
    errorGeneric: "Något gick fel. Försök igen om en liten stund.",
    perksTitle: "Det här får du",
    perks: [
      { title: "Tidig åtkomst", body: "Du släpps in innan den publika lanseringen." },
      { title: "10 % vid lansering", body: "Koden reserveras åt dig, utan kort eller betalning nu." },
      { title: "Byggd med dig", body: "Du kan tycka till om det som byggs härnäst." },
    ],
    statusTitle: "Just nu i förhandsvisning",
    statusBody: "BudAI är i tidig förhandsvisning. Playground är öppen — väntelistan ger dig rabatt och tidig åtkomst.",
    openPlayground: "Öppna Playground",
  },
  en: {
    badge: "Early access",
    title: "Be first to use BudAI.",
    lede: "Join the early access list and get 10% off when BudAI launches.",
    email: "you@company.com",
    emailLabel: "Email address",
    submit: "Join the waitlist",
    discount: "10% launch discount",
    noSpam: "No spam. Just BudAI updates.",
    countPrefix: "on the list",
    successTitle: "You're in.",
    successNote: "Your 10% launch discount is reserved.",
    codeLabel: "Your code",
    copyCode: "Copy code",
    copied: "Copied",
    nextTitle: "What happens next?",
    nextBody:
      "We are building BudAI in the open and let people in a few at a time. You get an email when your spot is ready — no payment, no card.",
    backToPlayground: "Back to the Playground",
    errorInvalid: "Check the email address and try again.",
    errorGeneric: "Something went wrong. Try again in a moment.",
    perksTitle: "What you'll get",
    perks: [
      { title: "Early access", body: "You get in before the public launch." },
      { title: "10% off at launch", body: "The code is reserved for you — no card, no payment now." },
      { title: "Built with you", body: "You get a say in what we build next." },
    ],
    statusTitle: "Currently in preview",
    statusBody: "BudAI is in early preview. The Playground is open — the waitlist gives you the discount and early access.",
    openPlayground: "Open the Playground",
  },
} as const;

export default function Waitlist({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" } = {}) {
  const Heading = headingLevel;
  const { lang } = useLang();
  const t = copy[lang === "sv" ? "sv" : "en"];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [copied, setCopied] = useState<"code" | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWaitlistCount()
      .then((value) => {
        // only ever show a number we actually have
        if (!cancelled) setCount(value > 0 ? value : null);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t.errorInvalid);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await addWaitlistUser({
        name: "",
        email: value,
        account_type: "individual",
        company: null,
        industry: null,
        employees: null,
        interest: "early-access",
        discount_code: DISCOUNT_CODE,
        notes: null,
        source: "waitlist-page",
        priority: null,
        last_contacted_at: null,
        tags: ["early-access"],
      });
      setDone(true);
      setCount((current) => (current === null ? null : current + 1));
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    try {
      void navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied("code");
      window.setTimeout(() => setCopied(null), 2200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section className="wl-section px-4 py-14 sm:px-6 sm:py-20" id="waitlist">
      <span className="wl-glow wl-glow--a" aria-hidden />
      <span className="wl-glow wl-glow--b" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        {/* ── the ask ───────────────────────────────────────────── */}
        <div>
          <span className="wl-badge">
            <Sparkles className="h-3 w-3" />
            {t.badge}
          </span>

          <Heading className="wl-title mt-5">{t.title}</Heading>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">{t.lede}</p>

          <div className="mt-7">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="wl-card"
                >
                  <span className="wl-success-icon" aria-hidden>
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                      className="flex items-center justify-center"
                    >
                      <Check className="h-5 w-5" />
                    </motion.span>
                  </span>
                  <h3 className="wl-card-title">{t.successTitle}</h3>
                  <p className="wl-card-sub">{t.successNote}</p>

                  <div className="wl-code mt-5">
                    <span className="wl-code-label">{t.codeLabel}</span>
                    <code className="wl-code-value">{DISCOUNT_CODE}</code>
                    <button type="button" onClick={copyCode} className="wl-code-copy">
                      {copied === "code" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === "code" ? t.copied : t.copyCode}
                    </button>
                  </div>

                  <p className="wl-success-note">{t.nextBody}</p>
                  <Link href="/" className="wl-invite-link mt-4 inline-flex items-center gap-1.5">
                    {t.backToPlayground}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={false}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="wl-input w-full">
                      <span className="sr-only">{t.emailLabel}</span>
                      <span className="wl-input-icon" aria-hidden>
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          if (error) setError("");
                        }}
                        placeholder={t.email}
                        aria-label={t.emailLabel}
                        aria-invalid={Boolean(error)}
                        className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/32"
                      />
                    </label>
                    <button type="submit" disabled={loading} className="wl-submit sm:w-auto sm:px-6">
                      {loading ? (
                        <span className="wl-spinner" aria-hidden />
                      ) : (
                        <>
                          {t.submit}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="wl-chip wl-chip--discount">
                      <BadgePercent className="h-3.5 w-3.5" />
                      <strong>{t.discount}</strong>
                    </span>
                    {count !== null && (
                      <span className="wl-stat wl-stat--live">
                        <span className="wl-stat-dot" aria-hidden />
                        <strong>{count.toLocaleString(lang === "sv" ? "sv-SE" : "en-GB")}</strong> {t.countPrefix}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-[12px] text-white/38">{t.noSpam}</p>
                </motion.form>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="wl-error mt-3"
                  role="alert"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── the product, exactly as it looks ──────────────────── */}
        <div className="wl-card wl-preview" aria-hidden>
          <span className="wl-preview-bar">
            <BudAILogo size="sm" animated />
            <span className="wl-preview-word">
              Bud<span>AI</span>
            </span>
            <span className="wl-preview-tag">PREVIEW</span>
          </span>
          <div className="wl-preview-body">
            <p className="wl-preview-q">{lang === "sv" ? "Vad jobbar du med?" : "What are you working on?"}</p>
            <p className="wl-preview-a">{lang === "sv" ? "Fråga BudAI vad som helst." : "Ask BudAI anything."}</p>
            <div className="wl-preview-rows">
              {(lang === "sv"
                ? ["Skriv", "Förklara", "Brainstorma", "Planera"]
                : ["Write", "Explain", "Brainstorm", "Plan"]
              ).map((row) => (
                <span key={row} className="wl-preview-row">
                  {row}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── what you actually get ─────────────────────────────── */}
      <div className="relative mx-auto mt-14 w-full max-w-5xl">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/42">{t.perksTitle}</h3>
        <div className="wl-perk-grid mt-4">
          {t.perks.map((perk, index) => (
            <div key={perk.title} className="wl-perk">
              <span className="wl-perk-icon" aria-hidden>
                {index + 1}
              </span>
              <strong>{perk.title}</strong>
              <span>{perk.body}</span>
            </div>
          ))}
        </div>

        <div className="wl-strip mt-8">
          <span className="wl-strip-item">
            <span className="wl-kicker wl-kicker--mint">{t.statusTitle}</span>
            <span className="text-white/48">{t.statusBody}</span>
          </span>
          <span className="wl-strip-divider" aria-hidden />
          <Link href="/" className="wl-invite-btn">
            {t.openPlayground}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
