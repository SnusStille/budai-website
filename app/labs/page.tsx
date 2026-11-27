import type { Metadata } from "next";
import { headers } from "next/headers";
import "./labs.css";
import LabsShareButton from "@/components/sections/LabsShareButton";
import BackToBudAI from "@/components/ui/BackToBudAI";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const path = h.get("x-budai-path") === "/sv/labs" ? "/sv/labs" : "/labs";
  const canonical = `${siteUrl}${path}`;
  const title = sv ? "Stilledev Labs — under utveckling" : "Stilledev Labs — under development";
  const description = sv ? "Stilledev Labs är under utveckling. Något nytt tar form." : "Stilledev Labs is under development. Something new is taking shape.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: { en: `${siteUrl}/labs`, sv: `${siteUrl}/sv/labs`, "x-default": `${siteUrl}/labs` } },
    robots: { index: false, follow: true },
    openGraph: { type: "website", url: canonical, siteName: "Stilledev", title, description, images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stilledev" }], locale: sv ? "sv_SE" : "en_US" },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default async function LabsPage() {
  const sv = (await headers()).get("x-budai-lang") === "sv";
  return (
    <main id="main" className="labs-hold-page">
      <div className="labs-hold-grid" aria-hidden="true" />
      <header className="labs-hold-header">
        <BackToBudAI href={sv ? "/sv" : "/"} lang={sv ? "sv" : "en"} />
        <nav aria-label={sv ? "Välj språk" : "Choose language"}>
          <a href="/labs" aria-current={!sv ? "page" : undefined}>EN</a>
          <a href="/sv/labs" aria-current={sv ? "page" : undefined}>SV</a>
        </nav>
      </header>
      <section className="labs-hold-message" aria-labelledby="labs-hold-title">
        <p className="labs-hold-eyebrow">{sv ? "STILLEDEV LABS" : "STILLEDEV LABS"}</p>
        <h1 id="labs-hold-title">STILLEDEV<br /><span>LABS</span></h1>
        <p className="labs-hold-status">{sv ? "UNDER UTVECKLING" : "UNDER DEVELOPMENT"}</p>
        <p className="labs-hold-line">{sv ? "Något nytt tar form." : "Something new is taking shape."}</p>
        <LabsShareButton lang={sv ? "sv" : "en"} />
      </section>
      <span className="labs-hold-index" aria-hidden="true">S / L — 01</span>
    </main>
  );
}
