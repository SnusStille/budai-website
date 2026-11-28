"use client";

/**
 * Minimal markdown renderer for BudAI/Labs messages.
 * Handles: paragraphs, bold (**text**), italic (*text*), inline code (`text`),
 * bullet lists, numbered lists, headings (##, ###), horizontal rules.
 * No external dependencies. XSS-safe: no raw HTML injection.
 *
 * Designed for streaming: handles partial lines gracefully.
 */
import { Fragment } from "react";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Convert inline markdown to React nodes */
function renderInline(text: string, keyPrefix: string): (string | JSX.Element)[] {
  const nodes: (string | JSX.Element)[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf("**");
    const codeIdx = remaining.indexOf("`");
    const itIdx = remaining.indexOf("*");

    const candidates: { kind: "bold" | "italic" | "code"; pos: number; end: number }[] = [];
    if (boldIdx !== -1) {
      const end = remaining.indexOf("**", boldIdx + 2);
      if (end !== -1 && end > boldIdx + 2) candidates.push({ kind: "bold", pos: boldIdx, end });
    }
    if (codeIdx !== -1) {
      const end = remaining.indexOf("`", codeIdx + 1);
      if (end !== -1 && end > codeIdx + 1) candidates.push({ kind: "code", pos: codeIdx, end });
    }
    if (itIdx !== -1) {
      const prev = itIdx > 0 ? remaining[itIdx - 1] : "";
      const next = itIdx + 1 < remaining.length ? remaining[itIdx + 1] : "";
      if (prev !== "*" && next !== "*" && prev !== " ") {
        const end = remaining.indexOf("*", itIdx + 1);
        if (end !== -1 && end > itIdx + 1) {
          const endPrev = end > 0 ? remaining[end - 1] : "";
          const endNext = end + 1 < remaining.length ? remaining[end + 1] : "";
          if (endPrev !== "*" && endNext !== "*" && remaining[itIdx + 1] !== " ") {
            candidates.push({ kind: "italic", pos: itIdx, end });
          }
        }
      }
    }

    if (candidates.length === 0) {
      nodes.push(remaining);
      break;
    }

    candidates.sort((a, b) => a.pos - b.pos);
    const tok = candidates[0];

    if (tok.pos > 0) {
      nodes.push(remaining.slice(0, tok.pos));
    }

    const inner = remaining.slice(tok.pos + (tok.kind === "bold" ? 2 : 1), tok.end);
    const k = `${keyPrefix}-${idx++}`;

    if (tok.kind === "bold") {
      nodes.push(<strong key={k}>{renderInline(inner, k)}</strong>);
    } else if (tok.kind === "italic") {
      nodes.push(<em key={k}>{renderInline(inner, k)}</em>);
    } else {
      nodes.push(<code key={k} className="labs-inline-code">{inner}</code>);
    }

    remaining = remaining.slice(tok.end + (tok.kind === "bold" ? 2 : 1));
  }

  return nodes;
}

/** Detect heading level (##, ###, ####) */
function matchHeading(line: string): { level: number; text: string } | null {
  const m = line.match(/^(#{1,4})\s+(.+)$/);
  if (!m) return null;
  return { level: m[1].length, text: m[2] };
}

/** Render a complete message as React blocks */
export function renderMarkdown(content: string): JSX.Element {
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Remove any leftover control characters except \n and \t
  const cleaned = normalized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  const lines = cleaned.split("\n");

  const blocks: JSX.Element[] = [];
  let i = 0;
  let blockIdx = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule: ---, ___, *** on their own
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(<hr key={blockIdx++} className="labs-md-hr" />);
      i++;
      continue;
    }

    // Heading: ## Title, ### Subtitle
    const heading = matchHeading(line);
    if (heading) {
      const Tag = (`h${Math.min(heading.level + 2, 5)}`) as keyof JSX.IntrinsicElements;
      blocks.push(
        <Tag key={blockIdx++} className={`labs-md-h labs-md-h${heading.level}`}>
          {renderInline(heading.text.trim(), `h-${blockIdx}`)}
        </Tag>
      );
      i++;
      continue;
    }

    // Bullet list: "- ", "• ", "* "
    if (/^[-•*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-•*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={blockIdx++} className="labs-md-list">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `ul-${blockIdx}-${j}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: "1. ", "2. "
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={blockIdx++} className="labs-md-ol">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `ol-${blockIdx}-${j}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-empty, non-special lines
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^[-•*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !matchHeading(lines[i]) &&
      !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    // Join with space — but keep intentional short lines (treat single newlines as spaces)
    const paraText = paraLines.join(" ").replace(/\s+/g, " ").trim();
    if (paraText) {
      blocks.push(
        <p key={blockIdx++} className="labs-md-p">
          {renderInline(paraText, `p-${blockIdx}`)}
        </p>
      );
    }
  }

  return <Fragment>{blocks}</Fragment>;
}
