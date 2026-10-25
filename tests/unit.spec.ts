import { test, expect } from "@playwright/test";
import { INTRO_MS, INTRO_REVEAL_MS, introLetters, nextIntroLetter } from "../lib/experience/intro";
import { cameraAt, CHAPTERS, journeyAt, worldChapterAt, worldOpacityAt } from "../lib/experience/timeline";
import { brainCameraAt, brainFovAt, brainJourneyProgress, brainVisualAt, playgroundProjectionAt, BRAIN_STORY_ORIGIN } from "../lib/experience/brain";
import { codeCharactersAt, CODE_LENGTH, EXAMPLE_SOURCE, tokenizeLine } from "../lib/experience/code";

test("intro has five deliberate letters and a bounded, short duration", () => {
  expect([0, 850, 1060, 1270, 1480, 1690, 9000].map(introLetters)).toEqual([0, 1, 2, 3, 4, 5, 5]);
  expect(INTRO_MS + INTRO_REVEAL_MS).toBeLessThanOrEqual(4000);
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

test("world departure is reversible and its invisible landing state is genuinely dormant", () => {
  expect(worldOpacityAt({chapter:0,sections:{signal:0}})).toBe(0);
  expect(worldOpacityAt({chapter:3,sections:{signal:1}})).toBeGreaterThan(0);
  expect(worldChapterAt({chapter:4,departure:1})).toBe(5);
  expect(worldChapterAt({chapter:6,departure:1})).toBe(6);
  const values = [0,.1,.5,.9,1].map(departure=>worldChapterAt({chapter:4,departure}));
  expect([...values].sort((a,b)=>a-b)).toEqual(values);
  expect([1,.9,.5,.1,0].map(departure=>worldChapterAt({chapter:4,departure})).reverse()).toEqual(values);
});

test("opening actually crosses the cortex and resolves into the SAME final hero pose",()=>{
  const poses=Array.from({length:101},(_,i)=>brainCameraAt({kind:"intro",progress:i/100}));
  expect(poses.some(p=>p.z<.8&&p.z>-.8)).toBe(true);
  expect(poses.at(-1)!.z).toBeLessThan(-1);
  const end=poses.at(-1)!,hero=brainCameraAt({kind:"hero",progress:0});
  for(const key of ["x","y","z","yaw","tilt"] as const)expect(end[key]).toBeCloseTo(hero[key],8);
  expect(brainVisualAt({kind:"intro",progress:1}).identity).toBe(1);
  expect(brainCameraAt({kind:"journey",progress:.86}).z-BRAIN_STORY_ORIGIN).toBeLessThan(0);
  expect(playgroundProjectionAt(1)).toEqual({depth:0,tilt:0});
});

test("the recovered story retains all four original stages and the identity volume is real, finite geometry",async()=>{
  const {ORIGINAL_BRAIN_STAGES}=await import("../lib/experience/brain-story");
  const {identityVolume}=await import("../lib/experience/identity-volume");
  const {sampleBrandVolume,brandContours}=await import("../lib/brand");
  expect(ORIGINAL_BRAIN_STAGES.map(s=>s.en.title)).toEqual(["Write","Memory","Decide","Voice & vision"]);
  expect(brandContours()).toHaveLength(3);
  const vertices=identityVolume();expect(vertices.length).toBeGreaterThan(3000);expect(vertices.length%18).toBe(0);
  expect(Array.from(vertices).every(Number.isFinite)).toBe(true);
  for(let i=0;i<vertices.length;i+=6)expect(Math.hypot(vertices[i+3],vertices[i+4],vertices[i+5])).toBeCloseTo(1,5);
  expect(sampleBrandVolume(100)).toEqual(sampleBrandVolume(100));
});

test("DOM-to-world unprojection follows the actual projection matrix",async()=>{
  const {worldAtNdc}=await import("../lib/experience/projection");
  const f=2.2,aspect=1.44,m=[f/aspect,0,0,0,0,f,0,0,0,0,-1,-1,0,0,-.1,0];
  for(const x of [-.8,0,.7])for(const y of [-.6,0,.9]){
    const [a,b,z]=worldAtNdc(m,x,y,-8),w=-z;
    expect((m[0]*a)/w).toBeCloseTo(x,7);expect((m[5]*b)/w).toBeCloseTo(y,7);
  }
});

test("model choices are configuration-aware public IDs; arbitrary or unavailable provider models are rejected",async()=>{
  const {publicModelOptions,resolveModelTier}=await import("../lib/ai-models");
  expect(publicModelOptions({})).toEqual([{id:"quality",label:"Quality"}]);
  const env={ANTHROPIC_MODEL:"private-quality",ANTHROPIC_MODEL_FAST:"private-fast",ANTHROPIC_MODEL_DEEP:"private-deep"};
  expect(publicModelOptions(env).map(o=>o.id)).toEqual(["quality","fast","deep"]);
  expect(JSON.stringify(publicModelOptions(env))).not.toContain("private-");
  expect(resolveModelTier("fast",env)).toBe("private-fast");expect(resolveModelTier("deep",env)).toBe("private-deep");
  expect(resolveModelTier(undefined,env)).toBe("private-quality");
  expect(resolveModelTier("fast",{})).toBeNull();expect(resolveModelTier("attacker-model",env)).toBeNull();expect(resolveModelTier({model:"private-fast"},env)).toBeNull();
});
