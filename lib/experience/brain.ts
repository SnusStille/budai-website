import { clamp, lerp, smooth } from "./timeline";
import { ORIGINAL_REGION_POSES } from "./brain-story";

export type BrainMotion = { kind:"intro"|"hero"|"journey"; progress:number; entry?:number };
export const BRAIN_STORY_ORIGIN = -6.25;
export const PLAYGROUND_PLANE_Z = -12.8;
const INTRO_END = { x:0, y:.18, z:-.38, yaw:.03, tilt:.02 };
export function originalStageAt(progress:number) {
  return Math.min(3,Math.floor(clamp((progress-.075)/.55)*4));
}
/** Absolute positions: intro crosses the cortex; hero holds its final identity;
 * original four-region tour precedes the deeper scroll flight. No camera reset.
 */
export function brainCameraAt({ kind, progress, entry=1 }: BrainMotion) {
  const p=clamp(progress);
  if (kind==="hero") return {...INTRO_END};
  if (kind==="intro") {
    const travel=smooth(clamp((p-.12)/.76));
    return {x:.1*Math.sin(p*Math.PI),y:lerp(.25,INTRO_END.y,smooth(p)),z:lerp(4.9,INTRO_END.z,travel),yaw:lerp(-.14,INTRO_END.yaw,smooth(p)),tilt:lerp(.12,INTRO_END.tilt,smooth(p))};
  }
  const tour=clamp((p-.075)/.55)*3;
  const a=Math.min(2,Math.floor(tour)), t=smooth(tour-a);
  const yaw=lerp(ORIGINAL_REGION_POSES[a][0],ORIGINAL_REGION_POSES[a+1][0],t);
  const tilt=lerp(ORIGINAL_REGION_POSES[a][1],ORIGINAL_REGION_POSES[a+1][1],t);
  const flight=smooth(clamp((p-.56)/.44));
  const settle=smooth(clamp((p-.57)/.2));
  return {
    x:.075*Math.sin(p*Math.PI*2),
    y:lerp(lerp(INTRO_END.y,.25,smooth(entry)),.03,flight),
    z:BRAIN_STORY_ORIGIN+lerp(lerp(4.6,4.1,smooth(p/.56)),-2.8,flight),
    yaw:lerp(lerp(INTRO_END.yaw,yaw,smooth(entry)),0,settle),
    tilt:lerp(lerp(INTRO_END.tilt,tilt,smooth(entry)),0,settle),
  };
}
/** Only the recovered brain. Branding is never a render target for this scene. */
export function brainVisualAt(motion:BrainMotion) {
  if(motion.kind!=="journey")return {offset:0,neural:0,focus:-1};
  return {offset:BRAIN_STORY_ORIGIN,neural:smooth((motion.progress-.58)/.25),focus:motion.progress<.67?originalStageAt(motion.progress):-1};
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
  return {depth:Math.max(0,(distance/finalDistance-1)*1400),tilt:(1-playgroundArrivalAt(progress))*5};
}
