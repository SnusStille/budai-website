import type { ReactNode } from "react";

/**
 * App Router remounts a template on route changes while the root layout stays
 * mounted. This opacity-only entrance leaves fixed controls and browser history
 * native, without delaying the page or introducing a route-level startup loader.
 */
export default function RouteTemplate({ children }: { children: ReactNode }) {
  return <div className="route-arrival min-h-screen">{children}</div>;
}
