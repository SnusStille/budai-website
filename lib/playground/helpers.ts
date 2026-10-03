import type { AiActivity, ChatMessage, Conversation } from "./types";

export function fileToBase64(file: File): Promise<{ b64: string; media: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = String(r.result || "");
      const m = res.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
      if (!m) reject(new Error("bad image"));
      else resolve({ b64: m[2], media: m[1] });
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function activityLabel(a: AiActivity, lang: "sv" | "en"): string {
  const map: Record<AiActivity, [string, string]> = {
    idle: ["", ""],
    thinking: ["Tänker…", "Thinking…"],
    reading_image: ["Läser bild…", "Reading image…"],
    analyzing: ["Analyserar…", "Analyzing…"],
    generating_image: ["Skapar bild…", "Creating image…"],
    remembering: ["Sparar minne…", "Saving memory…"],
    listening: ["Lyssnar…", "Listening…"],
    typing: ["Skriver…", "Writing…"],
    error: ["Fel", "Error"],
  };
  return lang === "sv" ? map[a][0] : map[a][1];
}

export function groupByDate(
  items: Pick<Conversation, "id" | "title" | "updatedAt" | "pinned">[],
  lang: "sv" | "en"
) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYday = startToday - 86400000;
  const startWeek = startToday - 7 * 86400000;
  const pinned = items.filter((c) => c.pinned);
  const rest = items.filter((c) => !c.pinned);
  const buckets: { label: string; items: typeof items }[] = [
    { label: lang === "sv" ? "Fästa" : "Pinned", items: pinned },
    { label: lang === "sv" ? "Idag" : "Today", items: [] },
    { label: lang === "sv" ? "Igår" : "Yesterday", items: [] },
    { label: lang === "sv" ? "Senaste 7 dagarna" : "Previous 7 days", items: [] },
    { label: lang === "sv" ? "Äldre" : "Older", items: [] },
  ];
  for (const c of rest) {
    if (c.updatedAt >= startToday) buckets[1].items.push(c);
    else if (c.updatedAt >= startYday) buckets[2].items.push(c);
    else if (c.updatedAt >= startWeek) buckets[3].items.push(c);
    else buckets[4].items.push(c);
  }
  return buckets.filter((b) => b.items.length);
}

export function formatMsgTime(ts: number, lang: "sv" | "en"): string {
  try {
    return new Date(ts).toLocaleTimeString(lang === "sv" ? "sv-SE" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function suggestFollowUps(
  content: string,
  lang: "sv" | "en"
): { id: string; label: string; prompt: string }[] {
  const sv = lang === "sv";
  const out: { id: string; label: string; prompt: string }[] = [];
  if ((content || "").length > 360) {
    out.push({
      id: "summarize",
      label: sv ? "Sammanfatta" : "Summarize",
      prompt: sv
        ? "Sammanfatta det senaste svaret i fem skarpa punkter. Ingen inledning."
        : "Summarize your last answer in five sharp bullets. No preamble.",
    });
  } else {
    out.push({
      id: "deeper",
      label: sv ? "Gå djupare" : "Go deeper",
      prompt: sv
        ? "Gå djupare på det senaste svaret — mer konkret, med exempel och vad jag ska undvika."
        : "Go deeper on your last answer — more concrete, with examples and what to avoid.",
    });
  }
  out.push({
    id: "next",
    label: sv ? "Nästa steg" : "Next steps",
    prompt: sv
      ? "Ge mig tre konkreta nästa steg jag kan göra idag utifrån det här."
      : "Give me three concrete next steps I can take today from this.",
  });
  out.push({
    id: "email",
    label: sv ? "Som mejl" : "As email",
    prompt: sv
      ? "Omvandla det senaste svaret till ett kort, proffsigt mejl jag kan skicka."
      : "Turn your last answer into a short professional email I can send.",
  });
  return out.slice(0, 3);
}

export function isWorkspaceWorthy(content: string): boolean {
  if (!content || content.length < 280) return false;
  if (/```[\s\S]*?```/.test(content)) return true;
  const lines = content.split("\n").filter((l) => l.trim());
  const structured =
    lines.filter((l) => /^(\s*[-*•]|\s*\d+[.)]|#{1,3}\s)/.test(l)).length >= 4;
  return structured || content.length >= 520;
}

export function workspaceTitle(content: string, lang: "sv" | "en"): string {
  const m = content.match(/^#{1,3}\s+(.+)$/m);
  if (m) return m[1].trim().slice(0, 64);
  const code = content.match(/```(\w+)?/);
  if (code)
    return lang === "sv"
      ? `Kod${code[1] ? ` · ${code[1]}` : ""}`
      : `Code${code[1] ? ` · ${code[1]}` : ""}`;
  const first = content.replace(/\s+/g, " ").trim().slice(0, 48);
  return first + (content.length > 48 ? "…" : "");
}

export function findPreviousUserText(messages: ChatMessage[], assistantId: string): string {
  const idx = messages.findIndex((m) => m.id === assistantId);
  if (idx < 0) return "";
  for (let i = idx - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}
