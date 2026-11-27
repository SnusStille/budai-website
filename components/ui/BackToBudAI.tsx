import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";

export default function BackToBudAI({
  href = "/",
  lang = "en",
  nativeLink = false,
}: {
  href?: string;
  lang?: "en" | "sv";
  nativeLink?: boolean;
}) {
  const content = (
    <>
      <ArrowLeft size={14} aria-hidden="true" />
      <BudAILogo size="xs" animated={false} />
      <span>{lang === "sv" ? "Tillbaka till BudAI" : "Back to BudAI"}</span>
    </>
  );
  const className = "standalone-back-link";

  return nativeLink ? (
    <a href={href} className={className}>{content}</a>
  ) : (
    <Link href={href} className={className}>{content}</Link>
  );
}
