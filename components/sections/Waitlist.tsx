"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Building2, Check, Mail, Sparkles, User, Users } from "lucide-react";
import { addWaitlistUser } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";


export default function Waitlist() {
  const { lang } = useLang();
  const isSv = lang === "sv";
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        interest: isSv ? "BudAI early access" : "BudAI early access",
        discount_code: null,
        notes: null,
        source: "landing",
        priority: null,
        last_contacted_at: null,
        tags: [accountType, "early-access"],
      });
      setSubmitted(true);
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



  return (
    <section id="waitlist" className="waitlist-section section-hairline relative scroll-mt-24 overflow-hidden">
      <div className="waitlist-glow waitlist-glow--one" aria-hidden="true" />
      <div className="waitlist-glow waitlist-glow--two" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-10 lg:py-28">
        <div className="waitlist-intro">
          <span className="section-kicker section-kicker--violet">
            <Sparkles className="h-3.5 w-3.5" />
            {isSv ? "Early access" : "Early access"}
          </span>
          <h2 className="section-heading mt-5">
            {isSv ? "BudAI byggs vidare." : "BudAI is taking shape."}{" "}
            <span className="text-gradient">{isSv ? "Kom med tidigt." : "Come along early."}</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
            {isSv
              ? "Skriv upp dig för uppdateringar och besked när nästa preview öppnar. BudAI utvecklas fortfarande — vi delar mer när det finns något nytt att prova."
              : "Join for updates and hear when the next preview opens. BudAI is still in development — we’ll share more when there is something new to try."}
          </p>

          <ul className="waitlist-benefits mt-8 space-y-4">
            <li>
              <span className="waitlist-benefit-icon"><Sparkles className="h-4 w-4" /></span>
              <span>
                <strong>{isSv ? "Tidig åtkomst" : "Early product access"}</strong>
                <small>{isSv ? "Inbjudningar när previewn växer." : "Invitations as the preview grows."}</small>
              </span>
            </li>
            <li>
              <span className="waitlist-benefit-icon"><Users className="h-4 w-4" /></span>
              <span>
                <strong>{isSv ? "Hjälp till att forma BudAI" : "A voice in the build"}</strong>
                <small>{isSv ? "Dina erfarenheter hjälper oss prioritera." : "Your experience can help shape what we build."}</small>
              </span>
            </li>
            <li>
              <span className="waitlist-benefit-icon"><Check className="h-4 w-4" /></span>
              <span>
                <strong>{isSv ? "Ingen betalning krävs" : "No purchase required"}</strong>
                <small>{isSv ? "Du kan gå med i väntelistan utan kostnad." : "Joining the waitlist is free."}</small>
              </span>
            </li>
          </ul>

          <p className="mt-8 text-xs leading-relaxed text-white/36">
            {isSv
              ? "Vi använder din e-post för information om BudAI early access. Läs mer i vår"
              : "We’ll use your email for BudAI early-access updates. Read more in our"}{" "}
            <a href="/legal/privacy" className="text-white/60 underline decoration-white/20 underline-offset-4 hover:text-white">
              {isSv ? "integritetspolicy" : "privacy policy"}
            </a>.
          </p>
        </div>

        <div className="waitlist-card">
          <div className="waitlist-card-topline" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            {!submitted ? (
              <motion.div
                key="waitlist-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-7">
                  <div className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    {isSv ? "Gå med i listan" : "Join the list"}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                    {isSv ? "Var med från början." : "Be part of what comes next."}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/48">
                    {isSv ? "Det tar mindre än en minut." : "It takes less than a minute."}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <fieldset>
                    <legend className="mb-2 text-xs font-medium text-white/58">
                      {isSv ? "Jag vill utforska BudAI för" : "I’m exploring BudAI for"}
                    </legend>
                    <div className="waitlist-type-switch" role="group" aria-label={isSv ? "Välj användning" : "Choose use type"}>
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

                  <div className="grid gap-4 sm:grid-cols-[0.78fr_1.22fr]">
                    <div>
                      <label htmlFor="waitlist-name" className="mb-2 block text-xs font-medium text-white/58">
                        {isSv ? "Namn" : "Name"} <span className="text-white/28">{isSv ? "(valfritt)" : "(optional)"}</span>
                      </label>
                      <input
                        id="waitlist-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                        maxLength={100}
                        placeholder={isSv ? "Ditt namn" : "Your name"}
                        className="waitlist-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="waitlist-email" className="mb-2 block text-xs font-medium text-white/58">
                        {isSv ? "E-post" : "Email"}
                      </label>
                      <div className="relative">
                        <Mail className="waitlist-input-icon" aria-hidden="true" />
                        <input
                          id="waitlist-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          autoComplete="email"
                          required
                          maxLength={254}
                          placeholder={isSv ? "du@exempel.se" : "you@example.com"}
                          className="waitlist-input waitlist-input--email"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="waitlist-error" role="alert">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="button-primary waitlist-submit group">
                    <span>{loading ? (isSv ? "Skickar…" : "Joining…") : (isSv ? "Gå med i väntelistan" : "Join the waitlist")}</span>
                    {loading ? <span className="waitlist-spinner" aria-hidden="true" /> : <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
                  </button>

                  <p className="text-center text-[11px] leading-relaxed text-white/34">
                    {isSv ? "Ingen bindning. BudAI är fortfarande en förhandsvisning." : "No commitment. BudAI is still an early preview."}
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="waitlist-success"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="waitlist-success"
                role="status"
                aria-live="polite"
              >
                <div className="waitlist-success-icon"><Check className="h-6 w-6" strokeWidth={2.5} /></div>
                <span className="section-kicker section-kicker--mint mx-auto">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isSv ? "Early access" : "Early access"}
                </span>
                <h3>{isSv ? "Du är med på väntelistan." : "You’re on the waitlist."}</h3>
                <p>
                  {isSv ? "Vi har sparat anmälan för " : "We saved the signup for "}
                  <strong>{email.trim().toLowerCase()}</strong>.
                  {isSv
                    ? " Vi skickar uppdateringar när det finns mer att prova."
                    : " We’ll share updates when there is more to try."}
                </p>
                <a href="#playground" className="button-secondary mt-6">
                  <span>{isSv ? "Till Playground" : "Explore the Playground"}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <p className="waitlist-success-note">
                  {isSv ? "BudAI är fortfarande under utveckling." : "BudAI is still in development."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
