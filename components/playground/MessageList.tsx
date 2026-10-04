"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CornerDownRight,
  Download,
  Expand,
  GitBranch,
  Pencil,
  RefreshCw,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Volume2,
  VolumeX,
  Wand2,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import Markdown from "./Markdown";
import type { AiActivity, ChatMessage } from "@/lib/playground/types";
import { FOLLOW_UPS, SPARKS, THINKING_STEPS, TRANSFORMS, type Transform } from "@/lib/playground/prompts";

type Lang = "sv" | "en";

export type DualOption = { title: string; body: string };

type Props = {
  lang: Lang;
  messages: ChatMessage[];
  dualPick: Record<string, DualOption[] | undefined>;
  onPickOption: (messageId: string, option: DualOption) => void;
  onRegenerate: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onBranch: (message: ChatMessage) => void;
  onCopy: (text: string) => void;
  onSpeak: (message: ChatMessage) => void;
  onRate: (messageId: string, rating: "up" | "down") => void;
  onDeleteMessage: (messageId: string) => void;
  onOpenWorkspace: (message: ChatMessage) => void;
  onLightbox: (url: string) => void;
  onImageVariation: (message: ChatMessage) => void;
  onTransform: (message: ChatMessage, transform: Transform) => void;
  onVariant: (message: ChatMessage, index: number) => void;
  onSuggestion: (text: string) => void;
  onSurprise: () => void;
  onOpenLibrary: () => void;
  greeting: string;
  userInitial: string;
  prompts: { id: string; title: string; body: string; icon: string }[];
  busy: boolean;
  activity: AiActivity;
  typingText: string;
  thinkingStep: number;
  elapsedMs: number;
  speakingId: string | null;
  showTimestamps: boolean;
  reduceEffects: boolean;
};

