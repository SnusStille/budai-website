"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Check,
  Command,
  Copy,
  Download,
  Gauge,
  Image as ImageIcon,
  Keyboard,
  Layers,
  Palette,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import Markdown from "./Markdown";
import type { AccentId, ChatMessage, MemoryItem } from "@/lib/playground/types";
import { estimateCostUsd } from "@/lib/playground/types";
import {
  ACCENTS,
  EFFORT_OPTIONS,
  LIBRARY_CATEGORIES,
  LIBRARY_PROMPTS,
  PERSONAS,
  STYLE_OPTIONS,
  type LibraryCategory,
} from "@/lib/playground/prompts";

type Lang = "sv" | "en";

/* ── shell ───────────────────────────────────────────────── */

/** Modals live on document.body so no ancestor transform or overflow can clip them. */
export function Portal({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  wide,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="pgx-modal-layer"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <button type="button" className="pgx-modal-backdrop" onClick={onClose} aria-label="close" />
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`pgx-modal ${wide ? "is-wide" : ""}`}
            >
              <div className="pgx-modal-head">
                <span className="pgx-modal-title">
                  {icon}
                  {title}
                </span>
                <button type="button" onClick={onClose} className="pgx-icon-btn" aria-label="close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="pgx-modal-body">{children}</div>
              {footer && <div className="pgx-modal-foot">{footer}</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/* ── command palette ─────────────────────────────────────── */

export type PaletteAction = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon?: ReactNode;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  actions,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  actions: PaletteAction[];
  lang: Lang;
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const isSv = lang === "sv";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) => a.label.toLowerCase().includes(q) || (a.hint || "").toLowerCase().includes(q) || a.group.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setIndex((i) => (i + 1) % Math.max(filtered.length, 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setIndex((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const action = filtered[index];
        if (action) {
          action.run();
          onClose();
        }
      } else if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, index, onClose]);

  return (
    <Modal open={open} onClose={onClose} title={isSv ? "Kommandopalett" : "Command palette"} icon={<Command className="h-4 w-4" />}>
      <div className="pgx-palette-search">
        <Search className="h-4 w-4" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isSv ? "Sök kommandon…" : "Search commands…"}
        />
        <kbd>esc</kbd>
      </div>
      <div className="pgx-palette-list">
        {filtered.length === 0 && <p className="pgx-empty-note">{isSv ? "Inget matchade." : "Nothing matched."}</p>}
        {filtered.map((action, i) => (
          <button
            key={action.id}
            type="button"
            onMouseEnter={() => setIndex(i)}
            onClick={() => {
              action.run();
              onClose();
            }}
            className={`pgx-palette-item ${i === index ? "is-active" : ""}`}
          >
            <span className="pgx-palette-icon">{action.icon || <Sparkles className="h-3.5 w-3.5" />}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-white/90">{action.label}</span>
              {action.hint && <span className="block truncate text-[11px] text-white/40">{action.hint}</span>}
            </span>
            <span className="pgx-palette-group">{action.group}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ── shortcuts ───────────────────────────────────────────── */

export function ShortcutsModal({ open, onClose, lang }: { open: boolean; onClose: () => void; lang: Lang }) {
  const isSv = lang === "sv";
  const rows: [string, string][] = [
    ["⌘ / Ctrl + K", isSv ? "Kommandopalett" : "Command palette"],
    ["⌘ / Ctrl + N", isSv ? "Ny chatt" : "New chat"],
    ["⌘ / Ctrl + B", isSv ? "Visa/dölj panel" : "Toggle side panel"],
    ["⌘ / Ctrl + E", isSv ? "Exportera konversation" : "Export conversation"],
    ["⌘ / Ctrl + /", isSv ? "Tangentbordsgenvägar" : "Keyboard shortcuts"],
    ["Enter", isSv ? "Skicka meddelande" : "Send message"],
    ["Shift + Enter", isSv ? "Ny rad" : "New line"],
    ["/", isSv ? "Kommandon i fältet" : "Commands in the field"],
    ["Esc", isSv ? "Stäng fönster/läge" : "Close dialog or mode"],
    ["↑ / ↓", isSv ? "Navigera i listor" : "Move through lists"],
  ];
  return (
    <Modal open={open} onClose={onClose} title={isSv ? "Tangentbord" : "Keyboard"} icon={<Keyboard className="h-4 w-4" />}>
      <div className="pgx-shortcut-grid">
        {rows.map(([keys, label]) => (
          <div key={keys} className="pgx-shortcut-row">
            <span className="pgx-shortcut-label">{label}</span>
            <span className="pgx-shortcut-keys">
              {keys.split(" / ").map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ── prompt library ──────────────────────────────────────── */

export function PromptLibrary({
  open,
  onClose,
  onUse,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  onUse: (text: string) => void;
  lang: Lang;
}) {
  const isSv = lang === "sv";
  const [category, setCategory] = useState<LibraryCategory>("work");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIBRARY_PROMPTS.filter((p) => (q ? p.title[lang].toLowerCase().includes(q) || p.body[lang].toLowerCase().includes(q) : p.category === category));
  }, [category, query, lang]);

  return (
    <Modal open={open} onClose={onClose} title={isSv ? "Promptbibliotek" : "Prompt library"} icon={<Layers className="h-4 w-4" />} wide>
      <div className="pgx-library-bar">
        <div className="pgx-library-tabs">
          {LIBRARY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setQuery("");
              }}
              className={cat.id === category && !query ? "is-active" : ""}
            >
              {cat.label[lang]}
            </button>
          ))}
        </div>
        <div className="pgx-palette-search is-inline">
          <Search className="h-3.5 w-3.5" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isSv ? "Sök mallar…" : "Search templates…"} />
        </div>
      </div>
      <div className="pgx-library-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onUse(item.body[lang]);
              onClose();
            }}
            className="pgx-library-card"
          >
            <span className="pgx-library-icon">{item.icon}</span>
            <span className="pgx-library-title">{item.title[lang]}</span>
            <span className="pgx-library-body">{item.body[lang]}</span>
            <span className="pgx-library-use">
              <Plus className="h-3.5 w-3.5" />
              {isSv ? "Använd" : "Use"}
            </span>
          </button>
        ))}
        {items.length === 0 && <p className="pgx-empty-note">{isSv ? "Inga mallar matchade." : "No templates matched."}</p>}
      </div>
    </Modal>
  );
}

