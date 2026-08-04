"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export default function BuddyCard({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={`${className} relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 p-1 shadow-[0_0_30px_rgba(0,229,255,0.12)] backdrop-blur-xl transition-all hover:scale-105 hover:border-accent-cyan/40`}
        aria-label="Open Buddy story"
      >
        <Image
          src="/images/IMG_8854.JPG"
          alt="Buddy the dog"
          width={48}
          height={48}
          className="h-full w-full rounded-full object-cover"
        />
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-cyan/90" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed bottom-20 right-4 z-[40] w-[min(92vw,320px)] rounded-2xl border border-white/10 bg-black/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close Buddy story"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Buddy’s little spark</p>
                <p className="mt-1 text-sm leading-6 text-muted/80">
                  Buddy is the quiet inspiration behind BudAI — a loyal friend whose name became part of the project’s story.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
