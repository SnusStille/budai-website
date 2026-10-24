"use client";

import BudAILogo from "@/components/ui/BudAILogo";

/** A restrained dimensional lockup: one vector mark, two low-contrast orbits. */
export default function Logo3D() {
  return (
    <div className="bud-logo-stage relative h-[110px] w-[110px]" aria-hidden="true">
      <span className="bud-logo-orbit bud-logo-orbit-a" />
      <span className="bud-logo-orbit bud-logo-orbit-b" />
      <div className="bud-logo-float absolute inset-[14px] flex items-center justify-center">
        <BudAILogo size="lg" animated className="!h-[82px] !w-[82px]" />
      </div>
      <span className="absolute -bottom-5 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-accent-cyan/20 blur-xl" />
    </div>
  );
}
