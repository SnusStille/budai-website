"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Lightweight markdown renderer for chat output.
 * Deliberately small: bold, inline code, lists, headings, quotes, fenced code.
 * No external dependency, no dangerouslySetInnerHTML.
 */

function renderInlineMd(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*.+?\*\*|`.+?`)/g;
  return text.split(pattern).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={`${keyPrefix}-c-${i}`}
          className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.88em] text-accent-cyan"
        >
          {part.slice(1, -1)}
        </code>
      );
    return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
  });
}

function renderTextBlock(text: string, keyPrefix: string): ReactNode {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let listBuf: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuf || !listBuf.items.length) {
      listBuf = null;
      return;
    }
    const Tag = listBuf.ordered ? "ol" : "ul";
    const cls = listBuf.ordered
      ? "my-2.5 list-decimal space-y-1.5 pl-5 text-white/85 marker:text-accent-cyan/60"
      : "my-2.5 list-disc space-y-1.5 pl-5 text-white/85 marker:text-accent-cyan/60";
    nodes.push(
      <Tag key={`${keyPrefix}-list-${nodes.length}`} className={cls}>
        {listBuf.items.map((it, i) => (
          <li key={i} className="leading-[1.7]">
            {renderInlineMd(it, `${keyPrefix}-li-${i}`)}
          </li>
        ))}
      </Tag>
    );
    listBuf = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const bullet = raw.match(/^\s*[-*•]\s+(.+)$/);
    const numbered = raw.match(/^\s*(\d+)[.)]\s+(.+)$/);
    const heading = raw.match(/^#{1,3}\s+(.+)$/);
    const quote = raw.match(/^>\s?(.*)$/);

    if (bullet) {
      if (!listBuf || listBuf.ordered) {
        flushList();
        listBuf = { ordered: false, items: [] };
      }
      listBuf.items.push(bullet[1]);
      continue;
    }
    if (numbered) {
      if (!listBuf || !listBuf.ordered) {
        flushList();
        listBuf = { ordered: true, items: [] };
      }
      listBuf.items.push(numbered[2]);
      continue;
    }
    flushList();

    if (heading) {
      nodes.push(
        <div
          key={`${keyPrefix}-h-${i}`}
          className="mt-4 mb-1.5 text-[15px] font-semibold tracking-tight text-white first:mt-0"
        >
          {renderInlineMd(heading[1], `${keyPrefix}-h-${i}`)}
        </div>
      );
      continue;
    }
    if (quote) {
      nodes.push(
        <div
          key={`${keyPrefix}-q-${i}`}
          className="my-2.5 border-l-2 border-accent-cyan/35 pl-3.5 italic text-muted"
        >
          {renderInlineMd(quote[1], `${keyPrefix}-q-${i}`)}
        </div>
      );
      continue;
    }
    if (raw.trim() === "") {
      nodes.push(<div key={`${keyPrefix}-sp-${i}`} className="h-2.5" />);
      continue;
    }
    nodes.push(
      <div key={`${keyPrefix}-p-${i}`} className="leading-[1.75]">
        {renderInlineMd(raw, `${keyPrefix}-p-${i}`)}
      </div>
    );
  }
  flushList();
  return <div className="space-y-0.5">{nodes}</div>;
}

function CodeBlock({ code, langHint }: { code: string; langHint: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/[0.09] bg-black/45">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.025] px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
          {langHint || "code"}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            } catch {
              /* clipboard unavailable */
            }
          }}
        >
          {copied ? <Check className="h-3 w-3 text-accent-green" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[12.5px] leading-relaxed text-white/85">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function renderMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((block, bi) => {
    if (block.startsWith("```") && block.endsWith("```")) {
      const inner = block.slice(3, -3);
      const nl = inner.indexOf("\n");
      const langHint = nl > 0 ? inner.slice(0, nl).trim() : "";
      const code = nl > 0 ? inner.slice(nl + 1) : inner;
      return <CodeBlock key={`code-${bi}`} code={code} langHint={langHint} />;
    }
    return <div key={`txt-${bi}`}>{renderTextBlock(block, `b${bi}`)}</div>;
  });
}
