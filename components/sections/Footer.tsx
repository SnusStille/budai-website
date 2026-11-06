"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, MessageSquare } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";
import BudAIWordmark from "@/components/ui/BudAIWordmark";
import StatusPill from "@/components/ui/StatusPill";
import { openCookieSettings } from "@/lib/consent";

export default function Footer() {
  const { lang, t } = useLang();
  const sv = lang === "sv";
  const groups = [
    {
      title: sv ? "Produkt" : "Product",
      links: [
        { label: "BudAI", href: "/budai" },
        { label: "Playground", href: "/#playground" },
        { label: sv ? "Förmågor" : "Capabilities", href: "/#capabilities" },
        { label: sv ? "Paket" : "Plans", href: "/#capabilities" },
      ],
    },
    {
      title: sv ? "Resurser" : "Resources",
      links: [
        { label: sv ? "Kunskapscenter" : "Knowledge Center", href: "/knowledge" },
        { label: "Roadmap", href: "/roadmap" },
        { label: "What's new", href: "/changelog" },
        { label: sv ? "Skicka feedback" : "Send feedback", href: "/feedback" },
      ],
    },
    {
      title: sv ? "Företag" : "Company",
      links: [
        { label: sv ? "Om Stilledev" : "About Stilledev", href: "/about" },
        { label: "Projects / Labs", href: "/labs" },
        { label: sv ? "Kontakt" : "Contact", href: "mailto:Stilleinc@hotmail.com" },
        { label: "GitHub", href: "https://github.com/SnusStille/budai-website", external: true },
      ],
    },
  ];
  const socials = [
    { label: "GitHub", href: "https://github.com/SnusStille", icon: Github },
    { label: "Discord", href: "https://discord.com/users/353944097301594123", icon: MessageSquare },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/", icon: Linkedin },
    { label: "Email", href: "mailto:Stilleinc@hotmail.com", icon: Mail },
  ];

  return (
    <footer id="continuation" className="v2-footer">
      <div className="v2-container">
        <div className="v2-footer-cta">
          <div><p className="v2-kicker">{sv ? "NÄSTA IDÉ BÖRJAR HÄR" : "YOUR NEXT IDEA STARTS HERE"}</p><h2>{sv ? "Fortsätt samtalet." : "Continue the conversation."}</h2><p>{sv ? "Prova den riktiga BudAI Playgrounden, eller hör av dig om du vill bygga något tillsammans med Stilledev." : "Try the real BudAI Playground, or get in touch if you want to build something with Stilledev."}</p></div>
          <div className="v2-footer-cta-actions"><Link href="/#playground" className="v2-button v2-button-primary">{sv ? "Tillbaka till Playground" : "Back to Playground"}<ArrowRight size={16} /></Link><a href="mailto:Stilleinc@hotmail.com" className="v2-button v2-button-secondary">{sv ? "Kontakta Stilledev" : "Contact Stilledev"}<ArrowUpRight size={15} /></a></div>
        </div>

        <div className="v2-footer-main">
          <div className="v2-footer-brand">
            <Link href="/" className="v2-footer-company" aria-label="Stilledev home"><StilledevMark size={29} /><span>STILLEDEV</span></Link>
            <p>{sv ? "Oberoende mjukvaru- och AI-utveckling i Sverige. Vi bygger intelligenta digitala upplevelser med tydlighet, omsorg och långsiktig ambition." : "Independent software & AI development in Sweden. Building intelligent digital experiences with clarity, care and long-term ambition."}</p>
            <Link href="/budai" className="v2-footer-product"><BudAILogo size="xs" /><BudAIWordmark /><span>{sv ? "Huvudprodukt" : "Primary product"}</span><ArrowUpRight size={13} /></Link>
            <div className="v2-socials">{socials.map((social) => <a key={social.label} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined} aria-label={social.label}><social.icon size={16} /></a>)}</div>
          </div>
          <div className="v2-footer-links">{groups.map((group) => <div key={group.title}><h3>{group.title}</h3><ul>{group.links.map((link) => <li key={link.label}>{link.external ? <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={11} /></a> : link.href.startsWith("mailto:") ? <a href={link.href}>{link.label}</a> : <Link href={link.href}>{link.label}</Link>}</li>)}</ul></div>)}</div>
        </div>

        <div className="v2-footer-legal">
          <div><Link href="/legal/privacy">{sv ? "Integritet" : "Privacy Policy"}</Link><Link href="/legal/terms">{sv ? "Villkor" : "Terms of Service"}</Link><Link href="/legal/cookies">Cookies</Link><Link href="/legal/gdpr">GDPR</Link><Link href="/legal/data">{sv ? "Datahantering" : "How your data is handled"}</Link></div>
          <StatusPill />
        </div>
        <div className="v2-footer-bottom"><p>{t.footer.rights}</p><button type="button" onClick={openCookieSettings}>{sv ? "Cookieinställningar" : "Cookie settings"}</button><p>{sv ? "Designad och byggd i Sverige" : "Designed & built in Sweden"}<span> · </span>2026</p></div>
      </div>
    </footer>
  );
}
