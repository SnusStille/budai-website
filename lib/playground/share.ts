/* ────────────────────────────────────────────────────────────────
   BudAI · shared conversations
   ────────────────────────────────────────────────────────────────
   A conversation can be frozen into a URL fragment: no server, no
   account, nothing stored on our side. Content is trimmed to the
   essentials (role + text), UTF-8 encoded and written as base64url so
   the link survives chat apps, email and QR codes.
   ──────────────────────────────────────────────────────────────── */

import type { ChatMessage } from "@/lib/playground/types";

export const SHARE_MAX_MESSAGES = 40;
export const SHARE_SOFT_LIMIT = 7200; // characters of payload we consider "safe" in a link

export type SharedTurn = { r: "u" | "a"; c: string; t: number };

export type SharedThread = {
  title: string;
  created: number;
  turns: SharedTurn[];
};

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShare(messages: ChatMessage[], title: string): string {
  const turns: SharedTurn[] = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .filter((m) => m.content.trim().length > 0)
    .slice(-SHARE_MAX_MESSAGES)
    .map((m) => ({
      r: m.role === "user" ? "u" : "a",
      c: m.content.slice(0, 4000),
      t: m.ts,
    }));
  const payload: SharedThread = { title: title.slice(0, 80), created: Date.now(), turns };
  return toBase64Url(JSON.stringify(payload));
}

export function shareUrl(messages: ChatMessage[], title: string): string {
  const payload = encodeShare(messages, title);
  const base = typeof window === "undefined" ? "" : `${window.location.origin}/playground/share`;
  return `${base}#${payload}`;
}

export function decodeShare(raw: string): SharedThread | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(raw)) as SharedThread;
    if (!parsed || !Array.isArray(parsed.turns)) return null;
    const turns = parsed.turns
      .filter((turn) => turn && (turn.r === "u" || turn.r === "a") && typeof turn.c === "string")
      .slice(0, SHARE_MAX_MESSAGES);
    if (!turns.length) return null;
    return { title: typeof parsed.title === "string" ? parsed.title : "", created: parsed.created || 0, turns };
  } catch {
    return null;
  }
}
