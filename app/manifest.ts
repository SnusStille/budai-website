import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BudAI",
    short_name: "BudAI",
    description: "Your new ChatGPT, in Swedish and English.",
    start_url: "/",
    display: "standalone",
    background_color: "#02050c",
    theme_color: "#02050c",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
