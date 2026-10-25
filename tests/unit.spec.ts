import { test, expect } from "@playwright/test";
import { INTRO_MS, INTRO_REVEAL_MS, introLetters, nextIntroLetter } from "../lib/experience/intro";
import { cameraAt, CHAPTERS, journeyAt } from "../lib/experience/timeline";
import { brainCameraAt, brainFovAt, brainJourneyProgress } from "../lib/experience/brain";
import { codeCharactersAt, CODE_LENGTH, EXAMPLE_SOURCE, tokenizeLine } from "../lib/experience/code";

test("intro has five deliberate letters and a bounded, short duration", () => {
  expect([0, 850, 1060, 1270, 1480, 1690, 9000].map(introLetters)).toEqual([0, 1, 2, 3, 4, 5, 5]);
  expect(INTRO_MS + INTRO_REVEAL_MS).toBeLessThanOrEqual(3100);
  let previous = 0, lastAt = 0;
  const observed = [];
  for (const elapsed of [0, 1100, 1160, 1280, 1460, 1640, 1820, 2100, 2350]) {
    const next = nextIntroLetter(previous, elapsed, elapsed - lastAt);
    if (next !== previous) { observed.push(next); previous = next; lastAt = elapsed; }
  }
  expect(observed).toEqual([1, 2, 3, 4, 5]);
});

test("camera path is finite, continuous at all chapter boundaries, and exactly reversible", () => {
  for (const mobile of [false, true]) {
    for (let i = 0; i <= (CHAPTERS.length - 1) * 100; i++) {
      const p = i / 100;
      const a = cameraAt(p, .4, mobile);
      expect([...a.position, ...a.target].every(Number.isFinite)).toBe(true);
      expect(a).toEqual(cameraAt(p, .4, mobile));
      if (i > 0) {
        const b = cameraAt(p - .0001, .4, mobile);
        expect(Math.hypot(...a.position.map((n, j) => n - b.position[j]))).toBeLessThan(.02);
      }
    }
  }
});

test("native scroll reconstructs every chapter in both directions", () => {
  const bounds = CHAPTERS.map((s, i) => ({ id: s.id, top: i * 2000, height: 2000 }));
  const forward = Array.from({ length: 121 }, (_, i) => journeyAt(i * 100, 900, 12000, bounds));
  const reverse = Array.from({ length: 121 }, (_, i) => journeyAt((120 - i) * 100, 900, 12000, bounds)).reverse();
  expect(forward).toEqual(reverse);
  expect(forward.at(-1)?.chapter).toBe(CHAPTERS.length - 1);
  expect(forward[0].chapter).toBe(0);
});

test("code reveal is deterministic, monotonic, bounded, and preserves every source character", () => {
  let previous = 0;
  for (let i = 0; i <= 100; i++) {
    const n = codeCharactersAt(i / 100);
    expect(n).toBeGreaterThanOrEqual(previous);
    expect(n).toBeLessThanOrEqual(CODE_LENGTH);
    previous = n;
  }
  expect(codeCharactersAt(0)).toBe(0);
  expect(codeCharactersAt(1)).toBe(CODE_LENGTH);
  expect(EXAMPLE_SOURCE.split("\n").map((line) => tokenizeLine(line).map(t => t.text).join("")).join("\n")).toBe(EXAMPLE_SOURCE);
});

 test("brain travel is absolute, continuous, enters the anatomy and reverses exactly", () => {
  expect(brainCameraAt({kind:"intro",progress:1}).z).toBeLessThan(brainCameraAt({kind:"intro",progress:0}).z);
  for (let i=0;i<=100;i++) {
    const p=i/100;
    const pose=brainCameraAt({kind:"journey",progress:p});
    expect(Object.values(pose).every(Number.isFinite)).toBe(true);
    expect(pose).toEqual(brainCameraAt({kind:"journey",progress:p}));
    if(i>0) expect(pose.z).toBeLessThan(brainCameraAt({kind:"journey",progress:p-.01}).z);
  }
  expect(brainCameraAt({kind:"journey",progress:1}).z).toBeLessThan(-2);
  expect(brainJourneyProgress(2800,1000,2800,1000)).toBe(1);
  expect(brainJourneyProgress(500,1000,2800,1000)).toBe(0);
 });

test("mobile brain uses one full-height target and a finite reversible perspective lens", () => {
  const hero = brainFovAt({ kind:"hero", progress:0 }, 844, true);
  expect(hero).toBeGreaterThan(.87);
  expect(brainFovAt({ kind:"journey", progress:0, entry:0 },844,true)).toBe(hero);
  expect(brainFovAt({ kind:"journey", progress:.5, entry:1 },844,true)).toBe(.87);
  expect(brainFovAt({ kind:"hero", progress:0 },1000,false)).toBe(.87);
  for (const height of [0, 370, 667, 844, 1200]) for (const entry of [0,.1,.5,.9,1]) {
    const fov = brainFovAt({ kind:"journey",progress:entry,entry },height,true);
    expect(Number.isFinite(fov)).toBe(true); expect(fov).toBeGreaterThan(0); expect(fov).toBeLessThan(Math.PI);
  }
  expect(new Set(CHAPTERS.map(c=>c.number)).size).toBe(CHAPTERS.length);
});
