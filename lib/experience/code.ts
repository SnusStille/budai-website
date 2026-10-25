import { clamp } from "./timeline";

// A prepared illustration of the EXISTING chat endpoint, never a live AI request.
export const EXAMPLE_SOURCE = `// From a thought to a starting point.
const project = {
  name: "BudAI",
  languages: ["sv", "en"],
  builtBy: "Stilledev",
};

async function create(prompt: string) {
  const response = await fetch("/api/playground", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      lang: "sv", stream: true,
    }),
  });
  return response.body;
}`;

export type CodeToken = { text: string; tone: string };
export function tokenizeLine(line: string): CodeToken[] {
  return line.split(/(\/\/.*$|"(?:[^"\\]|\\.)*"|\b(?:const|async|function|await|return|true|false|string)\b|\b(?:fetch|JSON|create|stringify)\b)/g)
    .filter(Boolean).map((text) => ({ text, tone: text.startsWith("//") ? "comment" : text.startsWith('"') ? "string" : /^(const|async|function|await|return|true|false|string)$/.test(text) ? "keyword" : /^(fetch|JSON|create|stringify)$/.test(text) ? "function" : "plain" }));
}
export const CODE_LINES = EXAMPLE_SOURCE.split("\n").map(tokenizeLine);
export const CODE_LENGTH = EXAMPLE_SOURCE.length;

/** Small per-line dwell: progress reconstructs exactly the same characters in reverse. */
export function codeCharactersAt(progress: number) {
  const p = clamp((progress - .06) / .62);
  const lines = EXAMPLE_SOURCE.split("\n");
  const lineWeights = lines.map((line) => Math.max(15, line.length) + 18);
  let remaining = p * lineWeights.reduce((sum, weight) => sum + weight, 0);
  let characters = 0;
  for (let i = 0; i < lines.length; i++) {
    const writeWeight = Math.max(15, lines[i].length);
    if (remaining >= lineWeights[i]) { characters += lines[i].length + (i < lines.length - 1 ? 1 : 0); remaining -= lineWeights[i]; }
    else { characters += Math.floor(clamp(remaining / writeWeight) * lines[i].length); break; }
  }
  return Math.min(CODE_LENGTH, characters);
}
