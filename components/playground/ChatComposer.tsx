"use client";

import { useEffect, useState, type DragEvent, type RefObject } from "react";
import { Dices, ImagePlus, Mic, Send, StopCircle, Wand2, X, Zap } from "lucide-react";
import type { AttachmentDraft, Mode } from "@/lib/playground/types";
import { MAX_MESSAGE_CHARS, type IntentPreset, type Lang } from "./presets";

type Props = {
  lang: Lang;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  taRef: RefObject<HTMLTextAreaElement>;
  fileRef: RefObject<HTMLInputElement>;
  attach: AttachmentDraft | null;
  onRemoveAttach: () => void;
  onFilePicked: (file: File) => void;
  listening: boolean;
  onMic: () => void;
  genMode: boolean;
  onToggleGen: () => void;
  imageGenEnabled: boolean;
  intents: IntentPreset[];
  intentId: string;
  onIntent: (id: string) => void;
  mode: Mode;
  onToggleConcise: () => void;
  answerLang: Lang;
  onAnswerLang: (l: Lang) => void;
  onSurprise: () => void;
  inspireSpin: boolean;
};

const MAX_ROWS_PX = 180;

/**
 * Composer — one card, calm chrome, everything the user actually reaches for.
 * Enter sends, Shift+Enter breaks a line, the field grows with the text.
 */
