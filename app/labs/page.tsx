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
    ? "Stilledev Labs — Från idé till färdig digital lösning"
    : "Stilledev Labs — From idea to finished digital product";
  const description = sv
    ? "Jag heter Oliver Stille och bygger hemsidor, webbappar, FiveM/Roblox-script och skräddarsydda digitala lösningar. Börja med att beskriv din idé – BudAI hjälper oss förstå omfattningen, sedan hör jag av mig personligen."
    : "I'm Oliver Stille and I build websites, web apps, FiveM/Roblox scripts, and custom digital solutions. Start by describing your idea — BudAI helps us understand the scope, then I'll get in touch personally.";
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
  // Read session (middleware ensures it exists for /labs routes)
  await getSession();

  return <LabsChat />;
}
