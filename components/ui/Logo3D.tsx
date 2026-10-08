"use client";

import BudAILogo from "@/components/ui/BudAILogo";

const LAYERS = [-14, -10, -6, -3, 0, 3, 6, 10, 14];

/** A solid-looking BudAI mark: stacked depth layers that spin around the Y axis. */
export default function Logo3D() {
  return (
    <div className="relative h-[110px] w-[110px]" style={{ perspective: 700 }} aria-hidden>
      <div className="bud-spin3d relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {LAYERS.map((z) => (
          <div
            key={z}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `translateZ(${z}px)`, opacity: z === 0 ? 1 : 0.2 + (14 - Math.abs(z)) / 40 }}
          >
            <BudAILogo size="lg" animated={z === 0} className="!h-[110px] !w-[110px]" />
          </div>
        ))}
      </div>
      <div className="absolute -bottom-7 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full bg-accent-cyan/30 blur-xl" />
    </div>
  );
}
