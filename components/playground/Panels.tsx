"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookmarkPlus,
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
import type { AccentId, ChatMessage } from "@/lib/playground/types";
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

export type NoteItem = {
  id: string;
  text: string;
  createdAt: number;
  source?: string;
};

export function NotesPanel({
  open,
  onClose,
  lang,
  notes,
  onDelete,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  notes: NoteItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  const isSv = lang === "sv";
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => n.text.toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  const exportNotes = () => {
    const body = notes
      .map((n) => `## ${new Date(n.createdAt).toLocaleString()}${n.source ? ` · ${n.source}` : ""}\n\n${n.text}\n`)
      .join("\n");
    const blob = new Blob([`# BudAI · ${isSv ? "Anteckningar" : "Notes"}\n\n${body}`], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budai-notes.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isSv ? "Anteckningar" : "Notes"}
      icon={<BookmarkPlus className="h-4 w-4" />}
      wide
      footer={
        <div className="pgx-modal-foot-row">
          <span className="text-[11px] text-white/45">
            {isSv ? `${notes.length} sparade utdrag` : `${notes.length} saved snippets`}
          </span>
          <span className="flex items-center gap-1.5">
            <button type="button" className="pgx-text-btn" onClick={exportNotes} disabled={!notes.length}>
              <Download className="h-3.5 w-3.5" />
              .md
            </button>
            {notes.length > 0 && (
              <button type="button" className="pgx-text-btn is-danger" onClick={onClear}>
                <Trash2 className="h-3.5 w-3.5" />
                {isSv ? "Rensa" : "Clear"}
              </button>
            )}
          </span>
        </div>
      }
    >
      {notes.length > 6 && (
        <div className="pgx-palette-search is-inline mb-3">
          <Search className="h-3.5 w-3.5" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isSv ? "Sök i anteckningar…" : "Search notes…"} />
        </div>
      )}
      {notes.length === 0 ? (
        <p className="pgx-empty-note">
          {isSv
            ? "Inga anteckningar ännu. Markera text i ett svar och spara den — eller tryck på bokmärket."
            : "No notes yet. Highlight text in an answer and save it — or press the bookmark icon."}
        </p>
      ) : (
        <div className="pgx-note-list">
          {filtered.map((note) => (
            <div key={note.id} className="pgx-note">
              <div className="pgx-note-meta">
                <span>{new Date(note.createdAt).toLocaleString()}</span>
                {note.source && <span className="pgx-note-source">{note.source}</span>}
              </div>
              <p className="pgx-note-text">{note.text}</p>
              <div className="pgx-note-actions">
                <button
                  type="button"
                  className="pgx-text-btn"
                  onClick={() => void navigator.clipboard.writeText(note.text)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {isSv ? "Kopiera" : "Copy"}
                </button>
                <button type="button" className="pgx-text-btn is-danger" onClick={() => onDelete(note.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ── insights ────────────────────────────────────────────── */

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
  customInstructions,
  onCustomInstructions,
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
  customInstructions: string;
  onCustomInstructions: (value: string) => void;
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

      <div className="pgx-settings-section">
        <span className="pgx-settings-label">
          <Sparkles className="h-3.5 w-3.5" />
          {isSv ? "Egna instruktioner" : "Custom instructions"}
        </span>
        <textarea
          value={customInstructions}
          onChange={(event) => onCustomInstructions(event.target.value.slice(0, 800))}
          rows={3}
          placeholder={
            isSv
              ? "T.ex. Jag jobbar på ett svenskt bolag, svara kort och undvik jargong."
              : "E.g. I work at a Swedish company, keep answers short and skip jargon."
          }
          className="pgx-inline-input"
          style={{ minHeight: "4.5rem", resize: "vertical", lineHeight: 1.55 }}
        />
        <span className="pgx-stat-hint">
          {isSv
            ? "Sparas bara på den här enheten och skickas som kontext i varje svar."
            : "Saved only on this device and sent as context with every reply."}
        </span>
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

function extractPreviewSource(body: string): { html: string; kind: "html" | "svg" | null } {
  const fences: RegExpExecArray[] = [];
  const pattern = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null = pattern.exec(body);
  while (match) {
    fences.push(match);
    match = pattern.exec(body);
  }
  if (!fences.length) return { html: "", kind: null };

  const svgFence = fences.find((f) => /svg/i.test(f[1] || "") || /^\s*<svg/i.test(f[2] || ""));
  if (svgFence) {
    return {
      html: `<!doctype html><html><body style="margin:0;display:grid;place-items:center;height:100vh;background:#0b0f17">${svgFence[2]}</body></html>`,
      kind: "svg",
    };
  }

  const htmlFence = fences.find((f) => /html/i.test(f[1] || "") || /<\/?(div|section|body|html|h1|p|button)\b/i.test(f[2] || ""));
  const cssFence = fences.find((f) => /css/i.test(f[1] || ""));
  const jsFence = fences.find((f) => /(js|javascript|ts|tsx)/i.test(f[1] || ""));

  if (htmlFence || cssFence) {
    return {
      html: `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:#0b0f17;background:#fff;padding:16px;margin:0}${cssFence?.[2] || ""}</style>
</head><body>${htmlFence?.[2] || ""}
<script>${jsFence?.[2] || ""}<\/script>
</body></html>`,
      kind: "html",
    };
  }
  return { html: "", kind: null };
}

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
  const [tab, setTab] = useState<"content" | "preview">("content");
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const preview = useMemo(() => extractPreviewSource(body), [body]);

  useEffect(() => {
    setTab("content");
  }, [title, body]);

  if (!open) return null;

  const openInTab = () => {
    const blob = new Blob([preview.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    window.setTimeout(() => URL.revokeObjectURL(url), 20000);
  };

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
      {preview.kind && (
        <div className="pgx-inspector-tabs">
          <button type="button" onClick={() => setTab("content")} className={tab === "content" ? "is-active" : ""}>
            {isSv ? "Innehåll" : "Content"}
          </button>
          <button type="button" onClick={() => setTab("preview")} className={tab === "preview" ? "is-active" : ""}>
            {isSv ? "Förhandsvisning" : "Preview"}
          </button>
        </div>
      )}
      <div className="pgx-inspector-body">
        {tab === "preview" && preview.kind ? (
          <div className="pgx-preview-wrap">
            <div className="pgx-preview-bar">
              <span>
                {isSv
                  ? "Körs i en sandlåda i din webbläsare — inget skickas någonstans."
                  : "Runs sandboxed in your browser — nothing is sent anywhere."}
              </span>
              <button type="button" className="pgx-text-btn" onClick={openInTab}>
                {isSv ? "Öppna i ny flik" : "Open in new tab"}
              </button>
            </div>
            <iframe
              title="preview"
              className="pgx-preview-frame"
              sandbox="allow-scripts allow-forms allow-modals allow-popups"
              srcDoc={preview.html}
            />
          </div>
        ) : (
          <Markdown text={body} />
        )}
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
