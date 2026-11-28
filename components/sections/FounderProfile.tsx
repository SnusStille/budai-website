import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import StandalonePageShell from "@/components/site/StandalonePageShell";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

export default function FounderProfile({ sv = false, nonce }: { sv?: boolean; nonce?: string }) {
  const home = sv ? "/sv" : "/";
  const contact = sv ? "/sv/contact" : "/contact";
  const labs = sv ? "/sv/labs" : "/labs";
  const profilePath = sv ? "/sv/oliver-stille" : "/oliver-stille";
  const canonical = `${siteUrl}${profilePath}`;
  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonical}#profile`,
    url: canonical,
    name: sv ? "Oliver Stille — grundare av Stilledev" : "Oliver Stille — Founder of Stilledev",
    mainEntity: { "@id": `${siteUrl}/#person` },
  };

  return (
    <StandalonePageShell
      title="Oliver Stille"
      eyebrow={sv ? "STILLEDEV · GRUNDARE" : "STILLEDEV · FOUNDER"}
      icon="founder"
      lang={sv ? "sv" : "en"}
      enHref="/oliver-stille"
      svHref="/sv/oliver-stille"
      backHref={home}
    >
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePage).replace(/</g, "\\u003c") }} />
      <p className="standalone-profile-lead text-base leading-relaxed text-white sm:text-lg">
        {sv
          ? "Grundare av Stilledev — en svensk mjukvarustudio för digital utveckling och AI."
          : "Founder of Stilledev — a Swedish software studio focused on digital development and AI."}
      </p>
      <p className="mt-4">
        {sv
          ? "Oliver arbetar med att utveckla digitala produkter och tillämpad AI. Stilledev bygger BudAI, en AI-arbetsyta för skrivande, planering och analys på svenska och engelska."
          : "Oliver works across digital product development and applied AI. Stilledev builds BudAI, an AI workspace for writing, planning and analysis in Swedish and English."}
      </p>
      <div className="standalone-page-actions">
        <Link href={labs} className="standalone-page-action standalone-page-action-primary">
          <FlaskConical size={14} aria-hidden="true" />{sv ? "Stilledev Labs" : "Stilledev Labs"}<ArrowUpRight size={14} aria-hidden="true" />
        </Link>
        <Link href={home} className="standalone-page-action">
          {sv ? "Utforska BudAI" : "Explore BudAI"}<ArrowUpRight size={14} aria-hidden="true" />
        </Link>
        <Link href={contact} className="standalone-page-action">
          {sv ? "Kontakta Stilledev" : "Contact Stilledev"}<ArrowUpRight size={14} aria-hidden="true" />
        </Link>
        <a className="standalone-page-action" href="https://www.linkedin.com/in/oliver-stille-8bb48a403/" target="_blank" rel="noopener noreferrer">
          LinkedIn<ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </StandalonePageShell>
  );
}
