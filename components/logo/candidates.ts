/* ────────────────────────────────────────────────────────────────
   BudAI · Logo Lab candidates
   ────────────────────────────────────────────────────────────────
   Each candidate is a self-contained SVG string: gradients, glow and
   motion baked in, so the exact same source renders in the lab, can be
   copied to the clipboard, or downloaded as an animated .svg that works
   on its own in any browser. `tone` flips the plate between the dark
   product surface and a light surface for print / light UI.
   ──────────────────────────────────────────────────────────────── */

export type LogoTone = "dark" | "light";

export type LogoCandidate = {
  id: string;
  name: string;
  note: Record<"sv" | "en", string>;
  tag: Record<"sv" | "en", string>;
  build: (size: number, tone: LogoTone) => string;
};

export function logoSvg(candidate: LogoCandidate, size = 512, tone: LogoTone = "dark") {
  return candidate.build(size, tone);
}

export function downloadSvg(source: string, filename: string) {
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const plate = (tone: LogoTone) =>
  tone === "dark"
    ? { fill: "url(#plateDark)", stroke: "rgba(255,255,255,0.10)" }
    : { fill: "url(#plateLight)", stroke: "rgba(9,14,24,0.10)" };

const plateDefs = (tone: LogoTone) =>
  tone === "dark"
    ? `<linearGradient id="plateDark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0a0f18"/><stop offset="0.55" stop-color="#060911"/><stop offset="1" stop-color="#0d1120"/>
      </linearGradient>`
    : `<linearGradient id="plateLight" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef2fb"/>
      </linearGradient>`;

const CYAN = "#3ee0cd";
const VIOLET = "#9a86ff";
const INK = "#05070c";

/* ── 0. B-mark (in use) ───────────────────────────────────────── */
const bMark: LogoCandidate = {
  id: "b-mark",
  name: "B-mark",
  tag: { sv: "I bruk — vald i labbet", en: "In use — chosen in the lab" },
  note: {
    sv: "Skeppat märke: ett geometriskt B där övre bågen är cyan och nedre violett, med en nod i omloppsbana runt mitten. Läser i 16 px och i 260 px.",
    en: "The shipped mark: a geometric B with a cyan upper bowl and violet lower bowl, and one node orbiting the counter. Reads at 16px and at 260px.",
  },
  build: (size, tone) => {
    const p = plate(tone);
    const stroke = tone === "dark" ? "#eafffc" : INK;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="BudAI B-mark">
  <defs>
    ${plateDefs(tone)}
    <linearGradient id="bmG" x1="14" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8ef0e2"/><stop offset="0.46" stop-color="#3ee0cd"/><stop offset="1" stop-color="#9a86ff"/>
    </linearGradient>
    <style>@keyframes bmDraw{from{stroke-dashoffset:140}to{stroke-dashoffset:0}}@keyframes bmOrbit{to{transform:rotate(360deg)}}@keyframes bmBreath{0%,100%{opacity:.75;transform:scale(.94)}50%{opacity:1;transform:scale(1.06)}}</style>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="14" fill="${p.fill}" stroke="${p.stroke}"/>
  <ellipse cx="33" cy="32" rx="24" ry="22" fill="none" stroke="url(#bmG)" stroke-width="0.7" stroke-dasharray="32 112" opacity="0.5"/>
  <path d="M21 13 V51" stroke="${stroke}" stroke-width="6.2" stroke-linecap="round" fill="none" stroke-dasharray="140" style="animation:bmDraw .9s cubic-bezier(.22,1,.36,1) both"/>
  <path d="M21 13 H32.5 a11.5 11.5 0 0 1 0 23 H21" stroke="url(#bmG)" stroke-width="6.2" stroke-linecap="round" fill="none" stroke-dasharray="140" style="animation:bmDraw 1s cubic-bezier(.22,1,.36,1) .12s both"/>
  <path d="M21 32 H32.5 a11.5 11.5 0 0 1 0 23 H21" stroke="url(#bmG)" stroke-width="6.2" stroke-linecap="round" opacity="0.92" fill="none" stroke-dasharray="140" style="animation:bmDraw 1s cubic-bezier(.22,1,.36,1) .24s both"/>
  <circle cx="33" cy="32" r="3.2" fill="#e8fffd" style="transform-origin:33px 32px;animation:bmBreath 3.6s ease-in-out infinite"/>
  <g style="transform-origin:33px 32px;animation:bmOrbit 9s linear infinite"><circle cx="57" cy="26" r="3" fill="#8ef0e2"/></g>
</svg>`;
  },
};

/* ── 1. Prism Core v3 ─────────────────────────────────────────── */
const prismV3: LogoCandidate = {
  id: "prism-v3",
  name: "Prism Core v3",
  tag: { sv: "Samma familj, mer djup", en: "Same family, more depth" },
  note: {
    sv: "Utvecklad version av nuvarande märke: slipade facetter, iris och två orbitala ringar i 3D.",
    en: "An evolved take on the current mark: cut facets, an iris and two orbits in 3D.",
  },
  build: (size, tone) => {
    const p = plate(tone);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="BudAI Prism Core">
  <defs>
    ${plateDefs(tone)}
    <linearGradient id="p3Glass" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="${CYAN}"/><stop offset="0.55" stop-color="#66d7f7"/><stop offset="1" stop-color="${VIOLET}"/>
    </linearGradient>
    <radialGradient id="p3Core" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#b8fff6"/><stop offset="1" stop-color="rgba(62,224,205,0)"/>
    </radialGradient>
    <filter id="p3Glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="p3Cut"><path d="M100 26 168 66v68l-68 40-68-40V66z"/></clipPath>
    <style>@keyframes p3spin{to{transform:rotate(360deg)}}@keyframes p3pulse{0%,100%{opacity:.85}50%{opacity:.35}}</style>
  </defs>
  <rect x="4" y="4" width="192" height="192" rx="46" fill="${p.fill}" stroke="${p.stroke}"/>
  <g clip-path="url(#p3Cut)" opacity="0.9">
    <path d="M100 26 168 66 100 100z" fill="url(#p3Glass)" opacity="0.42"/>
    <path d="M168 66v68L100 100z" fill="url(#p3Glass)" opacity="0.24"/>
    <path d="M32 66l68 34-68 34z" fill="url(#p3Glass)" opacity="0.32"/>
    <path d="M32 134l68-34v74z" fill="url(#p3Glass)" opacity="0.16"/>
  </g>
  <g clip-path="url(#p3Cut)">
    <path d="M100 170 168 134" stroke="url(#p3Glass)" stroke-width="2" opacity="0.6" fill="none"/>
    <path d="M100 170 32 134" stroke="url(#p3Glass)" stroke-width="2" opacity="0.35" fill="none"/>
  </g>
  <path d="M100 26 168 66v68l-68 40-68-40V66z" fill="none" stroke="url(#p3Glass)" stroke-width="3.2" stroke-linejoin="round"/>
  <g filter="url(#p3Glow)"><circle cx="100" cy="100" r="17" fill="url(#p3Core)"/></g>
  <circle cx="100" cy="100" r="7" fill="#ffffff"/>
  <g style="transform-origin:100px 100px;animation:p3spin 14s linear infinite">
    <ellipse cx="100" cy="100" rx="74" ry="30" fill="none" stroke="${CYAN}" stroke-width="1.6" opacity="0.55" transform="rotate(-18 100 100)"/>
    <circle cx="168" cy="86" r="4" fill="${CYAN}"/>
  </g>
  <g style="transform-origin:100px 100px;animation:p3spin 22s linear infinite reverse">
    <ellipse cx="100" cy="100" rx="60" ry="78" fill="none" stroke="${VIOLET}" stroke-width="1.4" opacity="0.45" transform="rotate(24 100 100)"/>
    <circle cx="100" cy="26" r="3.4" fill="${VIOLET}"/>
  </g>
  <circle cx="100" cy="100" r="52" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.10" style="animation:p3pulse 4.5s ease-in-out infinite"/>
</svg>`;
  },
};

/* ── 2. Aperture ──────────────────────────────────────────────── */
const aperture: LogoCandidate = {
  id: "aperture",
  name: "Aperture N",
  tag: { sv: "Bländare som öppnar sig", en: "An aperture opening" },
  note: {
    sv: "Sex blad som andas mellan stängt och öppet — känns som ett öga som fokuserar. Stark i små storlekar.",
    en: "Six blades that breathe between closed and open — an eye finding focus. Strong at small sizes.",
  },
  build: (size, tone) => {
    const p = plate(tone);
    const blades = [0, 60, 120, 180, 240, 300]
      .map(
        (angle, i) => `<path d="M100 100 L100 34 A66 66 0 0 1 157 67 Z" fill="url(#apG)" opacity="${0.14 + i * 0.06}" transform="rotate(${angle} 100 100)"/>`
      )
      .join("\n    ");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="BudAI Aperture">
  <defs>
    ${plateDefs(tone)}
    <linearGradient id="apG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${CYAN}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient>
    <radialGradient id="apCore" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="rgba(62,224,205,0.15)"/></radialGradient>
    <filter id="apBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
    <style>@keyframes apOpen{0%,100%{transform:scale(.82)}50%{transform:scale(1)}}</style>
  </defs>
  <rect x="4" y="4" width="192" height="192" rx="46" fill="${p.fill}" stroke="${p.stroke}"/>
  <g style="transform-origin:100px 100px;animation:apOpen 6s ease-in-out infinite">
    ${blades}
  </g>
  <circle cx="100" cy="100" r="66" fill="none" stroke="url(#apG)" stroke-width="2.4" opacity="0.85"/>
  <circle cx="100" cy="100" r="30" fill="url(#apCore)" filter="url(#apBlur)"/>
  <circle cx="100" cy="100" r="13" fill="#ffffff"/>
  <circle cx="100" cy="100" r="66" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.14"/>
  ${[0, 90, 180, 270]
    .map((a) => `<circle cx="100" cy="28" r="3" fill="${CYAN}" opacity="0.8" transform="rotate(${a} 100 100)"/>`)
    .join("")}
</svg>`;
  },
};

/* ── 3. Orbital ───────────────────────────────────────────────── */
const orbital: LogoCandidate = {
  id: "orbital",
  name: "Orbital",
  tag: { sv: "Kärna med elektroner", en: "Core with electrons" },
  note: {
    sv: "En tät kärna med tre elliptiska banor och elektroner som far runt. Renast av alla i 16–24 px.",
    en: "A dense core with three elliptical orbits and travelling electrons. The cleanest of the set at 16–24px.",
  },
  build: (size, tone) => {
    const p = plate(tone);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="BudAI Orbital">
  <defs>
    ${plateDefs(tone)}
    <radialGradient id="orbCore" cx="0.42" cy="0.36" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.4" stop-color="${CYAN}"/><stop offset="1" stop-color="${VIOLET}"/></radialGradient>
    <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
    <style>@keyframes orbSpin{to{transform:rotate(360deg)}}</style>
  </defs>
  <rect x="4" y="4" width="192" height="192" rx="46" fill="${p.fill}" stroke="${p.stroke}"/>
  <g filter="url(#orbGlow)" opacity="0.55"><circle cx="100" cy="100" r="34" fill="${CYAN}"/></g>
  <g style="transform-origin:100px 100px;animation:orbSpin 11s linear infinite"><ellipse cx="100" cy="100" rx="78" ry="40" fill="none" stroke="${CYAN}" stroke-width="1.8" opacity="0.7" transform="rotate(-24 100 100)"/><circle cx="180" cy="72" r="4.6" fill="#ffffff"/></g>
  <g style="transform-origin:100px 100px;animation:orbSpin 17s linear infinite reverse"><ellipse cx="100" cy="100" rx="76" ry="38" fill="none" stroke="${VIOLET}" stroke-width="1.6" opacity="0.62" transform="rotate(38 100 100)"/><circle cx="24" cy="132" r="4" fill="${VIOLET}"/></g>
  <g style="transform-origin:100px 100px;animation:orbSpin 26s linear infinite"><ellipse cx="100" cy="100" rx="52" ry="76" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.22" transform="rotate(8 100 100)"/><circle cx="100" cy="24" r="3" fill="${CYAN}"/></g>
  <circle cx="100" cy="100" r="26" fill="url(#orbCore)"/>
  <circle cx="92" cy="92" r="6" fill="#ffffff" opacity="0.9"/>
</svg>`;
  },
};

/* ── 4. Lattice ───────────────────────────────────────────────── */
const lattice: LogoCandidate = {
  id: "lattice",
  name: "Lattice",
  tag: { sv: "Nät som tänker", en: "A net that thinks" },
  note: {
    sv: "Nodnät med sex ekrar och en yttre ring — signalen vandrar utåt. Känns som ett neuralt nät utan att bli en klyscha.",
    en: "A node net with six spokes and an outer ring — the signal travels outward. A neural net without the cliché.",
  },
  build: (size, tone) => {
    const p = plate(tone);
    const inner = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return [100 + 56 * Math.cos(a), 100 + 56 * Math.sin(a)] as const;
    });
    const outer = Array.from({ length: 12 }, (_, i) => {
      const a = (Math.PI / 6) * i;
      return [100 + 84 * Math.cos(a), 100 + 84 * Math.sin(a)] as const;
    });
    const spokes = inner
      .map(
        ([x, y], i) =>
          `\n    <line x1="100" y1="100" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="url(#latG)" stroke-width="1.8" stroke-dasharray="62" stroke-dashoffset="62" opacity="0.9" style="animation:latDraw 2.8s ease-in-out ${(i * 0.18).toFixed(2)}s infinite"/>`
      )
      .join("");
    const links = outer
      .map(([x, y], i) => {
        const [ix, iy] = inner[i % 6];
        return `\n    <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${ix.toFixed(1)}" y2="${iy.toFixed(1)}" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1.2"/>`;
      })
      .join("");
    const nodes = [
      ...inner.map(([x, y], i) => ({ x, y, r: 4.6, fill: i % 2 ? CYAN : VIOLET, o: 1, d: i * 0.2 })),
      ...outer.map(([x, y], i) => ({ x, y, r: 3.2, fill: "#ffffff", o: 0.55, d: i * 0.12 })),
    ]
      .map(
        (n) =>
          `\n    <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r}" fill="${n.fill}" opacity="${n.o}" style="animation:latNode 2.6s ease-in-out ${n.d.toFixed(2)}s infinite"/>`
      )
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="BudAI Lattice">
  <defs>
    ${plateDefs(tone)}
    <linearGradient id="latG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${CYAN}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient>
    <radialGradient id="latCore" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${CYAN}"/></radialGradient>
    <filter id="latGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>@keyframes latDraw{0%{stroke-dashoffset:62;opacity:.1}40%{stroke-dashoffset:0;opacity:1}75%{stroke-dashoffset:0;opacity:.7}100%{stroke-dashoffset:-62;opacity:.05}}@keyframes latNode{0%,100%{opacity:.65}50%{opacity:1}}</style>
  </defs>
  <rect x="4" y="4" width="192" height="192" rx="46" fill="${p.fill}" stroke="${p.stroke}"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="#ffffff" stroke-opacity="0.07"/>
  <g>${links}</g>
  <g filter="url(#latGlow)">${spokes}${nodes}
  </g>
  <circle cx="100" cy="100" r="11.5" fill="url(#latCore)"/>
  <circle cx="100" cy="100" r="5" fill="#ffffff"/>
</svg>`;
  },
};

/* ── 5. Waveform ──────────────────────────────────────────────── */
const waveform: LogoCandidate = {
  id: "waveform",
  name: "Waveform",
  tag: { sv: "Rösten som vågform", en: "The voice as a waveform" },
  note: {
    sv: "Nio staplar som dansar inuti en mjuk platta — knyter an till röstläget. Lekfull och tydligt \"AI som lyssnar\".",
    en: "Nine bars dancing inside a soft squircle — ties straight into voice mode. Playful, obviously \"an AI that listens\".",
  },
  build: (size, tone) => {
    const p = plate(tone);
    const bars = Array.from({ length: 9 }, (_, i) => {
      const h = [26, 46, 68, 88, 104, 88, 66, 44, 26][i];
      const x = 40 + i * 14;
      return `\n    <rect x="${x}" y="${100 - h / 2}" width="8" height="${h}" rx="4" fill="url(#wfG)" style="transform-origin:${x + 4}px 100px;animation:wfBar ${1.1 + i * 0.14}s ease-in-out ${i * 0.06}s infinite"/>`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="BudAI Waveform">
  <defs>
    ${plateDefs(tone)}
    <linearGradient id="wfG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CYAN}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient>
    <filter id="wfGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>@keyframes wfBar{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1.05)}}</style>
  </defs>
  <rect x="4" y="4" width="192" height="192" rx="46" fill="${p.fill}" stroke="${p.stroke}"/>
  <g filter="url(#wfGlow)">${bars}
  </g>
  <circle cx="100" cy="100" r="76" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.08"/>
</svg>`;
  },
};

