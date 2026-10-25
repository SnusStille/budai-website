import { clamp, lerp, smooth } from "./timeline";

export type BrainMotion = { kind:"intro"|"journey"; progress:number; entry?:number };
export const BRAIN_STORY_ORIGIN = -6.25;
export const PLAYGROUND_PLANE_Z = -22;
const INTRO_END = { x:0, y:.18, z:-.38, yaw:.03, tilt:.02 };
export function originalStageAt(progress:number) {
  return Math.min(3,Math.floor(clamp((progress-.075)/.55)*4));
}
/** Absolute poses. The opening is disposed before landing; the separate tour
 * uses calm forward camera beats and never rotates through a full half-turn. */
export function brainCameraAt({ kind, progress }: BrainMotion) {
  const p=clamp(progress);
  if (kind==="intro") {
    const travel=smooth(clamp((p-.12)/.76));
    return {x:.1*Math.sin(p*Math.PI),y:lerp(.25,INTRO_END.y,smooth(p)),z:lerp(4.9,INTRO_END.z,travel),yaw:lerp(-.14,INTRO_END.yaw,smooth(p)),tilt:lerp(.12,INTRO_END.tilt,smooth(p))};
  }
  // Ordered camera beats, not the former full half-turn and last-second unwind.
  // Recovered section content/focus remains; only disruptive camera amplitude changes.
  const beats=[
    {at:0,z:4.6,y:.25,yaw:.10,tilt:.10},
    {at:.25,z:3.6,y:.22,yaw:-.14,tilt:.13},
    {at:.56,z:.62,y:.13,yaw:.04,tilt:.06},
    {at:.80,z:-1.2,y:.06,yaw:0,tilt:0},
    {at:1,z:-2.8,y:.03,yaw:0,tilt:0},
  ];
  let i=0;while(i<beats.length-2&&p>beats[i+1].at)i++;
  const a=beats[i],b=beats[i+1],t=smooth((p-a.at)/(b.at-a.at));
  return {x:.04*Math.sin(p*Math.PI*2),y:lerp(a.y,b.y,t),z:BRAIN_STORY_ORIGIN+lerp(a.z,b.z,t),yaw:lerp(a.yaw,b.yaw,t),tilt:lerp(a.tilt,b.tilt,t)};
}
/** Only the recovered brain. Branding is never a render target for this scene. */
export function brainVisualAt(motion:BrainMotion) {
  if(motion.kind!=="journey")return {offset:0,neural:0,focus:-1,cortex:1};
  return {offset:BRAIN_STORY_ORIGIN,neural:smooth((motion.progress-.58)/.25),focus:motion.progress<.67?originalStageAt(motion.progress):-1,cortex:1-smooth((motion.progress-.67)/.3)};
}
export function brainJourneyProgress(y:number,top:number,height:number,viewport:number) {
  return clamp((y-top)/Math.max(1,height-viewport));
}
/** Stable target: lens changes, never framebuffers on every scroll tick. */
export function brainFovAt(motion:BrainMotion|undefined,height:number,mobile:boolean) {
  if(motion?.kind!=="journey")return mobile?1.35:.87;
  return .87;
}
export function playgroundArrivalAt(progress:number) {
  return smooth((progress-.68)/.32);
}
/** The real console's perspective comes from the SAME camera distance, not a timer. */
export function playgroundProjectionAt(progress:number) {
  const camera=brainCameraAt({kind:"journey",progress,entry:1});
  const distance=camera.z-PLAYGROUND_PLANE_Z;
  const finalDistance=brainCameraAt({kind:"journey",progress:1}).z-PLAYGROUND_PLANE_Z;
  return {depth:Math.max(0,(distance/finalDistance-1)*1400),tilt:(1-playgroundArrivalAt(progress))*1.8};
}
