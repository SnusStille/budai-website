"use client";

import { motion } from "framer-motion";
import { Copy, FileDown, PanelRightClose, X } from "lucide-react";
import { renderMarkdown } from "./markdown";
import type { Lang } from "./presets";

export type WorkspaceDoc = { msgId: string; title: string; body: string };

type Props = {
  lang: Lang;
  workspace: WorkspaceDoc;
  busy: boolean;
  onCopy: (text: string) => void;
  onDownload: () => void;
  onClose: () => void;
  onImprove: () => void;
  onEditInChat: () => void;
};

/** Desktop side panel for long, structured answers. */
export function WorkspacePanel({
  lang,
  workspace,
  busy,
  onCopy,
  onDownload,
  onClose,
  onImprove,
  onEditInChat,
}: Props) {
  const sv = lang === "sv";

  return (
    <aside className="hidden w-[min(40%,420px)] shrink-0 flex-col border-l border-white/[0.07] bg-[#07070d] lg:flex">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-accent-cyan/75">
            Workspace
          </div>
          <div className="truncate text-[13px] font-semibold text-white/90">{workspace.title}</div>
        </div>
        <button
          type="button"
          onClick={() => onCopy(workspace.body)}
          title={sv ? "Kopiera" : "Copy"}
          aria-label={sv ? "Kopiera" : "Copy"}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDownload}
          title={sv ? "Ladda ner .md" : "Download .md"}
          aria-label={sv ? "Ladda ner .md" : "Download .md"}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <FileDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title={sv ? "Stäng" : "Close"}
          aria-label={sv ? "Stäng" : "Close"}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <PanelRightClose className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="pg-scroll-thin min-h-0 flex-1 overflow-y-auto p-5 text-[13.5px] leading-relaxed text-white/88">
        {renderMarkdown(workspace.body)}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={onImprove}
          disabled={busy}
          className="flex-1 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.09] py-2 text-[11.5px] font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/[0.14] disabled:opacity-40"
        >
          {sv ? "Förbättra" : "Improve"}
        </button>
        <button
          type="button"
          onClick={onEditInChat}
          className="flex-1 rounded-xl border border-white/[0.09] py-2 text-[11.5px] font-medium text-muted transition-colors hover:text-white"
        >
          {sv ? "Redigera i chatten" : "Edit in chat"}
        </button>
      </div>
    </aside>
  );
}

/** Mobile bottom sheet variant of the same document. */
export function WorkspaceSheet({
  lang,
  workspace,
  onCopy,
  onClose,
}: Pick<Props, "lang" | "workspace" | "onCopy" | "onClose">) {
  const sv = lang === "sv";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[91] flex flex-col justify-end lg:hidden"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-label={sv ? "Stäng" : "Close"}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "40%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="relative flex max-h-[85svh] flex-col rounded-t-3xl border border-white/[0.1] bg-[#08080f] shadow-2xl"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.16em] text-accent-cyan/75">Workspace</div>
            <div className="truncate text-sm font-semibold text-white">{workspace.title}</div>
          </div>
          <button
            type="button"
            onClick={() => onCopy(workspace.body)}
            aria-label={sv ? "Kopiera" : "Copy"}
            className="rounded-lg p-2 text-muted hover:bg-white/[0.06] hover:text-white"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={sv ? "Stäng" : "Close"}
            className="rounded-lg p-2 text-muted hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="pg-scroll-thin min-h-0 flex-1 overflow-y-auto p-5 text-[14px] leading-relaxed text-white/88">
          {renderMarkdown(workspace.body)}
        </div>
      </motion.div>
    </motion.div>
  );
}
