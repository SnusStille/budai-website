"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Plus, ArrowLeft, Bell } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import StilledevWordmark from "@/components/ui/StilledevWordmark";
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
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const isOnDeepLink = pathname.match(/\/(?:sv\/)?labs\/[a-f0-9-]+$/i);
  const backHref = lang === "sv" ? "/sv/labs" : "/labs";
  const budaiHref = lang === "sv" ? "/sv" : "/";

  const handleBackToBudai = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Smooth fade-out transition before navigating
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => {
      router.push(budaiHref);
    }, 280);
  };

  return (
    <header
      className={`labs-header ${scrolled ? "labs-scrolled" : ""} ${leaving ? "labs-header-leaving" : ""} labs-header-animate`}
      role="banner"
    >
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

          {/* Brand — Stilledev · Labs */}
          <Link
            href={budaiHref}
            className="labs-header-brand"
            aria-label="Stilledev — home"
            onClick={handleBackToBudai}
          >
            <StilledevWordmark size="sm" />
            <span className="labs-header-brand-divider" aria-hidden />
            <span className="labs-header-brand-labs">Labs</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="labs-header-right">
          {/* What's new (bell) — dispatches the same event as BudAI navbar */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("budai:whats-new"))}
            className="labs-header-bell-btn"
            aria-label={lang === "sv" ? "Vad är nytt" : "What's new"}
            title={lang === "sv" ? "Vad är nytt" : "What's new"}
          >
            <Bell size={15} />
            <span className="labs-header-bell-dot" aria-hidden />
          </button>

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

          <LangSwitcher variant="dropdown" labsContext />
        </div>
      </div>
    </header>
  );
}
