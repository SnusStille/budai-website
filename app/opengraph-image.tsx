import { ImageResponse } from "next/og";

/* Generated social card — drawn from the same tokens as the site so it can't drift. */

export const runtime = "edge";
export const alt = "BudAI — an AI work assistant for Swedish and English, in early preview";
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
              <svg width="62" height="62" viewBox="0 0 48 48">
                {/* BudAI mark — one unbroken line that becomes a B and opens like a bud */}
                <defs>
                  <linearGradient id="ogB" x1="6" y1="44" x2="42" y2="4" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#22d3ee" />
                    <stop offset="0.52" stopColor="#818cf8" />
                    <stop offset="1" stopColor="#f0abfc" />
                  </linearGradient>
                </defs>
                <path
                  d="M16 40 V10 C23.2 8 29 11.2 29.8 16.4 C30.6 21.6 26.4 24.6 20 25 C28.2 25.4 33 29 33 33.8 C33 38 28 40.2 22.4 40"
                  fill="none"
                  stroke="url(#ogB)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="10" r="2.1" fill="#e0e7ff" />
                <circle cx="20" cy="25" r="1.75" fill="#e0e7ff" />
                <circle cx="22.4" cy="40" r="1.75" fill="#e0e7ff" />
                <circle cx="16" cy="40" r="1.75" fill="#e0e7ff" />
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
            Ask BudAI anything.
          </span>
          <span style={{ fontSize: 50, fontWeight: 700, color: "#87e9df", lineHeight: 1.06, letterSpacing: -2 }}>
            An AI work assistant for Swedish and English.
          </span>
          <span style={{ fontSize: 26, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            Early preview — the Playground is home, no account needed.
          </span>
        </div>

        {/* footer chips */}
        <div style={{ display: "flex", gap: 14 }}>
          {["Open Playground", "Swedish + English", "No account needed"].map((chip) => (
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
