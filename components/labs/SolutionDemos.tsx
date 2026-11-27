"use client";

/**
 * Interactive Solution Explorer — mini product demos for each service category.
 *
 * Each demo is a small, self-contained CSS-only preview showing what a typical
 * deliverable in that category could look like. These are concept demonstrations,
 * not real customer projects — clearly labelled as such.
 *
 * Demos are interactive where it adds value (hover states, toggle buttons).
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface DemoProps {
  onExplore: () => void;
  exploreLabel: string;
  conceptLabel: string;
  title?: string;
  lang?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Website demo — minimal business site mockup
// ─────────────────────────────────────────────────────────────────────────────
function WebsiteDemo({ onExplore, exploreLabel, conceptLabel, title, lang }: DemoProps) {
  return (
    <DemoShell label={conceptLabel} accent="#00e5ff" onExplore={onExplore} exploreLabel={exploreLabel} title={title}>
      <div className="sd-site">
        <div className="sd-site-nav">
          <span className="sd-site-logo" />
          <span className="sd-site-link" />
          <span className="sd-site-link sd-site-link-short" />
          <span className="sd-site-cta" />
        </div>
        <div className="sd-site-hero">
          <span className="sd-site-eyebrow" />
          <span className="sd-site-h1" />
          <span className="sd-site-h1 sd-site-h1-short" />
          <span className="sd-site-sub" />
          <span className="sd-site-btn" />
        </div>
        <div className="sd-site-cards">
          <div className="sd-site-card" />
          <div className="sd-site-card" />
          <div className="sd-site-card" />
        </div>
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Web App / Dashboard demo — mini admin dashboard
// ─────────────────────────────────────────────────────────────────────────────
function WebAppDemo({ onExplore, exploreLabel, conceptLabel, title, lang }: DemoProps) {
  return (
    <DemoShell label={conceptLabel} accent="#7c5cff" onExplore={onExplore} exploreLabel={exploreLabel} title={title}>
      <div className="sd-dash">
        <div className="sd-dash-sidebar">
          <span className="sd-dash-logo" />
          <span className="sd-dash-nav sd-dash-nav-active" />
          <span className="sd-dash-nav" />
          <span className="sd-dash-nav" />
          <span className="sd-dash-nav" />
        </div>
        <div className="sd-dash-main">
          <div className="sd-dash-top">
            <span className="sd-dash-title" />
            <span className="sd-dash-badge" />
          </div>
          <div className="sd-dash-stats">
            <div className="sd-dash-stat"><span className="sd-dash-stat-num" /><span className="sd-dash-stat-lab" /></div>
            <div className="sd-dash-stat"><span className="sd-dash-stat-num sd-dash-stat-num-p" /><span className="sd-dash-stat-lab" /></div>
            <div className="sd-dash-stat"><span className="sd-dash-stat-num sd-dash-stat-num-a" /><span className="sd-dash-stat-lab" /></div>
          </div>
          <div className="sd-dash-chart">
            {[30, 50, 40, 65, 55, 80, 70, 90].map((h, i) => (
              <div key={i} className="sd-dash-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FiveM / Game inventory demo — stylized inventory grid
// ─────────────────────────────────────────────────────────────────────────────
function GameDemo({ onExplore, exploreLabel, conceptLabel, title, lang }: DemoProps) {
  const [selected, setSelected] = useState(3);
  const items = [
    { name: "pistol", rare: false },
    { name: "water", rare: false },
    { name: "bread", rare: false },
    { name: "key", rare: true },
    { name: "phone", rare: false },
    { name: "money", rare: false },
    { name: "lockpick", rare: true },
    { name: "medkit", rare: false },
    { name: "", rare: false, empty: true },
    { name: "", rare: false, empty: true },
    { name: "radio", rare: false },
    { name: "", rare: false, empty: true },
  ];
  const metaHint = lang === "sv" ? "Klicka på ett fack för att markera" : "Click a slot to select";
  return (
    <DemoShell label={conceptLabel} accent="#f59e0b" onExplore={onExplore} exploreLabel={exploreLabel} title={title}>
      <div className="sd-fivem">
        <div className="sd-fivem-header">
          <span className="sd-fivem-title">INVENTORY</span>
          <span className="sd-fivem-weight">12.4 / 25.0 kg</span>
        </div>
        <div className="sd-fivem-grid">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => !item.empty && setSelected(i)}
              className={`sd-fivem-slot ${item.empty ? "sd-fivem-empty" : ""} ${item.rare ? "sd-fivem-rare" : ""} ${selected === i ? "sd-fivem-selected" : ""}`}
              aria-label={item.name || "empty"}
            >
              {!item.empty && <span className="sd-fivem-item">{item.name[0]?.toUpperCase()}</span>}
            </button>
          ))}
        </div>
        <div className="sd-fivem-detail">
          <span className="sd-fivem-dname">{items[selected]?.name || ""}</span>
          <span className="sd-fivem-dmeta">{metaHint}</span>
        </div>
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Roblox demo — game UI / progress bar
// ─────────────────────────────────────────────────────────────────────────────
function RobloxDemo({ onExplore, exploreLabel, conceptLabel, title, lang }: DemoProps) {
  const [progress, setProgress] = useState(42);
  const isSv = lang === "sv";
  return (
    <DemoShell label={conceptLabel} accent="#e0495e" onExplore={onExplore} exploreLabel={exploreLabel} title={title}>
      <div className="sd-roblox">
        <div className="sd-rblx-top">
          <span className="sd-rblx-coin">★ 2,450</span>
          <span className="sd-rblx-level">{isSv ? "NIVÅ 12" : "LEVEL 12"}</span>
        </div>
        <div className="sd-rblx-scene">
          <div className="sd-rblx-player" />
          <div className="sd-rblx-block sd-rblx-block-1" />
          <div className="sd-rblx-block sd-rblx-block-2" />
          <div className="sd-rblx-block sd-rblx-block-3" />
        </div>
        <div className="sd-rblx-progress">
          <div className="sd-rblx-bar">
            <div className="sd-rblx-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="sd-rblx-prolabel">{isSv ? `Samlar mynt... ${progress}%` : `Collecting coins... ${progress}%`}</span>
        </div>
        <div className="sd-rblx-actions">
          <button type="button" className="sd-rblx-btn" onClick={() => setProgress(Math.min(100, progress + 8))}>
            {isSv ? "Samla" : "Collect"}
          </button>
        </div>
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI / Automation demo — workflow with steps
// ─────────────────────────────────────────────────────────────────────────────
function AutomationDemo({ onExplore, exploreLabel, conceptLabel, title, lang }: DemoProps) {
  const isSv = lang === "sv";
  const steps = isSv
    ? ["Kund lägger order", "Bekräftelse mailas", "Lager uppdateras", "Frakt etikett skapas", "Ekonomi bokförs"]
    : ["Order received", "Confirmation emailed", "Inventory updating", "Shipping label created", "Books auto-posted"];
  return (
    <DemoShell label={conceptLabel} accent="#34d399" onExplore={onExplore} exploreLabel={exploreLabel} title={title}>
      <div className="sd-auto">
        {steps.map((label, i) => (
          <div key={i}>
            <div className={`sd-auto-step ${i < 2 ? "sd-auto-done" : i === 2 ? "sd-auto-active" : ""}`}>
              <span className={`sd-auto-dot ${i === 2 ? "sd-auto-dot-active" : ""}`} />
              <span className="sd-auto-label">{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`sd-auto-line ${i < 2 ? "sd-auto-line-done" : ""}`} />}
          </div>
        ))}
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic demo shell with chrome
// ─────────────────────────────────────────────────────────────────────────────
function DemoShell({
  label,
  accent,
  onExplore,
  exploreLabel,
  title,
  children,
}: {
  label: string;
  accent: string;
  onExplore: () => void;
  exploreLabel: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="sd-shell"
      style={{ ["--accent" as string]: accent }}
    >
      {title && <div className="sd-title">{title}</div>}
      <div className="sd-chrome">
        <div className="sd-chrome-dots">
          <span /><span /><span />
        </div>
        <span className="sd-chrome-label">{label}</span>
        <span />
      </div>
      <div className="sd-stage">{children}</div>
      <button type="button" onClick={onExplore} className="sd-explore-btn">
        {exploreLabel}
        <ChevronRight size={13} />
      </button>
    </motion.div>
  );
}

export { WebsiteDemo, WebAppDemo, GameDemo, RobloxDemo, AutomationDemo };
