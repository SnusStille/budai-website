"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function BuddyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="mt-8 inline-flex items-center gap-4 p-1 rounded-3xl bg-gradient-to-r from-accent-cyan/30 via-accent-purple/20 to-accent-green/20 shadow-lg hover:translate-y-[-4px] transform transition-all"
    >
      <div className="rounded-2xl bg-black/40 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
          <Image
            src="/images/IMG_8854.JPG"
            alt="Buddy the dog"
            width={80}
            height={80}
            className="object-cover w-20 h-20"
          />
          <div className="absolute -bottom-1 -right-1 bg-accent-cyan text-xs text-black font-semibold px-2 py-1 rounded-full">🐾</div>
        </div>

        <div className="text-left">
          <div className="flex items-center gap-2">
            <div className="text-base text-white font-semibold">Buddy</div>
            <div className="text-xs text-accent-green bg-white/10 px-2 py-0.5 rounded-full">Founder</div>
          </div>
          <div className="text-sm text-muted/70 max-w-xs">Buddy created the BudAI name — he's our dog and the inspiration behind the project.</div>
        </div>
      </div>
    </motion.div>
  );
}
