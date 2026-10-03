import type { Metadata } from "next";
import WaitlistView from "@/components/waitlist/WaitlistView";

export const metadata: Metadata = {
  title: "Join the preview",
  description:
    "Join the BudAI Preview. Get early access and lock in 10% off when BudAI launches. Code BUDAI-EARLY-10.",
};

export default function WaitlistPage() {
  return <WaitlistView />;
}
