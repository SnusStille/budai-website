import { ImageResponse } from "next/og";

export const alt = "BudAI — try the AI work assistant live";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card, drawn from the same tokens as the site (dark surface, cyan →
 * purple accent, mono label). Code-generated so it can never go stale the way
 * a hand-exported PNG does.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#020205",
          backgroundImage:
            "radial-gradient(60% 55% at 12% 8%, rgba(0,229,255,0.20), rgba(0,229,255,0) 70%), radial-gradient(55% 50% at 92% 92%, rgba(185,103,255,0.20), rgba(185,103,255,0) 70%)",
          color: "#ffffff",
        }}
      >
        {/* top row: wordmark + preview tag */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #00e5ff, #b967ff)",
                color: "#04121a",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              B
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
              Bud<span style={{ color: "#00e5ff" }}>AI</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px dashed rgba(255,215,0,0.4)",
              background: "rgba(255,215,0,0.06)",
              color: "rgba(255,215,0,0.9)",
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            developer preview
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            Test BudAI live in your browser
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.62)", maxWidth: 900 }}>
            The AI work assistant built in Sweden. Chat, draft, analyze and automate — in Swedish and
            English.
          </div>
        </div>

        {/* bottom row: facts */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "rgba(255,255,255,0.5)" }}>
          <div style={{ display: "flex" }}>No account needed</div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.22)" }}>·</div>
          <div style={{ display: "flex" }}>Real model, real limits</div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.22)" }}>·</div>
          <div style={{ display: "flex" }}>stilledev.se</div>
        </div>
      </div>
    ),
    size
  );
}
