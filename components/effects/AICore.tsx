"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BudAILogo from "@/components/ui/BudAILogo";

const FUN_MESSAGES = [
  "⚡ 92% caffeine, 8% code.",
  "🤖 Neural core online.",
  "✨ You found the secret button.",
  "🧠 Inference spark detected.",
  "🚀 Extra compute, on the house.",
  "👀 We see you.",
];

function SecretMode() {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.8 + Math.random() * 1.2,
      color: ["#00e5ff", "#b967ff", "#00ff9d", "#ff6b9d", "#ffd700"][i % 5],
      rotate: Math.floor(Math.random() * 360),
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-6 rounded-2xl glass-strong border border-accent-cyan/30 text-center shadow-[0_0_60px_rgba(0,229,255,0.3)] max-w-xs"
      >
        <div className="text-3xl mb-2">🎉</div>
        <div className="text-xl font-bold text-white mb-1">Secret Mode Unlocked</div>
        <div className="text-sm text-muted">Five clicks. Orb acknowledged.</div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Hero wrapper for BudAILogo — tilt + click FX only.
 * No extra rings/halos (those live inside the logo once).
 */
export default function AICore({ isMobile = false }: { isMobile?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [burstId, setBurstId] = useState<number | null>(null);
  const [funMsg, setFunMsg] = useState<string | null>(null);
  const [secretMode, setSecretMode] = useState(false);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    if (isMobile || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    let target = { x: 0, y: 0 };
    let cur = { x: 0, y: 0 };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.12;
      cur.y += (target.y - cur.y) * 0.12;
      setTilt({ x: cur.x, y: cur.y });
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      target = {
        x: Math.max(-1, Math.min(1, dy)) * 12,
        y: Math.max(-1, Math.min(1, dx)) * -14,
      };
    };
    const onLeave = () => {
      target = { x: 0, y: 0 };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  const onClick = () => {
    const id = Date.now();
    setBurstId(id);
    setFunMsg(FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]);
    setTimeout(() => setBurstId((c) => (c === id ? null : c)), 700);
    setTimeout(() => setFunMsg(null), 2200);
    const now = Date.now();
    clicks.current = [...clicks.current, now].filter((t) => now - t < 3000);
    if (clicks.current.length >= 5) {
      clicks.current = [];
      setSecretMode(true);
      setTimeout(() => setSecretMode(false), 3200);
    }
  };

  const dim = isMobile ? 200 : 268;

  return (
    <>
      <AnimatePresence>{secretMode && <SecretMode />}</AnimatePresence>
      <motion.div
        ref={wrapRef}
        initial={{ opacity: 0, scale: 0.55 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mb-10 sm:mb-12 flex items-center justify-center"
        style={{ width: dim, height: dim, perspective: "1000px" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Soft floor glow only — no second ring set */}
          <div
            className="absolute left-1/2 top-[86%] -translate-x-1/2 w-[65%] h-[12%] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(0,229,255,0.25), transparent 70%)",
              filter: "blur(12px)",
              transform: "rotateX(80deg) translateZ(-30px)",
            }}
          />

          <AnimatePresence>
            {funMsg && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap px-3.5 py-2 rounded-xl glass-strong border border-accent-cyan/30 text-xs font-medium text-white shadow-[0_0_28px_rgba(0,229,255,0.25)] z-30"
              >
                {funMsg}
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#08080f] border-r border-b border-accent-cyan/30" />
              </motion.div>
            )}
          </AnimatePresence>

          {burstId && (
            <div key={burstId} className="absolute inset-0 pointer-events-none z-20">
              {Array.from({ length: isMobile ? 12 : 18 }).map((_, i) => {
                const angle = (i / 18) * Math.PI * 2;
                const dist = 100 + ((i * 41) % 45);
                const c = ["#00e5ff", "#b967ff", "#00ff9d"][i % 3];
                return (
                  <motion.span
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: c, boxShadow: `0 0 10px ${c}` }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                );
              })}
            </div>
          )}

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative z-10"
            style={{ transform: "translateZ(40px)" }}
          >
            <BudAILogo size="hero" animated interactive onClick={onClick} label="BudAI" />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
