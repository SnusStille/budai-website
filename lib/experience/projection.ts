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
