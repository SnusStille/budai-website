import { headers } from "next/headers";
import ContactForm from "@/components/sections/ContactForm";
import StandalonePageShell from "@/components/site/StandalonePageShell";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";

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
      showShare={false}
      showReadingProgress={false}
    >
      <section aria-label={sv ? "Kontaktformulär" : "Enquiry form"}>
        <p className="mb-4 text-sm text-muted">
          {sv ? "Föredrar du att mejla företaget direkt? " : "Prefer to email the company directly? "}
          <a className="inline-flex min-h-11 items-center text-accent-cyan underline underline-offset-4" href={CONTACT_MAILTO}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <ContactForm />
      </section>
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </StandalonePageShell>
  );
}
