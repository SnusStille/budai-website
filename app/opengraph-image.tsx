import { ImageResponse } from "next/og";

/* Generated social card — drawn from the same tokens as the site so it can't drift. */

export const runtime = "edge";
export const alt = "BudAI — AI work assistant in early preview, built in Sweden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070a0f",
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(135,233,223,0.20), transparent 55%), radial-gradient(circle at 92% 100%, rgba(185,168,246,0.22), transparent 58%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div
              style={{
                width: 76,
                height: 76,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                border: "1px solid rgba(135,233,223,0.45)",
                background: "rgba(135,233,223,0.07)",
              }}
            >
              <svg width="52" height="52" viewBox="0 0 64 64">
                <path
                  d="M32 5.2 L55.4 18.6 V45.4 L32 58.8 L8.6 45.4 V18.6 Z"
                  fill="rgba(135,233,223,0.06)"
                  stroke="#87e9df"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M45.2 32 L38.6 43.4 H25.4 L18.8 32 L25.4 20.6 H38.6 Z"
                  fill="none"
                  stroke="#b9a8f6"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="32" r="7.4" fill="#d9fffa" />
                <circle cx="29.2" cy="29.4" r="2.3" fill="#ffffff" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 700, color: "#ffffff", letterSpacing: -1 }}>
                Bud<span style={{ color: "#87e9df" }}>AI</span>
              </span>
              <span style={{ fontSize: 20, color: "rgba(255,255,255,0.45)" }}>by Stilledev · Sweden</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 999,
              border: "1px solid rgba(241,217,143,0.4)",
              background: "rgba(241,217,143,0.1)",
              padding: "12px 22px",
              fontSize: 24,
              fontWeight: 700,
              color: "#f1d98f",
            }}
          >
            10% founding access
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 74, fontWeight: 700, color: "#ffffff", lineHeight: 1.06, letterSpacing: -2 }}>
            Try the Playground.
          </span>
          <span style={{ fontSize: 60, fontWeight: 700, color: "#87e9df", lineHeight: 1.06, letterSpacing: -2 }}>
            Streaming answers, six personas, memory.
          </span>
          <span style={{ fontSize: 28, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
            An AI work assistant for Swedish and English workdays — early preview.
          </span>
        </div>

        {/* footer chips */}
        <div style={{ display: "flex", gap: 14 }}>
          {["Live streaming replies", "Voice · image · files", "⌘K command palette", "Works without an account"].map((chip) => (
            <span
              key={chip}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                padding: "12px 20px",
                fontSize: 22,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    ),
    size
  );
}
