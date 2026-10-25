export const CHAPTERS = [
  { id: "intelligence", label: "Intelligence", number: "00" },
  { id: "signal", label: "Neural journey", number: "01" },
  { id: "playground", label: "Playground", number: "02" },
  { id: "capabilities", label: "Capabilities", number: "03" },
  { id: "about", label: "Builder", number: "04" },
  { id: "waitlist", label: "Waitlist", number: "05" },
  { id: "roadmap", label: "Roadmap", number: "06" },
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
};

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Pure and reversible: absolute scroll, never accumulated deltas or wheel hijacking. */
export function journeyAt(y: number, height: number, documentHeight: number, bounds: SectionBounds[]) {
  let chapter = 0;
  let active: ChapterId = "intelligence";
  const sections: JourneyFrame["sections"] = {};
  const sectionBounds: JourneyFrame["bounds"] = {};
  for (const section of bounds) {
    sectionBounds[section.id] = section;
    sections[section.id] = section.id === "signal" ? clamp((y - section.top) / Math.max(1, section.height - height)) : clamp((y - section.top + height * .35) / Math.max(height * .65, section.height - height * .55));
    if (y + height * .4 >= section.top) active = section.id;
    if (section.id !== "intelligence") {
      chapter += smooth((y - section.top + height * .85) / (height * .7));
    }
  }
  return { chapter, active, sections, bounds: sectionBounds, progress: clamp(y / Math.max(1, documentHeight - height)) };
}

export type CameraPose = { position: [number, number, number]; target: [number, number, number] };
const POSES: CameraPose[] = [
  { position: [0, 2.5, 10], target: [0, 1, 0] },
  { position: [24, 2.4, -3], target: [24, 1, -16] },
  { position: [24, 3.2, -3], target: [24, 1, -16] },
  { position: [49, 3.5, -18], target: [48, 1, -32] },
  { position: [73.5, 3.4, -34], target: [72, 1.6, -48] },
  { position: [96, 1.5, -48], target: [96, 1, -64] },
  { position: [122, 7, -67], target: [120, .6, -80] },
];

/** Dwell at each environment; deliberate camera approach inside the Builder. */
export function cameraAt(chapter: number, builderProgress: number, mobile = false): CameraPose {
  const c = clamp(chapter, 0, 6);
  const a = Math.min(5, Math.floor(c));
  const b = a + 1;
  const k = smooth(c - a);
  const position = POSES[a].position.map((v, i) => lerp(v, POSES[b].position[i], k)) as CameraPose["position"];
  const target = POSES[a].target.map((v, i) => lerp(v, POSES[b].target[i], k)) as CameraPose["target"];
  const builderWeight = Math.max(0, 1 - Math.abs(c - 4));
  const p = smooth(builderProgress);
  position[0] -= (1.5 + p * .9) * builderWeight;
  position[1] -= p * 1.05 * builderWeight;
  position[2] -= p * (mobile ? 1 : 3.4) * builderWeight;
  target[0] -= .35 * builderWeight;
  // Leave a quiet top third for the section heading. No DOM/code overlap.
  target[1] += 1.25 * builderWeight;
  if (mobile) position[2] += 5;
  return { position, target };
}

/** The Next Signal's approach is visual choreography, not a delayed form anchor. */
export function worldChapterAt({ chapter, departure = 0 }: Pick<JourneyFrame, "chapter" | "departure">) {
  return chapter >= 4 && chapter < 5 ? Math.max(chapter, 4 + smooth(departure)) : chapter;
}
export function worldOpacityAt(frame: Pick<JourneyFrame, "chapter" | "departure" | "sections">) {
  const chapter = worldChapterAt(frame);
  return chapter < 2 ? .25 * smooth((frame.sections.signal ?? 0) * 1.2) : chapter > 4.6 ? .65 : .95;
}
