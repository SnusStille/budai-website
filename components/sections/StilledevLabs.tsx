"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Github,
  Globe,
  Linkedin,
  Lock,
  Mail,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { EXAMPLE_SOURCE } from "@/lib/experience/code";
import {
  COMPANY_REGISTRY,
  CONTACT_CHANNELS,
  FOUNDER_PROFILE,
  STILLEDEV_DOMAINS,
  STILLEDEV_PROJECTS,
  type StilledevProject,
} from "@/lib/stilledev-labs";

function ProjectVisual({ project, sv }: { project: StilledevProject; sv: boolean }) {
  if (project.visual === "budai") {
    return (
      <div className="labs-project-visual labs-visual-budai" aria-hidden="true">
        <div className="labs-visual-chrome">
          <span className="labs-visual-dots"><i /><i /><i /></span>
          <span className="labs-visual-host">stilledev.se · budai.core</span>
          <span className="labs-visual-tag">SV ↔ EN</span>
        </div>
        <div className="labs-visual-stage">
          <div className="labs-budai-orbit">
            <span className="labs-orbit-ring labs-orbit-ring-outer" />
            <span className="labs-orbit-ring labs-orbit-ring-inner" />
            <div className="labs-budai-core-wrap">
              <BudAILogo size="sm" animated={false} />
            </div>
          </div>
          <div className="labs-budai-stream">
            <div className="labs-stream-pill">
              <b>01</b>
              <span>{sv ? "Signal → Strukturerad handling" : "Signal → Structured action"}</span>
            </div>
            <div className="labs-stream-lines">
              <span className="w-[88%]" />
              <span className="w-[66%]" />
            </div>
            <div className="labs-stream-meta">
              <code>memory: user_controlled</code>
              <b>LIVE</b>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (project.visual === "stilleaffe") {
    return (
      <div className="labs-project-visual labs-visual-affe" aria-hidden="true">
        <div className="labs-visual-chrome">
          <span className="labs-visual-dots"><i /><i /><i /></span>
          <span className="labs-visual-host">stilleaffe · mission.control</span>
          <span className="labs-visual-tag labs-tag-emerald">AUTH</span>
        </div>
        <div className="labs-visual-stage labs-affe-stage">
          <div className="labs-affe-top">
            <div className="labs-affe-roles">
              <span className="is-active">S · {sv ? "Säljvy" : "Seller"}</span>
              <span>A · {sv ? "Chefsvy" : "Manager"}</span>
            </div>
            <code className="labs-affe-pace">{sv ? "DAGSRYTM · AKTIV" : "DAILY PACE · ACTIVE"}</code>
          </div>
          <div className="labs-affe-bars">
            {[44, 62, 56, 78, 92].map((h, idx) => (
              <div key={idx} className="labs-affe-bar-col">
                <span style={{ height: `${h}%` }} className={idx === 4 ? "is-peak" : undefined} />
                <small>0{idx + 1}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (project.visual === "second-brain") {
    return (
      <div className="labs-project-visual labs-visual-brain" aria-hidden="true">
        <div className="labs-visual-chrome">
          <span className="labs-visual-dots"><i /><i /><i /></span>
          <span className="labs-visual-host">second.brain · knowledge.graph</span>
          <span className="labs-visual-tag labs-tag-lavender">AI</span>
        </div>
        <div className="labs-visual-stage labs-brain-stage">
          <svg className="labs-brain-links" viewBox="0 0 280 110" fill="none">
            <path
              d="M62 32 C110 32, 112 56, 144 56"
              stroke="rgba(122, 219, 240, 0.42)"
              strokeWidth="1.2"
            />
            <path
              d="M62 82 C110 82, 112 56, 144 56"
              stroke="rgba(164, 175, 232, 0.42)"
              strokeWidth="1.2"
            />
            <path
              d="M144 56 C182 56, 192 56, 224 56"
              stroke="rgba(110, 231, 183, 0.48)"
              strokeWidth="1.2"
            />
            <circle cx="62" cy="32" r="3.5" fill="#7adbf0" />
            <circle cx="62" cy="82" r="3.5" fill="#a4afe8" />
            <circle cx="144" cy="56" r="4.5" fill="#e6f7ff" />
            <circle cx="224" cy="56" r="3.5" fill="#6ee7b7" />
          </svg>
          <div className="labs-brain-nodes">
            <span className="labs-node labs-node-a">{sv ? "Anteckningar" : "Notes"}</span>
            <span className="labs-node labs-node-b">{sv ? "Kontext" : "Context"}</span>
            <span className="labs-node labs-node-hub">{sv ? "AI-syntes" : "AI Synthesis"}</span>
            <span className="labs-node labs-node-out">{sv ? "Fokus & plan" : "Focus & plan"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="labs-project-visual labs-visual-blueprint" aria-hidden="true">
      <div className="labs-visual-chrome">
        <span className="labs-visual-dots"><i /><i /><i /></span>
        <span className="labs-visual-host">stilledev.labs · module.{project.index}</span>
        <span className="labs-visual-tag">SYS</span>
      </div>
      <div className="labs-visual-stage labs-blueprint-stage">
        <StilledevMark size={30} />
        <code>{project.name.toLowerCase().replace(/\s+/g, ".")}</code>
      </div>
    </div>
  );
}

export default function StilledevLabs() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyExampleSource = () => {
    void navigator.clipboard?.writeText(EXAMPLE_SOURCE).then(() => {
      setCopiedSource(true);
      window.setTimeout(() => setCopiedSource(false), 1600);
    });
  };

  const copyEmailAddress = () => {
    void navigator.clipboard?.writeText("Stilleinc@hotmail.com").then(() => {
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    });
  };

  const navAnchors = [
    { num: "A", label: sv ? "Grundaren" : "Founder", href: "#builder-profile" },
    { num: "B", label: sv ? "Om Stilledev" : "About Stilledev", href: "#about-stilledev" },
    { num: "C", label: sv ? "Projekt" : "Projects", href: "#stilledev-projects" },
    { num: "D", label: sv ? "Kontakt" : "Contact", href: "#stilledev-contact" },
    { num: "E", label: sv ? "Företagsinfo" : "Company", href: "#stilledev-company" },
  ];

  const channelIcon = (id: (typeof CONTACT_CHANNELS)[number]["id"]) => {
    switch (id) {
      case "email":
        return Mail;
      case "website":
        return Globe;
      case "github":
        return Github;
      case "linkedin":
        return Linkedin;
    }
  };

  const registryRows: Array<{ label: string; value: string; muted?: boolean }> = [
    {
      label: sv ? "Företag" : "Company",
      value: COMPANY_REGISTRY.name,
    },
    {
      label: sv ? "Bolagsform" : "Legal form",
      value: sv ? COMPANY_REGISTRY.legalForm.sv : COMPANY_REGISTRY.legalForm.en,
    },
    {
      label: sv ? "Grundare" : "Founder",
      value: COMPANY_REGISTRY.founder,
    },
    {
      label: sv ? "Verksamhetsområde" : "Operations",
      value: sv ? COMPANY_REGISTRY.scope.sv : COMPANY_REGISTRY.scope.en,
    },
    {
      label: sv ? "Land" : "Country",
      value: sv ? COMPANY_REGISTRY.country.sv : COMPANY_REGISTRY.country.en,
    },
  ];

  if (COMPANY_REGISTRY.orgNumber) {
    registryRows.push({
      label: sv ? "Organisationsnummer" : "Organization ID",
      value: COMPANY_REGISTRY.orgNumber,
    });
  }
  if (COMPANY_REGISTRY.vatNumber) {
    registryRows.push({
      label: sv ? "Momsreg.nr (VAT)" : "VAT number",
      value: COMPANY_REGISTRY.vatNumber,
    });
  }
  if (COMPANY_REGISTRY.fSkatt) {
    registryRows.push({
      label: sv ? "Skatteregistrering" : "Tax status",
      value: COMPANY_REGISTRY.fSkatt,
    });
  }
  if (COMPANY_REGISTRY.registeredAddress) {
    registryRows.push({
      label: sv ? "Adress" : "Address",
      value: COMPANY_REGISTRY.registeredAddress,
    });
  }
  if (!COMPANY_REGISTRY.orgNumber && !COMPANY_REGISTRY.registeredAddress) {
    registryRows.push({
      label: sv ? "Org.nr & registrering" : "Registration details",
      value: sv
        ? "Lämnas vid offert, samarbete eller förfrågan"
        : "Provided upon proposal, partnership, or request",
      muted: true,
    });
  }

  return (
    <div id="stilledev-labs" className="stilledev-labs-shell" data-stilledev-labs>
      <div className="stilledev-labs-container">
        {/* Studio conduit & Architectural Intro */}
        <ScrollReveal className="labs-intro">
          <div className="capabilities-bridge-dock" aria-hidden="true">
            <span className="capabilities-bridge-stem" />
            <span className="capabilities-bridge-node" />
          </div>
          <div className="labs-intro-header">
            <div>
              <span className="chapter-label inline-flex items-center gap-2.5">
                <StilledevMark size={16} />
                04.2 / {sv ? "STILLEDEV LABS · UTVECKLINGSBOLAG & TECH-LAB" : "STILLEDEV LABS · SOFTWARE STUDIO & TECH LAB"}
              </span>
              <h2 className="labs-display-title">
                Stilledev Labs.{" "}
                <span className="text-gradient">
                  {sv ? "Idéer byggda till riktig mjukvara." : "Ideas engineered into real software."}
                </span>
              </h2>
            </div>
            <p className="labs-intro-lead">
              {sv
                ? "Bakom BudAI står Stilledev — ett svenskt digitalt utvecklingsbolag och personligt tech-lab där AI-lösningar, webbapplikationer och egna produkter tar form från första koncept till färdig produkt."
                : "Behind BudAI is Stilledev — a Swedish digital development studio and personal tech lab where AI systems, web applications, and independent software products move from first concept to shipped reality."}
            </p>
          </div>

          <nav
            className="labs-subnav"
            aria-label={sv ? "Navigering för Stilledev Labs" : "Stilledev Labs navigation"}
          >
            {navAnchors.map((item) => (
              <a key={item.href} href={item.href} className="labs-subnav-pill">
                <b>{item.num}</b>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </ScrollReveal>

        {/* A. Meet the Founder */}
        <div id="builder-profile" className="labs-founder-grid">
          <ScrollReveal className="labs-founder-copy">
            <span className="chapter-label">
              <i />A · {sv ? "MÖT GRUNDAREN · MEET THE FOUNDER" : "MEET THE FOUNDER · THE HUMAN BEHIND THE CODE"}
            </span>
            <h3>
              {FOUNDER_PROFILE.headline.line1}
              <br />
              <span className="text-gradient">
                {sv ? FOUNDER_PROFILE.headline.line2.sv : FOUNDER_PROFILE.headline.line2.en}
              </span>
            </h3>

            <div className="labs-founder-paragraphs">
              {(sv ? FOUNDER_PROFILE.paragraphs.sv : FOUNDER_PROFILE.paragraphs.en).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="builder-stack">
              {FOUNDER_PROFILE.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <ul className="builder-values">
              {(sv ? FOUNDER_PROFILE.principles.sv : FOUNDER_PROFILE.principles.en).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="builder-links">
              <a
                href="#playground"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("budai:prompt", {
                      detail: sv
                        ? "Skapa en tydlig lanseringsplan på svenska och engelska med milstolpar, risker och nästa steg."
                        : "Create a clear bilingual launch plan in Swedish and English with milestones, risks, and next steps.",
                    })
                  )
                }
              >
                {sv ? "Prova exemplet i Playground" : "Try this prompt in Playground"}
                <ArrowRight size={13} />
              </a>
              <a href="#stilledev-projects">
                {sv ? "Utforska projekt" : "Explore projects"}
                <ArrowRight size={13} />
              </a>
              <a href="#stilledev-contact">
                <Mail size={14} />
                {sv ? "Kontakta Oliver" : "Contact Oliver"}
              </a>
            </div>

            <details className="builder-source-details">
              <summary>
                {sv ? "Läs kodexemplet från 3D-skärmen" : "Read the code example"}
                <Code2 size={14} />
              </summary>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="!mt-0">
                  {sv
                    ? "Ett illustrativt anrop till Playground. Koden på skärmen körs inte och gör inga nätverksanrop."
                    : "An illustrative request to the Playground. The code on the monitor is not executed and makes no network requests."}
                </p>
                <button
                  type="button"
                  onClick={copyExampleSource}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 font-mono text-[10px] text-accent-cyan transition-colors hover:border-accent-cyan/50 hover:text-white"
                >
                  {copiedSource ? <Check size={11} /> : <Copy size={11} />}
                  {copiedSource ? (sv ? "Kopierad" : "Copied") : (sv ? "Kopiera TS" : "Copy TS")}
                </button>
              </div>
              <pre tabIndex={0}>
                <code>{EXAMPLE_SOURCE}</code>
              </pre>
            </details>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="labs-founder-card-wrap">
            <SpotlightCard maxTilt={3.8} className="labs-founder-plate">
              <span className="labs-caliper labs-caliper-tl" aria-hidden="true" />
              <span className="labs-caliper labs-caliper-tr" aria-hidden="true" />
              <span className="labs-caliper labs-caliper-bl" aria-hidden="true" />
              <span className="labs-caliper labs-caliper-br" aria-hidden="true" />

              <div className="labs-founder-plate-head">
                <div className="flex items-center gap-3.5">
                  <div className="labs-founder-monogram">
                    <StilledevMark size={28} />
                  </div>
                  <div>
                    <div className="labs-founder-name">{FOUNDER_PROFILE.name}</div>
                    <div className="labs-founder-role">
                      {sv ? FOUNDER_PROFILE.role.sv : FOUNDER_PROFILE.role.en}
                    </div>
                  </div>
                </div>
                <span className="labs-origin-chip">
                  <i />
                  {sv ? "SVERIGE · SE" : "SWEDEN · SE"}
                </span>
              </div>

              <div className="labs-founder-metrics">
                {FOUNDER_PROFILE.metrics.map((metric) => (
                  <div key={metric.value} className="labs-metric-cell">
                    <b>{metric.value}</b>
                    <span>{sv ? metric.label.sv : metric.label.en}</span>
                  </div>
                ))}
              </div>

              <div className="labs-workflow-block">
                <div className="labs-workflow-kicker">
                  {sv ? "ARBETSSÄTT · FRÅN IDÉ TILL LEVERANS" : "APPROACH · IDEA TO PRODUCTION"}
                </div>
                <ol className="labs-workflow-steps">
                  {FOUNDER_PROFILE.workflow.map((w) => (
                    <li key={w.step}>
                      <span className="labs-step-num">{w.step}</span>
                      <div>
                        <strong>{sv ? w.title.sv : w.title.en}</strong>
                        <small>{sv ? w.detail.sv : w.detail.en}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="labs-founder-plate-foot">
                <span>
                  {sv ? FOUNDER_PROFILE.base.sv : FOUNDER_PROFILE.base.en}
                </span>
                <div className="labs-founder-quicklinks">
                  <a
                    href="https://github.com/SnusStille"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Oliver Stille GitHub"
                  >
                    <Github size={14} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/oliver-stille-8bb48a403/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Oliver Stille LinkedIn"
                  >
                    <Linkedin size={14} />
                  </a>
                  <a href="mailto:Stilleinc@hotmail.com" aria-label="Email Oliver Stille">
                    <Mail size={14} />
                  </a>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        </div>

        {/* B. About Stilledev */}
        <div id="about-stilledev" className="labs-subsection">
          <ScrollReveal className="labs-section-head">
            <div>
              <span className="chapter-label">
                <i />B · {sv ? "OM STILLEDEV · PLATTFORM FÖR DIGITAL UTVECKLING" : "ABOUT STILLEDEV · DIGITAL DEVELOPMENT PLATFORM"}
              </span>
              <h3>
                {sv ? "Ett modernt utvecklingsbolag." : "A modern software studio."}
                <br />
                <span>{sv ? "Drivet som enskild firma i Sverige." : "Operated as a Swedish sole proprietorship."}</span>
              </h3>
            </div>
            <p>
              {sv
                ? "Stilledev är mitt registrerade företag (enskild firma) och navet för allt jag bygger — från skräddarsydda AI-integrationer och webbapplikationer till egna digitala produkter och mjukvaruexperiment."
                : "Stilledev is my registered business (Swedish Enskild firma) and the platform behind everything I build — spanning custom AI integrations, full-stack web applications, SaaS products, and independent R&D."}
            </p>
          </ScrollReveal>

          <div className="labs-domains-grid">
            {STILLEDEV_DOMAINS.map((domain, idx) => (
              <ScrollReveal
                key={domain.id}
                delay={Math.min(0.18, idx * 0.04)}
                className={idx === 0 ? "labs-domain-span" : undefined}
              >
                <SpotlightCard maxTilt={3} className="labs-domain-card h-full">
                  <div className="labs-domain-top">
                    <span className="labs-domain-num">{domain.num}</span>
                    <code>{domain.code}</code>
                  </div>
                  <h4>{sv ? domain.title.sv : domain.title.en}</h4>
                  <p>{sv ? domain.description.sv : domain.description.en}</p>
                  <ul className="labs-domain-tags">
                    {(sv ? domain.highlights.sv : domain.highlights.en).map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* C. Stilledev Projects */}
        <div id="stilledev-projects" className="labs-subsection">
          <ScrollReveal className="labs-section-head">
            <div>
              <span className="chapter-label">
                <i />C · {sv ? "STILLEDEV PROJECTS · UTVECKLADE SYSTEM" : "STILLEDEV PROJECTS · ENGINEERED SYSTEMS"}
              </span>
              <h3>
                {sv ? "Utvalda projekt." : "Selected projects."}
                <br />
                <span>{sv ? "Produkter, verktyg och plattformar." : "Products, tools, and platforms."}</span>
              </h3>
            </div>
            <p>
              {sv
                ? "Ett urval av system utvecklade under Stilledev — från den öppna förhandsvisningen av BudAI till specialiserade sälj- och kunskapsverktyg."
                : "Systems engineered under Stilledev — from the open developer preview of BudAI to specialized sales and personal knowledge platforms."}
            </p>
          </ScrollReveal>

          <div className="labs-projects-grid">
            {STILLEDEV_PROJECTS.map((project, idx) => (
              <ScrollReveal key={project.id} delay={idx * 0.06}>
                <SpotlightCard maxTilt={4} className="labs-project-card h-full">
                  <ProjectVisual project={project} sv={sv} />

                  <div className="labs-project-body">
                    <div className="labs-project-meta">
                      <span className="labs-project-idx">{project.index}</span>
                      {project.status && (
                        <span className={`labs-status-badge labs-status-${project.status.tone}`}>
                          <i />
                          {sv ? project.status.label.sv : project.status.label.en}
                        </span>
                      )}
                    </div>

                    <h4>{project.name}</h4>
                    <div className="labs-project-category">
                      {sv ? project.category.sv : project.category.en}
                    </div>
                    <p>{sv ? project.summary.sv : project.summary.en}</p>

                    <div className="labs-project-stack">
                      {project.stack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>

                    <div className="labs-project-actions">
                      {project.links.length > 0 ? (
                        project.links.map((link) => (
                          <a
                            key={`${project.id}-${link.href}`}
                            href={link.href}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noopener noreferrer" : undefined}
                            className={
                              link.kind === "primary"
                                ? "labs-project-link labs-project-link-primary"
                                : "labs-project-link"
                            }
                          >
                            {link.kind === "github" && <Github size={13} />}
                            <span>{sv ? link.label.sv : link.label.en}</span>
                            {link.external ? <ArrowUpRight size={13} /> : <ArrowRight size={13} />}
                          </a>
                        ))
                      ) : (
                        <span className="labs-project-private">
                          <Lock size={12} />
                          {project.privateNote
                            ? sv
                              ? project.privateNote.sv
                              : project.privateNote.en
                            : sv
                              ? "Privat system"
                              : "Private system"}
                        </span>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* D & E. Contact & Connect + Company Information */}
        <div className="labs-subsection labs-bottom-grid">
          <div id="stilledev-contact" className="labs-contact-anchor">
            <ScrollReveal className="labs-contact-panel">
              <span className="chapter-label">
                <i />D · {sv ? "KONTAKT & SAMARBETE · CONTACT & CONNECT" : "CONTACT & CONNECT · INQUIRIES & PARTNERSHIPS"}
              </span>
              <h3>
                {sv ? "Hör av dig." : "Get in touch."}
                <br />
                <span>
                  {sv
                    ? "För uppdrag, samarbeten eller produktfrågor."
                    : "For projects, partnerships, or product inquiries."}
                </span>
              </h3>
              <p className="labs-contact-lead">
                {sv
                  ? "Vill du diskutera en webbapplikation, AI-integration, ett tekniskt samarbete eller ge feedback på BudAI? Nå mig direkt via e-post eller koppla upp på GitHub och LinkedIn."
                  : "Looking to build a web application, integrate AI into a workflow, explore a partnership, or share feedback on BudAI? Reach out directly by email or connect on GitHub and LinkedIn."}
              </p>

              <div className="labs-direct-email">
                <div className="labs-direct-email-info">
                  <small>{sv ? "DIREKT E-POST" : "DIRECT EMAIL"}</small>
                  <strong>Stilleinc@hotmail.com</strong>
                </div>
                <div className="labs-direct-email-actions">
                  <a href="mailto:Stilleinc@hotmail.com" className="labs-email-cta">
                    <Mail size={14} />
                    <span>{sv ? "Skicka e-post" : "Send email"}</span>
                  </a>
                  <button
                    type="button"
                    onClick={copyEmailAddress}
                    className="labs-email-copy"
                    aria-label={sv ? "Kopiera e-postadress" : "Copy email address"}
                  >
                    {copiedEmail ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedEmail ? (sv ? "Kopierad" : "Copied") : (sv ? "Kopiera" : "Copy")}</span>
                  </button>
                </div>
              </div>

              <div className="labs-channels-grid">
                {CONTACT_CHANNELS.map((channel) => {
                  const Icon = channelIcon(channel.id);
                  return (
                    <a
                      key={channel.id}
                      href={channel.href}
                      target={channel.external ? "_blank" : undefined}
                      rel={channel.external ? "noopener noreferrer" : undefined}
                      className="labs-channel-card"
                    >
                      <div className="labs-channel-head">
                        <span className="labs-channel-icon">
                          <Icon size={15} />
                        </span>
                        <ArrowUpRight size={14} className="labs-channel-arrow" />
                      </div>
                      <div className="labs-channel-label">
                        {sv ? channel.label.sv : channel.label.en}
                      </div>
                      <div className="labs-channel-value">{channel.value}</div>
                      <div className="labs-channel-note">
                        {sv ? channel.note.sv : channel.note.en}
                      </div>
                    </a>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>

          <div id="stilledev-company" className="labs-company-anchor">
            <ScrollReveal delay={0.08} className="labs-company-panel h-full">
              <div className="labs-company-card">
                <div className="labs-company-head">
                  <span className="chapter-label">
                    <i />E · {sv ? "FÖRETAGSINFORMATION" : "COMPANY INFORMATION"}
                  </span>
                  <div className="labs-company-brand">
                    <StilledevMark size={24} />
                    <div>
                      <h4>{COMPANY_REGISTRY.name}</h4>
                      <span>{sv ? "Enskild firma · Sverige" : "Sole proprietorship · Sweden"}</span>
                    </div>
                  </div>
                </div>

                <dl className="labs-company-ledger">
                  {registryRows.map((row) => (
                    <div key={row.label} className="labs-ledger-row">
                      <dt>{row.label}</dt>
                      <dd className={row.muted ? "is-muted" : undefined}>{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="labs-company-foot">
                  <span className="labs-company-dot" aria-hidden="true" />
                  <p>
                    {sv
                      ? "Stilledev drivs från Sverige av Oliver Stille med fokus på långsiktig mjukvarukvalitet, transparens och integritet."
                      : "Stilledev is operated out of Sweden by Oliver Stille with a focus on dependable engineering, transparency, and privacy."}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
