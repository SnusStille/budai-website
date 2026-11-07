import type { Metadata } from "next";
import PhoneWelcome from "@/components/sections/PhoneWelcome";

export const metadata: Metadata = { title: "Mobile welcome preview", robots: { index: false, follow: false } };
export default function PhonePreview() { return <PhoneWelcome />; }
