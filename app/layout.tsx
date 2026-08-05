"use client";

import { useState } from "react";
import "./globals.css";
import LoadingScreen from "@/components/effects/LoadingScreen";
import VercelAnalytics from "@/components/VercelAnalytics";
import { LanguageProvider } from "@/context/LanguageContext";
import CookieBanner from "@/components/ui/CookieBanner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <html lang="sv" className="font-sans">
      <head>
        <title>BudAI — Din intelligenta AI-assistent</title>
        <meta name="description" content="BudAI är en avancerad AI-plattform som hjälper både privatpersoner och företag att arbeta smartare, automatisera uppgifter och få hjälp i vardagen." />
        <meta name="keywords" content="AI, artificiell intelligens, Sverige, automatisering, digital assistent, BudAI, personlig AI" />
        <meta name="author" content="Stilledev" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BudAI — Din intelligenta AI-assistent" />
        <meta property="og:description" content="Avancerad AI för alla. Developer Preview." />
        <meta property="og:site_name" content="BudAI" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate" hrefLang="sv" href="https://www.stilledev.se" />
        <link rel="alternate" hrefLang="en" href="https://www.stilledev.se" />
      </head>
      <body className="antialiased noise-overlay">
        <LanguageProvider>
          <LoadingScreen onComplete={() => setLoaded(true)} />
          <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
            {children}
          </div>
          <CookieBanner />
          <VercelAnalytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
