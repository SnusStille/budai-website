import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import LabsChat from "@/components/labs/LabsChat";
import { getSession, isValidConversationId } from "@/lib/labs/session";
import { serviceClient } from "@/lib/supabase/service";

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
  const title = sv ? "Stilledev Labs — Fortsätt konversationen" : "Stilledev Labs — Continue conversation";
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

  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const lang = sv ? "sv" : "en";

  // Read session (middleware ensures it exists for /labs routes)
  const sessionId = await getSession();

  // Try to load the conversation - but only if it belongs to this session
  let initialMessages: { id: string; role: "user" | "assistant"; content: string; createdAt?: string }[] = [];
  let conversationBelongsToSession = false;

  if (sessionId) {
    const sb = serviceClient();
    if (sb) {
      const { data: conv } = await sb
        .from("labs_conversations")
        .select("id, session_id, language")
        .eq("id", id)
        .maybeSingle();

      if (conv && conv.session_id === sessionId) {
        conversationBelongsToSession = true;
        const { data: messages } = await sb
          .from("labs_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true });

        initialMessages = (messages || []).map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          createdAt: m.created_at,
        }));
      }
    }
  }

  // If the conversation doesn't belong to this session, render empty chat
  if (!conversationBelongsToSession) {
    return <LabsChat lang={lang} />;
  }

  return (
    <LabsChat
      lang={lang}
      initialConversationId={id}
      initialMessages={initialMessages}
    />
  );
}
