"use client";

import { useState } from "react";
import {
  BrainCircuit,
  Check,
  Clock,
  EyeOff,
  MessageSquarePlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { Lang, HistoryItem } from "./presets";

type Props = {
  lang: Lang;
  groups: { label: string; items: HistoryItem[] }[];
  convoId: string | null;
  creatingChat: boolean;
  isMember: boolean;
  search: string;
  onSearch: (v: string) => void;
  onNewChat: () => void;
  onNewTemporary: () => void;
  onLoad: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  memoryCount: number;
  memoryEnabled: boolean;
  onOpenMemory: () => void;
  remaining: number;
  limit: number;
  onUpgrade?: () => void;
  onClose?: () => void;
};

/** Conversation history — cloud for signed-in users, on-device for guests. */
export default function ChatSidebar({
  lang,
  groups,
  convoId,
  creatingChat,
  isMember,
  search,
  onSearch,
  onNewChat,
  onNewTemporary,
  onLoad,
  onRename,
  onDelete,
  memoryCount,
  memoryEnabled,
  onOpenMemory,
  remaining,
  limit,
  onUpgrade,
  onClose,
}: Props) {
  const sv = lang === "sv";
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const startRename = (id: string, title: string) => {
    setRenamingId(id);
    setRenameVal(title);
  };

  const commit = (id: string) => {
    const title = renameVal.trim().slice(0, 80);
    setRenamingId(null);
    if (title) onRename(id, title);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b border-white/[0.06] p-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={creatingChat}
            onClick={onNewChat}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[var(--r-sm)] border border-white/[0.1] bg-white/[0.045] text-[12.5px] font-semibold text-white transition-all hover:border-accent-cyan/30 hover:bg-accent-cyan/[0.09] active:scale-[0.98] disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5 text-accent-cyan" />
            {sv ? "Ny chatt" : "New chat"}
            <span className="kbd ml-1 hidden !h-4 !min-w-[1.15rem] !text-[9px] lg:inline-flex">⌘N</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={sv ? "Stäng" : "Close"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-muted transition-colors hover:text-white md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isMember && (
          <button
            type="button"
            onClick={onNewTemporary}
            title={sv ? "Sparas inte i minnet" : "Nothing is saved to memory"}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.07] text-[11.5px] text-muted transition-colors hover:border-white/[0.14] hover:text-white"
          >
            <Clock className="h-3 w-3" />
            {sv ? "Tillfällig chatt" : "Temporary chat"}
          </button>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/70" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={sv ? "Sök i historik…" : "Search chats…"}
            className="h-8 w-full rounded-[var(--r-xs)] border border-white/[0.07] bg-white/[0.03] pl-8 pr-2 text-[12px] text-white transition-colors placeholder:text-muted/50 focus:border-accent-cyan/35 focus:bg-white/[0.05] focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2.5">
        {groups.length === 0 && (
          <p className="px-2 py-6 text-center text-[11.5px] leading-relaxed text-muted/55">
            {search.trim()
              ? sv
                ? "Ingen chatt matchar sökningen."
                : "No chat matches that search."
              : isMember
                ? sv
                  ? "Inga chattar ännu — starta en ny."
                  : "No chats yet — start a new one."
                : sv
                  ? "Gästhistorik sparas tillfälligt på den här enheten."
                  : "Guest history stays on this device for now."}
          </p>
        )}

        {groups.map((g) => (
          <div key={g.label}>
            <div className="mb-1.5 px-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/45">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((c) => {
                const active = convoId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-0.5 rounded-xl px-1.5 py-1.5 transition-colors ${
                      active
                        ? "border border-accent-cyan/20 bg-accent-cyan/[0.09]"
                        : "border border-transparent hover:bg-white/[0.035]"
                    }`}
                  >
                    {renamingId === c.id ? (
                      <form
                        className="flex flex-1 items-center gap-1"
                        onSubmit={(e) => {
                          e.preventDefault();
                          commit(c.id);
                        }}
                      >
                        <input
                          autoFocus
                          value={renameVal}
                          onChange={(e) => setRenameVal(e.target.value)}
                          className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/40 px-1.5 py-1 text-[12px] text-white focus:border-accent-cyan/40 focus:outline-none"
                        />
                        <button
                          type="submit"
                          aria-label={sv ? "Spara" : "Save"}
                          className="rounded-md p-1 text-accent-cyan hover:bg-white/[0.07]"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={sv ? "Avbryt" : "Cancel"}
                          onClick={() => setRenamingId(null)}
                          className="rounded-md p-1 text-muted hover:bg-white/[0.07] hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onLoad(c.id)}
                          className="flex min-w-0 flex-1 items-center gap-1.5 px-1 text-left"
                        >
                          <MessageSquarePlus
                            className={`h-3.5 w-3.5 shrink-0 ${
                              active ? "text-accent-cyan" : "text-muted/45"
                            }`}
                          />
                          <span
                            className={`truncate text-[12.5px] ${
                              active ? "text-white" : "text-white/75"
                            }`}
                          >
                            {c.title}
                          </span>
                          {c.temporary && (
                            <Clock className="h-3 w-3 shrink-0 text-amber-200/60" aria-label="temporary" />
                          )}
                        </button>

                        {confirmDelete === c.id ? (
                          <span className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDelete(null);
                                onDelete(c.id);
                              }}
                              className="rounded-md px-1.5 py-1 text-[10.5px] font-medium text-red-300 hover:bg-red-500/10"
                            >
                              {sv ? "Radera" : "Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(null)}
                              className="rounded-md p-1 text-muted hover:bg-white/[0.07] hover:text-white"
                              aria-label={sv ? "Avbryt" : "Cancel"}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ) : (
                          <span className="flex shrink-0 items-center opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                            <button
                              type="button"
                              aria-label={sv ? "Byt namn" : "Rename"}
                              onClick={() => startRename(c.id, c.title)}
                              className="rounded-md p-1 text-muted hover:bg-white/[0.07] hover:text-white"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              aria-label={sv ? "Ta bort" : "Delete"}
                              onClick={() => setConfirmDelete(c.id)}
                              className="rounded-md p-1 text-muted hover:bg-red-500/10 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-white/[0.06] p-2.5">
        {isMember && (
          <button
            type="button"
            onClick={onOpenMemory}
            className="flex h-9 w-full items-center gap-2 rounded-xl px-2 text-[11.5px] text-muted transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-accent-purple" />
            {sv ? "Långtidsminne" : "Long-term memory"}
            <span className="ml-auto font-mono text-[11px] text-accent-purple/80">{memoryCount}</span>
            {!memoryEnabled && <EyeOff className="h-3 w-3 text-muted/60" />}
          </button>
        )}
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between text-[10.5px] text-muted/50">
            <span className="font-mono uppercase tracking-[0.12em]">
              {isMember ? (sv ? "konto" : "account") : sv ? "gäst" : "guest"}
            </span>
            <span className="font-mono tabular-nums">
              {remaining}/{limit} {sv ? "idag" : "today"}
            </span>
          </div>
          <div
            className={`meter mt-2 ${
              limit > 0 && remaining / limit < 0.15 ? "meter-danger" : limit > 0 && remaining / limit < 0.4 ? "meter-warn" : ""
            }`}
          >
            <span style={{ width: `${limit > 0 ? Math.min(100, Math.round(((limit - remaining) / limit) * 100)) : 0}%` }} />
          </div>
        </div>

        {!isMember && onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className="group flex w-full items-center gap-2.5 rounded-[var(--r-sm)] border border-accent-cyan/20 bg-accent-cyan/[0.055] px-2.5 py-2.5 text-left transition-colors hover:border-accent-cyan/40 hover:bg-accent-cyan/[0.1]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-cyan" />
            <span className="min-w-0">
              <span className="block text-[11.5px] font-medium text-white">
                {sv ? "Lås upp mer" : "Unlock more"}
              </span>
              <span className="block truncate text-[10.5px] text-muted/70">
                {sv ? "Historik, minne och bilder" : "History, memory and images"}
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