const ROLE_LABEL: Record<Lang, (role: ChatMessage["role"]) => string> = {
  sv: (role) => (role === "user" ? "Du" : role === "assistant" ? "BudAI" : "System"),
  en: (role) => (role === "user" ? "You" : role === "assistant" ? "BudAI" : "System"),
};

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageList({
  lang,
  messages,
  dualPick,
  onPickOption,
  onRegenerate,
  onEdit,
  onBranch,
  onCopy,
  onSpeak,
  onRate,
  onDeleteMessage,
  onOpenWorkspace,
  onLightbox,
  onImageVariation,
  onTransform,
  onVariant,
  onSuggestion,
  onSurprise,
  onOpenLibrary,
  greeting,
  userInitial,
  prompts,
  busy,
  activity,
  typingText,
  thinkingStep,
  elapsedMs,
  speakingId,
  showTimestamps,
  reduceEffects,
}: Props) {
  const isSv = lang === "sv";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (atBottom) el.scrollTop = el.scrollHeight;
  }, [messages, typingText, activity, atBottom]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 120);
  };

  const jump = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setAtBottom(true);
  };

  const empty = messages.length === 0 && activity === "idle";
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && !m.error);

  const steps = THINKING_STEPS[lang];
  const activeStep = steps[Math.min(thinkingStep, steps.length - 1)];
  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={onScroll} className="pgx-scroll h-full overflow-y-auto px-3 pb-6 pt-4 sm:px-6">
        {empty && (
          <div className="pgx-welcome mx-auto flex max-w-3xl flex-col items-center pt-4 text-center sm:pt-8">
            <div className={`pgx-welcome-orb ${reduceEffects ? "" : "is-live"}`}>
              <BudAILogo size="lg" motion="idle" animated={!reduceEffects} />
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              {greeting}
            </h2>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-white/55 sm:text-sm">
              {isSv
                ? "Ställ en fråga, klistra in text eller välj ett uppdrag. BudAI är en tidig förhandsvisning — testa fritt."
                : "Ask anything, paste text, or pick a task. BudAI is an early preview — explore freely."}
            </p>

            <div className="pgx-welcome-cards mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {prompts.slice(0, 6).map((prompt, index) => (
                <motion.button
                  key={prompt.id}
                  type="button"
                  initial={reduceEffects ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 + index * 0.04 }}
                  onClick={() => onSuggestion(prompt.body)}
                  className="pgx-welcome-card group text-left"
                >
                  <span className="pgx-welcome-card-icon">{prompt.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-semibold text-white/92">{prompt.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-white/45">
                      {prompt.body}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={onSurprise} className="pgx-welcome-action">
                <Sparkles className="h-3.5 w-3.5" />
                {isSv ? "Överraska mig" : "Surprise me"}
              </button>
              <button type="button" onClick={onOpenLibrary} className="pgx-welcome-action">
                <Wand2 className="h-3.5 w-3.5" />
                {isSv ? "Promptbibliotek" : "Prompt library"}
              </button>
              <span className="pgx-welcome-spark hidden sm:inline">
                {SPARKS[lang][0]}
              </span>
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => {
            const isUser = message.role === "user";
            const options = dualPick[message.id];
            return (
              <div
                key={message.id}
                className={`pgx-msg ${isUser ? "is-user" : "is-ai"} ${message.error ? "is-error" : ""}`}
              >
                <div className="pgx-avatar" aria-hidden>
                  {isUser ? (
                    <span className="pgx-avatar-user">{userInitial}</span>
                  ) : (
                    <BudAILogo size="xs" animated={!reduceEffects} motion={busy ? "thinking" : "idle"} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="pgx-msg-head">
                    <span className="pgx-msg-role">{ROLE_LABEL[lang](message.role)}</span>
                    {showTimestamps && <span className="pgx-msg-time">{timeLabel(message.ts)}</span>}
                    {message.model && <span className="pgx-msg-model">{message.model}</span>}
                    {typeof message.ms === "number" && message.ms > 0 && (
                      <span className="pgx-msg-model">{(message.ms / 1000).toFixed(1)}s</span>
                    )}
                    {message.variants && message.variants.length > 1 && (
                      <span className="pgx-variants">
                        <button
                          type="button"
                          onClick={() => onVariant(message, (message.variantIndex ?? 0) - 1)}
                          disabled={(message.variantIndex ?? 0) <= 0}
                          aria-label={isSv ? "Föregående version" : "Previous version"}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                        <span>
                          {(message.variantIndex ?? 0) + 1}/{message.variants.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => onVariant(message, (message.variantIndex ?? 0) + 1)}
                          disabled={(message.variantIndex ?? 0) >= message.variants.length - 1}
                          aria-label={isSv ? "Nästa version" : "Next version"}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>

                  {message.imageUrl && (
                    <button
                      type="button"
                      onClick={() => onLightbox(message.imageUrl!)}
                      className="pgx-image-frame group mb-2 block max-w-[280px] overflow-hidden rounded-2xl border border-white/12"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={message.imageUrl} alt="" className="h-auto w-full" />
                      <span className="pgx-image-zoom">
                        <Expand className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  )}

                  {options && options.length >= 2 ? (
                    <div className="pgx-compare">
                      <div className="pgx-compare-head">
                        <span>
                          {isSv ? "Två vinklar — välj den du gillar" : "Two angles — pick the one you like"}
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {options.map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => onPickOption(message.id, option)}
                            className="pgx-compare-card group text-left"
                          >
                            <span className="pgx-compare-tag">
                              {index === 0 ? (isSv ? "Alternativ A" : "Option A") : isSv ? "Alternativ B" : "Option B"}
                            </span>
                            <span className="pgx-compare-title">{option.title}</span>
                            <span className="pgx-compare-body">
                              <Markdown text={option.body} compact />
                            </span>
                            <span className="pgx-compare-pick">
                              <CornerDownRight className="h-3.5 w-3.5" />
                              {isSv ? "Använd detta" : "Use this"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="pgx-bubble">
                      <Markdown text={message.content} />
                    </div>
                  )}

                  {isUser ? (
                    <div className="pgx-actions is-user">
                      <ActionButton icon={<Pencil className="h-3.5 w-3.5" />} label={isSv ? "Redigera" : "Edit"} onClick={() => onEdit(message)} />
                      <ActionButton icon={<Copy className="h-3.5 w-3.5" />} label={isSv ? "Kopiera" : "Copy"} onClick={() => onCopy(message.content)} />
                      <ActionButton
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        label={isSv ? "Ta bort" : "Remove"}
                        onClick={() => onDeleteMessage(message.id)}
                      />
                    </div>
                  ) : (
                    !options && (
                      <MessageActions
                        lang={lang}
                        message={message}
                        speaking={speakingId === message.id}
                        onCopy={onCopy}
                        onRegenerate={onRegenerate}
                        onBranch={onBranch}
                        onSpeak={onSpeak}
                        onRate={onRate}
                        onOpenWorkspace={onOpenWorkspace}
                        onDeleteMessage={onDeleteMessage}
                        onImageVariation={onImageVariation}
                      />
                    )
                  )}

                  {lastAssistant?.id === message.id && !busy && !options && !message.error && (
                    <div className="pgx-transforms">
                      {TRANSFORMS.map((transform) => (
                        <button
                          key={transform.id}
                          type="button"
                          onClick={() => onTransform(message, transform)}
                          className="pgx-transform"
                        >
                          <span aria-hidden>{transform.glyph}</span>
                          {transform.label[lang]}
                        </button>
                      ))}
                    </div>
                  )}

                  {lastAssistant?.id === message.id && !busy && !options && !message.error && (
                    <div className="pgx-followups">
                      {FOLLOW_UPS.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => onSuggestion(chip.prompt[lang])}
                          className="pgx-followup"
                        >
                          {chip.label[lang]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* live answer / thinking */}
          {(typingText || (busy && activity !== "typing" && activity !== "idle")) && (
            <div className="pgx-msg is-ai">
              <div className="pgx-avatar" aria-hidden>
                <BudAILogo size="xs" motion="thinking" animated={!reduceEffects} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="pgx-msg-head">
                  <span className="pgx-msg-role">BudAI</span>
                  <span className="pgx-msg-time">{seconds}s</span>
                </div>
                {typingText ? (
                  <div className="pgx-bubble">
                    <Markdown text={typingText} />
                    <span className="pgx-caret" aria-hidden />
                  </div>
                ) : (
                  <div className="pgx-bubble pgx-thinking">
                    <div className="pgx-thinking-row">
                      <span className="pgx-thinking-pulse" aria-hidden />
                      <span>{activityLabel(activity, lang)}</span>
                      <span className="pgx-thinking-step">{activeStep}…</span>
                    </div>
                    <div className="pgx-thinking-bar" aria-hidden>
                      <span style={{ animationDelay: "0s" }} />
                      <span style={{ animationDelay: "0.12s" }} />
                      <span style={{ animationDelay: "0.24s" }} />
                      <span style={{ animationDelay: "0.36s" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!atBottom && messages.length > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={jump}
            className="pgx-jump"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            {isSv ? "Till senaste" : "Jump to latest"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function activityLabel(activity: AiActivity, lang: Lang) {
  const map: Record<AiActivity, [string, string]> = {
    idle: ["", ""],
    thinking: ["Tänker", "Thinking"],
    reading_image: ["Läser bilden", "Reading the image"],
    analyzing: ["Analyserar", "Analysing"],
    generating_image: ["Skapar bilden", "Creating the image"],
    remembering: ["Sparar minne", "Saving memory"],
    listening: ["Lyssnar", "Listening"],
    typing: ["Skriver", "Writing"],
    error: ["Fel", "Error"],
  };
  return lang === "sv" ? map[activity][0] : map[activity][1];
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`pgx-action ${active ? "is-active" : ""} ${danger ? "is-danger" : ""}`}
    >
      {icon}
    </button>
  );
}

function MessageActions({
  lang,
  message,
  speaking,
  onCopy,
  onRegenerate,
  onBranch,
  onSpeak,
  onRate,
  onOpenWorkspace,
  onDeleteMessage,
  onImageVariation,
}: {
  lang: Lang;
  message: ChatMessage;
  speaking: boolean;
  onCopy: (text: string) => void;
  onRegenerate: (message: ChatMessage) => void;
  onBranch: (message: ChatMessage) => void;
  onSpeak: (message: ChatMessage) => void;
  onRate: (id: string, rating: "up" | "down") => void;
  onOpenWorkspace: (message: ChatMessage) => void;
  onDeleteMessage: (id: string) => void;
  onImageVariation: (message: ChatMessage) => void;
}) {
  const isSv = lang === "sv";
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const long = message.content.length > 420;

  return (
    <div className="pgx-actions">
      <ActionButton
        icon={copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
        label={isSv ? "Kopiera" : "Copy"}
        onClick={() => {
          onCopy(message.content);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      />
      <ActionButton icon={<RefreshCw className="h-3.5 w-3.5" />} label={isSv ? "Generera om" : "Regenerate"} onClick={() => onRegenerate(message)} />
      <ActionButton
        icon={<ThumbsUp className="h-3.5 w-3.5" />}
        label={isSv ? "Bra svar" : "Good answer"}
        active={message.rating === "up"}
        onClick={() => onRate(message.id, "up")}
      />
      <ActionButton
        icon={<ThumbsDown className="h-3.5 w-3.5" />}
        label={isSv ? "Dåligt svar" : "Bad answer"}
        active={message.rating === "down"}
        onClick={() => onRate(message.id, "down")}
      />
      <ActionButton
        icon={speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        label={speaking ? (isSv ? "Stoppa uppläsning" : "Stop reading") : isSv ? "Läs upp" : "Read aloud"}
        active={speaking}
        onClick={() => onSpeak(message)}
      />
      {long && (
        <ActionButton icon={<Download className="h-3.5 w-3.5" />} label={isSv ? "Workspace" : "Workspace"} onClick={() => onOpenWorkspace(message)} />
      )}
      {message.generated && message.imageUrl && (
        <ActionButton icon={<Wand2 className="h-3.5 w-3.5" />} label={isSv ? "Variation" : "Variation"} onClick={() => onImageVariation(message)} />
      )}

      <span className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pgx-action pgx-action-more"
          title={isSv ? "Mer" : "More"}
          aria-label={isSv ? "Mer" : "More"}
        >
          ⋯
        </button>
        {open && (
          <>
            <button type="button" className="fixed inset-0 z-30 cursor-default" aria-label="close" onClick={() => setOpen(false)} />
            <div className="pgx-menu absolute bottom-full right-0 z-40 mb-1.5 w-52">
              <button
                type="button"
                onClick={() => {
                  onBranch(message);
                  setOpen(false);
                }}
                className="pgx-menu-item"
              >
                <GitBranch className="h-3.5 w-3.5" />
                {isSv ? "Förgrena härifrån" : "Branch from here"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${isSv ? "BudAI svar" : "BudAI answer"}:\n\n${message.content}`
                  );
                  setOpen(false);
                }}
                className="pgx-menu-item"
              >
                <Share2 className="h-3.5 w-3.5" />
                {isSv ? "Kopiera som citat" : "Copy as quote"}
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenWorkspace(message);
                  setOpen(false);
                }}
                className="pgx-menu-item"
              >
                <Expand className="h-3.5 w-3.5" />
                {isSv ? "Öppna i panel" : "Open in panel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMessage(message.id);
                  setOpen(false);
                }}
                className="pgx-menu-item is-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isSv ? "Ta bort svaret" : "Delete answer"}
              </button>
            </div>
          </>
        )}
      </span>
    </div>
  );
}
