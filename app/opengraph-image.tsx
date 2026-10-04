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
          padding: "58px 72px",
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
              <svg width="58" height="58" viewBox="0 0 64 64">
                {/* BudAI B-mark — one letterform, two arcs, one node */}
                <defs>
                  <linearGradient id="ogB" x1="14" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#8ef0e2" />
                    <stop offset="0.46" stopColor="#3ee0cd" />
                    <stop offset="1" stopColor="#9a86ff" />
                  </linearGradient>
                </defs>
                <ellipse cx="33" cy="32" rx="26" ry="24" fill="none" stroke="url(#ogB)" strokeWidth="0.9" strokeDasharray="34 118" opacity="0.55" />
                <path d="M21 13 V51" stroke="#eafffc" strokeWidth="6.2" strokeLinecap="round" fill="none" />
                <path d="M21 13 H32.5 a11.5 11.5 0 0 1 0 23 H21" stroke="url(#ogB)" strokeWidth="6.2" strokeLinecap="round" fill="none" />
                <path d="M21 32 H32.5 a11.5 11.5 0 0 1 0 23 H21" stroke="url(#ogB)" strokeWidth="6.2" strokeLinecap="round" opacity="0.9" fill="none" />
                <circle cx="33" cy="32" r="3.2" fill="#e8fffd" />
                <circle cx="59" cy="26" r="3" fill="#8ef0e2" />
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
              padding: "10px 20px",
              fontSize: 23,
              fontWeight: 700,
              color: "#f1d98f",
            }}
          >
            10% off at launch
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 66, fontWeight: 700, color: "#ffffff", lineHeight: 1.06, letterSpacing: -2 }}>
            Try BudAI right now.
          </span>
          <span style={{ fontSize: 50, fontWeight: 700, color: "#87e9df", lineHeight: 1.06, letterSpacing: -2 }}>
            An AI work assistant for Swedish and English.
          </span>
          <span style={{ fontSize: 26, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            Early preview — the Playground is open, no account needed.
          </span>
        </div>

        {/* footer chips */}
        <div style={{ display: "flex", gap: 14 }}>
          {["Live Playground", "Swedish + English", "No account needed"].map((chip) => (
            <span
              key={chip}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                padding: "10px 18px",
                fontSize: 20,
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
