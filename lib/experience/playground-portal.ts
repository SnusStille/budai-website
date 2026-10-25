import { worldAtNdc } from "./projection";
import { PLAYGROUND_PLANE_Z } from "./brain";
export const PORTAL_VERTICES=72;
type Rect={left:number;top:number;width:number;height:number};
/** Manufacture a spatial frame around the REAL, currently projected chat surface.
 * A focused neural signal reaches its toolbar. No copied canvas/HTML chat mockup.
 */
export function writePlaygroundPortal(out:Float32Array,m:ArrayLike<number>,canvas:Rect,panel:Rect) {
  const project=(x:number,y:number)=>worldAtNdc(m,2*(x-canvas.left)/Math.max(1,canvas.width)-1,1-2*(y-canvas.top)/Math.max(1,canvas.height),PLAYGROUND_PLANE_Z);
  const corners=[project(panel.left-5,panel.top-5),project(panel.left+panel.width+5,panel.top-5),project(panel.left+panel.width+5,panel.top+panel.height+5),project(panel.left-5,panel.top+panel.height+5)];
  let n=0;
  const vertex=(v:number[],t:number)=>{out.set([...v,t,.4,.4,-3],n);n+=7;};
  for (const depth of [0,.8]) for (let i=0;i<4;i++) {
    const a=corners[i],b=corners[(i+1)%4];vertex([a[0],a[1],a[2]-depth],0);vertex([b[0],b[1],b[2]-depth],1);
  }
  corners.forEach(a=>{vertex(a,0);vertex([a[0],a[1],a[2]-.8],1);});
  const end=project(panel.left+panel.width*.5,panel.top-5);
  const at=(t:number)=>{
    const s=1-t;
    return [s*s*s*.12+3*s*t*t*end[0]+t*t*t*end[0],s*s*s*.04+3*s*s*t*.06+3*s*t*t*(end[1]+.3)+t*t*t*end[1],s*s*s*(-9.7)+3*s*s*t*(-10.4)+3*s*t*t*(-12.0)+t*t*t*end[2]];
  };
  for (let i=0;i<24;i++) {vertex(at(i/24),i/24);vertex(at((i+1)/24),(i+1)/24);}
  return corners;
}
