import sharp from "sharp";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="field" cx="82%" cy="18%" r="85%"><stop offset="0" stop-color="#10212b"/><stop offset=".62" stop-color="#080d12"/><stop offset="1" stop-color="#05080c"/></radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9bd9e5"/><stop offset="1" stop-color="#b1b9e5"/></linearGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#b5d3de" stroke-opacity=".035"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#field)"/><rect width="1200" height="630" fill="url(#grid)"/>
  <path d="M90 106H1110" stroke="#b5d3de" stroke-opacity=".13"/>
  <text x="90" y="75" fill="#8d9ba5" font-family="monospace" font-size="13" letter-spacing="3">STILLEDEV / SWEDEN</text>
  <text x="1040" y="75" fill="#8d9ba5" font-family="monospace" font-size="13" letter-spacing="3">SV + EN</text>
  <g transform="translate(90 218) scale(4.5)">
    <circle cx="16" cy="16" r="14.5" stroke="url(#mark)" stroke-width="1.5" fill="#9bd9e5" fill-opacity=".035"/>
    <path d="M21.5 11.2c-.6-1.8-2.2-2.9-4.4-2.9-2.8 0-4.6 1.5-4.6 3.5 0 1.9 1.3 2.9 4.2 3.5l1.4.3c2.1.5 3.1 1.2 3.1 2.6 0 1.6-1.5 2.7-3.7 2.7-2.1 0-3.6-1-4.3-2.7" stroke="url(#mark)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  </g>
  <text x="285" y="289" fill="#edf3f5" font-family="Arial, sans-serif" font-size="76" font-weight="500" letter-spacing="-3">Stilledev</text>
  <text x="290" y="347" fill="#afc8d2" font-family="Arial, sans-serif" font-size="29" letter-spacing="-.5">Independent software &amp; AI development.</text>
  <path d="M90 450H1110" stroke="#b5d3de" stroke-opacity=".13"/>
  <text x="90" y="520" fill="#edf3f5" font-family="Arial, sans-serif" font-size="38" font-weight="600">BudAI</text>
  <text x="222" y="518" fill="#8d9ba5" font-family="Arial, sans-serif" font-size="22">Primary product · Intelligent AI workspace</text>
  <circle cx="94" cy="568" r="3" fill="#8bd7bd"/>
  <text x="108" y="573" fill="#5f6f7b" font-family="monospace" font-size="11" letter-spacing="2">OPEN DEVELOPER PREVIEW</text>
  <text x="957" y="573" fill="#5f6f7b" font-family="monospace" font-size="11" letter-spacing="2">STILLEDEV.SE</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/og.png");
console.log("Generated public/og.png (1200 × 630)");
