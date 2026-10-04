"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  AtSign,
  AudioLines,
  Command,
  Image as ImageIcon,
  Library,
  Mic,
  Paperclip,
  SplitSquareHorizontal,
  Sparkles,
  Square,
  X,
  Wand2,
  Zap,
} from "lucide-react";
import type { AttachmentDraft, PersonaId, StyleId } from "@/lib/playground/types";
import { estimateTokens } from "@/lib/playground/types";
import { PERSONAS, SLASH_COMMANDS, STYLE_OPTIONS } from "@/lib/playground/prompts";

type Lang = "sv" | "en";

type Props = {
  lang: Lang;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (overrideText?: string) => void;
  onStop: () => void;
  busy: boolean;
  attach: AttachmentDraft | null;
  onPickFile: () => void;
  onClearAttach: () => void;
  listening: boolean;
  onToggleMic: () => void;
  genMode: boolean;
  onToggleGen: () => void;
  compare: boolean;
  onToggleCompare: () => void;
  onImprove: () => void;
  improving: boolean;
  onRecall: () => string;
  onOpenVoice: () => void;
  imageGenEnabled: boolean;
  placeholder: string;
  persona: PersonaId;
  style: StyleId;
  onPersona: (persona: PersonaId) => void;
  onStyle: (style: StyleId) => void;
  onOpenLibrary: () => void;
  onOpenPalette: () => void;
  dragOver: boolean;
};

