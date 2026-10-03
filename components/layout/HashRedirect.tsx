"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Old single-page hashes → product routes. */
const MAP: Record<string, string> = {
  playground: "/playground",
  waitlist: "/waitlist",
  capabilities: "/about",
  terminal: "/playground",
  roadmap: "/about",
  status: "/about",
  vision: "/about",
};

export default function HashRedirect() {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) sessionStorage.setItem("budai-ref", ref.slice(0, 64));
    } catch {
      /* */
    }
    if (path !== "/") return;
    const raw = (window.location.hash || "").replace(/^#/, "").split("?")[0];
    if (!raw) return;
    const dest = MAP[raw];
    if (dest) router.replace(dest);
  }, [path, router]);

  return null;
}
