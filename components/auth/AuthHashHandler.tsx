"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles Supabase implicit / hash redirects:
 *   https://stilledev.se/#access_token=...&refresh_token=...&type=magiclink
 * or error in hash. Runs once on mount.
 */
export default function AuthHashHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    if (!hash.includes("access_token") && !hash.includes("error=")) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const error = params.get("error_description") || params.get("error");

    const clean = () => {
      const u = new URL(window.location.href);
      u.hash = "playground";
      // strip auth-related search if any
      window.history.replaceState({}, "", `${u.pathname}${u.search}#playground`);
    };

    if (error) {
      clean();
      window.location.replace(
        `/?auth=error&reason=${encodeURIComponent(error)}#playground`
      );
      return;
    }

    if (!access_token || !refresh_token) return;

    const sb = createClient();
    if (!sb) return;

    void (async () => {
      try {
        const { error: setErr } = await sb.auth.setSession({
          access_token,
          refresh_token,
        });
        clean();
        if (setErr) {
          window.location.replace(
            `/?auth=error&reason=${encodeURIComponent(setErr.message)}#playground`
          );
        } else {
          window.location.replace(`/?auth=ok#playground`);
        }
      } catch (e) {
        clean();
        console.error("[AuthHashHandler]", e);
      }
    })();
  }, []);

  return null;
}
