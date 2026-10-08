import type { Metadata } from "next";

/**
 * The control center is an internal tool: give it a real tab title and keep it
 * out of search results (robots.ts disallows /admin as well).
 */
export const metadata: Metadata = {
  title: "Control Center",
  description: "Internal BudAI admin — waitlist, accounts and usage.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
