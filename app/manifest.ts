import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BudAI — AI work assistant",
    short_name: "BudAI",
    description:
      "An AI work assistant in early preview: streaming answers, personas, memory and voice mode — in Swedish and English.",
    start_url: "/",
    display: "standalone",
    background_color: "#070a0f",
    theme_color: "#080a0f",
    orientation: "portrait-primary",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/opengraph-image", sizes: "1200x630", type: "image/png" },
    ],
    categories: ["productivity", "business", "utilities"],
    lang: "sv-SE",
  };
}
