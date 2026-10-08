import { ImageResponse } from "next/og";

/**
 * iOS home-screen icon. Apple ignores SVG touch icons, so this is generated as a
 * real PNG (180×180) at build/request time — keeps the install experience premium
 * without adding a binary asset to the repo.
 */
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "BudAI";

export default function AppleIcon() {
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
            width: 168,
            height: 168,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 28% 24%, rgba(0,229,255,0.75), rgba(0,229,255,0) 62%), radial-gradient(circle at 74% 80%, rgba(124,92,255,0.8), rgba(124,92,255,0) 64%)",
            filter: "blur(10px)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 122,
            height: 122,
            borderRadius: 40,
            border: "2px solid rgba(255,255,255,0.16)",
            background: "rgba(7,7,14,0.72)",
            color: "#ffffff",
            fontSize: 74,
            fontWeight: 700,
            letterSpacing: -4,
          }}
        >
          B
        </div>
      </div>
    ),
    size
  );
}
