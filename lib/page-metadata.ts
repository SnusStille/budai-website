import type { Metadata } from "next";
import { headers } from "next/headers";

export async function localizedMetadata(path: string, title: { en: string; sv: string }, description: { en: string; sv: string }): Promise<Metadata> {
  const sv = (await headers()).get("x-budai-lang") === "sv";
  const localizedTitle = sv ? title.sv : title.en;
  const localizedDescription = sv ? description.sv : description.en;
  return {
    title: localizedTitle,
    description: localizedDescription,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: path,
      title: localizedTitle,
      description: localizedDescription,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: localizedTitle }],
    },
    twitter: { card: "summary_large_image", title: localizedTitle, description: localizedDescription, images: ["/og.png"] },
  };
}
