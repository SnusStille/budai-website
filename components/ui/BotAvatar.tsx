import Image from "next/image";

/**
 * The Builder Bot as BudAI's picture in the Playground.
 * Shows next to every assistant answer (and, enlarged with a pulse ring, while thinking).
 * Decorative: the adjacent "BudAI" label carries the meaning for screen readers.
 */
export default function BotAvatar({ size = 32, state = "idle" }: { size?: number; state?: "idle" | "thinking" | "talking" }) {
  return (
    <span className={`bot-avatar bot-avatar-${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <Image src="/images/builder-bot.png" alt="" width={96} height={96} sizes="96px" className="bot-avatar-img" priority={false} />
      <span className="bot-avatar-eye left" /><span className="bot-avatar-eye right" />
    </span>
  );
}
