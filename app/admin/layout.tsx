import type { Metadata } from "next";
import type { ReactNode } from "react";

// robots.txt disallow is not noindex. Keep the admin surface out of indexes even
// if it is ever linked from somewhere else.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