/* ── 6. Monogram ──────────────────────────────────────────────── */
const monogram: LogoCandidate = {
  id: "monogram",
  name: "Monogram B",
  tag: { sv: "Bokstaven som märke", en: "The letter as the mark" },
  note: {
    sv: "Ett geometriskt B byggt av två bågar med en krets som band — mest \"varumärke\", minst teknik.",
    en: "A geometric B built from two arcs with a circuit as the spine — the most brand-like, least techy option.",
  },
  build: (size, tone) => {
    const p = plate(tone);
    const stroke = tone === "dark" ? "#ffffff" : INK;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="BudAI Monogram">
  <defs>
    ${plateDefs(tone)}
    <linearGradient id="mgG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${CYAN}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient>
    <style>@keyframes mgDash{to{stroke-dashoffset:-320}}@keyframes mgOrbit{to{transform:rotate(360deg)}}</style>
  </defs>
  <rect x="4" y="4" width="192" height="192" rx="46" fill="${p.fill}" stroke="${p.stroke}"/>
  <g transform="translate(-13 0)">
  <path d="M76 44v112" stroke="${stroke}" stroke-width="12" stroke-linecap="round" opacity="0.95"/>
  <path d="M76 44h30a28 28 0 0 1 0 56H76" fill="none" stroke="url(#mgG)" stroke-width="12" stroke-linecap="round"/>
  <path d="M76 100h36a28 28 0 0 1 0 56H76" fill="none" stroke="url(#mgG)" stroke-width="12" stroke-linecap="round" opacity="0.82"/>
  <path d="M76 44v112" stroke="url(#mgG)" stroke-width="3" stroke-dasharray="10 8" style="animation:mgDash 6s linear infinite"/>
  <g style="transform-origin:100px 100px;animation:mgOrbit 9s linear infinite">
    <circle cx="100" cy="24" r="4.6" fill="${CYAN}"/>
  </g>
  <circle cx="162" cy="100" r="3.4" fill="${VIOLET}"/>
  </g>
</svg>`;
  },
};

export const LOGO_CANDIDATES: LogoCandidate[] = [
  bMark,
  prismV3,
  aperture,
  orbital,
  lattice,
  waveform,
  monogram,
];
