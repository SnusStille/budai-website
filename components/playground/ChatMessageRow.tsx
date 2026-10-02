"use client";

import {
  AlertCircle,
  Copy,
  Download,
  PanelRight,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import type { ChatMessage } from "@/lib/playground/types";
import { renderMarkdown } from "./markdown";
import { isWorkspaceWorthy, type Lang } from "./presets";

export type DualOption = { title: string; body: string };

type Props = {
  msg: ChatMessage;
  lang: Lang;
  busy: boolean;
  isLastAssistant: boolean;
  dualOptions?: DualOption[];
  canRetry: boolean;
  onPickDual: (opt: DualOption) => void;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  onContinue: () => void;
  onWorkspace: () => void;
  onRetry: () => void;
  onOpenImage: (url: string) => void;
  onVariation: () => void;
};

function ActionButton({
  label,
  onClick,
  children,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-7 items-center gap-1 rounded-lg px-1.5 text-[11px] transition-colors ${
        active
          ? "bg-accent-cyan/10 text-accent-cyan"
          : "text-muted/70 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/** One chat turn — user bubble on the right, BudAI answer as readable prose. */
export default function ChatMessageRow({
  msg,
  lang,
  busy,
  isLastAssistant,
  dualOptions,
  canRetry,
  onPickDual,
  onCopy,
  onRegenerate,
  onContinue,
  onWorkspace,
  onRetry,
  onOpenImage,
  onVariation,
}: Props) {
  const sv = lang === "sv";

  /* ── user turn ─────────────────────────────────────── */
  if (msg.role === "user") {
    return (
      <div className="pg-msg-enter flex flex-col items-end gap-2">
        {msg.imageUrl && (
          <button
            type="button"
            onClick={() => onOpenImage(msg.imageUrl!)}
            className="max-w-[220px] overflow-hidden rounded-xl border border-white/10 transition-opacity hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={msg.imageUrl} alt="" className="h-auto w-full" />
          </button>
        )}
        <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-accent-cyan/[0.16] bg-accent-cyan/[0.08] px-4 py-2.5 text-[14.5px] leading-[1.65] text-white sm:max-w-[75%]">
          {msg.content}
        </div>
      </div>
    );
  }

  /* ── BudAI turn ────────────────────────────────────── */
  const showActions = !msg.error && !dualOptions?.length;

  return (
    <div className="pg-msg-enter group flex gap-3">
      <div className="relative mt-0.5 h-7 w-7 shrink-0 rounded-[10px] bg-gradient-to-br from-accent-cyan/85 to-accent-purple/85 p-[1.5px]">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[8.5px] bg-[#08080f]">
          <BudAILogo size="xs" animated className="!h-[18px] !w-[18px]" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {msg.imageUrl && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenImage(msg.imageUrl!)}
              className="max-w-[280px] overflow-hidden rounded-xl border border-white/10 transition-opacity hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={msg.imageUrl} alt="" className="h-auto w-full" />
            </button>
          </div>
        )}

        {dualOptions && dualOptions.length >= 2 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {dualOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPickDual(opt)}
                className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent-cyan/35 hover:bg-accent-cyan/[0.04]"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-1.5 py-0.5 font-mono text-[10px] text-accent-cyan">
                    {i === 0 ? "A" : "B"}
                  </span>
                  <span className="text-[13px] font-semibold text-white">{opt.title}</span>
                </div>
                <div className="line-clamp-6 text-[13px] leading-relaxed text-white/70">
                  {renderMarkdown(opt.body)}
                </div>
                <div className="mt-2.5 text-[11px] font-medium text-accent-cyan/80">
                  {sv ? "Välj det här svaret" : "Use this answer"}
                </div>
              </button>
            ))}
          </div>
        ) : msg.error ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-amber-50/90">
                  {msg.content}
                </p>
                {canRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-300/30 px-2.5 py-1 text-[11.5px] font-medium text-amber-100 transition-colors hover:border-amber-300/50 hover:bg-amber-300/10"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {sv ? "Försök igen" : "Try again"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[14.5px] text-white/88">{renderMarkdown(msg.content)}</div>
        )}

        {msg.generated && msg.imageUrl && (
          <div className="mt-2 flex flex-wrap gap-1">
            <a
              href={msg.imageUrl}
              download="budai-image.png"
              className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] text-muted/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              {sv ? "Ladda ner" : "Download"}
            </a>
            <ActionButton label={sv ? "Skapa variation" : "Create variation"} onClick={onVariation}>
              <RotateCcw className="h-3.5 w-3.5" />
              {sv ? "Variation" : "Variation"}
            </ActionButton>
          </div>
        )}

        {showActions && (
          <div
            className={`mt-1.5 flex flex-wrap items-center gap-0.5 transition-opacity duration-200 ${
              isLastAssistant ? "opacity-100" : "opacity-60 md:opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <ActionButton label={sv ? "Kopiera svar" : "Copy response"} onClick={() => onCopy(msg.content)}>
              <Copy className="h-3.5 w-3.5" />
            </ActionButton>
            <ActionButton
              label={sv ? "Generera om" : "Regenerate"}
              onClick={onRegenerate}
              active={false}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </ActionButton>
            <ActionButton label={sv ? "Fortsätt" : "Continue"} onClick={onContinue}>
              <Sparkles className="h-3.5 w-3.5" />
            </ActionButton>
            {isWorkspaceWorthy(msg.content) && (
              <ActionButton label="Workspace" onClick={onWorkspace}>
                <PanelRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Workspace</span>
              </ActionButton>
            )}
            {isLastAssistant && busy && (
              <span className="ml-1 text-[11px] text-muted/45">
                {sv ? "svarar…" : "responding…"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
