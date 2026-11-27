"use client";

/**
 * Minimal markdown renderer for BudAI messages.
 * Handles: paragraphs, bold (**text**), italic (*text*), inline code (`text`), bullet lists, numbered lists.
 * No external dependencies. XSS-safe: escapes HTML first, then adds our own tags.
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

/** Convert inline markdown (bold/italic/code) to React nodes on a text fragment */
function renderInline(text: string, keyPrefix: string): (string | JSX.Element)[] {
  const nodes: (string | JSX.Element)[] = [];
  // We process bold (**x**), italic (*x* when not part of **), inline code (`x`), in a single pass
  // Simpler: split by tokens sequentially
  let remaining = text;
  let idx = 0;

  // Tokenize by finding first matching pattern each time
  while (remaining.length > 0) {
    // Find nearest of **, *, `
    const boldIdx = remaining.indexOf("**");
    const codeIdx = remaining.indexOf("`");
    const itIdx = remaining.indexOf("*");

    // Pick closest marker (prefer bold over italic since ** starts with *)
    const candidates: { kind: "bold" | "italic" | "code"; pos: number; end: number }[] = [];
    if (boldIdx !== -1) {
      const end = remaining.indexOf("**", boldIdx + 2);
      if (end !== -1) candidates.push({ kind: "bold", pos: boldIdx, end });
    }
    if (codeIdx !== -1) {
      const end = remaining.indexOf("`", codeIdx + 1);
      if (end !== -1) candidates.push({ kind: "code", pos: codeIdx, end });
    }
    // Italic: find single * not preceded/followed by *
    if (itIdx !== -1) {
      // check not part of **
      const prev = itIdx > 0 ? remaining[itIdx - 1] : "";
      const next = itIdx + 1 < remaining.length ? remaining[itIdx + 1] : "";
      if (prev !== "*" && next !== "*") {
        // find closing *
        const end = remaining.indexOf("*", itIdx + 1);
        if (end !== -1 && end > itIdx + 1) {
          const endPrev = end > 0 ? remaining[end - 1] : "";
          const endNext = end + 1 < remaining.length ? remaining[end + 1] : "";
          if (endPrev !== "*" && endNext !== "*") {
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

/** Render a complete message as React blocks (paragraphs + lists) */
export function renderMarkdown(content: string): JSX.Element {
  const blocks: JSX.Element[] = [];
  const lines = content.split("\n");
  let i = 0;
  let blockIdx = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bullet list: "- " or "• "
    if (/^[-•*]\s+/.test(line) && !/^\*{2}/.test(line.slice(2))) {
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

    // Numbered list: "1. ", "2. ", etc.
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

    // Empty line - paragraph break
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: collect until empty line or list
    const paraLines: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^[-•*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={blockIdx++} className="labs-md-p">
        {renderInline(paraLines.join(" "), `p-${blockIdx}`)}
      </p>
    );
  }

  return <Fragment>{blocks}</Fragment>;
}