/* ── memory ──────────────────────────────────────────────── */

export function MemoryPanel({
  open,
  onClose,
  lang,
  items,
  enabled,
  onToggle,
  onAdd,
  onUpdate,
  onDelete,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  items: MemoryItem[];
  enabled: boolean;
  onToggle: (value: boolean) => void;
  onAdd: (text: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  const isSv = lang === "sv";
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isSv ? "BudAI:s minne" : "BudAI memory"}
      icon={<BrainCircuit className="h-4 w-4" />}
      footer={
        <div className="pgx-modal-foot-row">
          <span className="text-[11px] text-white/45">
            {isSv ? `${items.length} sparade fakta` : `${items.length} saved facts`}
          </span>
          {items.length > 0 && (
            <button type="button" onClick={onClear} className="pgx-text-btn is-danger">
              <Trash2 className="h-3.5 w-3.5" />
              {isSv ? "Rensa allt" : "Clear all"}
            </button>
          )}
        </div>
      }
    >
      <div className="pgx-switch-row">
        <span className="min-w-0">
          <span className="block text-[13px] text-white/90">{isSv ? "Använd minne i samtal" : "Use memory in chats"}</span>
          <span className="block text-[11px] text-white/45">
            {isSv
              ? "BudAI kommer ihåg saker du berättar mellan chattar."
              : "BudAI remembers things you share across chats."}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`pgx-switch ${enabled ? "is-on" : ""}`}
        >
          <span />
        </button>
      </div>

      <form
        className="pgx-memory-add"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          onAdd(draft.trim());
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isSv ? "Lägg till något BudAI ska komma ihåg…" : "Add something BudAI should remember…"}
        />
        <button type="submit" className="pgx-btn-primary" disabled={!draft.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="pgx-memory-list">
        {items.length === 0 && (
          <p className="pgx-empty-note">
            {isSv
              ? "Inget sparat ännu. BudAI föreslår minnen automatiskt när du berättar något varaktigt."
              : "Nothing saved yet. BudAI suggests memories automatically when you share something durable."}
          </p>
        )}
        {items.map((item) => (
          <div key={item.id} className="pgx-memory-item">
            {editing === item.id ? (
              <form
                className="flex flex-1 items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdate(item.id, editVal);
                  setEditing(null);
                }}
              >
                <input
                  autoFocus
                  value={editVal}
                  onChange={(event) => setEditVal(event.target.value)}
                  className="pgx-inline-input"
                />
                <button type="submit" className="pgx-mini-btn">
                  <Check className="h-3.5 w-3.5 text-accent-green" />
                </button>
              </form>
            ) : (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] leading-snug text-white/85">{item.text}</span>
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-white/35">
                    {item.source === "auto" ? (isSv ? "automatiskt" : "automatic") : isSv ? "manuellt" : "manual"}
                  </span>
                </span>
                <button
                  type="button"
                  className="pgx-mini-btn"
                  onClick={() => {
                    setEditing(item.id);
                    setEditVal(item.text);
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="pgx-mini-btn pgx-mini-btn--danger" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ── insights ────────────────────────────────────────────── */

export function StatsPanel({
  open,
  onClose,
  lang,
  messages,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  messages: ChatMessage[];
}) {
  const isSv = lang === "sv";
  const stats = useMemo(() => {
    const user = messages.filter((m) => m.role === "user");
    const ai = messages.filter((m) => m.role === "assistant");
    const words = messages.reduce((sum, m) => sum + (m.content.trim() ? m.content.trim().split(/\s+/).length : 0), 0);
    const tokensIn = user.reduce((sum, m) => sum + Math.round(m.content.length / 4), 0);
    const tokensOut = ai.reduce((sum, m) => sum + Math.round(m.content.length / 4), 0);
    const latencies = ai.map((m) => m.ms || 0).filter((v) => v > 0);
    const avg = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    return {
      messages: messages.length,
      words,
      tokensIn,
      tokensOut,
      cost: estimateCostUsd(tokensIn, tokensOut),
      avg,
      images: messages.filter((m) => m.imageUrl).length,
    };
  }, [messages]);

  const tiles: { label: string; value: string; hint?: string; icon: ReactNode }[] = [
    { label: isSv ? "Meddelanden" : "Messages", value: String(stats.messages), icon: <Layers className="h-3.5 w-3.5" /> },
    { label: isSv ? "Ord" : "Words", value: stats.words.toLocaleString("sv-SE"), icon: <BarChart3 className="h-3.5 w-3.5" /> },
    {
      label: isSv ? "Tokens (in/ut)" : "Tokens (in/out)",
      value: `${stats.tokensIn} / ${stats.tokensOut}`,
      icon: <Gauge className="h-3.5 w-3.5" />,
    },
    {
      label: isSv ? "Snitt svarstid" : "Avg response",
      value: stats.avg ? `${(stats.avg / 1000).toFixed(1)}s` : "—",
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    {
      label: isSv ? "Uppskattad kostnad" : "Estimated cost",
      value: stats.cost > 0 ? `$${stats.cost.toFixed(4)}` : "—",
      hint: isSv ? "grov uppskattning" : "rough estimate",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
    },
    { label: isSv ? "Bilder" : "Images", value: String(stats.images), icon: <ImageIcon className="h-3.5 w-3.5" /> },
  ];

  return (
    <Modal open={open} onClose={onClose} title={isSv ? "Insikter" : "Insights"} icon={<BarChart3 className="h-4 w-4" />} wide>
      <div className="pgx-stat-grid">
        {tiles.map((tile) => (
          <div key={tile.label} className="pgx-stat-tile">
            <span className="pgx-stat-icon">{tile.icon}</span>
            <span className="pgx-stat-value">{tile.value}</span>
            <span className="pgx-stat-label">{tile.label}</span>
            {tile.hint && <span className="pgx-stat-hint">{tile.hint}</span>}
          </div>
        ))}
      </div>
      <p className="pgx-empty-note mt-3">
        {isSv
          ? "Siffrorna är lokala uppskattningar för den här sessionen — inget skickas någonstans."
          : "These numbers are local estimates for this session — nothing is sent anywhere."}
      </p>
      {messages.length > 0 && (
        <div className="pgx-timeline">
          {messages.slice(-12).map((m) => (
            <div key={m.id} className={`pgx-timeline-row ${m.role === "user" ? "is-user" : ""}`}>
              <span className="pgx-timeline-dot" />
              <span className="truncate text-[11.5px] text-white/60">{m.content.slice(0, 90) || "…"}</span>
              <span className="pgx-timeline-words">
                {m.content ? m.content.trim().split(/\s+/).length : 0} {isSv ? "ord" : "w"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ── gallery ─────────────────────────────────────────────── */

export function GalleryPanel({
  open,
  onClose,
  lang,
  messages,
  onLightbox,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  messages: ChatMessage[];
  onLightbox: (url: string) => void;
}) {
  const isSv = lang === "sv";
  const images = messages.filter((m) => m.imageUrl);
  return (
    <Modal open={open} onClose={onClose} title={isSv ? "Galleri" : "Gallery"} icon={<ImageIcon className="h-4 w-4" />} wide>
      {images.length === 0 ? (
        <p className="pgx-empty-note">{isSv ? "Inga bilder i den här chatten ännu." : "No images in this chat yet."}</p>
      ) : (
        <div className="pgx-gallery">
          {images.map((m) => (
            <button key={m.id} type="button" onClick={() => onLightbox(m.imageUrl!)} className="pgx-gallery-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.imageUrl} alt="" />
              <a
                href={m.imageUrl}
                download="budai-image.png"
                onClick={(event) => event.stopPropagation()}
                className="pgx-gallery-download"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ── preferences ─────────────────────────────────────────── */

export function SettingsPanel({
  open,
  onClose,
  lang,
  accent,
  sound,
  stream,
  showTimestamps,
  reduceEffects,
  persona,
  style,
  effort,
  answerLang,
  onAccent,
  onSound,
  onStream,
  onTimestamps,
  onReduceEffects,
  onPersona,
  onStyle,
  onEffort,
  onAnswerLang,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  accent: AccentId;
  sound: boolean;
  stream: boolean;
  showTimestamps: boolean;
  reduceEffects: boolean;
  persona: string;
  style: string;
  effort: string;
  answerLang: Lang;
  onAccent: (accent: AccentId) => void;
  onSound: (value: boolean) => void;
  onStream: (value: boolean) => void;
  onTimestamps: (value: boolean) => void;
  onReduceEffects: (value: boolean) => void;
  onPersona: (value: string) => void;
  onStyle: (value: string) => void;
  onEffort: (value: string) => void;
  onAnswerLang: (value: Lang) => void;
}) {
  const isSv = lang === "sv";
  return (
    <Modal open={open} onClose={onClose} title={isSv ? "Inställningar" : "Preferences"} icon={<Palette className="h-4 w-4" />}>
      <div className="pgx-settings-section">
        <span className="pgx-settings-label">
          <Palette className="h-3.5 w-3.5" />
          {isSv ? "Accentfärg" : "Accent colour"}
        </span>
        <div className="pgx-accent-row">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onAccent(a.id)}
              className={`pgx-accent-dot ${a.id === accent ? "is-active" : ""}`}
              style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
              aria-label={a.label}
              title={a.label}
            />
          ))}
        </div>
      </div>

      <div className="pgx-settings-section">
        <span className="pgx-settings-label">
          <Sparkles className="h-3.5 w-3.5" />
          {isSv ? "Standardroll" : "Default persona"}
        </span>
        <div className="pgx-chip-row">
          {PERSONAS.map((p) => (
            <button key={p.id} type="button" onClick={() => onPersona(p.id)} className={`pgx-chip ${p.id === persona ? "is-active" : ""}`}>
              <span style={{ color: p.accent }}>{p.glyph}</span>
              {p.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="pgx-settings-section">
        <span className="pgx-settings-label">
          <Layers className="h-3.5 w-3.5" />
          {isSv ? "Svarsstil" : "Response style"}
        </span>
        <div className="pgx-chip-row">
          {STYLE_OPTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => onStyle(s.id)} className={`pgx-chip ${s.id === style ? "is-active" : ""}`}>
              {s.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="pgx-settings-section">
        <span className="pgx-settings-label">
          <Gauge className="h-3.5 w-3.5" />
          {isSv ? "Djup" : "Depth"}
        </span>
        <div className="pgx-chip-row">
          {EFFORT_OPTIONS.map((e) => (
            <button key={e.id} type="button" onClick={() => onEffort(e.id)} className={`pgx-chip ${e.id === effort ? "is-active" : ""}`}>
              {e.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="pgx-settings-section">
        <span className="pgx-settings-label">{isSv ? "Svara på" : "Answer in"}</span>
        <div className="pgx-chip-row">
          {(["sv", "en"] as const).map((code) => (
            <button key={code} type="button" onClick={() => onAnswerLang(code)} className={`pgx-chip ${code === answerLang ? "is-active" : ""}`}>
              {code === "sv" ? "Svenska" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="pgx-settings-toggles">
        <Toggle lang={lang} icon={<Sparkles className="h-3.5 w-3.5" />} label={isSv ? "Strömmande svar" : "Streaming answers"} value={stream} onChange={onStream} />
        <Toggle lang={lang} icon={<Volume2 className="h-3.5 w-3.5" />} label={isSv ? "Ljud" : "Sound"} value={sound} onChange={onSound} />
        <Toggle
          lang={lang}
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          label={isSv ? "Visa tidsstämplar" : "Show timestamps"}
          value={showTimestamps}
          onChange={onTimestamps}
        />
        <Toggle
          lang={lang}
          icon={<Gauge className="h-3.5 w-3.5" />}
          label={isSv ? "Minska rörelse" : "Reduce motion"}
          value={reduceEffects}
          onChange={onReduceEffects}
        />
      </div>
    </Modal>
  );
}

function Toggle({
  icon,
  label,
  value,
  onChange,
}: {
  lang: Lang;
  icon: ReactNode;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="pgx-switch-row is-compact">
      <span className="flex min-w-0 items-center gap-2 text-[12.5px] text-white/85">
        <span className="text-white/45">{icon}</span>
        {label}
      </span>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`pgx-switch ${value ? "is-on" : ""}`}>
        <span />
      </button>
    </div>
  );
}

/* ── workspace / inspector ───────────────────────────────── */

export function InspectorPanel({
  open,
  lang,
  title,
  body,
  onClose,
}: {
  open: boolean;
  lang: Lang;
  title: string;
  body: string;
  onClose: () => void;
}) {
  const isSv = lang === "sv";
  const [copied, setCopied] = useState(false);
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  if (!open) return null;

  const download = () => {
    const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budai-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "dokument"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="pgx-inspector">
      <div className="pgx-inspector-head">
        <span className="min-w-0">
          <span className="pgx-inspector-kicker">{isSv ? "Panel" : "Panel"}</span>
          <span className="pgx-inspector-title">{title}</span>
        </span>
        <button type="button" onClick={onClose} className="pgx-icon-btn" aria-label={isSv ? "Stäng panel" : "Close panel"}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="pgx-inspector-body">
        <Markdown text={body} />
      </div>
      <div className="pgx-inspector-foot">
        <span>{words} {isSv ? "ord" : "words"}</span>
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            className="pgx-text-btn"
            onClick={() => {
              void navigator.clipboard.writeText(body);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
            {isSv ? "Kopiera" : "Copy"}
          </button>
          <button type="button" className="pgx-text-btn" onClick={download}>
            <Download className="h-3.5 w-3.5" />
            .md
          </button>
        </span>
      </div>
    </aside>
  );
}

export { Modal };
