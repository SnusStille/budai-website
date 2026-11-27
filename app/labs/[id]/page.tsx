import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import LabsChat from "@/components/labs/LabsChat";
import { isValidConversationId } from "@/lib/labs/session";
import { getSession } from "@/lib/labs/session";

type Props = {
  params: Promise<{ id: string }>;
};

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const path = h.get("x-budai-path") || "";
  const isSvPath = path.startsWith("/sv/");
  const canonical = `${siteUrl}${isSvPath ? `/sv/labs/${id}` : `/labs/${id}`}`;
  const title = sv
    ? "Stilledev Labs — Fortsätt konversationen"
    : "Stilledev Labs — Continue conversation";
  const description = sv
    ? "Fortsätt din konversation med BudAI."
    : "Continue your conversation with BudAI.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}

export default async function LabsConversationPage({ params }: Props) {
  const { id } = await params;

  if (!isValidConversationId(id)) {
    notFound();
  }

  // Ensure session cookie exists (middleware handles this, but double-check)
  await getSession();

  // LabsChat reads the conversation ID from the URL path itself
  return <LabsChat />;
}
