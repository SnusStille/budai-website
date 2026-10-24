import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BudAI — AI work assistant for Sweden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#020205", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 700, color: "#00e5ff", letterSpacing: -8 }}>{"</>"}</div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, marginTop: 10 }}>BudAI</div>
        <div style={{ display: "flex", fontSize: 34, color: "#9aa4b2", marginTop: 18 }}>AI work assistant for Sweden · SV + EN</div>
      </div>
    ),
    size
  );
}
