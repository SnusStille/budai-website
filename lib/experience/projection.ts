/** Pixel/world projection adapted from 14islands/r3f-scroll-rig's PerspectiveCamera
 * (MIT, notice in docs/experience/licenses). No R3F or smooth-scroll runtime needed.
 */
export function worldUnitsPerPixel(distance: number, fov: number, viewportHeight: number) {
  return 2 * distance * Math.tan(fov * Math.PI / 360) / Math.max(1, viewportHeight);
}
export function domViewOffset(projected: { x: number; y: number }, rect: { left: number; top: number; width: number; height: number }, width: number, height: number) {
  const x = ((rect.left + rect.width / 2) / width) * 2 - 1;
  const y = 1 - ((rect.top + rect.height / 2) / height) * 2;
  return { x: (projected.x - x) * width / 2, y: (y - projected.y) * height / 2 };
}

/** Original 2×2 unprojection at a known world-depth plane. This is the inverse
 * of this renderer's actual MVP, not a second independently animated camera. */
export function worldAtNdc(m:ArrayLike<number>,x:number,y:number,z:number):[number,number,number] {
  const a=m[0]-x*m[3],b=m[4]-x*m[7],c=(x*m[11]-m[8])*z+x*m[15]-m[12];
  const d=m[1]-y*m[3],e=m[5]-y*m[7],f=(y*m[11]-m[9])*z+y*m[15]-m[13];
  const determinant=a*e-b*d;
  if (Math.abs(determinant)<1e-10) return [0,0,z];
  return [(c*e-b*f)/determinant,(a*f-c*d)/determinant,z];
}
