import type { Metadata } from "next";
import { headers } from "next/headers";
import LabsChat from "@/components/labs/LabsChat";
import { getSession } from "@/lib/labs/session";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const path = h.get("x-budai-path") === "/sv/labs" ? "/sv/labs" : "/labs";
  const canonical = `${siteUrl}${path}`;
  const title = sv
    ? "Stilledev Labs — Berätta om din idé"
    : "Stilledev Labs — Share your idea";
  const description = sv
    ? "Beskriv din idé för BudAI. Få ärlig feedback, smarta förslag och en tydlig väg framåt – tillsammans med Oliver Stille."
    : "Describe your idea to BudAI. Get honest feedback, smart suggestions, and a clear path forward – together with Oliver Stille.";
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true },
    alternates: {
      canonical,
      languages: { en: `${siteUrl}/labs`, sv: `${siteUrl}/sv/labs`, "x-default": `${siteUrl}/labs` },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Stilledev",
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stilledev Labs" }],
      locale: sv ? "sv_SE" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default async function LabsPage() {
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const lang = sv ? "sv" : "en";

  // Read session (middleware ensures it exists for /labs routes)
  await getSession();

  return <LabsChat lang={lang} />;
}
