"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Download, WrapText } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   A deliberately small, dependency-free markdown renderer.
   Handles what a chat product actually needs: headings, lists,
   task lists, quotes, tables, rules, links and rich code blocks.
   It is tolerant of partial input so it can render a live stream.
   ──────────────────────────────────────────────────────────── */

type Key = string;

function inline(text: string, key: Key): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|~~[^~]+~~|\[[^\]]+\]\([^)]+\)|https?:\/\/\S+)/g;
  const parts = text.split(pattern).filter((p) => p !== "");
  return parts.map((part, i) => {
    const k = `${key}-i${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={k} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
      return (
        <span key={k} className="text-white/45 line-through">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={k}
          className="rounded-md border border-white/10 bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.86em] text-accent-cyan"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={k} className="italic text-white/95">
          {part.slice(1, -1)}
        </em>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={k}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-cyan underline decoration-accent-cyan/30 underline-offset-2 hover:decoration-accent-cyan"
        >
          {link[1]}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={k}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-accent-cyan underline decoration-accent-cyan/30 underline-offset-2 hover:decoration-accent-cyan"
        >
          {part.replace(/^https?:\/\//, "")}
        </a>
      );
    }
    return <span key={k}>{part}</span>;
  });
}

function CodeBlock({ code, lang, keyId }: { code: string; lang: string; keyId: string }) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    const ext =
      {
        typescript: "ts",
        ts: "ts",
        javascript: "js",
        js: "js",
        tsx: "tsx",
        jsx: "jsx",
        python: "py",
        py: "py",
        bash: "sh",
        sh: "sh",
        json: "json",
        css: "css",
        html: "html",
        sql: "sql",
        sv: "txt",
      }[lang.toLowerCase()] || "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budai-${keyId}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pgx-code group/code my-3 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#05070c]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan/70" />
          {lang || "code"}
        </span>
        <span className="flex items-center gap-1 opacity-70 transition-opacity group-hover/code:opacity-100">
          <button
            type="button"
            onClick={() => setWrap((w) => !w)}
            className="rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
            title={wrap ? "No wrap" : "Wrap lines"}
            aria-label="Toggle line wrap"
          >
            <WrapText className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
            title="Download"
            aria-label="Download code"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </span>
      </div>
      <pre
        className={`pgx-code-body overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-white/88 ${
          wrap ? "whitespace-pre-wrap break-words" : ""
        }`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Table({ rows, keyId }: { rows: string[][]; keyId: string }) {
  if (!rows.length) return null;
  const [head, ...body] = rows;
  return (
    <div className="my-3 overflow-x-auto rounded-2xl border border-white/[0.09]">
      <table className="w-full border-collapse text-left text-[12.5px]">
        <thead>
          <tr className="bg-white/[0.04]">
            {head.map((cell, i) => (
              <th key={`${keyId}-h${i}`} className="border-b border-white/[0.08] px-3 py-2 font-semibold text-white/90">
                {inline(cell, `${keyId}-h${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={`${keyId}-r${r}`} className="odd:bg-white/[0.012]">
              {row.map((cell, c) => (
                <td key={`${keyId}-r${r}c${c}`} className="border-b border-white/[0.05] px-3 py-2 align-top text-white/78">
                  {inline(cell, `${keyId}-r${r}c${c}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function parseTableRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function Markdown({ text, compact = false }: { text: string; compact?: boolean }) {
  const nodes: ReactNode[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  let i = 0;
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const { ordered, items } = listBuffer;
    const items_ = items.map((it, idx) => (
      <li key={idx} className="leading-relaxed">
        {inline(it, `li-${nodes.length}-${idx}`)}
      </li>
    ));
    nodes.push(
      ordered ? (
        <ol key={`ol-${nodes.length}`} className="my-2 list-decimal space-y-1 pl-5 text-white/88 marker:text-accent-cyan/70">
          {items_}
        </ol>
      ) : (
        <ul key={`ul-${nodes.length}`} className="my-2 list-disc space-y-1 pl-5 text-white/88 marker:text-accent-cyan/60">
          {items_}
        </ul>
      )
    );
    listBuffer = null;
  };

  while (i < lines.length) {
    const raw = lines[i];

    /* fenced code */
    const fence = raw.match(/^\s*```(\w[\w+.-]*)?\s*$/);
    if (fence) {
      const lang = fence[1] || "";
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence (or run off the end while streaming)
      flushList();
      nodes.push(<CodeBlock key={`c-${nodes.length}`} code={body.join("\n")} lang={lang} keyId={`${nodes.length}`} />);
      continue;
    }

    /* table */
    if (/^\s*\|.*\|\s*$/.test(raw) && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      const rows: string[][] = [parseTableRow(raw)];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      flushList();
      nodes.push(<Table key={`t-${nodes.length}`} rows={rows} keyId={`t${nodes.length}`} />);
      continue;
    }

    /* heading */
    const heading = raw.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const cls =
        level === 1
          ? "mt-4 mb-2 text-lg font-semibold tracking-tight text-white"
          : level === 2
            ? "mt-3.5 mb-1.5 text-[15px] font-semibold tracking-tight text-white"
            : "mt-3 mb-1 text-[13.5px] font-semibold uppercase tracking-[0.08em] text-white/80";
      nodes.push(
        <div key={`h-${nodes.length}`} className={cls}>
          {inline(heading[2], `h-${nodes.length}`)}
        </div>
      );
      i += 1;
      continue;
    }

    /* horizontal rule */
    if (/^\s*([-*_])\1{2,}\s*$/.test(raw)) {
      flushList();
      nodes.push(<hr key={`hr-${nodes.length}`} className="my-3.5 border-white/10" />);
      i += 1;
      continue;
    }

    /* task list */
    const task = raw.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (task) {
      flushList();
      const done = task[1].toLowerCase() === "x";
      nodes.push(
        <div key={`task-${nodes.length}`} className="my-1 flex items-start gap-2.5 text-white/88">
          <span
            className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
              done ? "border-accent-green/50 bg-accent-green/20 text-accent-green" : "border-white/20"
            }`}
          >
            {done && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
          <span className={done ? "text-white/45 line-through" : ""}>{inline(task[2], `task-${nodes.length}`)}</span>
        </div>
      );
      i += 1;
      continue;
    }

    /* lists */
    const bullet = raw.match(/^\s*[-*•]\s+(.+)$/);
    const ordered = raw.match(/^\s*(\d+)[.)]\s+(.+)$/);
    if (bullet) {
      if (!listBuffer || listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(bullet[1]);
      i += 1;
      continue;
    }
    if (ordered) {
      if (!listBuffer || !listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(ordered[2]);
      i += 1;
      continue;
    }

    /* blockquote */
    const quote = raw.match(/^>\s?(.*)$/);
    if (quote) {
      flushList();
      const quoteLines = [quote[1]];
      i += 1;
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      nodes.push(
        <blockquote
          key={`q-${nodes.length}`}
          className="my-2.5 rounded-r-xl border-l-2 border-accent-cyan/45 bg-white/[0.025] py-1.5 pl-3.5 pr-3 text-white/80 italic"
        >
          {quoteLines.map((l, idx) => (
            <div key={idx} className="leading-relaxed">
              {inline(l, `q-${nodes.length}-${idx}`)}
            </div>
          ))}
        </blockquote>
      );
      continue;
    }

    /* blank */
    if (!raw.trim()) {
      flushList();
      if (!compact) nodes.push(<div key={`sp-${nodes.length}`} className="h-2" />);
      i += 1;
      continue;
    }

    /* paragraph */
    flushList();
    nodes.push(
      <p key={`p-${nodes.length}`} className="leading-relaxed">
        {inline(raw, `p-${nodes.length}`)}
      </p>
    );
    i += 1;
  }

  flushList();
  return <div className={`pgx-md ${compact ? "text-[13px]" : "text-[13.5px]"}`}>{nodes}</div>;
}

export default Markdown;
