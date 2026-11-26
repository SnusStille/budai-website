import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowLeft, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";
import "./profile.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const websiteId = `${siteUrl}/#website`;
const organizationId = `${siteUrl}/#organization`;
const personId = `${siteUrl}/oliver-stille#person`;
const github = "https://github.com/SnusStille";
const linkedin = "https://www.linkedin.com/in/oliver-stille-8bb48a403/";

type Copy = {
  title: string;
  description: string;
  back: string;
  label: string;
  role: string;
  intro: string;
  focus: string;
  projects: string;
  budai: string;
  budaiBody: string;
  tryBudai: string;
  labs: string;
  labsBody: string;
  openLabs: string;
  experience: string;
  experienceLabel: string;
  experienceBody: string;
  profiles: string;
  github: string;
  linkedin: string;
  contact: string;
  contactBody: string;
  email: string;
  privacyNote: string;
};

const COPY: Record<"en" | "sv", Copy> = {
  en: {
    title: "Oliver Stille – Founder of Stilledev",
    description: "Oliver Stille is the founder of Stilledev, a Swedish business working in digital development and AI. Explore BudAI, Stilledev Labs and verified professional profiles.",
    back: "Back to Stilledev",
    label: "FOUNDER · DIGITAL DEVELOPMENT & AI",
    role: "Founder of Stilledev",
    intro: "I’m Oliver Stille. I work on digital development and practical AI through Stilledev, the Swedish studio behind BudAI.",
    focus: "The focus is useful software: clear interfaces, thoughtful workflows and AI tools that help turn context into concrete next steps.",
    projects: "Projects",
    budai: "BudAI",
    budaiBody: "A live AI workspace for writing, planning and analysis in Swedish and English, with account features including user-controlled memory and history.",
    tryBudai: "Try the live Playground",
    labs: "Stilledev Labs",
    labsBody: "An experimental studio space for digital products and practical AI. Labs is in development; public work will be described here when it is ready to share.",
    openLabs: "Visit Stilledev Labs",
    experience: "Professional experience",
    experienceLabel: "Separate from Stilledev",
    experienceBody: "Meeting manager and coder at SkandiaMäklarna. This professional experience is separate from Stilledev; no employment dates are published here.",
    profiles: "Professional profiles",
    github: "GitHub projects and code",
    linkedin: "LinkedIn profile",
    contact: "Business contact",
    contactBody: "For Stilledev, BudAI or project enquiries, contact the business inbox:",
    email: CONTACT_EMAIL,
    privacyNote: "Only public professional information is included on this page. No private address or phone number is published.",
  },
  sv: {
    title: "Oliver Stille – Grundare av Stilledev",
    description: "Oliver Stille är grundare av Stilledev, en svensk verksamhet inom digital utveckling och AI. Upptäck BudAI, Stilledev Labs och verifierade yrkesprofiler.",
    back: "Tillbaka till Stilledev",
    label: "GRUNDARE · DIGITAL UTVECKLING & AI",
    role: "Grundare av Stilledev",
    intro: "Jag heter Oliver Stille och arbetar med digital utveckling och praktisk AI genom Stilledev, den svenska studion bakom BudAI.",
    focus: "Fokus ligger på användbar mjukvara: tydliga gränssnitt, genomtänkta arbetsflöden och AI-verktyg som gör kontext till konkreta nästa steg.",
    projects: "Projekt",
    budai: "BudAI",
    budaiBody: "En öppen AI-arbetsyta för skrivande, planering och analys på svenska och engelska, med kontofunktioner som minne du styr och historik.",
    tryBudai: "Prova Playground",
    labs: "Stilledev Labs",
    labsBody: "En experimentyta för digitala produkter och praktisk AI. Labs är under utveckling; offentliga projekt beskrivs här när de är redo att visas.",
    openLabs: "Besök Stilledev Labs",
    experience: "Yrkeserfarenhet",
    experienceLabel: "Separat från Stilledev",
    experienceBody: "Mötesansvarig och kodare på SkandiaMäklarna. Den yrkeserfarenheten är separat från Stilledev; anställningsdatum publiceras inte här.",
    profiles: "Professionella profiler",
    github: "Projekt och kod på GitHub",
    linkedin: "LinkedIn-profil",
    contact: "Företagskontakt",
    contactBody: "Frågor om Stilledev, BudAI eller projekt? Kontakta företagets inkorg:",
    email: CONTACT_EMAIL,
    privacyNote: "Sidan innehåller endast offentlig yrkesinformation. Ingen privat adress eller något privat telefonnummer publiceras.",
  },
};

async function pageContext() {
  const h = await headers();
  const path = h.get("x-budai-path") || "/oliver-stille";
  const sv = h.get("x-budai-lang") === "sv";
  const copy = COPY[sv ? "sv" : "en"];
  const canonicalPath = path === "/sv/oliver-stille" ? path : "/oliver-stille";
  const canonical = `${siteUrl}${canonicalPath}`;
  return { h, path, sv, copy, canonical };
}

