import type { Metadata } from "next";
import HomeGateway from "@/components/home/HomeGateway";

export const metadata: Metadata = {
  title: { absolute: "BudAI — AI work assistant" },
  description:
    "BudAI is the AI work assistant for Sweden. Write, plan, and think faster in Swedish and English. Developer preview — try it live.",
};

export default function Home() {
  return <HomeGateway />;
}
