"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

function renderInlineMd(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s<]+)/g;
  return text.split(pattern).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**"))
      return (
        <em key={`${keyPrefix}-i-${i}`} className="italic text-white/80">
          {part.slice(1, -1)}
        </em>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={`${keyPrefix}-c-${i}`}
          className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-accent-cyan/90 text-[0.86em] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    const mdLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdLink) {
      const href = mdLink[2];
      const safe = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
      if (safe) {
        return (
          <a
            key={`${keyPrefix}-a-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan underline underline-offset-2 hover:text-white break-words"
          >
            {mdLink[1]}
          </a>
        );
      }
    }
    if (/^https?:\/\//.test(part)) {
      const href = part.replace(/[),.;!?]+$/, "");
      const trail = part.slice(href.length);
      return (
        <span key={`${keyPrefix}-u-${i}`}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan underline underline-offset-2 hover:text-white break-all"
          >
            {href.replace(/^https?:\/\//, "")}
          </a>
          {trail}
        </span>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
  });
}

function CopyCode({ code }: { code: string }) {
  const [ok, setOk] = useState(false);
  const sv =
    typeof document !== "undefined" &&
    (document.documentElement.lang === "sv" ||
      (typeof localStorage !== "undefined" && localStorage.getItem("budai-lang") === "sv"));
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-[10px] text-white/45 hover:text-white transition-colors"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setOk(true);
          window.setTimeout(() => setOk(false), 1400);
        } catch {
          /* */
        }
      }}
    >
      {ok ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
      {ok ? (sv ? "Kopierat" : "Copied") : sv ? "Kopiera" : "Copy"}
    </button>
  );
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
      ? "list-decimal pl-5 my-2 space-y-1 text-white/88"
      : "list-disc pl-5 my-2 space-y-1 text-white/88";
    nodes.push(
      <Tag key={`${keyPrefix}-list-${nodes.length}`} className={cls}>
        {listBuf.items.map((it, i) => (
          <li key={i} className="leading-relaxed">
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

    if (/^\s*\|/.test(raw) && raw.includes("|")) {
      flushList();
      const rows: string[][] = [];
      let j = i;
      while (j < lines.length && /^\s*\|/.test(lines[j]) && lines[j].includes("|")) {
        const cells = lines[j]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        const isSep = cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
        if (!isSep) rows.push(cells);
        j++;
      }
      if (rows.length) {
        const head = rows[0];
        const body = rows.slice(1);
        nodes.push(
          <div key={`${keyPrefix}-tbl-${i}`} className="my-3 overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-white/[0.04] text-white/80">
                <tr>
                  {head.map((c, ci) => (
                    <th key={ci} className="px-3 py-2 font-medium border-b border-white/[0.06]">
                      {renderInlineMd(c, `${keyPrefix}-th-${i}-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              {body.length > 0 && (
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri} className="border-t border-white/[0.05]">
                      {row.map((c, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-white/75 align-top">
                          {renderInlineMd(c, `${keyPrefix}-td-${i}-${ri}-${ci}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        );
        i = j - 1;
        continue;
      }
    }
    if (heading) {
      nodes.push(
        <div
          key={`${keyPrefix}-h-${i}`}
          className="font-semibold text-white mt-3 mb-1 tracking-tight text-[15px]"
        >
          {renderInlineMd(heading[1], `${keyPrefix}-h-${i}`)}
        </div>
      );
      continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(raw)) {
      nodes.push(
        <div key={`${keyPrefix}-hr-${i}`} className="my-4 h-px bg-white/[0.08]" />
      );
      continue;
    }
    if (quote) {
      nodes.push(
        <div
          key={`${keyPrefix}-q-${i}`}
          className="border-l-2 border-white/15 pl-3 my-2 text-white/55 italic"
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
      <div key={`${keyPrefix}-p-${i}`} className="leading-[1.7]">
        {renderInlineMd(raw, `${keyPrefix}-p-${i}`)}
      </div>
    );
  }
  flushList();
  return <div className="space-y-0.5">{nodes}</div>;
}

export function renderMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((block, bi) => {
    if (block.startsWith("```") && block.endsWith("```")) {
      const inner = block.slice(3, -3);
      const nl = inner.indexOf("\n");
      const langHint = nl > 0 ? inner.slice(0, nl).trim() : "";
      const code = nl > 0 ? inner.slice(nl + 1) : inner;
      return (
        <div
          key={`code-${bi}`}
          className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#07070c]"
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.03]">
            <span className="text-[10px] font-mono text-white/40">{langHint || "code"}</span>
            <CopyCode code={code} />
          </div>
          <pre className="p-3.5 overflow-x-auto text-[12.5px] font-mono text-white/82 leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    return <div key={`txt-${bi}`}>{renderTextBlock(block, `b${bi}`)}</div>;
  });
}
