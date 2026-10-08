import { ImageResponse } from "next/og";

/**
 * Shared BudAI app-icon artwork. Drawn at 180 units and scaled, so the same
 * design powers the Apple touch icon and the PWA icons. The glyph sits inside
 * the central 80% so "maskable" crops on Android never clip it.
 */
export function renderAppIcon(px: number) {
  const k = px / 180;
  const s = (n: number) => Math.round(n * k);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#020205",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: s(168),
            height: s(168),
            borderRadius: 999,
            background:
              "radial-gradient(circle at 28% 24%, rgba(0,229,255,0.75), rgba(0,229,255,0) 62%), radial-gradient(circle at 74% 80%, rgba(124,92,255,0.8), rgba(124,92,255,0) 64%)",
            filter: `blur(${s(10)}px)`,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: s(122),
            height: s(122),
            borderRadius: s(40),
            border: `${Math.max(1, s(2))}px solid rgba(255,255,255,0.16)`,
            background: "rgba(7,7,14,0.72)",
            color: "#ffffff",
            fontSize: s(74),
            fontWeight: 700,
            letterSpacing: s(-4),
          }}
        >
          B
        </div>
      </div>
    ),
    { width: px, height: px }
  );
}
