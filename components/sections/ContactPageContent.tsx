import { headers } from "next/headers";
import Link from "next/link";
import ContactForm from "@/components/sections/ContactForm";
import ContactEmailActions from "@/components/sections/ContactEmailActions";
import { StilledevMark } from "@/components/ui/BudAILogo";
import StandalonePageShell from "@/components/site/StandalonePageShell";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const organizationId = `${siteUrl}/#organization`;
const personId = `${siteUrl}/#person`;

export default async function ContactPageContent({ sv = false }: { sv?: boolean }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const path = sv ? "/sv/contact" : "/contact";
  const canonical = `${siteUrl}${path}`;
  const name = sv ? "Kontakta Stilledev" : "Contact Stilledev";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${canonical}#contact-page`,
    url: canonical,
    name,
    inLanguage: sv ? "sv" : "en",
    mainEntity: { "@id": organizationId },
    about: { "@id": personId },
  };

  return (
    <StandalonePageShell
      title={name}
      eyebrow={sv ? "STILLEDEV · FÖRETAGSKONTAKT" : "STILLEDEV · BUSINESS ENQUIRIES"}
      icon="contact"
      lang={sv ? "sv" : "en"}
      enHref="/contact"
      svHref="/sv/contact"
      backHref={sv ? "/sv" : "/"}
    >
        <header className="contact-hero-grid">
          <div className="contact-hero-copy">
            <p className="contact-description">
              {sv
                ? "Stilledev är en svensk mjukvarustudio grundad av Oliver Stille. Hör av dig om BudAI, digital utveckling, AI-projekt, samarbeten eller andra professionella frågor."
                : "Stilledev is a Swedish software studio founded by Oliver Stille. Get in touch about BudAI, digital development, AI projects, partnerships or other professional enquiries."}
            </p>
            <ContactEmailActions />
          </div>
          <div className="contact-signal-panel" aria-hidden="true">
            <span className="contact-signal-label">STILLEDEV <i /> OPEN CHANNEL</span>
            <div className="contact-signal-orbit contact-signal-orbit-a" />
            <div className="contact-signal-orbit contact-signal-orbit-b" />
            <div className="contact-signal-core"><StilledevMark size={48} /></div>
            <span className="contact-signal-line contact-signal-line-a" />
            <span className="contact-signal-line contact-signal-line-b" />
            <span className="contact-signal-node contact-signal-node-a" />
            <span className="contact-signal-node contact-signal-node-b" />
            <span className="contact-signal-caption">{sv ? "SVERIGE · SV / EN" : "SWEDEN · EN / SV"}</span>
            <span className="contact-signal-index">01</span>
          </div>
        </header>

        <section className="mt-12 grid gap-8 border-t border-white/[0.08] pt-8" aria-labelledby="contact-form-title">
          <div>
            <h2 id="contact-form-title" className="mb-2 text-2xl font-medium tracking-tight">{sv ? "Skicka en förfrågan" : "Send an enquiry"}</h2>
            <p className="mb-5 max-w-xl text-sm leading-relaxed text-muted">{sv ? "Beskriv kort vad du vill prata om. Föredrar du e-post kan du skriva direkt till företagets inkorg." : "Tell us briefly what you would like to discuss. If you prefer, email the business inbox directly."}</p>
            <ContactForm />
          </div>
          <aside className="h-fit rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent-cyan">{sv ? "STILLEDEV" : "STILLEDEV"}</p>
            <h2 className="mt-3 text-xl font-medium">{sv ? "Professionella ärenden" : "Professional enquiries"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{sv ? "För projektförfrågningar, samarbeten och frågor om BudAI är e-post och formuläret här rätt väg in." : "For project enquiries, collaborations and questions about BudAI, use the email address or form on this page."}</p>
            <p className="mt-5 border-t border-white/[0.08] pt-4 text-xs leading-relaxed text-muted">{sv ? "Kontaktuppgifter används för att hantera din förfrågan enligt vår integritetspolicy." : "Contact details are used to handle your enquiry as described in our privacy policy."}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <Link href={sv ? "/legal/privacy" : "/legal/privacy"} className="text-accent-cyan underline underline-offset-4">{sv ? "Integritetspolicy" : "Privacy policy"}</Link>
              <Link href={sv ? "/legal/gdpr" : "/legal/gdpr"} className="text-accent-cyan underline underline-offset-4">GDPR</Link>
            </div>
          </aside>
        </section>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-5 text-xs text-muted">
          <span>{sv ? "UTVECKLAD AV STILLEDEV · SVERIGE" : "DEVELOPED BY STILLEDEV · SWEDEN"}</span>
        </div>
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </StandalonePageShell>
  );
}
