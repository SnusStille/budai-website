/**
 * STILLEDEV — GLSL for the cinematic world.
 *
 * Everything here is procedural: no external models, HDRIs or textures. That is a deliberate
 * production choice — the "assets" are the light, so the whole film weighs a few kilobytes,
 * loads instantly on a phone, and never 404s.
 */

/** Ashima 3D simplex noise (public domain). Shared by the core displacement and slab drift. */
const SIMPLEX = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ return snoise(p)*0.6 + snoise(p*2.03)*0.28 + snoise(p*4.11)*0.12; }
`;

/* ── The brand written in light ─────────────────────────────────────────────────
   Points fly in from a cold nebula shell and settle into the STILLEDEV wordmark,
   then scatter as the camera moves on. One object, three states, no logo decal.   */

export const markVertex = /* glsl */ `
attribute vec3 aMark;
attribute vec3 aField;
attribute float aSeed;
attribute float aEdge;
uniform float uTime;
uniform float uForm;      // 0 = nebula, 1 = wordmark
uniform float uScatter;   // 0..1 dissolve toward the end of a scene
uniform float uSize;
uniform float uDpr;
varying float vSeed;
varying float vEdge;
varying float vFade;
${SIMPLEX}
void main(){
  vec3 p = mix(aField, aMark, uForm);

  // living drift — the mark breathes, it never freezes
  float w = 0.55 + aSeed * 0.9;
  vec3 drift = vec3(
    sin(uTime * 0.31 + aSeed * 41.0),
    cos(uTime * 0.27 + aSeed * 23.0),
    sin(uTime * 0.37 + aSeed * 13.0)
  );
  p += drift * (0.19 * w) * (1.0 - uForm * 0.72);
  p.y += sin(uTime * 0.5 + p.x * 1.4 + aSeed * 6.0) * 0.018 * uForm;

  // scatter: dissolve along a noisy outward vector, so it tears rather than fades
  if (uScatter > 0.001) {
    vec3 dir = normalize(p - vec3(0.0, 1.2, 0.0) + 0.001);
    float n = fbm(p * 0.55 + uTime * 0.12);
    p += dir * uScatter * (2.4 + aSeed * 7.0) + vec3(n, n * 0.6, -n) * uScatter * 3.0;
    p.z -= uScatter * 6.0;
  }

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  vFade = smoothstep(120.0, 12.0, dist);
  gl_PointSize = uSize * uDpr * (340.0 / max(dist, 0.6)) * (0.6 + aSeed * 0.85 + aEdge * 0.5);
  vSeed = aSeed;
  vEdge = aEdge;
  gl_Position = projectionMatrix * mv;
}
`;

export const markFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uEdgeColor;
uniform float uOpacity;
uniform float uTime;
uniform float uForm;
varying float vSeed;
varying float vEdge;
varying float vFade;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  // soft core with a hot centre: reads as light, not as a pixel
  float a = smoothstep(0.5, 0.06, d);
  a *= a;
  float tw = 0.62 + 0.38 * sin(uTime * 1.9 + vSeed * 47.0);
  vec3 col = mix(uColorA, uColorB, clamp(vSeed * 0.85 + (1.0 - uForm) * 0.35, 0.0, 1.0));
  col = mix(col, uEdgeColor, vEdge * 0.85);
  float alpha = a * tw * uOpacity * vFade * (0.34 + vEdge * 0.66 + uForm * 0.35);
  gl_FragColor = vec4(col * (0.75 + vEdge * 0.9), alpha);
}
`;

/* ── Scene C — the intelligence core ───────────────────────────────────────────
   A machined shell over a lit lattice. As the scene develops the shell expands
   (exploded view) and the inner structure is revealed: "we open the black box". */

export const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uScale;
uniform float uReveal;
varying vec3 vN;
varying vec3 vV;
varying float vDisp;
varying float vBand;
${SIMPLEX}
void main(){
  float n = fbm(normal * uScale + vec3(0.0, 0.0, uTime * 0.5));
  float amp = uAmp * (0.55 + uReveal * 0.75);
  float disp = n * amp;
  vec3 p = position + normal * disp;
  // machined grooves: precision, not blob
  float band = sin(position.y * 34.0 + uTime * 0.35);
  band = smoothstep(0.86, 1.0, band);
  p += normal * band * 0.012;
  vBand = band;
  vDisp = disp;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const coreFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uRim;
uniform float uReveal;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vV;
varying float vDisp;
varying float vBand;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(vV);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 2.4);
  // two directional terms so the body has form instead of being a flat glow
  float key = clamp(dot(N, normalize(vec3(0.55, 0.8, 0.35))), 0.0, 1.0);
  float fill = clamp(dot(N, normalize(vec3(-0.7, -0.15, -0.5))), 0.0, 1.0);
  vec3 base = mix(uColorA, uColorB, clamp(vDisp * 1.6 + 0.5, 0.0, 1.0));
  vec3 col = base * (0.045 + key * 0.30 + fill * 0.10);
  col += uRim * fres * (1.35 - uReveal * 0.45);
  // grooves catch light; they are the "engineered" read
  col += uRim * vBand * (0.20 + uReveal * 0.35);
  // the shell opens up as the inner layers are revealed
  float a = uOpacity * (0.9 - fres * 0.15) * (1.0 - uReveal * 0.55);
  gl_FragColor = vec4(col, a);
}
`;

/* ── The floor: a dark measured grid the camera travels over ──────────────────── */

export const gridVertex = /* glsl */ `
varying vec2 vWorld;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const gridFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uPulse;
uniform float uTime;
uniform float uOpacity;
uniform float uCell;
varying vec2 vWorld;

