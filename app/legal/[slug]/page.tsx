"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, FileText, Cookie, Scale } from "lucide-react";
import Link from "next/link";

const content: Record<string, { title: string; icon: React.ElementType; paragraphs: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    icon: Shield,
    paragraphs: [
      "BudAI values your privacy. We only collect data necessary to provide our services. All personal information is processed in accordance with GDPR and stored securely on servers within the EU.",
      "We never share your data with third parties without your explicit consent. You have the right to request deletion of your data at any time by contacting us at Stilleinc@hotmail.com.",
      "Data collected includes: email addresses (for waitlist), usage analytics (anonymized), and API interaction logs (retained for 30 days).",
      "Our AI processing happens on secure Nordic infrastructure. No training data is stored permanently.",
    ],
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    paragraphs: [
      "By using BudAI, you agree to these terms. The service is provided as-is and we do not guarantee that it will always be available or error-free.",
      "You may not use BudAI for illegal activities or in a way that damages our infrastructure. We reserve the right to terminate accounts that violate these terms.",
      "The Developer Preview is provided free of charge and may have limitations. We are not liable for any decisions made based on AI-generated content.",
      "All intellectual property rights to BudAI remain with Stilledev AB. You retain ownership of your data.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    icon: Cookie,
    paragraphs: [
      "BudAI uses cookies to enhance your experience and analyze traffic. We only use necessary cookies and analytical cookies with your consent.",
      "Necessary cookies are required for the website to function and cannot be disabled. Analytical cookies help us improve our service.",
      "You can change your cookie settings or withdraw your consent at any time. Third-party cookies are not used.",
      "Cookies are stored for a maximum of 12 months. No tracking cookies are used.",
    ],
  },
  gdpr: {
    title: "GDPR Compliance",
    icon: Scale,
    paragraphs: [
      "BudAI complies with the EU General Data Protection Regulation (GDPR). As a user, you have the following rights: right of access, right to rectification, right to erasure, right to restriction of processing, right to data portability, and right to object.",
      "Data controller: Stilledev AB. Contact us at Stilleinc@hotmail.com for GDPR questions or to exercise your rights.",
      "We process data on the legal basis of legitimate interest and consent. You can withdraw consent at any time.",
      "In case of a data breach, we will notify affected users within 72 hours as required by GDPR Article 33.",
    ],
  },
};

export default function LegalPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const page = content[slug] || content.privacy;
  const Icon = page.icon;

  return (
    <main className="min-h-screen bg-background text-white pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to BudAI
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">{page.title}</h1>
          </div>

          <div className="space-y-4">
            {page.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-muted leading-relaxed"
              >
                {p}
              </motion.p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.06]">
            <p className="text-sm text-muted">
              Last updated: August 2026. For questions, contact{" "}
              <a href="mailto:Stilleinc@hotmail.com" className="text-accent-cyan hover:underline">
                Stilleinc@hotmail.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}