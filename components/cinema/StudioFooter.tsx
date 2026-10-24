"use client";

import StockholmClock from "@/components/ui/StockholmClock";
import { useLang } from "@/components/ui/LanguageContext";
import { scrollToScene } from "@/lib/cinema/scroll";

/**
 * Studio footer: every route that must survive the film, in plain text, at the bottom where
 * people look for it. Legal pages and the BudAI product site are all real, existing routes.
 */
export default function StudioFooter() {
  const { lang } = useLang();
  const sv = lang === "sv";

  const cols: { title: string; titleSv: string; items: { label: string; href: string; external?: boolean }[] }[] = [
    {
      title: "Product",
      titleSv: "Produkt",
      items: [
        { label: "BudAI", href: "/budai" },
        { label: sv ? "AI Playground" : "AI Playground", href: "/budai#playground" },
        { label: sv ? "Förmågor" : "Capabilities", href: "/budai#capabilities" },
        { label: sv ? "Väntelista" : "Waitlist", href: "#waitlist" },
        { label: sv ? "Vägkarta" : "Roadmap", href: "/budai#roadmap" },
      ],
    },
    {
      title: "Studio",
      titleSv: "Studio",
      items: [
        { label: sv ? "Intelligens" : "Intelligence", href: "#intelligence" },
        { label: sv ? "Konstruktion" : "Construction", href: "#construction" },
        { label: sv ? "System" : "Systems", href: "#systems" },
        { label: sv ? "Arbeten" : "Selected work", href: "#works" },
        { label: "Stilledev på GitHub", href: "https://github.com/SnusStille", external: true },
      ],
    },
    {
      title: "Legal",
      titleSv: "Juridik",
      items: [
        { label: sv ? "Integritetspolicy" : "Privacy policy", href: "/legal/privacy" },
        { label: sv ? "Användarvillkor" : "Terms", href: "/legal/terms" },
        { label: sv ? "Cookiepolicy" : "Cookies", href: "/legal/cookies" },
        { label: "GDPR", href: "/legal/gdpr" },
      ],
    },
  ];

  return (
    <footer className="st-footer">
      <div className="st-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="st-footer__word">STILLEDEV</p>
            <p className="st-body mt-4 max-w-[38ch]">
              {sv
                ? "Mjukvara, regisserad. AI-produkter, gränssnitt och automatisering från Stockholm — byggd, levererad och underhållen av samma händer."
                : "Software, directed. AI products, interfaces and automation from Stockholm — built, shipped and maintained by the same hands."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <StockholmClock />
              <a className="st-footer__link" href="mailto:Stilleinc@hotmail.com">
                Stilleinc@hotmail.com
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="st-eyebrow">{sv ? c.titleSv : c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((it) => (
                    <li key={it.label}>
                      <a
                        href={it.href}
                        {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="st-footer__link"
                      >
                        {it.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="st-footer__bottom">
          <p className="st-mono">
            © {new Date().getFullYear()} Stilledev · BudAI · Stockholm, Sweden
          </p>
          <p className="st-mono">
            {sv ? "Byggd på " : "Built on "}
            <a className="st-footer__link" href="https://github.com/SnusStille/budai-website" target="_blank" rel="noopener noreferrer">
              Next.js + three.js
            </a>
            {" · "}
            <button type="button" className="st-footer__link" onClick={() => scrollToScene("arrival")}>
              {sv ? "Till början ↑" : "Back to the top ↑"}
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}