float gridLine(vec2 p, float w){
  vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
  return 1.0 - min(min(g.x, g.y) * w, 1.0);
}
void main(){
  float near = 1.0 - smoothstep(6.0, 78.0, length(vWorld - vec2(0.0, -12.0)));
  if (near <= 0.0) discard;
  float fine = gridLine(vWorld / (uCell * 0.25), 1.25) * 0.18;
  float major = gridLine(vWorld / uCell, 1.0) * 0.55;
  float l = max(fine, major) * near;
  // a slow surveying pulse runs along -Z, so the plane is never dead
  float wave = exp(-pow(fract((vWorld.y + uTime * 1.5) / 46.0) * 6.2831 - 3.14, 2.0) * 1.5);
  vec3 col = uColor * l + uPulse * (l * 0.7 + wave * 0.06 * near);
  gl_FragColor = vec4(col, (l * 0.85 + wave * 0.05) * uOpacity * near);
}
`;

/* ── Connected systems: links with data travelling along them ─────────────────── */

export const linkVertex = /* glsl */ `
attribute float aPath;   // 0..1 position along its link
attribute float aSeed;
varying float vPath;
varying float vSeed;
varying float vFade;
void main(){
  vPath = aPath;
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFade = smoothstep(150.0, 14.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const linkFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uPulse;
uniform float uTime;
uniform float uOpacity;
uniform float uFlow;
varying float vPath;
varying float vSeed;
varying float vFade;
void main(){
  // the line itself is quiet; a bright packet runs along it
  float body = 0.14;
  float head = fract(vPath * 0.5 - uTime * (0.09 + vSeed * 0.05) * uFlow);
  float packet = smoothstep(0.0, 0.055, head) * (1.0 - smoothstep(0.055, 0.22, head));
  vec3 col = uColor * body + uPulse * packet * 1.9;
  float a = (body + packet * 0.95) * uOpacity * vFade;
  gl_FragColor = vec4(col, a);
}
`;

/* ── Emissive edge strips for the architecture slabs ─────────────────────────── */

export const edgeVertex = /* glsl */ `
attribute float aSeed;
varying float vSeed;
varying float vY;
void main(){
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  vY = position.y;
  gl_Position = projectionMatrix * mv;
}
`;

export const edgeFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uOpacity;
varying float vSeed;
varying float vY;
void main(){
  float breathe = 0.5 + 0.5 * sin(uTime * (0.5 + vSeed * 0.8) + vSeed * 20.0);
  float a = uOpacity * (0.35 + breathe * 0.65);
  gl_FragColor = vec4(uColor * (0.8 + breathe * 0.9), a);
}
`;

/* ── Final grade: the film print ────────────────────────────────────────────────
   Runs after OutputPass, in display space. Vignette, gentle contrast curve,
   a cool shadow lift, desaturation, lens fringing and grain. This pass is why the
   scene reads as "shot" rather than "rendered". */

export const gradeVertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export const gradeFragment = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uVignette;
uniform float uGrain;
uniform float uAberr;
uniform float uTime;
uniform float uBloom;
varying vec2 vUv;
float hash(vec2 p){
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}
void main(){
  vec2 d = vUv - 0.5;
  float r2 = dot(d, d);
  vec2 off = d * uAberr * r2;
  vec3 c;
  c.r = texture2D(tDiffuse, vUv - off).r;
  c.g = texture2D(tDiffuse, vUv).g;
  c.b = texture2D(tDiffuse, vUv + off).b;

  float vig = smoothstep(1.05, uVignette * 0.30, r2 * 2.0);
  c *= mix(0.62, 1.0, vig);

  c = clamp(c, 0.0, 1.0);
  c = c * c * (3.0 - 2.0 * c) * 0.30 + c * 0.70;   // soft S-curve, keeps blacks open
  c += vec3(0.010, 0.017, 0.032) * (1.0 - c);        // cool lift in the shadows
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(lum), c, 0.86);                       // restrained, not monochrome
  c = mix(c, c + vec3(0.0, 0.02, 0.05) * lum, uBloom * 0.35);

  if (uGrain > 0.0) {
    float g = hash(vUv * vec2(1180.0, 760.0) + fract(uTime) * 71.0);
    c += (g - 0.5) * uGrain * (1.0 - lum * 0.55);
  }
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;
