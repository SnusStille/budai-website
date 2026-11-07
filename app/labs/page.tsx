import type { Metadata } from "next";
import { headers } from "next/headers";
import StilledevLabs from "@/components/sections/StilledevLabs";
import "./labs.css";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const swedishPath = h.get("x-budai-path") === "/sv/labs";
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
  return {
    title: { absolute: "Labs" },
    description: sv ? "Labs — digitala produkter och idéer av Oliver Stille." : "Labs — digital products and ideas by Oliver Stille.",
    alternates: { canonical: swedishPath ? "/sv/labs" : "/labs", languages: { en: `${base}/labs`, sv: `${base}/sv/labs`, "x-default": `${base}/labs` } },
    openGraph: { title: "Labs", description: sv ? "Digitala produkter och idéer av Oliver Stille." : "Digital products and ideas by Oliver Stille." },
    twitter: { card: "summary_large_image", title: "Labs", description: sv ? "Digitala produkter och idéer av Oliver Stille." : "Digital products and ideas by Oliver Stille.", images: ["/og.png"] },
  };
}

export default function LabsPage() { return <StilledevLabs />; }
