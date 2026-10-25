import type { CSSProperties } from "react";

/** Exact casing and typography of the brand; the uppercase intro remains intentional. */
export default function BudAIWordmark({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`budai-wordmark ${className}`} style={style} data-budai-wordmark>BudAI</span>;
}
