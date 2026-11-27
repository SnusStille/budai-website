import { Sparkles } from "lucide-react";

/** A quiet, abstract signal mark for BudAI replies; intentionally not a character avatar. */
export default function AssistantMark({ size = 32, state = "idle" }: { size?: number; state?: "idle" | "thinking" | "talking" }) {
  return (
    <span
      className={`assistant-mark assistant-mark-${state} shrink-0 inline-flex items-center justify-center rounded-xl border border-accent-cyan/20 bg-[#08121a] text-accent-cyan`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Sparkles size={Math.max(13, Math.round(size * 0.48))} strokeWidth={1.6} />
    </span>
  );
}
