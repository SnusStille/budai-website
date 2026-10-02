"use client";

import BudAILogo from "@/components/ui/BudAILogo";
import type { AiActivity } from "@/lib/playground/types";
import { renderMarkdown } from "./markdown";
import { activityLabel, type Lang } from "./presets";

type Props = {
  lang: Lang;
  activity: AiActivity;
  typingText: string;
};

/**
 * Live state while BudAI works: soft thinking bubble, then streamed text with a caret.
 */
export default function ThinkingBubble({ lang, activity, typingText }: Props) {
  const streaming = typingText.length > 0;

  return (
    <div className="pg-msg-enter flex gap-3">
      <div className="relative mt-0.5 h-7 w-7 shrink-0 rounded-[10px] bg-gradient-to-br from-accent-cyan/85 to-accent-purple/85 p-[1.5px]">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[8.5px] bg-[#08080f]">
          <BudAILogo size="xs" animated className="!h-[18px] !w-[18px]" />
        </div>
        {!streaming && (
          <span className="pointer-events-none absolute -inset-1 rounded-[13px] border border-accent-cyan/25 logo-pulse-ring" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {streaming ? (
          <div className="text-[14.5px] text-white/88">
            {renderMarkdown(typingText)}
            <span className="pg-caret ml-0.5 align-middle" aria-hidden />
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5"
            role="status"
            aria-live="polite"
          >
            <span className="flex items-center gap-1" aria-hidden>
              {[0, 1, 2].map((d) => (
                <span key={d} className="pg-dot" style={{ animationDelay: `${d * 0.14}s` }} />
              ))}
            </span>
            <span className="text-[12.5px] text-muted">
              {activityLabel(activity, lang)}
              <span className="pg-ellipsis" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