export async function generateMetadata(): Promise<Metadata> {
  const { sv, copy, canonical } = await pageContext();
  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/oliver-stille`,
        sv: `${siteUrl}/sv/oliver-stille`,
        "x-default": `${siteUrl}/oliver-stille`,
      },
    },
    openGraph: {
      type: "profile",
      url: canonical,
      siteName: "Stilledev",
      title: copy.title,
      description: copy.description,
      firstName: "Oliver",
      lastName: "Stille",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stilledev and BudAI" }],
      locale: sv ? "sv_SE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: ["/og.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function OliverStillePage() {
  const { h, path, sv, copy, canonical } = await pageContext();
  const nonce = h.get("x-nonce") ?? undefined;
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonical}#profile`,
    url: canonical,
    name: copy.title,
    description: copy.description,
    inLanguage: sv ? "sv" : "en",
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    mainEntity: { "@id": personId },
    publisher: { "@id": organizationId },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: sv ? "Stilledev" : "Stilledev", item: sv ? `${siteUrl}/sv` : siteUrl },
        { "@type": "ListItem", position: 2, name: "Oliver Stille", item: canonical },
      ],
    },
  };
  const home = sv ? "/sv" : "/";
  const playground = sv ? "/sv#playground" : "/#playground";

  return (
    <main id="main" className="oliver-profile" data-profile-path={path}>
      <div className="oliver-profile-shell">
        <div className="oliver-profile-nav">
          <nav aria-label={sv ? "Brödsmulor" : "Breadcrumb"}>
            <ol>
              <li><a href={home} className="oliver-profile-back"><ArrowLeft size={15} aria-hidden="true" />{copy.back}</a></li>
              <li><span aria-current="page">Oliver Stille</span></li>
            </ol>
          </nav>
          <div className="oliver-profile-nav-actions">
            <div className="oliver-profile-languages" role="group" aria-label={sv ? "Välj språk" : "Choose language"}>
              <a href="/oliver-stille" aria-current={!sv ? "page" : undefined}>EN</a>
              <a href="/sv/oliver-stille" aria-current={sv ? "page" : undefined}>SV</a>
            </div>
            <a href={sv ? "/sv/labs" : "/labs"}>{copy.labs}<ArrowUpRight size={13} aria-hidden="true" /></a>
          </div>
        </div>

        <header className="oliver-profile-hero">
          <p className="oliver-profile-kicker"><span />{copy.label}</p>
          <h1>Oliver Stille</h1>
          <p className="oliver-profile-role">{copy.role} <span>·</span> {sv ? "Stilledev EF · Sverige" : "Stilledev · Sweden"}</p>
          <p className="oliver-profile-intro">{copy.intro}</p>
          <p className="oliver-profile-focus">{copy.focus}</p>
        </header>

        <section className="oliver-profile-section" aria-labelledby="oliver-projects-title">
          <div className="oliver-profile-section-heading"><span>01</span><h2 id="oliver-projects-title">{copy.projects}</h2></div>
          <div className="oliver-profile-cards">
            <article className="oliver-profile-card">
              <span className="oliver-profile-card-label">LIVE PRODUCT</span>
              <h3>{copy.budai}</h3>
              <p>{copy.budaiBody}</p>
              <a href={playground}>{copy.tryBudai}<ArrowUpRight size={15} aria-hidden="true" /></a>
            </article>
            <article className="oliver-profile-card">
              <span className="oliver-profile-card-label">IN DEVELOPMENT</span>
              <h3>{copy.labs}</h3>
              <p>{copy.labsBody}</p>
              <a href={sv ? "/sv/labs" : "/labs"}>{copy.openLabs}<ArrowUpRight size={15} aria-hidden="true" /></a>
            </article>
          </div>
        </section>

        <section className="oliver-profile-section" aria-labelledby="oliver-experience-title">
          <div className="oliver-profile-section-heading"><span>02</span><h2 id="oliver-experience-title">{copy.experience}</h2></div>
          <article className="oliver-profile-experience">
            <div><span className="oliver-profile-card-label">{copy.experienceLabel}</span><h3>SkandiaMäklarna</h3></div>
            <p>{copy.experienceBody}</p>
          </article>
        </section>

        <section className="oliver-profile-section oliver-profile-links" aria-labelledby="oliver-profiles-title">
          <div className="oliver-profile-section-heading"><span>03</span><h2 id="oliver-profiles-title">{copy.profiles}</h2></div>
          <div className="oliver-profile-socials">
            <a href={linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17} aria-hidden="true" />{copy.linkedin}<ArrowUpRight size={14} aria-hidden="true" /></a>
            <a href={github} target="_blank" rel="noopener noreferrer"><Github size={17} aria-hidden="true" />{copy.github}<ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="oliver-profile-contact" aria-labelledby="oliver-contact-title">
          <div><span className="oliver-profile-card-label">{sv ? "STILLEDEV EF" : "STILLEDEV"}</span><h2 id="oliver-contact-title">{copy.contact}</h2><p>{copy.contactBody}</p></div>
          <a href={CONTACT_MAILTO}><Mail size={16} aria-hidden="true" />{copy.email}<ArrowUpRight size={14} aria-hidden="true" /></a>
        </section>

        <p className="oliver-profile-privacy">{copy.privacyNote}</p>
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd).replace(/</g, "\\u003c") }} />
      </div>
    </main>
  );
}
