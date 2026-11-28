"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Plus, ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
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

  const isOnDeepLink = pathname.match(/\/(?:sv\/)?labs\/[a-f0-9-]+$/i);
  const backHref = lang === "sv" ? "/sv/labs" : "/labs";
  const budaiHref = lang === "sv" ? "/sv" : "/";
  const contactHref = lang === "sv" ? "/sv/contact" : "/contact";

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`labs-header ${scrolled ? "labs-scrolled" : ""}`}
      role="banner"
    >
      <div
        className="labs-scroll-progress"
        style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
        aria-hidden
      />
      <div className="labs-header-inner">
        {/* Left side: nav + brand */}
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

          {/* Brand — Stilledev wordmark with Labs context, matching main site */}
          <Link
            href={budaiHref}
            className="labs-header-brand"
            aria-label="Stilledev — BudAI home"
          >
            <StilledevWordmark size="sm" />
            <span className="labs-header-brand-divider" aria-hidden />
            <span className="labs-header-brand-label">
              <span className="labs-header-brand-budai">BudAI</span>
              <span className="labs-header-brand-labs">Labs</span>
            </span>
          </Link>

          {/* Back to BudAI pill — only on chat/deep-link states, not on welcome */}
          {isOnDeepLink && (
            <Link
              href={budaiHref}
              className="labs-header-back-pill"
              title={t.nav.backToBudai}
            >
              <span className="labs-header-pill-dot" aria-hidden />
              {t.nav.backToBudai}
              <ArrowUpRight size={11} aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Right side: actions */}
        <div className="labs-header-right">
          {/* Contact link — desktop only */}
          <Link
            href={contactHref}
            className="labs-header-contact-link hidden md:inline-flex"
            title={t.nav.contact}
          >
            <Mail size={13} />
            <span>{t.nav.contact}</span>
          </Link>

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
    </motion.header>
  );
}
