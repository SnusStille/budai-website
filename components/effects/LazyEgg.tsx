"use client";

import dynamic from "next/dynamic";

const Egg = dynamic(() => import("@/components/effects/LogoEasterEgg"), { ssr: false });

export default function LazyEgg() {
  return <Egg />;
}