export default function Composer({
  lang,
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  attach,
  onPickFile,
  onClearAttach,
  listening,
  onToggleMic,
  genMode,
  onToggleGen,
  compare,
  onToggleCompare,
  onImprove,
  improving,
  onRecall,
  onOpenVoice,
  imageGenEnabled,
  placeholder,
  persona,
  style,
  onPersona,
  onStyle,
  onOpenLibrary,
  onOpenPalette,
  dragOver,
}: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [menu, setMenu] = useState<"none" | "slash" | "style" | "persona">("none");
  const [menuIndex, setMenuIndex] = useState(0);
  const isSv = lang === "sv";

  const slashQuery = value.startsWith("/") && !value.includes(" ") ? value.slice(1).toLowerCase() : null;

  const slashMatches = useMemo(() => {
    if (slashQuery === null) return [];
    if (!slashQuery) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (c) =>
        c.cmd.slice(1).includes(slashQuery) ||
        c.label.sv.toLowerCase().includes(slashQuery) ||
        c.label.en.toLowerCase().includes(slashQuery)
    );
  }, [slashQuery]);

  useEffect(() => {
    if (slashQuery !== null && slashMatches.length) {
      setMenu("slash");
      setMenuIndex(0);
    } else if (slashQuery === null) {
      setMenu((m) => (m === "slash" ? "none" : m));
    }
  }, [slashQuery, slashMatches.length]);

  /* auto-grow */
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 220;
    const next = Math.min(el.scrollHeight, max);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value]);

  useEffect(() => {
    if (!busy) return;
    const el = taRef.current;
    if (document.activeElement !== el && el && !window.matchMedia("(max-width: 640px)").matches) {
      /* keep focus while streaming if the field was already in use */
    }
  }, [busy]);

  const selectCommand = (id: string) => {
    const cmd = SLASH_COMMANDS.find((c) => c.id === id);
    if (!cmd) return;
    if (cmd.tool === "image") {
      onToggleGen();
      onChange("");
      setMenu("none");
      return;
    }
    if (cmd.tool === "concise") onStyle("concise");
    if (cmd.tool === "precise") onStyle("precise");
    if (cmd.tool === "creative") onStyle("creative");
    if (cmd.tool === "stepbystep") onStyle("stepbystep");
    onChange(cmd.template[lang] || "");
    setMenu("none");
    taRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "ArrowUp" && !value && menu === "none") {
      const recalled = onRecall();
      if (recalled) {
        event.preventDefault();
        onChange(recalled);
        return;
      }
    }
    if (menu === "slash" && slashMatches.length) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setMenuIndex((i) => (i + 1) % slashMatches.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setMenuIndex((i) => (i - 1 + slashMatches.length) % slashMatches.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        selectCommand(slashMatches[menuIndex].id);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setMenu("none");
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const tokens = estimateTokens(value);
  const canSend = (value.trim().length > 0 || Boolean(attach)) && !busy;
  const activePersona = PERSONAS.find((p) => p.id === persona) || PERSONAS[0];

  return (
    <div className="pgx-composer relative shrink-0">
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-2 -top-2 z-30 rounded-2xl border border-dashed border-accent-cyan/60 bg-accent-cyan/[0.08] px-4 py-3 text-center text-xs font-medium text-accent-cyan backdrop-blur"
          >
            {isSv ? "Släpp bilden eller filen här" : "Drop the image or file here"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* attachments */}
      <AnimatePresence>
        {attach && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-2 flex items-center gap-2.5"
          >
            <div className="relative">
              {attach.kind === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={attach.preview}
                  alt={attach.name}
                  className="h-14 w-14 rounded-xl border border-white/15 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] text-[10px] font-semibold uppercase text-accent-cyan">
                  {(attach.name.split(".").pop() || "txt").slice(0, 4)}
                </div>
              )}
              <button
                type="button"
                onClick={onClearAttach}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black text-white/80 hover:text-white"
                aria-label={isSv ? "Ta bort bilaga" : "Remove attachment"}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="min-w-0 text-[11px] leading-snug text-white/60">
              <div className="max-w-[180px] truncate text-white/85">{attach.name}</div>
              <div>
                {(attach.size / 1024).toFixed(0)} KB ·{" "}
                {attach.kind === "image"
                  ? isSv
                    ? "bildanalys"
                    : "image analysis"
                  : isSv
                    ? "text i kontexten"
                    : "text in context"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* command / option menus */}
      <AnimatePresence>
        {menu === "slash" && slashMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.14 }}
            className="pgx-popover absolute bottom-full left-0 z-40 mb-2 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e15]/97 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white/40">
              <span>{isSv ? "Kommandon" : "Commands"}</span>
              <span className="flex items-center gap-1">
                <Command className="h-3 w-3" />↑↓ · Enter
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {slashMatches.map((cmd, index) => (
                <button
                  key={cmd.id}
                  type="button"
                  onMouseEnter={() => setMenuIndex(index)}
                  onClick={() => selectCommand(cmd.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                    index === menuIndex ? "bg-accent-cyan/12" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[13px]">
                    {cmd.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-medium text-white/92">
                      {cmd.label[lang]} <span className="ml-1 font-mono text-[10px] text-white/35">{cmd.cmd}</span>
                    </span>
                    <span className="block truncate text-[11px] text-white/45">{cmd.hint[lang]}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the field */}
      <div className={`pgx-input-shell ${busy ? "is-busy" : ""} ${listening ? "is-listening" : ""}`}>
        <div className="pgx-input-glow" aria-hidden />
        <textarea
          ref={taRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setMenu((m) => (m === "slash" ? m : "none"))}
          rows={1}
          placeholder={placeholder}
          className="pgx-textarea"
          aria-label={isSv ? "Skriv till BudAI" : "Message BudAI"}
        />

        {/* tool row */}
        <div className="pgx-toolbar">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={onPickFile}
              className="pgx-tool"
              title={isSv ? "Bifoga bild eller textfil" : "Attach image or text file"}
              aria-label={isSv ? "Bifoga fil" : "Attach file"}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenLibrary}
              className="pgx-tool"
              title={isSv ? "Promptbibliotek" : "Prompt library"}
              aria-label={isSv ? "Öppna promptbibliotek" : "Open prompt library"}
            >
              <Library className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleGen}
              disabled={!imageGenEnabled}
              className={`pgx-tool ${genMode ? "is-active" : ""}`}
              title={
                imageGenEnabled
                  ? isSv
                    ? "Bildgenerering"
                    : "Image generation"
                  : isSv
                    ? "Bildgenerering är inte aktiverad i denna förhandsvisning"
                    : "Image generation is not enabled in this preview"
              }
              aria-pressed={genMode}
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            <span className="pgx-tool-divider" aria-hidden />

            <button
              type="button"
              onClick={onImprove}
              disabled={improving || !value.trim()}
              className={`pgx-pill ${improving ? "is-busy" : ""}`}
              title={isSv ? "Förbättra din prompt med AI" : "Improve your prompt with AI"}
            >
              <Wand2 className={`h-3.5 w-3.5 ${improving ? "pgx-spin" : ""}`} />
              <span className="pgx-pill-text">{improving ? (isSv ? "Förbättrar…" : "Improving…") : isSv ? "Förbättra" : "Improve"}</span>
            </button>
            <button
              type="button"
              onClick={onToggleCompare}
              className={`pgx-tool ${compare ? "is-active" : ""}`}
              title={
                isSv
                  ? "Jämför två svarsförslag sida vid sida"
                  : "Compare two answer options side by side"
              }
              aria-pressed={compare}
            >
              <SplitSquareHorizontal className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setMenu((m) => (m === "persona" ? "none" : "persona"))}
              className={`pgx-pill ${menu === "persona" ? "is-open" : ""}`}
              title={isSv ? "Roll" : "Persona"}
            >
              <span style={{ color: activePersona.accent }}>{activePersona.glyph}</span>
              <span className="pgx-pill-text">{activePersona.label[lang]}</span>
            </button>
            <button
              type="button"
              onClick={() => setMenu((m) => (m === "style" ? "none" : "style"))}
              className={`pgx-pill ${menu === "style" ? "is-open" : ""}`}
              title={isSv ? "Svarsstil" : "Response style"}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="pgx-pill-text">
                {STYLE_OPTIONS.find((s) => s.id === style)?.label[lang]}
              </span>
            </button>

            <AnimatePresence>
              {menu === "persona" && (
                <OptionMenu
                  items={PERSONAS.map((p) => ({
                    id: p.id,
                    label: p.label[lang],
                    hint: p.blurb[lang],
                    glyph: p.glyph,
                    accent: p.accent,
                  }))}
                  activeId={persona}
                  onSelect={(id) => {
                    onPersona(id as PersonaId);
                    setMenu("none");
                  }}
                  onClose={() => setMenu("none")}
                />
              )}
              {menu === "style" && (
                <OptionMenu
                  items={STYLE_OPTIONS.map((s) => ({ id: s.id, label: s.label[lang], hint: s.hint[lang] }))}
                  activeId={style}
                  onSelect={(id) => {
                    onStyle(id as StyleId);
                    setMenu("none");
                  }}
                  onClose={() => setMenu("none")}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="pgx-counter" title={isSv ? "Uppskattade tokens" : "Estimated tokens"}>
              {tokens > 0 ? `~${tokens} tok` : ""}
            </span>
            <button
              type="button"
              onClick={onOpenPalette}
              className="pgx-tool hidden sm:inline-flex"
              title={isSv ? "Kommandopalett (⌘K)" : "Command palette (⌘K)"}
              aria-label="Command palette"
            >
              <AtSign className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenVoice}
              className="pgx-tool"
              title={isSv ? "Röstläge — prata fritt med BudAI" : "Voice mode — hands-free with BudAI"}
              aria-label={isSv ? "Öppna röstläge" : "Open voice mode"}
            >
              <AudioLines className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleMic}
              className={`pgx-tool ${listening ? "is-live" : ""}`}
              title={isSv ? "Röstinmatning" : "Voice input"}
              aria-label={isSv ? "Röstinmatning" : "Voice input"}
              aria-pressed={listening}
            >
              {listening ? <span className="pgx-mic-wave" aria-hidden /> : <Mic className="h-4 w-4" />}
            </button>
            {busy ? (
              <button type="button" onClick={onStop} className="pgx-send is-stop" title={isSv ? "Stoppa" : "Stop"}>
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSubmit()}
                disabled={!canSend}
                className="pgx-send"
                title={isSv ? "Skicka (Enter)" : "Send (Enter)"}
                aria-label={isSv ? "Skicka" : "Send"}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.6} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pgx-composer-foot">
        <span>
          {isSv
            ? "Enter skickar · Shift+Enter ny rad · / för kommandon"
            : "Enter sends · Shift+Enter new line · / for commands"}
        </span>
        <span className="hidden sm:inline">
          {isSv ? "BudAI kan göra fel — kontrollera viktiga detaljer." : "BudAI can be wrong — check what matters."}
        </span>
      </div>
    </div>
  );
}

function OptionMenu({
  items,
  activeId,
  onSelect,
  onClose,
}: {
  items: { id: string; label: string; hint: string; glyph?: string; accent?: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.13 }}
      className="pgx-popover absolute bottom-full left-0 z-40 mb-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e15]/97 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
    >
      <div className="p-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelect(item.id);
              onClose();
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
              item.id === activeId ? "bg-accent-cyan/12" : "hover:bg-white/[0.04]"
            }`}
          >
            {item.glyph && (
              <span className="text-[13px]" style={{ color: item.accent }}>
                {item.glyph}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium text-white/90">{item.label}</span>
              <span className="block truncate text-[11px] text-white/45">{item.hint}</span>
            </span>
            {item.id === activeId && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-cyan" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
