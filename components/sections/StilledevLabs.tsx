"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  FileText,
  Github,
  Globe,
  Layers,
  Linkedin,
  Lock,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { CODE_LINES, EXAMPLE_SOURCE } from "@/lib/experience/code";
import {
  COMPANY_REGISTRY,
  CONTACT_CHANNELS,
  FOUNDER_PROFILE,
  INQUIRY_TOPICS,
  STILLEDEV_DOMAINS,
  STILLEDEV_PROJECTS,
  type DomainSchematicKind,
  type StilledevInquiryTopic,
  type StilledevProject,
} from "@/lib/stilledev-labs";

function useStockholmClock() {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        const formatted = new Intl.DateTimeFormat("sv-SE", {
          timeZone: "Europe/Stockholm",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
        setClock(formatted);
      } catch {
        setClock(null);
      }
    };
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return clock;
}

function DomainSchematic({ kind, sv }: { kind: DomainSchematicKind; sv: boolean }) {
  if (kind === "ai-pipeline") {
    const stages = sv
      ? [
          { code: "IN", label: "Indata & röst" },
          { code: "MEM", label: "Kontextminne" },
          { code: "LLM", label: "SSE-ström" },
          { code: "OUT", label: "Strukturerat svar" },
        ]
      : [
          { code: "IN", label: "Prompt & voice" },
          { code: "MEM", label: "Context gate" },
          { code: "LLM", label: "SSE stream" },
          { code: "OUT", label: "Structured output" },
        ];
    return (
      <div className="labs-schematic labs-schematic-ai" aria-hidden="true">
        <div className="labs-ai-pipeline">
          {stages.map((s, idx) => (
            <div key={s.code} className="labs-ai-stage">
              <div className={`labs-ai-node ${idx === 2 ? "is-core" : ""}`}>
                <small>{s.code}</small>
                <span>{s.label}</span>
              </div>
              {idx < stages.length - 1 && (
                <span className="labs-ai-connector">
                  <i />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "web-craft") {
    return (
      <div className="labs-schematic" aria-hidden="true">
        <div className="labs-web-frames">
          <div className="labs-web-desktop">
            <span className="labs-web-bar"><i /><i /></span>
            <div className="labs-web-grid">
              <span />
              <span />
            </div>
          </div>
          <div className="labs-web-mobile">
            <span className="labs-web-notch" />
            <i />
          </div>
          <div className="labs-web-metrics">
            <code>SSR / Edge</code>
            <code>Nonce CSP</code>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "saas-layers") {
    const layers = sv
      ? ["Auth & session", "Rollbaserad vy", "Postgres · RLS"]
      : ["Auth & session", "Role workspace", "Postgres · RLS"];
    return (
      <div className="labs-schematic" aria-hidden="true">
        <div className="labs-saas-stack">
          {layers.map((layer, idx) => (
            <div key={layer} className={`labs-saas-layer layer-${idx + 1}`}>
              <b>L{idx + 1}</b>
              <span>{layer}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "workflow-nodes") {
    return (
      <div className="labs-schematic" aria-hidden="true">
        <div className="labs-flow-mini">
          <span className="labs-flow-chip">{sv ? "Rådata" : "Raw signal"}</span>
          <i className="labs-flow-line" />
          <span className="labs-flow-chip is-hub">{sv ? "AI-syntes" : "Synthesis"}</span>
          <i className="labs-flow-line" />
          <span className="labs-flow-chip is-out">{sv ? "Åtgärdsplan" : "Action plan"}</span>
        </div>
      </div>
    );
  }

  const milestones = sv
    ? ["Idé", "Prototyp", "Preview", "Live"]
    : ["Concept", "Prototype", "Preview", "Shipped"];
  return (
    <div className="labs-schematic" aria-hidden="true">
      <div className="labs-rd-track">
        {milestones.map((m, idx) => (
          <div key={m} className={`labs-rd-step ${idx === 3 ? "is-live" : ""}`}>
            <i />
            <span>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectVisual({ project, sv }: { project: StilledevProject; sv: boolean }) {
  const [budaiPreviewLang, setBudaiPreviewLang] = useState<"sv" | "en">(sv ? "sv" : "en");
  const [affeRole, setAffeRole] = useState<"seller" | "manager">("seller");
  const [brainNode, setBrainNode] = useState<"notes" | "context" | "tasks">("notes");

  useEffect(() => {
    setBudaiPreviewLang(sv ? "sv" : "en");
  }, [sv]);

  if (project.visual === "budai") {
    const isSv = budaiPreviewLang === "sv";
    return (
      <div className="labs-project-visual labs-visual-budai">
        <div className="labs-visual-chrome">
          <span className="labs-visual-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="labs-visual-host">stilledev.se · budai.core</span>
          <div className="labs-visual-switch" role="group" aria-label={sv ? "Språk för BudAI-förhandsvisning" : "BudAI preview language"}>
            {(["sv", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setBudaiPreviewLang(code)}
                aria-pressed={budaiPreviewLang === code}
                className={budaiPreviewLang === code ? "is-active" : undefined}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="labs-visual-stage">
          <div className="labs-budai-orbit" aria-hidden="true">
            <span className="labs-orbit-ring labs-orbit-ring-outer" />
            <span className="labs-orbit-ring labs-orbit-ring-inner" />
            <div className="labs-budai-core-wrap">
              <BudAILogo size="sm" animated={false} />
            </div>
          </div>
          <div className="labs-budai-stream">
            <div className="labs-stream-pill">
              <b>01</b>
              <span>
                {isSv
                  ? "Signal → 3 strukturerade nästa steg"
                  : "Signal → 3 structured next actions"}
              </span>
            </div>
            <div className="labs-stream-lines" aria-hidden="true">
              <span className={isSv ? "w-[92%]" : "w-[84%]"} />
              <span className={isSv ? "w-[64%]" : "w-[72%]"} />
            </div>
            <div className="labs-stream-meta">
              <code>{isSv ? "minne: användarstyrt" : "memory: user_controlled"}</code>
              <b>LIVE</b>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (project.visual === "stilleaffe") {
    const bars = affeRole === "seller" ? [44, 62, 56, 78, 92] : [66, 74, 81, 77, 95];
    return (
      <div className="labs-project-visual labs-visual-affe">
        <div className="labs-visual-chrome">
          <span className="labs-visual-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="labs-visual-host">stilleaffe · mission.control</span>
          <span className="labs-visual-tag labs-tag-emerald">AUTH</span>
        </div>
        <div className="labs-visual-stage labs-affe-stage">
          <div className="labs-affe-top">
            <div className="labs-affe-roles" role="group" aria-label={sv ? "StilleAffe rollförhandsvisning" : "StilleAffe role preview"}>
              <button
                type="button"
                onClick={() => setAffeRole("seller")}
                aria-pressed={affeRole === "seller"}
                className={affeRole === "seller" ? "is-active" : undefined}
              >
                S · {sv ? "Säljvy" : "Seller"}
              </button>
              <button
                type="button"
                onClick={() => setAffeRole("manager")}
                aria-pressed={affeRole === "manager"}
                className={affeRole === "manager" ? "is-active" : undefined}
              >
                A · {sv ? "Chefsvy" : "Manager"}
              </button>
            </div>
            <code className="labs-affe-pace">
              {affeRole === "seller"
                ? sv
                  ? "DAGSFOKUS · I FAS"
                  : "DAILY PACE · ON TRACK"
                : sv
                  ? "TEAMVY · COACHNING"
                  : "TEAM VIEW · COACHING"}
            </code>
          </div>
          <div className="labs-affe-bars" aria-hidden="true">
            {bars.map((h, idx) => (
              <div key={idx} className="labs-affe-bar-col">
                <span
                  style={{ height: `${h}%` }}
                  className={
                    idx === 4
                      ? affeRole === "manager"
                        ? "is-peak is-manager"
                        : "is-peak"
                      : affeRole === "manager"
                        ? "is-manager"
                        : undefined
                  }
                />
                <small>W{idx + 1}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (project.visual === "second-brain") {
    const readout =
      brainNode === "notes"
        ? sv
          ? "14 länkade anteckningar → sammanfattning klar"
          : "14 linked notes → context summary ready"
        : brainNode === "context"
          ? sv
            ? "Långsiktsminne → relevanta beslut hämtade"
            : "Long-term memory → key decisions surfaced"
          : sv
            ? "Dagens fokus → 3 prioriterade uppgifter"
            : "Daily focus → 3 prioritized actions";

    return (
      <div className="labs-project-visual labs-visual-brain">
        <div className="labs-visual-chrome">
          <span className="labs-visual-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="labs-visual-host">second.brain · knowledge.graph</span>
          <span className="labs-visual-tag labs-tag-lavender">AI</span>
        </div>
        <div className="labs-visual-stage labs-brain-stage">
          <svg className="labs-brain-links" viewBox="0 0 280 96" fill="none" aria-hidden="true">
            <path
              d="M62 22 C108 22, 112 48, 148 48"
              stroke={brainNode === "notes" ? "rgba(122, 219, 240, 0.85)" : "rgba(122, 219, 240, 0.25)"}
              strokeWidth={brainNode === "notes" ? "1.6" : "1.1"}
            />
            <path
              d="M62 48 C104 48, 114 48, 148 48"
              stroke={brainNode === "context" ? "rgba(164, 175, 232, 0.85)" : "rgba(164, 175, 232, 0.25)"}
              strokeWidth={brainNode === "context" ? "1.6" : "1.1"}
            />
            <path
              d="M62 74 C108 74, 112 48, 148 48"
              stroke={brainNode === "tasks" ? "rgba(110, 231, 183, 0.85)" : "rgba(110, 231, 183, 0.25)"}
              strokeWidth={brainNode === "tasks" ? "1.6" : "1.1"}
            />
            <path
              d="M148 48 C184 48, 196 48, 226 48"
              stroke="rgba(122, 219, 240, 0.65)"
              strokeWidth="1.4"
            />
            <circle cx="148" cy="48" r="4" fill="#e6f7ff" />
            <circle cx="226" cy="48" r="3.5" fill="#6ee7b7" />
          </svg>
          <div className="labs-brain-interactive">
            <div className="labs-brain-inputs" role="group" aria-label={sv ? "Kunskapsgrafens indata" : "Knowledge graph inputs"}>
              <button
                type="button"
                onClick={() => setBrainNode("notes")}
                aria-pressed={brainNode === "notes"}
                className={`labs-node ${brainNode === "notes" ? "is-selected" : ""}`}
              >
                {sv ? "Anteckningar" : "Notes"}
              </button>
              <button
                type="button"
                onClick={() => setBrainNode("context")}
                aria-pressed={brainNode === "context"}
                className={`labs-node ${brainNode === "context" ? "is-selected" : ""}`}
              >
                {sv ? "Kontext" : "Context"}
              </button>
              <button
                type="button"
                onClick={() => setBrainNode("tasks")}
                aria-pressed={brainNode === "tasks"}
                className={`labs-node ${brainNode === "tasks" ? "is-selected" : ""}`}
              >
                {sv ? "Uppgifter" : "Tasks"}
              </button>
            </div>
            <span className="labs-node labs-node-hub">{sv ? "AI-syntes" : "AI Synthesis"}</span>
            <span className="labs-node labs-node-out">{sv ? "Fokus & plan" : "Focus & plan"}</span>
          </div>
          <div className="labs-brain-readout">
            <code>{readout}</code>
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
  const stockholmClock = useStockholmClock();

  const [activeAnchor, setActiveAnchor] = useState<string>("builder-profile");
  const [activeWorkflowIdx, setActiveWorkflowIdx] = useState<number>(0);
  const [projectFilter, setProjectFilter] = useState<"all" | "public" | "private">("all");
  const [projectTabById, setProjectTabById] = useState<Record<string, "overview" | "architecture">>({});

  const [selectedTopicId, setSelectedTopicId] = useState<StilledevInquiryTopic["id"]>("ai");
  const [inquiryNote, setInquiryNote] = useState("");

  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedCompany, setCopiedCompany] = useState(false);

  // Scroll-spy for the sticky Stilledev Labs telemetry sub-bar
  useEffect(() => {
    const ids = [
      "builder-profile",
      "about-stilledev",
      "stilledev-projects",
      "stilledev-contact",
      "stilledev-company",
    ];
    const onScroll = () => {
      const probeY = window.innerHeight * 0.36;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probeY) {
          const contact = document.getElementById("stilledev-contact");
          const sharesRow = id === "stilledev-company" && contact && Math.abs(contact.getBoundingClientRect().top - el.getBoundingClientRect().top) < 10;
          if (!sharesRow || window.location.hash === "#stilledev-company") current = id;
        }
      }
      setActiveAnchor(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("hashchange", onScroll); };
  }, []);

  const copyExampleSource = () => {
    void navigator.clipboard?.writeText(EXAMPLE_SOURCE).then(() => {
      setCopiedSource(true);
      window.setTimeout(() => setCopiedSource(false), 1600);
    }).catch(() => {});
  };

  const copyEmailAddress = () => {
    void navigator.clipboard?.writeText("Stilleinc@hotmail.com").then(() => {
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    }).catch(() => {});
  };

  const selectedTopic = useMemo(
    () => INQUIRY_TOPICS.find((t) => t.id === selectedTopicId) ?? INQUIRY_TOPICS[0],
    [selectedTopicId]
  );

  const composedSubject = sv ? selectedTopic.subject.sv : selectedTopic.subject.en;
  const composedBody = useMemo(() => {
    const intro = sv ? selectedTopic.template.sv : selectedTopic.template.en;
    const trimmed = inquiryNote.trim();
    const detail = trimmed
      ? trimmed
      : sv
        ? "[Beskriv kort projektet, tidplan eller din fråga här]"
        : "[Briefly describe your project, timeline, or question here]";
    return `${intro}${detail}\n\n—`;
  }, [inquiryNote, selectedTopic, sv]);

  const composedMailto = useMemo(() => {
    return `mailto:Stilleinc@hotmail.com?subject=${encodeURIComponent(composedSubject)}&body=${encodeURIComponent(composedBody)}`;
  }, [composedSubject, composedBody]);

  const copyFormattedBrief = () => {
    const payload = `To: Stilleinc@hotmail.com\nSubject: ${composedSubject}\n\n${composedBody}`;
    void navigator.clipboard?.writeText(payload).then(() => {
      setCopiedBrief(true);
      window.setTimeout(() => setCopiedBrief(false), 1800);
    }).catch(() => {});
  };

  const navAnchors = [
    { id: "builder-profile", num: "A", code: "04.A · FOUNDER", label: sv ? "Grundaren" : "Founder", href: "#builder-profile" },
    { id: "about-stilledev", num: "B", code: "04.B · STUDIO", label: sv ? "Om Stilledev" : "About Stilledev", href: "#about-stilledev" },
    { id: "stilledev-projects", num: "C", code: "04.C · PROJECTS", label: sv ? "Projekt" : "Projects", href: "#stilledev-projects" },
    { id: "stilledev-contact", num: "D", code: "04.D · CONNECT", label: sv ? "Kontakt" : "Contact", href: "#stilledev-contact" },
    { id: "stilledev-company", num: "E", code: "04.E · REGISTRY", label: sv ? "Företagsinfo" : "Company", href: "#stilledev-company" },
  ];

  const activeDockMeta = navAnchors.find((n) => n.id === activeAnchor) ?? navAnchors[0];

  const filteredProjects = useMemo(() => {
    if (projectFilter === "all") return STILLEDEV_PROJECTS;
    return STILLEDEV_PROJECTS.filter((p) => p.visibility === projectFilter);
  }, [projectFilter]);

  const publicCount = STILLEDEV_PROJECTS.filter((p) => p.visibility === "public").length;
  const privateCount = STILLEDEV_PROJECTS.filter((p) => p.visibility === "private").length;

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
    {
      label: sv ? "Arbetsspråk" : "Languages",
      value: sv ? COMPANY_REGISTRY.languages.sv : COMPANY_REGISTRY.languages.en,
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

  const copyCompanySummary = () => {
    const lines = [
      `${COMPANY_REGISTRY.name} (${sv ? COMPANY_REGISTRY.legalForm.sv : COMPANY_REGISTRY.legalForm.en})`,
      `${sv ? "Grundare" : "Founder"}: ${COMPANY_REGISTRY.founder}`,
      `${sv ? "Verksamhetsområde" : "Operations"}: ${sv ? COMPANY_REGISTRY.scope.sv : COMPANY_REGISTRY.scope.en}`,
      `${sv ? "Land" : "Country"}: ${sv ? COMPANY_REGISTRY.country.sv : COMPANY_REGISTRY.country.en}`,
      `Web: https://stilledev.se`,
      `Email: Stilleinc@hotmail.com`,
    ];
    if (COMPANY_REGISTRY.orgNumber) {
      lines.push(`${sv ? "Org.nr" : "Org. ID"}: ${COMPANY_REGISTRY.orgNumber}`);
    }
    void navigator.clipboard?.writeText(lines.join("\n")).then(() => {
      setCopiedCompany(true);
      window.setTimeout(() => setCopiedCompany(false), 1800);
    }).catch(() => {});
  };

  const activeWorkflow = FOUNDER_PROFILE.workflow[activeWorkflowIdx] ?? FOUNDER_PROFILE.workflow[0];

  return (
    <div id="stilledev-labs" className="stilledev-labs-shell" data-stilledev-labs>
      <div className="labs-blueprint-backdrop" aria-hidden="true" />

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
        </ScrollReveal>

        {/* Sticky Architectural Sub-Navigation & Live Studio Telemetry */}
        <div className="labs-sticky-dock" data-labs-dock>
          <div className="labs-dock-readout">
            <StilledevMark size={15} />
            <code>{activeDockMeta.code}</code>
          </div>

          <nav
            className="labs-subnav"
            aria-label={sv ? "Navigering för Stilledev Labs" : "Stilledev Labs navigation"}
          >
            {navAnchors.map((item) => {
              const isCurrent = activeAnchor === item.id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent ? "location" : undefined}
                  className={`labs-subnav-pill ${isCurrent ? "is-active" : ""}`}
                >
                  <b>{item.num}</b>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="labs-dock-telemetry">
            <span className="labs-clock-chip" title="Europe/Stockholm">
              <i />
              SE{stockholmClock ? ` · ${stockholmClock}` : " · CET"}
            </span>
            <a href="#stilledev-contact" className="labs-dock-cta">
              <span>{sv ? "Kontakt" : "Inquire"}</span>
              <ArrowRight size={12} />
            </a>
          </div>
        </div>

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
              <pre tabIndex={0} className="labs-tokenized-pre">
                <code>
                  {CODE_LINES.map((tokens, lineIdx) => (
                    <span key={lineIdx} className="labs-code-line">
                      <span className="labs-code-ln" aria-hidden="true">
                        {String(lineIdx + 1).padStart(2, "0")}
                      </span>
                      <span>
                        {tokens.length === 0
                          ? "\n"
                          : tokens.map((tok, tokIdx) => (
                              <span key={tokIdx} className={`token-${tok.tone}`}>
                                {tok.text}
                              </span>
                            ))}
                        {tokens.length > 0 && lineIdx < CODE_LINES.length - 1 ? "\n" : ""}
                      </span>
                    </span>
                  ))}
                </code>
              </pre>
            </details>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="labs-founder-card-wrap">
            <SpotlightCard maxTilt={3.5} className="labs-founder-plate">
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
                <div className="labs-workflow-head">
                  <div className="labs-workflow-kicker">
                    {sv ? "ARBETSSÄTT · FRÅN IDÉ TILL LEVERANS" : "APPROACH · IDEA TO PRODUCTION"}
                  </div>
                  <span className="labs-workflow-hint">
                    {sv ? "Välj fas" : "Inspect phase"}
                  </span>
                </div>

                <div
                  className="labs-workflow-steps"
                  role="group"
                  aria-label={sv ? "Utvecklingsfaser" : "Engineering phases"}
                >
                  {FOUNDER_PROFILE.workflow.map((w, idx) => {
                    const isSelected = activeWorkflowIdx === idx;
                    return (
                      <button
                        key={w.step}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setActiveWorkflowIdx(idx)}
                        className={`labs-workflow-step-btn ${isSelected ? "is-active" : ""}`}
                      >
                        <span className="labs-step-num">{w.step}</span>
                        <div className="labs-step-text">
                          <strong>{sv ? w.title.sv : w.title.en}</strong>
                          <small>{sv ? w.detail.sv : w.detail.en}</small>
                        </div>
                        <span className="labs-step-indicator" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>

                <div className="labs-workflow-readout" >
                  <p>{sv ? activeWorkflow.spec.sv : activeWorkflow.spec.en}</p>
                  <div className="labs-workflow-outputs">
                    {(sv ? activeWorkflow.outputs.sv : activeWorkflow.outputs.en).map((out) => (
                      <code key={out}>{out}</code>
                    ))}
                  </div>
                </div>
              </div>

              <div className="labs-founder-plate-foot">
                <span>
                  {sv ? FOUNDER_PROFILE.base.sv : FOUNDER_PROFILE.base.en}
                  {stockholmClock ? ` · ${stockholmClock}` : ""}
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

                  <DomainSchematic kind={domain.schematic} sv={sv} />

                  <h4>{sv ? domain.title.sv : domain.title.en}</h4>
                  <p>{sv ? domain.description.sv : domain.description.en}</p>

                  <div className="labs-domain-foot">
                    <ul className="labs-domain-tags">
                      {(sv ? domain.highlights.sv : domain.highlights.en).map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>

                    {domain.playgroundPrompt && (
                      <a
                        href="#playground"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("budai:prompt", {
                              detail: sv ? domain.playgroundPrompt!.sv : domain.playgroundPrompt!.en,
                            })
                          )
                        }
                        className="labs-domain-prompt-link"
                      >
                        <Sparkles size={12} />
                        <span>
                          {sv ? "Testa arkitekturprompt i BudAI" : "Test architecture prompt in BudAI"}
                        </span>
                        <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
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
            <div className="labs-projects-head-right">
              <p>
                {sv
                  ? "Ett urval av system utvecklade under Stilledev — från den öppna förhandsvisningen av BudAI till specialiserade sälj- och kunskapsverktyg."
                  : "Systems engineered under Stilledev — from the open developer preview of BudAI to specialized sales and personal knowledge platforms."}
              </p>

              <div
                className="labs-project-filters"
                role="group"
                aria-label={sv ? "Filtrera projekt" : "Filter projects"}
              >
                <button
                  type="button"
                  onClick={() => setProjectFilter("all")}
                  aria-pressed={projectFilter === "all"}
                  className={projectFilter === "all" ? "is-active" : undefined}
                >
                  {sv ? "Alla" : "All"} <b>{STILLEDEV_PROJECTS.length}</b>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectFilter("public")}
                  aria-pressed={projectFilter === "public"}
                  className={projectFilter === "public" ? "is-active" : undefined}
                >
                  {sv ? "Publika" : "Public Live"} <b>{publicCount}</b>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectFilter("private")}
                  aria-pressed={projectFilter === "private"}
                  className={projectFilter === "private" ? "is-active" : undefined}
                >
                  {sv ? "Privata system" : "Private Systems"} <b>{privateCount}</b>
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="labs-projects-grid">
            {filteredProjects.map((project, idx) => {
              const mode = projectTabById[project.id] ?? "overview";
              return (
                <ScrollReveal key={project.id} delay={idx * 0.05}>
                  <SpotlightCard maxTilt={3.5} className="labs-project-card h-full">
                    <ProjectVisual project={project} sv={sv} />
                    <div className="labs-preview-caption">{sv ? "Illustrativ förhandsvisning · exempeldata" : "Illustrative preview · sample data"}</div>

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

                      <div className="labs-project-title-row">
                        <div>
                          <h4>{project.name}</h4>
                          <div className="labs-project-category">
                            {sv ? project.category.sv : project.category.en}
                          </div>
                        </div>
                      </div>

                      <div
                        className="labs-project-mode-tabs"
                        role="group"
                        aria-label={`${project.name} ${sv ? "vy" : "view"}`}
                      >
                        <button
                          type="button"
                          aria-pressed={mode === "overview"}
                          onClick={() =>
                            setProjectTabById((prev) => ({ ...prev, [project.id]: "overview" }))
                          }
                          className={mode === "overview" ? "is-active" : undefined}
                        >
                          <FileText size={11} />
                          <span>{sv ? "Översikt" : "Overview"}</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={mode === "architecture"}
                          onClick={() =>
                            setProjectTabById((prev) => ({ ...prev, [project.id]: "architecture" }))
                          }
                          className={mode === "architecture" ? "is-active" : undefined}
                        >
                          <Layers size={11} />
                          <span>{sv ? "Arkitektur" : "Architecture"}</span>
                        </button>
                      </div>

                      {mode === "overview" ? (
                        <>
                          <p>{sv ? project.summary.sv : project.summary.en}</p>
                          <div className="labs-project-stack">
                            {project.stack.map((tech) => (
                              <span key={tech}>{tech}</span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <ul className="labs-project-arch-list">
                          {(sv ? project.architecture.sv : project.architecture.en).map((item, i) => (
                            <li key={i}>
                              <b>0{i + 1}</b>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

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
              );
            })}
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

              {/* Guided Quick Inquiry Composer */}
              <div className="labs-inquiry-composer">
                <div className="labs-composer-header">
                  <span className="labs-composer-kicker">
                    <MessageSquare size={12} />
                    {sv ? "SNABBFÖRFRÅGAN · ÄMNE & UTKAST" : "QUICK INQUIRY · TOPIC & BRIEF"}
                  </span>
                  <code>mailto · direct</code>
                </div>

                <div
                  className="labs-topic-pills"
                  role="group"
                  aria-label={sv ? "Välj ämne för kontakt" : "Select inquiry topic"}
                >
                  {INQUIRY_TOPICS.map((topic) => {
                    const active = selectedTopicId === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopicId(topic.id)}
                        aria-pressed={active}
                        className={active ? "is-active" : undefined}
                      >
                        {sv ? topic.label.sv : topic.label.en}
                      </button>
                    );
                  })}
                </div>

                <label className="sr-only" htmlFor="labs-inquiry-note">
                  {sv ? "Kort projektbeskrivning eller meddelande" : "Short project note or message"}
                </label>
                <textarea
                  id="labs-inquiry-note"
                  rows={2}
                  maxLength={600}
                  value={inquiryNote}
                  onChange={(e) => setInquiryNote(e.target.value)}
                  placeholder={
                    sv
                      ? "Valfritt: beskriv kort vad du vill bygga eller diskutera..."
                      : "Optional: add a line or two about what you want to build or discuss..."
                  }
                  className="labs-composer-textarea"
                />

                <div className="labs-composer-actions">
                  <a href={composedMailto} className="labs-composer-send">
                    <Mail size={13} />
                    <span>{sv ? "Öppna förifyllt mejl" : "Open pre-filled email"}</span>
                    <ArrowUpRight size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={copyFormattedBrief}
                    className="labs-composer-copy"
                  >
                    {copiedBrief ? <Check size={13} /> : <Copy size={13} />}
                    <span>
                      {copiedBrief
                        ? sv
                          ? "Utkast kopierat"
                          : "Brief copied"
                        : sv
                          ? "Kopiera utkast"
                          : "Copy brief"}
                    </span>
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
            <ScrollReveal delay={0.06} className="labs-company-wrap">
              <SpotlightCard maxTilt={2.5} className="labs-company-card">
                <div className="labs-company-top-bar">
                  <span className="chapter-label !mb-0">
                    <i />E · {sv ? "FÖRETAGSINFORMATION" : "COMPANY INFORMATION"}
                  </span>
                  <button
                    type="button"
                    onClick={copyCompanySummary}
                    className="labs-company-copy-btn"
                    aria-label={sv ? "Kopiera företagsinformation" : "Copy company information"}
                  >
                    {copiedCompany ? <Check size={11} /> : <Copy size={11} />}
                    <span>
                      {copiedCompany ? (sv ? "Kopierad" : "Copied") : sv ? "Kopiera" : "Copy specs"}
                    </span>
                  </button>
                </div>

                <div className="labs-company-head">
                  <StilledevMark size={26} />
                  <div>
                    <h4>{COMPANY_REGISTRY.name}</h4>
                    <span>
                      {sv ? "Enskild firma · Sverige" : "Sole proprietorship · Sweden"}
                    </span>
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
                      ? "Stilledev drivs från Sverige av Oliver Stille med fokus på långsiktig kodkvalitet, transparens och dataskydd."
                      : "Stilledev is operated out of Sweden by Oliver Stille with a focus on dependable engineering, transparency, and privacy."}
                  </p>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
