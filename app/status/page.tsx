import type { Metadata } from "next";
import StatusPageClient from "@/components/status/StatusPageClient";

export const metadata: Metadata = {
  title: "System status",
  description:
    "Follow BudAI's spatial journey from prompt to response, then inspect live web-route health and server-configured features.",
  alternates: { canonical: "/status" },
};

export default function StatusPage() {
  return <StatusPageClient />;
}
