import { brandContours } from "../brand";

/** Small original ear-clip triangulator for our own three closed contours.
 * Returns an extruded, bevel-free manufactured mark; no runtime SVG/model loader.
 */
export function identityVolume() {
  const vertices:number[]=[];
  const push=(p:number[],n:number[])=>vertices.push(...p,...n);
  for (const contour of brandContours()) {
    const points=contour.map(([x,y])=>[(x-16)*.069,(16-y)*.069]);
    const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0);
    if (area<0) points.reverse();
    const indices=points.map((_,i)=>i);
    const cross=(a:number[],b:number[],c:number[]) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    const inside=(p:number[],a:number[],b:number[],c:number[])=>cross(a,b,p)>=-1e-9&&cross(b,c,p)>=-1e-9&&cross(c,a,p)>=-1e-9;
    const front=-6.11,back=-6.39;
    for (let guard=0;indices.length>2 && guard<points.length*points.length;guard++) {
      let found=false;
      for (let k=0;k<indices.length;k++) {
        const a=indices[(k+indices.length-1)%indices.length],b=indices[k],c=indices[(k+1)%indices.length];
        if (cross(points[a],points[b],points[c])<=1e-10) continue;
        if (indices.some(j=>j!==a&&j!==b&&j!==c&&inside(points[j],points[a],points[b],points[c]))) continue;
        [a,b,c].forEach(j=>push([...points[j],front],[0,0,1]));
        [c,b,a].forEach(j=>push([...points[j],back],[0,0,-1]));
        indices.splice(k,1);found=true;break;
      }
      if (!found) throw new Error("Invalid Confluence contour");
    }
    points.forEach((p,i)=>{
      const q=points[(i+1)%points.length],dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);
      const n=[dy/d,-dx/d,0];
      [[...p,front],[...p,back],[...q,back],[...p,front],[...q,back],[...q,front]].forEach(v=>push(v,n));
    });
  }
  return new Float32Array(vertices);
}
