import type { Metadata } from "next";
import ShareView from "@/components/playground/ShareView";

export const metadata: Metadata = {
  title: "Shared conversation · BudAI",
  description:
    "A read-only BudAI conversation shared from the Playground. The transcript travels inside the link — nothing is stored on our servers.",
  robots: { index: false, follow: true },
};

export default function SharedChatPage() {
  return <ShareView />;
}
