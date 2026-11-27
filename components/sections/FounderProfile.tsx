import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { StilledevMark } from "@/components/ui/BudAILogo";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

export default function FounderProfile({ sv = false }: { sv?: boolean }) {
  const home = sv ? "/sv" : "/";
  const contact = sv ? "/sv/contact" : "/contact";
  const canonical = `${siteUrl}${sv ? "/sv/oliver-stille" : "/oliver-stille"}`;
  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonical}#profile`,
    url: canonical,
    name: sv ? "Oliver Stille — grundare av Stilledev" : "Oliver Stille — Founder of Stilledev",
    mainEntity: { "@id": `${siteUrl}/#person` },
  };

  return (
    <main className="founder-profile" id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePage).replace(/</g, "\\u003c") }} />
      <div className="founder-profile-grid" aria-hidden="true" />
      <header className="founder-profile-header">
        <Link href={home} className="founder-profile-brand" aria-label={sv ? "Stilledev startsida" : "Stilledev home"}>
          <StilledevMark size={25} />
          <span>STILLEDEV</span>
        </Link>
        <nav className="founder-profile-languages" aria-label={sv ? "Välj språk" : "Choose language"}>
          <Link href="/oliver-stille" aria-current={!sv ? "page" : undefined}>EN</Link>
          <Link href="/sv/oliver-stille" aria-current={sv ? "page" : undefined}>SV</Link>
        </nav>
      </header>

      <article className="founder-profile-content">
        <p className="founder-profile-eyebrow">STILLEDEV / {sv ? "GRUNDARE" : "FOUNDER"}</p>
        <h1>Oliver <span>Stille</span></h1>
        <p className="founder-profile-lead">
          {sv
            ? "Grundare av Stilledev — en svensk mjukvarustudio för digital utveckling och AI."
            : "Founder of Stilledev — a Swedish software studio focused on digital development and AI."}
        </p>
        <p className="founder-profile-body">
          {sv
            ? "Oliver arbetar med att utveckla digitala produkter och tillämpad AI. Stilledev bygger BudAI, en AI-arbetsyta för skrivande, planering och analys på svenska och engelska."
            : "Oliver works across digital product development and applied AI. Stilledev builds BudAI, an AI workspace for writing, planning and analysis in Swedish and English."}
        </p>
        <div className="founder-profile-links">
          <Link href={home}>
            {sv ? "Utforska BudAI" : "Explore BudAI"}<ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <Link href={contact}>
            {sv ? "Kontakta Stilledev" : "Contact Stilledev"}<ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <a href="https://www.linkedin.com/in/oliver-stille-8bb48a403/" target="_blank" rel="noopener noreferrer">
            LinkedIn<ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </article>

      <footer className="founder-profile-footer">
        <Link href={home}><ArrowLeft size={14} aria-hidden="true" />{sv ? "Till Stilledev" : "Back to Stilledev"}</Link>
        <span>{sv ? "UTVECKLAT I SVERIGE" : "BUILT IN SWEDEN"}</span>
      </footer>
    </main>
  );
}
