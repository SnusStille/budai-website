/**
 * BudAI usage limits — guest vs signed-in.
 * Enforced client-side (UX) + server-side (API) via daily counters.
 */

export type AccessTier = "guest" | "member";

export const LIMITS = {
  guest: {
    messagesPerDay: 12,
    imagesPerDay: 0, // vision upload not for guests (or 1 if you prefer)
    generationsPerDay: 0,
    maxHistory: 2, // local only
    memoryEnabled: false,
    maxAttachmentBytes: 0,
    label: { sv: "Gäst", en: "Guest" },
  },
  member: {
    messagesPerDay: 80,
    imagesPerDay: 15,
    generationsPerDay: 8,
    maxHistory: 40,
    memoryEnabled: true,
    maxAttachmentBytes: 4 * 1024 * 1024, // 4MB
    label: { sv: "Konto", en: "Account" },
  },
} as const;

export type LimitKind = "messages" | "images" | "generations";

export function limitFor(tier: AccessTier, kind: LimitKind): number {
  const L = LIMITS[tier];
  if (kind === "messages") return L.messagesPerDay;
  if (kind === "images") return L.imagesPerDay;
  return L.generationsPerDay;
}

export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10); // UTC day
}
