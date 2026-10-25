export const CHAPTERS = [
  { id: "intelligence", label: "Intelligence", number: "00" },
  { id: "signal", label: "Neural journey", number: "01" },
  { id: "playground", label: "Playground", number: "02" },
  { id: "capabilities", label: "Capabilities", number: "03" },
  { id: "about", label: "Builder", number: "04" },
  { id: "roadmap", label: "Roadmap", number: "05" },
] as const;
export type ChapterId = (typeof CHAPTERS)[number]["id"];
export type SectionBounds = { id: ChapterId; top: number; height: number };
export type JourneyFrame = {
  y: number;
  height: number;
  width: number;
  progress: number;
  chapter: number;
  active: ChapterId;
  sections: Partial<Record<ChapterId, number>>;
  bounds: Partial<Record<ChapterId, SectionBounds>>;
  reduced: boolean;
  time: number;
  departure?: number;
  closing?: number;
};

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Pure and reversible: absolute scroll, never accumulated deltas or wheel hijacking. */
export function journeyAt(y: number, height: number, documentHeight: number, bounds: SectionBounds[]) {
  let chapter = 0;
  let active: ChapterId = "intelligence";
  const sections: JourneyFrame["sections"] = {};
  const sectionBounds: JourneyFrame["bounds"] = {};
  for (const section of bounds) {
    sectionBounds[section.id] = section;
    sections[section.id] =
      section.id === "signal"
        ? clamp((y - section.top) / Math.max(1, section.height - height))
        : clamp((y - section.top + height * 0.35) / Math.max(height * 0.65, section.height - height * 0.55));
    if (y + height * 0.4 >= section.top) active = section.id;
    if (section.id !== "intelligence") {
      chapter += smooth((y - section.top + height * 0.85) / (height * 0.7));
    }
  }
  return {
    chapter,
    active,
    sections,
    bounds: sectionBounds,
    progress: clamp(y / Math.max(1, documentHeight - height)),
  };
}

export type CameraPose = { position: [number, number, number]; target: [number, number, number] };
const POSES: CameraPose[] = [
  { position: [0, 2.5, 10], target: [0, 1, 0] },
  { position: [24, 2.4, -3], target: [24, 1, -16] },
  { position: [24, 3.2, -3], target: [24, 1, -16] },
  { position: [49, 3.5, -18], target: [48, 1, -32] },
  { position: [73.5, 3.4, -34], target: [72, 1.6, -48] },
  { position: [98, 7, -51], target: [96, 0.6, -64] },
  { position: [98, 7, -51], target: [96, 0.6, -64] },
];

/** Dwell at each environment; deliberate camera approach inside the Builder. */
export function cameraAt(chapter: number, builderProgress: number, mobile = false, closing = 0): CameraPose {
  const c = clamp(chapter, 0, 6);
  const a = Math.min(5, Math.floor(c));
  const b = a + 1;
  const k = smooth(c - a);
  const position = POSES[a].position.map((v, i) => lerp(v, POSES[b].position[i], k)) as CameraPose["position"];
  const target = POSES[a].target.map((v, i) => lerp(v, POSES[b].target[i], k)) as CameraPose["target"];
  const builderWeight = Math.max(0, 1 - Math.abs(c - 4));
  const p = smooth(builderProgress);
  position[0] -= (1.5 + p * 0.9) * builderWeight;
  position[1] -= p * 1.05 * builderWeight;
  position[2] -= p * (mobile ? 1 : 3.4) * builderWeight;
  target[0] -= 0.35 * builderWeight;
  // Leave a quiet top third for the section heading. No DOM/code overlap.
  target[1] += 1.25 * builderWeight;
  if (mobile) position[2] += 5;
  const retreat = smooth(closing) * smooth((c - 4.5) / 0.5);
  for (let i = 0; i < 3; i++) position[i] = target[i] + (position[i] - target[i]) * (1 + 0.12 * retreat);
  position[1] += 0.35 * retreat;
  return { position, target };
}

export function worldChapterAt({ chapter, departure = 0 }: Pick<JourneyFrame, "chapter" | "departure">) {
  return chapter >= 4 && chapter < 5 ? Math.max(chapter, 4 + smooth(departure)) : chapter;
}
export function worldOpacityAt(frame: Pick<JourneyFrame, "chapter" | "departure" | "sections">) {
  const chapter = worldChapterAt(frame);
  return chapter < 2.8 ? 0.95 * smooth((chapter - 2.05) / 0.75) : chapter > 4.6 ? 0.65 : 0.95;
}

/** Footer is part of the existing final chapter, never another loading scene. */
export function closingProgressAt(y: number, top: number, height: number, maxScroll = Infinity) {
  const start = top - height * 0.8;
  const span = Math.max(1, Math.min(height * 0.8, maxScroll - start));
  return smooth((y - start) / span);
}
