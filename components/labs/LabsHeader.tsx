"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, ArrowLeft, Sparkles } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevLabsWordmark } from "@/components/ui/StilledevWordmark";
import LangSwitcher from "@/components/ui/LangSwitcher";
import { useLabsTranslation } from "@/lib/labs/i18n";

interface LabsHeaderProps {
  onToggleHistory?: () => void;
  onNewChat?: () => void;
  showHistoryButton?: boolean;
  compact?: boolean;
  scrolled?: boolean;
  scrollProgress?: number;
}

export default function LabsHeader({
  onToggleHistory,
  onNewChat,
  showHistoryButton = true,
  compact = false,
  scrolled = false,
  scrollProgress = 0,
}: LabsHeaderProps) {
  const { lang } = useLang();
  const t = useLabsTranslation(lang);
  const pathname = usePathname();

  const isOnDeepLink = pathname.match(/\/(?:sv\/)?labs\/[a-f0-9-]+$/i);
  const backHref = lang === "sv" ? "/sv/labs" : "/labs";
  const budaiHref = lang === "sv" ? "/sv" : "/";

  return (
    <header className={`labs-header ${scrolled ? "labs-scrolled" : ""}`} role="banner">
      <div
        className="labs-scroll-progress"
        style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
        aria-hidden
      />
      <div className="labs-header-inner">
        {/* Left side */}
        <div className="labs-header-left">
          {isOnDeepLink ? (
            <Link
              href={backHref}
              className="labs-header-icon-btn"
              aria-label={t.nav.backToSite}
            >
              <ArrowLeft size={16} />
            </Link>
          ) : showHistoryButton && onToggleHistory ? (
            <button
              type="button"
              onClick={onToggleHistory}
              className="labs-header-icon-btn"
              aria-label={t.nav.history}
            >
              <Menu size={16} />
            </button>
          ) : null}

          <Link
            href={lang === "sv" ? "/sv/labs" : "/labs"}
            className="labs-header-brand"
            aria-label="Stilledev Labs"
          >
            <StilledevLabsWordmark />
          </Link>

          {/* Vertical separator + BudAI link */}
          <span className="labs-header-sep" aria-hidden>·</span>
          <Link
            href={budaiHref}
            className="labs-header-budai-link"
            title={lang === "sv" ? "Tillbaka till BudAI" : "Back to BudAI"}
          >
            <Sparkles size={11} />
            <span>BudAI</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="labs-header-right">
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="labs-header-action-btn"
              aria-label={t.nav.newChat}
              title={t.nav.newChat}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">{t.nav.newChat}</span>
            </button>
          )}

          {/* Language switcher — shared component */}
          <LangSwitcher variant="dropdown" labsContext />
        </div>
      </div>
    </header>
  );
}
