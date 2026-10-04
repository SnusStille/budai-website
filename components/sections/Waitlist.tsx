"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Building2,
  Check,
  Copy,
  Mail,
  MapPin,
  Send,
  Share2,
  Sparkles,
  Ticket,
  User,
  Users,
  Zap,
} from "lucide-react";
import { addWaitlistUser, getWaitlistCount } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";

type Interest = "work" | "write" | "build" | "learn";

function referralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const ref = new URLSearchParams(window.location.search).get("ref");
  return ref ? ref.slice(0, 60) : null;
}

function inviteCode(email: string): string {
  let hash = 0;
  const input = `${email}|budai`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 99991;
  }
  return `BUD${String(hash).padStart(5, "0")}`;
}

export default function Waitlist() {
  const { lang } = useLang();
  const isSv = lang === "sv";

  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [interest, setInterest] = useState<Interest>("work");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWaitlistCount()
      .then((value) => {
        if (!cancelled) setCount(value);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const perks = isSv
    ? [
        { icon: <BadgePercent className="h-4 w-4" />, title: "10 % founding-rabatt", text: "För dig som går med nu, när BudAI lanserar betalda planer." },
        { icon: <Ticket className="h-4 w-4" />, title: "Early access", text: "Inbjudan till nya preview-släpp före alla andra i listan." },
        { icon: <Zap className="h-4 w-4" />, title: "Nya funktioner först", text: "Playground-uppdateringar och experiment innan de blir publika." },
        { icon: <Users className="h-4 w-4" />, title: "Direktlinje till teamet", text: "Din feedback går rakt in i roadmappen — inte in i ett tomrum." },
      ]
    : [
        { icon: <BadgePercent className="h-4 w-4" />, title: "10% founding discount", text: "For everyone joining now, when BudAI ships paid plans." },
        { icon: <Ticket className="h-4 w-4" />, title: "Early access", text: "An invite to new preview releases ahead of the rest of the list." },
        { icon: <Zap className="h-4 w-4" />, title: "New features first", text: "Playground updates and experiments before they go public." },
        { icon: <Users className="h-4 w-4" />, title: "A direct line to the team", text: "Your feedback lands on the roadmap — not in a void." },
      ];

  const interestOptions: { id: Interest; label: string }[] = useMemo(
    () =>
      isSv
        ? [
            { id: "work", label: "Jobbet & vardagen" },
            { id: "write", label: "Skriva & innehåll" },
            { id: "build", label: "Utveckling & kod" },
            { id: "learn", label: "Lära & utforska" },
          ]
        : [
            { id: "work", label: "Work & everyday tasks" },
            { id: "write", label: "Writing & content" },
            { id: "build", label: "Building & code" },
            { id: "learn", label: "Learning & exploring" },
          ],
    [isSv]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    setError("");

    try {
      await addWaitlistUser({
        name: name.trim() || cleanEmail.split("@")[0],
        email: cleanEmail,
        account_type: accountType,
        company: null,
        industry: null,
        employees: null,
        interest,
        discount_code: "FOUNDING10",
        notes: null,
        source: referralFromUrl() ? `referral:${referralFromUrl()}` : "landing",
        priority: null,
        last_contacted_at: null,
        tags: [accountType, "early-access", "founding-10", interest],
      });
      setSubmitted(true);
      setCount((value) => (value === null ? value : value + 1));
    } catch (submissionError: unknown) {
      const err = submissionError as { message?: string; code?: string };
      const message = (err.message || "").toLowerCase();
      if (err.code === "23505" || message.includes("duplicate") || message.includes("unique") || message.includes("already")) {
        setError(isSv ? "Den e-postadressen finns redan på väntelistan." : "That email is already on the waitlist.");
      } else if (message.includes("network") || message.includes("fetch")) {
        setError(isSv ? "Nätverksfel. Kontrollera anslutningen och försök igen." : "Network error. Check your connection and try again.");
      } else {
        setError(isSv ? "Det gick inte att spara just nu. Försök igen om en stund." : "We couldn't save this right now. Please try again shortly.");
      }
    } finally {
      setLoading(false);
    }
  };

  const code = useMemo(() => (email ? inviteCode(email.trim().toLowerCase()) : "BUD00000"), [email]);
  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${window.location.pathname}?ref=${code}#waitlist`;
  }, [code]);

  const copy = async (value: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section id="waitlist" className="wl-section relative scroll-mt-24 overflow-hidden">
      <div className="wl-glow wl-glow--a" aria-hidden="true" />
      <div className="wl-glow wl-glow--b" aria-hidden="true" />
      <div className="wl-grid-overlay" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[80rem] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="wl-kicker">
            <Sparkles className="h-3.5 w-3.5" />
            {isSv ? "Founding members" : "Founding members"}
          </span>
          <h2 className="wl-title mt-5">
            {isSv ? "De första " : "The first "}
            <span className="wl-percent">10 %</span>
            {isSv ? " får early access." : " get early access."}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base sm:leading-8">
            {isSv
              ? "BudAI är i tidig förhandsvisning. Gå med på väntelistan och lås upp 10 % founding-rabatt, tidig tillgång till nya släpp och en direkt linje till oss som bygger."
              : "BudAI is in early preview. Join the waitlist to unlock a 10% founding discount, early access to new releases, and a direct line to the people building it."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <span className="wl-stat">
              <strong>10 %</strong>
              {isSv ? "founding-rabatt" : "founding discount"}
            </span>
            <span className="wl-stat">
              <strong>{isSv ? "0 kr" : "Free"}</strong>
              {isSv ? "att gå med" : "to join"}
            </span>
            <span className="wl-stat">
              <strong>SV / EN</strong>
              {isSv ? "två språk" : "two languages"}
            </span>
            {count !== null && count > 0 && (
              <span className="wl-stat wl-stat--live">
                <span className="wl-stat-dot" aria-hidden />
                <strong>{count}</strong>
                {isSv ? "på listan" : "on the list"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.02fr] lg:items-start lg:gap-14">
          {/* perks */}
          <div className="wl-perks">
            <div className="wl-perk-grid">
              {perks.map((perk, index) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="wl-perk"
                >
                  <span className="wl-perk-icon">{perk.icon}</span>
                  <span>
                    <strong>{perk.title}</strong>
                    <small>{perk.text}</small>
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="wl-note">
              <span className="wl-note-mark">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <p>
                {isSv
                  ? "Byggt i Sverige av Stilledev. BudAI är fortfarande under utveckling — vi lovar inget vi inte kan hålla."
                  : "Built in Sweden by Stilledev. BudAI is still in development — we won't promise what we can't hold."}
              </p>
            </div>

            <ul className="wl-fineprint">
              <li>
                <Check className="h-3.5 w-3.5" />
                {isSv ? "Ingen betalning, inget kort." : "No payment, no card."}
              </li>
              <li>
                <Check className="h-3.5 w-3.5" />
                {isSv ? "Avregistrera när du vill." : "Leave whenever you want."}
              </li>
              <li>
                <Check className="h-3.5 w-3.5" />
                {isSv
                  ? "E-post används bara för BudAI-uppdateringar."
                  : "Email is only used for BudAI updates."}
              </li>
            </ul>
          </div>

          {/* form / success */}
          <div className="wl-card">
            <div className="wl-card-line" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="wl-card-kicker">{isSv ? "Säkra din plats" : "Secure your spot"}</div>
                      <h3 className="wl-card-title">
                        {isSv ? "Lås upp 10 % för alltid." : "Unlock 10% for good."}
                      </h3>
                      <p className="wl-card-sub">
                        {isSv ? "Det tar under en minut." : "Takes under a minute."}
                      </p>
                    </div>
                    <span className="wl-badge" aria-hidden>
                      <BadgePercent className="h-5 w-5" />
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                    <fieldset>
                      <legend className="wl-label">{isSv ? "Jag utforskar BudAI för" : "I'm exploring BudAI for"}</legend>
                      <div className="wl-switch" role="group">
                        <button
                          type="button"
                          aria-pressed={accountType === "individual"}
                          onClick={() => setAccountType("individual")}
                          className={accountType === "individual" ? "is-selected" : ""}
                        >
                          <User className="h-4 w-4" />
                          {isSv ? "Mig själv" : "Myself"}
                        </button>
                        <button
                          type="button"
                          aria-pressed={accountType === "company"}
                          onClick={() => setAccountType("company")}
                          className={accountType === "company" ? "is-selected" : ""}
                        >
                          <Building2 className="h-4 w-4" />
                          {isSv ? "Mitt team" : "My team"}
                        </button>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="wl-label">{isSv ? "Mest intresserad av" : "Most interested in"}</legend>
                      <div className="wl-chip-row">
                        {interestOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={interest === option.id}
                            onClick={() => setInterest(option.id)}
                            className={`wl-chip ${interest === option.id ? "is-selected" : ""}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                      <div>
                        <label htmlFor="wl-name" className="wl-label">
                          {isSv ? "Namn" : "Name"} <span>{isSv ? "(valfritt)" : "(optional)"}</span>
                        </label>
                        <input
                          id="wl-name"
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          autoComplete="name"
                          maxLength={100}
                          placeholder={isSv ? "Ditt namn" : "Your name"}
                          className="wl-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="wl-email" className="wl-label">
                          {isSv ? "E-post" : "Email"}
                        </label>
                        <div className="relative">
                          <Mail className="wl-input-icon" aria-hidden="true" />
                          <input
                            id="wl-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                            maxLength={254}
                            placeholder={isSv ? "du@exempel.se" : "you@example.com"}
                            className="wl-input wl-input--email"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="wl-error" role="alert">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="wl-submit group">
                      <span>
                        {loading
                          ? isSv
                            ? "Skickar…"
                            : "Joining…"
                          : isSv
                            ? "Gå med och lås 10 %"
                            : "Join and lock in 10%"}
                      </span>
                      {loading ? (
                        <span className="wl-spinner" aria-hidden />
                      ) : (
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      )}
                    </button>

                    <p className="wl-legal">
                      {isSv ? "Genom att gå med godkänner du vår " : "By joining you accept our "}
                      <a href="/legal/privacy">{isSv ? "integritetspolicy" : "privacy policy"}</a>.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="wl-success"
                  role="status"
                  aria-live="polite"
                >
                  <div className="wl-success-icon">
                    <Check className="h-6 w-6" strokeWidth={2.6} />
                  </div>
                  <span className="wl-kicker wl-kicker--mint">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isSv ? "Du är med" : "You're in"}
                  </span>
                  <h3>{isSv ? "Välkommen som founding member." : "Welcome, founding member."}</h3>
                  <p>
                    {isSv ? "Vi sparade platsen för " : "We saved the spot for "}
                    <strong>{email.trim().toLowerCase()}</strong>
                    {isSv ? " — 10 % är låst till ditt konto." : " — 10% is locked to your account."}
                  </p>

                  <div className="wl-code">
                    <span className="wl-code-label">{isSv ? "Din founding-kod" : "Your founding code"}</span>
                    <span className="wl-code-value">{code}</span>
                    <button
                      type="button"
                      onClick={() => void copy(code, "code")}
                      className="wl-code-copy"
                      aria-label={isSv ? "Kopiera kod" : "Copy code"}
                    >
                      {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied === "code" ? (isSv ? "Kopierad" : "Copied") : isSv ? "Kopiera" : "Copy"}
                    </button>
                  </div>

                  <div className="wl-invite">
                    <div className="min-w-0">
                      <div className="wl-invite-title">
                        {isSv ? "Bjud in en vän — båda flyttar fram" : "Invite a friend — you both move up"}
                      </div>
                      <div className="wl-invite-link">{inviteLink || "…"}</div>
                    </div>
                    <button type="button" onClick={() => void copy(inviteLink, "link")} className="wl-invite-btn">
                      {copied === "link" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <a href="#playground" className="wl-secondary">
                    <span>{isSv ? "Testa Playground medan du väntar" : "Try the Playground while you wait"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <p className="wl-success-note">
                    {isSv
                      ? "BudAI är fortfarande under utveckling. Vi hör av oss när nästa släpp är redo."
                      : "BudAI is still in development. We'll be in touch when the next release is ready."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* bottom strip */}
        <div className="wl-strip">
          <span className="wl-strip-item">
            <Send className="h-3.5 w-3.5" />
            {isSv ? "Ett mejl när något är redo — inget brus." : "One email when something is ready — no noise."}
          </span>
          <span className="wl-strip-divider" aria-hidden />
          <span className="wl-strip-item">
            <Zap className="h-3.5 w-3.5" />
            {isSv ? "Byggt i Kista, Stockholm." : "Built in Kista, Stockholm."}
          </span>
        </div>
      </div>
    </section>
  );
}
