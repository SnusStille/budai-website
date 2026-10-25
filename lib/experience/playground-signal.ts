import {worldAtNdc} from "./projection";
import {PLAYGROUND_PLANE_Z} from "./brain";
export const SIGNAL_VERTICES=48;
type Rect={left:number;top:number;width:number;height:number};
/** One information signal reaches the REAL toolbar. No rectangle, cage, portal,
 * duplicate interface or independent camera. The endpoint is unprojected through
 * the very same MVP that draws the remaining biological connections.
 */
export function writePlaygroundSignal(out:Float32Array,m:ArrayLike<number>,canvas:Rect,panel:Rect){
  const end=worldAtNdc(m,2*(panel.left+panel.width*.5-canvas.left)/Math.max(1,canvas.width)-1,1-2*(panel.top-canvas.top)/Math.max(1,canvas.height),PLAYGROUND_PLANE_Z);
  const at=(t:number)=>{
    const s=1-t;
    return [s*s*s*.08+3*s*t*t*end[0]+t*t*t*end[0],s*s*s*.04+3*s*s*t*.06+3*s*t*t*(end[1]+.18)+t*t*t*end[1],s*s*s*(-9.7)+3*s*s*t*(-12)+3*s*t*t*(-18)+t*t*t*end[2]];
  };
  let n=0;
  for(let i=0;i<24;i++)for(const t of[i/24,(i+1)/24]){out.set([...at(t),t,.4,.4,-3],n);n+=7;}
  return end;
}
