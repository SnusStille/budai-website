/** BudAI / Confluence. Two continuous neural ribbons meet at one computational cell.
 * Original vector geometry, not a letter B, stock brain, sparkle or orbit icon.
 */
export const BUDAI_MARK_PATH = "M15.1 3.6C11.4 1.7 7 2.8 4.8 6.3L1.8 11.4C-.1 14.7 1.1 18.8 4.4 20.7L10.9 24.4L13.3 20.2L6.9 16.5C5.7 15.8 5.3 14.4 6 13.2L9 8C9.9 6.5 11.6 6.1 13.1 6.9L19.8 10.8L22.2 6.6ZM16.9 28.4C20.6 30.3 25 29.2 27.2 25.7L30.2 20.6C32.1 17.3 30.9 13.2 27.6 11.3L21.1 7.6L18.7 11.8L25.1 15.5C26.3 16.2 26.7 17.6 26 18.8L23 24C22.1 25.5 20.4 25.9 18.9 25.1L12.2 21.2L9.8 25.4ZM12.5 14L16 12L19.5 14V18L16 20L12.5 18Z";
export const BUDAI_SIGNAL_PATHS = [
  "M20.6 8.7L14.2 5.1C11.4 3.6 8.1 4.5 6.5 7.3L3.9 12C2.6 14.5 3.5 17 5.8 18.4L12.1 22.1",
  "M11.4 23.3L17.8 26.9C20.6 28.4 23.9 27.5 25.5 24.7L28.1 20C29.4 17.5 28.5 15 26.2 13.6L19.9 9.9",
] as const;
export const BUDAI_BRAND = { dark: "#071017", light: "#dcebf0", ink: "#12212b", signal: "#a1d9e3" } as const;

/** Static identity: installed icons deliberately contain no animation or filters. */
export function budaiMarkSvg({ installed = false, background = false, light = false } = {}) {
  const box = installed ? "-5 -5 42 42" : "0 0 32 32";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}"><title>BudAI — Confluence</title>${background ? `<rect x="${installed ? -5 : 0}" y="${installed ? -5 : 0}" width="${installed ? 42 : 32}" height="${installed ? 42 : 32}" rx="${installed ? 0 : 7}" fill="${BUDAI_BRAND.dark}"/>` : ""}<path d="${BUDAI_MARK_PATH}" fill="${light ? BUDAI_BRAND.ink : BUDAI_BRAND.light}" fill-rule="nonzero"/></svg>`;
}

/** Flatten our small M/L/H/V/C/Z vocabulary. Shared by the neural-to-identity morph
 * and the manufactured capability core; no SVG loader or Three dependency at entry.
 */
export function brandContours() {
  const tokens = BUDAI_MARK_PATH.match(/[A-Za-z]|-?(?:\d*\.)?\d+/g)!;
  const polygons: Array<Array<[number, number]>> = [];
  let i = 0, x = 0, y = 0, command = "", polygon: Array<[number, number]> = [];
  const n = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) command = tokens[i++];
    if (command === "M") { polygon = []; polygons.push(polygon); x = n(); y = n(); polygon.push([x,y]); command = "L"; }
    else if (command === "L") { x = n(); y = n(); polygon.push([x,y]); }
    else if (command === "H") { x = n(); polygon.push([x,y]); }
    else if (command === "V") { y = n(); polygon.push([x,y]); }
    else if (command === "C") {
      const x0=x,y0=y,x1=n(),y1=n(),x2=n(),y2=n(),x3=n(),y3=n();
      for (let k=1;k<=16;k++) { const t=k/16,s=1-t; polygon.push([s*s*s*x0+3*s*s*t*x1+3*s*t*t*x2+t*t*t*x3,s*s*s*y0+3*s*s*t*y1+3*s*t*t*y2+t*t*t*y3]); }
      x=x3;y=y3;
    } else if (command === "Z") { command=""; }
    else throw new Error("Unsupported brand path command");
  }
  return polygons;
}
export function sampleBrandVolume(count: number) {
  const contours = brandContours();
  const contains = (x:number,y:number) => contours.some(polygon => {
    let inside=false;
    for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
      const [a,b]=polygon[i],[c,d]=polygon[j];
      if ((b>y)!==(d>y) && x<(c-a)*(y-b)/(d-b)+a) inside=!inside;
    }
    return inside;
  });
  let seed=2718;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;};
  const points = new Float32Array(count*3);
  for (let i=0;i<count;) {
    const x=random()*32,y=random()*32;
    if (!contains(x,y)) continue;
    points.set([(x-16)*.069,(16-y)*.069,-6.25+(random()-.5)*.12],i++*3);
  }
  return points;
}
