import type { Metadata } from "next";
import { headers } from "next/headers";
import StilledevLabs from "@/components/sections/StilledevLabs";
import "./labs.css";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const path = h.get("x-budai-path") || "/labs";
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
  const canonicalPath = path === "/sv/labs" ? path : "/labs";
  const canonical = `${base}${canonicalPath}`;
  const title = sv ? "Stilledev Labs – AI och digital utveckling" : "Stilledev Labs – AI & Digital Development";
  const description = sv
    ? "Utforska Stilledev Labs, en experimentyta för digitala produkter och praktisk AI. Upptäck den publika produkten BudAI och läs om grundaren Oliver Stille."
    : "Explore Stilledev Labs, an experimental space for digital products and practical AI. Discover the public BudAI product and read about founder Oliver Stille.";
  return {
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        en: `${base}/labs`,
        sv: `${base}/sv/labs`,
        "x-default": `${base}/labs`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Stilledev",
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stilledev Labs and BudAI" }],
      locale: sv ? "sv_SE" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default function LabsPage() { return <StilledevLabs />; }
