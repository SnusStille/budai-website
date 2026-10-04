"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Loader2, Copy } from "lucide-react";
import { addWaitlistUser } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";
export default function Waitlist() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [business, setBusiness] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError("");
    try {
      const ref = new URLSearchParams(window.location.search)
        .get("ref")
        ?.slice(0, 64);
      await addWaitlistUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: business ? company.trim() : null,
        account_type: business ? "company" : "individual",
        industry: null,
        employees: null,
        interest: "Early access",
        discount_code: "BUDAI-EARLY-10",
        notes: ref ? `referral:${ref}` : null,
        source: ref ? "referral" : "landing",
        priority: business ? 60 : 45,
        last_contacted_at: null,
        tags: [business ? "company" : "individual"],
      });
      setState("success");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : String((err as { message?: string })?.message || "");
      setError(
        /duplicate|unique|already/i.test(message)
          ? sv
            ? "Du finns redan på listan med den här e-postadressen."
            : "This email is already on the list. You’re all set."
          : sv
            ? "Det gick inte att spara din anmälan. Försök igen om en stund."
            : "We couldn’t save your signup. Please try again in a moment.",
      );
      setState("idle");
    }
  }
  return (
    <section id="waitlist" className="site-width waitlist-final">
      <div className="waitlist-copy">
        <div className="eyebrow">
          <span className="signal-dot" />
          EARLY ACCESS
        </div>
        <h2>
          {sv ? "Nästa kapitel." : "The next chapter."}
          <br />
          <span>
            {sv ? "Var med från början." : "Be there from the start."}
          </span>
        </h2>
        <p>
          {sv
            ? "Hjälp oss forma ett bättre sätt att arbeta. Skriv upp dig för lanseringsnyheter och tidig tillgång till BudAI."
            : "Help shape a better way to work. Join the list for launch updates and early access to BudAI."}
        </p>
        <div className="discount-line">
          <span>10%</span>
          <div>
            <strong>{sv ? "rabatt vid lansering" : "off at launch"}</strong>
            <p>
              {sv
                ? "En liten fördel för dig som är tidigt ute."
                : "A little thank-you for being here early."}
            </p>
          </div>
        </div>
      </div>
      <div className="signup-panel">
        {state === "success" ? (
          <div className="signup-success" role="status">
            <div className="success-icon">
              <Check size={28} />
            </div>
            <div className="eyebrow">YOU’RE ON THE LIST</div>
            <h3>
              {sv ? "Välkommen till nästa steg." : "Good things start here."}
            </h3>
            <p>
              {sv ? "Vi kontaktar dig på" : "We’ll get in touch at"}{" "}
              <strong>{email}</strong>{" "}
              {sv ? "när BudAI är redo." : "when BudAI is ready."}
            </p>
            <button
              className="discount-code"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText("BUDAI-EARLY-10");
                  setCopied(true);
                } catch {
                  setError(
                    sv
                      ? "Kopiera koden manuellt."
                      : "Please copy the code manually.",
                  );
                }
              }}
            >
              BUDAI-EARLY-10 {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <p className="fine-print">
              {sv
                ? "Spara din kod för 10% rabatt vid lansering."
                : "Keep your code for 10% off at launch."}
            </p>
            {error && <p role="alert">{error}</p>}
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3>
              {sv ? "Din inbjudan börjar här." : "Your invitation starts here."}
            </h3>
            <p>
              {sv
                ? "Tidig tillgång. Lanseringsnyheter. Ingen spam."
                : "Early access. Launch updates. No noise."}
            </p>
            <label htmlFor="waitlist-name">{sv ? "Namn" : "Name"}</label>
            <input
              id="waitlist-name"
              autoComplete="given-name"
              placeholder={sv ? "Ditt namn" : "Your name"}
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="waitlist-email">
              {sv ? "E-postadress" : "Email address"}
            </label>
            <input
              id="waitlist-email"
              autoComplete="email"
              type="email"
              placeholder="you@example.com"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="company-check">
              <input
                type="checkbox"
                checked={business}
                onChange={(e) => setBusiness(e.target.checked)}
              />
              {sv
                ? "Jag är intresserad för mitt företag"
                : "I’m interested for my business"}
            </label>
            {business && (
              <>
                <label htmlFor="waitlist-company">
                  {sv ? "Företag" : "Company"}
                </label>
                <input
                  id="waitlist-company"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  maxLength={150}
                />
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="primary-action" disabled={state === "loading"}>
              {state === "loading" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {sv
                    ? "Gå med · få 10% rabatt"
                    : "Join the list · get 10% off"}
                  <ArrowUpRight size={17} />
                </>
              )}
            </button>
            <p className="fine-print">
              {sv
                ? "Genom att gå med godkänner du vår"
                : "By joining, you agree to our"}{" "}
              <a href="/legal/privacy">
                {sv ? "integritetspolicy" : "privacy policy"}
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
