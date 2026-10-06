import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BudAI",
    short_name: "BudAI",
    description: "Your new ChatGPT, in Swedish and English.",
    start_url: "/",
    display: "standalone",
    background_color: "#020205",
    theme_color: "#020205",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
