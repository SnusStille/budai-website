import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BudAI — AI work companion for Sweden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function SignalMark() {
  return (
    <svg width="200" height="200" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="signal" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00e5ff" />
          <stop offset="1" stopColor="#7c5cff" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12.6" stroke="url(#signal)" strokeWidth=".85" opacity=".34" />
      <circle cx="16" cy="3.4" r="1.1" fill="#00e5ff" />
      <path d="M16 3.4a12.6 12.6 0 0 1 8.9 3.7" stroke="url(#signal)" strokeWidth="1.15" strokeLinecap="round" opacity=".8" />
      <path d="M8.5 16h4M19.5 16h4M12.5 12l3.5 4 3.5-4M12.5 20l3.5-4 3.5 4" stroke="url(#signal)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
      <circle cx="16" cy="16" r="3.2" fill="url(#signal)" />
      <circle cx="16" cy="16" r="1.15" fill="#fff" opacity=".94" />
    </svg>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#020205", color: "white", fontFamily: "Arial, sans-serif", padding: "0 100px" }}>
        <div style={{ width: 270, height: 270, borderRadius: 135, display: "flex", alignItems: "center", justifyContent: "center", background: "#07070e", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 0 90px rgba(0,229,255,.12)" }}>
          <SignalMark />
        </div>
        <div style={{ width: 1, height: 260, background: "rgba(255,255,255,.14)", margin: "0 58px" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, lineHeight: 1, fontWeight: 700, letterSpacing: -4 }}>
            <span>Bud</span><span style={{ color: "#00e5ff" }}>AI</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 29, color: "#d9e3ef" }}>An AI work companion for Sweden</div>
          <div style={{ marginTop: 14, fontSize: 21, color: "#8c98a8" }}>Write, plan and think — in Swedish and English.</div>
          <div style={{ marginTop: 70, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: "#00e5ff" }}>STILLEDEV.SE</div>
        </div>
      </div>
    ),
    size
  );
}
