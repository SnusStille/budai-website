"use client";

import { useState } from "react";
import "./globals.css";
import LoadingScreen from "@/components/effects/LoadingScreen";
import VercelAnalytics from "@/components/VercelAnalytics";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <html lang="sv" className="font-sans">
      <head>
        <title>BudAI — The Future of Digital Work for Swedish Companies</title>
        <meta name="description" content="BudAI is an advanced AI platform that helps Swedish companies save time, automate tasks, improve workflows, and make businesses more efficient. Developer Preview by Stilledev." />
        <meta name="keywords" content="AI, artificial intelligence, Sweden, business automation, digital assistant, Stilledev, BudAI, enterprise AI" />
        <meta name="author" content="Stilledev" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BudAI — The Future of Digital Work" />
        <meta property="og:description" content="Advanced AI for Swedish companies. Developer Preview." />
        <meta property="og:site_name" content="BudAI" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BudAI — The Future of Digital Work" />
        <meta name="twitter:description" content="Advanced AI for Swedish companies. Developer Preview." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
          <body className="antialiased noise-overlay">
        <LoadingScreen onComplete={() => setLoaded(true)} />
        <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
          {children}
        </div>

        <VercelAnalytics />
      </body>
    </html>
  );
}