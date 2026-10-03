import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlaybookView from "@/components/playbooks/PlaybookView";
import { PLAYBOOKS, getPlaybook } from "@/lib/playbooks";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const playbook = getPlaybook(params.slug);
  if (!playbook) return { title: "Playbook · BudAI" };

  const title = `${playbook.title.en} · BudAI playbook`;
  const description = playbook.subtitle.en;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/playbooks/${playbook.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/playbooks/${playbook.slug}`,
      siteName: "BudAI",
      type: "article",
    },
  };
}

export default function PlaybookPage({ params }: { params: { slug: string } }) {
  const playbook = getPlaybook(params.slug);
  if (!playbook) notFound();

  const related = playbook.next
    .map((slug) => PLAYBOOKS.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return <PlaybookView playbook={playbook} related={related} />;
}
