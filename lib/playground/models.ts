/**
 * Model allowlist for the Playground.
 *
 * The client picks one of these *labels*; it can never name an arbitrary model. Each label is
 * resolved server-side against an env var, so a deployment only offers what it can actually run
 * and no key or provider configuration is ever sent to the browser.
 */

const FALLBACK_MODEL = "claude-sonnet-4-20250514";

const isSet = (v: string | undefined) =>
  Boolean(v && v.trim().length > 8 && !v.includes("your-"));

const CHOICES = [
  {
    id: "fast",
    env: "ANTHROPIC_MODEL_FAST",
    en: "Fast",
    sv: "Snabb",
    noteEn: "short drafts, quick answers",
    noteSv: "korta utkast, snabba svar",
  },
  {
    id: "quality",
    env: "ANTHROPIC_MODEL",
    en: "Quality",
    sv: "Kvalitet",
    noteEn: "default — balanced reasoning",
    noteSv: "standard — avvägd analys",
  },
  {
    id: "deep",
    env: "ANTHROPIC_MODEL_DEEP",
    en: "Deep",
    sv: "Djup",
    noteEn: "long analysis, more detail",
    noteSv: "lång analys, mer detalj",
  },
] as const;

export type ModelOption = {
  id: string;
  en: string;
  sv: string;
  noteEn: string;
  noteSv: string;
  /** The model this label resolves to on the server — shown for transparency, never chosen by the client. */
  model: string;
};

/**
 * One definition of "configured" everywhere in this file: a value that exists, is long enough
 * to be a real model id and is not the placeholder from .env.example.
 */
const envOr = (v: string | undefined) => (isSet(v) ? String(v) : FALLBACK_MODEL);

export const DEFAULT_MODEL = envOr(process.env.ANTHROPIC_MODEL);

/** What this deployment can serve, in menu order. */
export function availableModels(): ModelOption[] {
  return CHOICES.filter((c) => c.id === "quality" || isSet(process.env[c.env])).map((c) => ({
    id: c.id,
    en: c.en,
    sv: c.sv,
    noteEn: c.noteEn,
    noteSv: c.noteSv,
    model: envOr(process.env[c.env]),
  }));
}

/** Resolve a client-supplied label to a configured model, defaulting when unknown. */
export function resolveModel(id: unknown): string {
  const c = CHOICES.find((x) => x.id === id);
  if (!c) return DEFAULT_MODEL;
  return envOr(process.env[c.env]);
}
