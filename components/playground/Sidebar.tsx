"use client";

import { useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  Check,
  Clock,
  LogIn,
  LogOut,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import type { Conversation } from "@/lib/playground/types";

type Lang = "sv" | "en";

export type HistoryItem = Pick<
  Conversation,
  "id" | "title" | "updatedAt" | "createdAt" | "temporary" | "pinned"
>;

type Props = {
  lang: Lang;
  history: HistoryItem[];
  grouped: { label: string; items: HistoryItem[] }[];
  activeId: string | null;
  search: string;
  onSearch: (value: string) => void;
  onNew: () => void;
  onTemporary: () => void;
  onLoad: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  creating: boolean;
  isMember: boolean;
  isGuest: boolean;
  remaining: number;
  limit: number;
  memoryCount: number;
  memoryEnabled: boolean;
  onOpenMemory: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onClose?: () => void;
  userName?: string | null;
  /** conversation id → matching snippet from the search */
  snippets?: Record<string, string>;
};

export default function Sidebar({
  lang,
  grouped,
  activeId,
  search,
  onSearch,
  onNew,
  onTemporary,
  onLoad,
  onRename,
  onDelete,
  onTogglePin,
  creating,
  isMember,
  isGuest,
  remaining,
  limit,
  memoryCount,
  memoryEnabled,
  onOpenMemory,
  onOpenStats,
  onOpenSettings,
  onSignIn,
  onSignOut,
  onClose,
  userName,
  snippets = {},
}: Props) {
  const isSv = lang === "sv";
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const usedRatio = limit > 0 ? Math.max(0, Math.min(1, 1 - remaining / limit)) : 0;

  return (
    <div className="pgx-sidebar flex h-full min-h-0 flex-col">
      <div className="pgx-sidebar-head">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onNew} disabled={creating} className="pgx-new-chat group">
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            <span>{isSv ? "Ny chatt" : "New chat"}</span>
            <kbd className="pgx-kbd hidden lg:inline">⌘N</kbd>
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="pgx-icon-btn lg:hidden" aria-label={isSv ? "Stäng" : "Close"}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="pgx-search">
          <Search className="h-3.5 w-3.5" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={isSv ? "Sök i chattar…" : "Search chats…"}
            aria-label={isSv ? "Sök i chattar" : "Search chats"}
          />
          {search && (
            <button type="button" onClick={() => onSearch("")} aria-label={isSv ? "Rensa" : "Clear"}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isMember && (
          <button type="button" onClick={onTemporary} className="pgx-ghost-row">
            <Clock className="h-3.5 w-3.5" />
            <span>{isSv ? "Tillfällig chatt" : "Temporary chat"}</span>
            <span className="pgx-ghost-note">{isSv ? "sparas ej" : "not saved"}</span>
          </button>
        )}
      </div>

      <div className="pgx-history min-h-0 flex-1 overflow-y-auto">
        {grouped.length === 0 && (
          <div className="pgx-history-empty">
            <span className="pgx-history-empty-mark">◈</span>
            <p>
              {isGuest
                ? isSv
                  ? "Gästchattar sparas bara här på enheten, i den här webbläsaren."
                  : "Guest chats live only in this browser on this device."
                : isSv
                  ? "Inga chattar ännu. Starta en ny och se den dyka upp här."
                  : "No chats yet. Start one and it shows up here."}
            </p>
            {search && (
              <p className="px-3 text-[11px] text-white/30">
                {isSv ? "Söker även inuti dina meddelanden." : "Search also looks inside your messages."}
              </p>
            )}
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="pgx-history-label">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeId === item.id;
                return (
                  <div key={item.id} className={`pgx-history-row group ${active ? "is-active" : ""}`}>
                    {renamingId === item.id ? (
                      <form
                        className="flex flex-1 items-center gap-1"
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (renameVal.trim()) onRename(item.id, renameVal.trim());
                          setRenamingId(null);
                        }}
                      >
                        <input
                          autoFocus
                          value={renameVal}
                          onChange={(event) => setRenameVal(event.target.value)}
                          onBlur={() => setRenamingId(null)}
                          className="min-w-0 flex-1 rounded-md border border-accent-cyan/30 bg-black/50 px-2 py-1 text-[12px] text-white outline-none"
                        />
                        <button type="submit" className="p-1 text-accent-cyan" aria-label={isSv ? "Spara" : "Save"}>
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onLoad(item.id)}
                          className="min-w-0 flex-1 text-left"
                          title={item.title}
                        >
                          <span className="flex items-center gap-1.5">
                            {item.pinned && <Pin className="h-3 w-3 shrink-0 text-accent-cyan" />}
                            <span className="truncate text-[12.5px] text-white/85">{item.title}</span>
                          </span>
                          {snippets[item.id] && (
                            <span className="pgx-history-snippet">{snippets[item.id]}</span>
                          )}
                        </button>
                        <span className="pgx-history-actions">
                          <button
                            type="button"
                            onClick={() => onTogglePin(item.id)}
                            className="pgx-mini-btn"
                            title={item.pinned ? (isSv ? "Ta bort nål" : "Unpin") : isSv ? "Fäst" : "Pin"}
                            aria-label={item.pinned ? "Unpin" : "Pin"}
                          >
                            {item.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingId(item.id);
                              setRenameVal(item.title);
                            }}
                            className="pgx-mini-btn"
                            title={isSv ? "Byt namn" : "Rename"}
                            aria-label={isSv ? "Byt namn" : "Rename"}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="pgx-mini-btn pgx-mini-btn--danger"
                            title={isSv ? "Ta bort" : "Delete"}
                            aria-label={isSv ? "Ta bort" : "Delete"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pgx-sidebar-foot">
        <button type="button" onClick={onOpenStats} className="pgx-foot-row">
          <BarChart3 className="h-3.5 w-3.5 text-accent-cyan" />
          <span>{isSv ? "Insikter" : "Insights"}</span>
          <span className="pgx-foot-meter" aria-hidden>
            <span className="pgx-foot-meter-fill" style={{ width: `${Math.round(usedRatio * 100)}%` }} />
          </span>
          <span className="pgx-foot-value">
            {remaining}/{limit}
          </span>
        </button>

        {isMember && (
          <button type="button" onClick={onOpenMemory} className="pgx-foot-row">
            <BrainCircuit className="h-3.5 w-3.5 text-accent-purple" />
            <span>{isSv ? "Minne" : "Memory"}</span>
            {!memoryEnabled && <span className="pgx-foot-badge">{isSv ? "av" : "off"}</span>}
            <span className="pgx-foot-value">{memoryCount}</span>
          </button>
        )}

        <button type="button" onClick={onOpenSettings} className="pgx-foot-row">
          <Settings2 className="h-3.5 w-3.5 text-white/50" />
          <span>{isSv ? "Inställningar" : "Preferences"}</span>
        </button>

        {isMember ? (
          <div className="pgx-account">
            <span className="pgx-account-avatar">{(userName || "B").slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] text-white/85">{userName || "BudAI member"}</span>
              <span className="block text-[10px] text-white/40">{isSv ? "Inloggad" : "Signed in"}</span>
            </span>
            <button type="button" onClick={onSignOut} className="pgx-mini-btn" title={isSv ? "Logga ut" : "Sign out"}>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={onSignIn} className="pgx-signin">
            <LogIn className="h-3.5 w-3.5" />
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[12px] font-medium">{isSv ? "Logga in gratis" : "Sign in free"}</span>
              <span className="block text-[10px] text-white/45">
                {isSv ? "Minne, historik i molnet, fler meddelanden" : "Memory, cloud history, more messages"}
              </span>
            </span>
          </button>
        )}

        <div className="pgx-build-tag">BudAI preview · v5.3</div>
      </div>
    </div>
  );
}
