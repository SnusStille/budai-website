"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import LoadingScreen from "@/components/effects/LoadingScreen";
import VercelAnalytics from "@/components/VercelAnalytics";
import { LangProvider } from "@/components/ui/LanguageContext";
import CommandPalette from "@/components/ui/CommandPalette";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [lang, setLang] = useState("sv");

  useEffect(() => {
    const saved = localStorage.getItem("budai-lang") as "sv" | "en";
    if (saved) setLang(saved);
  }, []);

  const title = lang === "sv" 
    ? "BudAI — Framtiden för Digitalt Arbete för Svenska Företag och Privatpersoner"
    : "BudAI — The Future of Digital Work for Swedish Companies and Individuals";

  const description = lang === "sv"
    ? "BudAI är en avancerad AI-plattform som hjälper svenska företag och privatpersoner att spara tid, automatisera uppgifter, förbättra arbetsflöden och göra verksamheter mer effektiva. Utvecklarförhandsvisning av Stilledev."
    : "BudAI is an advanced AI platform that helps Swedish companies and individuals save time, automate tasks, improve workflows, and get more done. Developer Preview by Stilledev.";

  return (
    <html lang={lang} className="font-sans">
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="AI, artificial intelligence, Sweden, business automation, digital assistant, Stilledev, BudAI, enterprise AI" />
        <meta name="author" content="Stilledev" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="BudAI" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased noise-overlay">
        <LangProvider>
          <LoadingScreen onComplete={() => setLoaded(true)} />
          <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
            {children}
          </div>
          <CommandPalette />
        </LangProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