export default function ChatComposer({
  lang,
  input,
  onInputChange,
  onSend,
  onStop,
  busy,
  taRef,
  fileRef,
  attach,
  onRemoveAttach,
  onFilePicked,
  listening,
  onMic,
  genMode,
  onToggleGen,
  imageGenEnabled,
  intents,
  intentId,
  onIntent,
  mode,
  onToggleConcise,
  answerLang,
  onAnswerLang,
  onSurprise,
  inspireSpin,
}: Props) {
  const sv = lang === "sv";
  const [dragOver, setDragOver] = useState(false);
  const canSend = Boolean(input.trim()) && !busy;
  const charRatio = input.length / MAX_MESSAGE_CHARS;

  /* auto-grow textarea */
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_PX)}px`;
  }, [input, taRef]);

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFilePicked(f);
  };

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-[#07070d]/85 px-3 pb-3 pt-3 sm:px-5 sm:pb-4">
      <div className="mx-auto w-full max-w-3xl">
        {/* mode row */}
        <div className="pg-scroll-thin -mx-1 mb-2.5 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
          {intents.map((it) => (
            <button
              key={it.id}
              type="button"
              title={it.hint}
              onClick={() => onIntent(it.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 ${
                intentId === it.id
                  ? "border-accent-cyan/35 bg-accent-cyan/[0.11] text-white shadow-[0_0_18px_-6px_rgba(0,229,255,0.5)]"
                  : "border-white/[0.08] bg-white/[0.02] text-muted hover:border-white/[0.16] hover:text-white"
              }`}
            >
              {it.label}
            </button>
          ))}

          <span className="hidden h-4 w-px shrink-0 bg-white/[0.08] sm:block" />

          <button
            type="button"
            onClick={onToggleConcise}
            title={sv ? "Korta, kärnfulla svar" : "Short, dense answers"}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
              mode === "concise"
                ? "border-accent-purple/40 bg-accent-purple/[0.13] text-accent-purple"
                : "border-white/[0.08] bg-white/[0.02] text-muted hover:border-white/[0.16] hover:text-white"
            }`}
          >
            <Zap className="h-3 w-3" />
            {sv ? "Kort" : "Short"}
          </button>

          <div
            className="flex shrink-0 items-center rounded-full border border-white/[0.08] bg-black/40 p-0.5"
            role="group"
            aria-label={sv ? "Svarspråk" : "Answer language"}
          >
            {(["en", "sv"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onAnswerLang(code)}
                aria-pressed={answerLang === code}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
                  answerLang === code
                    ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                    : "text-muted/70 hover:text-white"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* attachment */}
        {attach && (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attach.preview}
                alt={attach.name}
                className="h-12 w-12 rounded-lg border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={onRemoveAttach}
                aria-label={sv ? "Ta bort bild" : "Remove image"}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black text-white/80 transition-colors hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="min-w-0 text-[11.5px]">
              <div className="truncate text-white/85">{attach.name}</div>
              <div className="text-muted/60">
                {(attach.size / 1024).toFixed(0)} KB · {sv ? "redo att analyseras" : "ready to analyze"}
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend || (attach && !busy)) onSend();
          }}
          onDragEnter={onDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`rounded-2xl border bg-white/[0.035] transition-all duration-200 focus-within:border-accent-cyan/35 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] ${
            dragOver
              ? "border-accent-cyan/50 bg-accent-cyan/[0.05]"
              : "border-white/[0.1]"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) onFilePicked(f);
            }}
          />

          <label className="block">
            <span className="sr-only">{sv ? "Meddelande till BudAI" : "Message to BudAI"}</span>
            <textarea
              ref={taRef}
              value={input}
              maxLength={MAX_MESSAGE_CHARS}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend || (attach && !busy)) onSend();
                }
              }}
              rows={1}
              placeholder={
                genMode && imageGenEnabled
                  ? sv
                    ? "Beskriv bilden du vill skapa…"
                    : "Describe the image you want…"
                  : sv
                    ? "Skriv till BudAI…"
                    : "Message BudAI…"
              }
              className="block max-h-[180px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[14.5px] leading-[1.6] text-white placeholder:text-muted/55 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-1 px-2 pb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title={sv ? "Bifoga bild" : "Attach image"}
              aria-label={sv ? "Bifoga bild" : "Attach image"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.07] hover:text-accent-cyan"
            >
              <ImagePlus className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onMic}
              title={sv ? "Prata in" : "Voice input"}
              aria-label={sv ? "Prata in" : "Voice input"}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                listening
                  ? "bg-accent-green/15 text-accent-green"
                  : "text-muted hover:bg-white/[0.07] hover:text-accent-green"
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>

            {imageGenEnabled && (
              <button
                type="button"
                onClick={onToggleGen}
                title={sv ? "Skapa bild" : "Create image"}
                aria-pressed={genMode}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11.5px] transition-colors ${
                  genMode
                    ? "bg-accent-purple/15 text-accent-purple"
                    : "text-muted hover:bg-white/[0.07] hover:text-accent-purple"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{sv ? "Skapa bild" : "Create image"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSurprise}
              disabled={busy}
              title={sv ? "Slumpa en stark prompt" : "Drop in a strong prompt"}
              className={`ml-0.5 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11.5px] transition-colors disabled:opacity-40 ${
                inspireSpin
                  ? "bg-accent-purple/15 text-accent-purple"
                  : "text-muted hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Dices className={`h-3.5 w-3.5 ${inspireSpin ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{sv ? "Inspiration" : "Surprise"}</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              {listening && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-accent-green">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
                  {sv ? "lyssnar" : "listening"}
                </span>
              )}
              {charRatio > 0.12 && (
                <span
                  className={`font-mono text-[10.5px] tabular-nums ${
                    charRatio > 0.95 ? "text-red-300" : "text-muted/55"
                  }`}
                >
                  {input.length}/{MAX_MESSAGE_CHARS}
                </span>
              )}

              {busy ? (
                <button
                  type="button"
                  onClick={onStop}
                  title={sv ? "Stoppa" : "Stop generating"}
                  aria-label={sv ? "Stoppa" : "Stop generating"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 transition-colors hover:bg-red-500/20"
                >
                  <StopCircle className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend && !attach}
                  title={sv ? "Skicka" : "Send"}
                  aria-label={sv ? "Skicka" : "Send"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple text-white shadow-[0_6px_20px_-6px_rgba(0,229,255,0.6)] transition-all duration-200 hover:brightness-110 active:scale-95 disabled:from-white/[0.08] disabled:to-white/[0.08] disabled:text-muted/50 disabled:shadow-none"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="mt-2 hidden text-[11px] text-muted/45 sm:block">
          {sv
            ? "Enter skickar · Shift + Enter ny rad · lägena ovan styr hur BudAI svarar"
            : "Enter sends · Shift + Enter for a new line · the modes above steer how BudAI answers"}
        </p>
      </div>
    </div>
  );
}
