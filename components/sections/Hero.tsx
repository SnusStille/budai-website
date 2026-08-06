"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Code2, Zap, Shield, ChevronDown } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

// A small easter egg for anyone who clicks the orb — the site notices.
const FUN_MESSAGES = [
  "⚡ 68% caffeine, 32% code.",
  "🤖 Beep boop. Nice click.",
  "✨ You found the secret button.",
  "🧠 Still thinking about that click.",
  "🚀 Extra sparkle, on the house.",
  "👀 We see you.",
];

// A bigger surprise for anyone determined enough: 5 orb clicks within 3
// seconds unlocks this. Full-screen confetti + a little acknowledgment.
function SecretMode() {
  const [pieces] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.8,
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
        initial={{ scale: 0.7, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ delay: 0.15, type: "spring", damping: 16 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-6 rounded-2xl glass-strong border border-accent-cyan/25 text-center shadow-[0_0_60px_rgba(0,229,255,0.25)] max-w-xs"
      >
        <div className="text-3xl mb-2">🎉</div>
        <div className="text-xl font-bold text-white mb-1">Secret Mode Unlocked</div>
        <div className="text-sm text-muted">Five clicks. We respect the dedication.</div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const { t, lang } = useLang();
  const [isMobile, setIsMobile] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [burstId, setBurstId] = useState<number | null>(null);
  const [funMsg, setFunMsg] = useState<string | null>(null);
  const [secretMode, setSecretMode] = useState(false);
  const clickTimestamps = useRef<number[]>([]);

  const handleOrbClick = () => {
    const id = Date.now();
    setBurstId(id);
    setFunMsg(FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]);
    setTimeout(() => setBurstId((cur) => (cur === id ? null : cur)), 850);
    setTimeout(() => setFunMsg(null), 2600);

    // Big surprise: 5 clicks within 3 seconds unlocks secret mode.
    const now = Date.now();
    clickTimestamps.current = [...clickTimestamps.current, now].filter((t) => now - t < 3000);
    if (clickTimestamps.current.length >= 5) {
      clickTimestamps.current = [];
      setSecretMode(true);
      setTimeout(() => setSecretMode(false), 4000);
    }
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cycles the last part of the headline through a few alternatives
  // ("...for Business" -> "...for Automation" -> ...), resetting to 0
  // whenever the language (and therefore the word list) changes.
  useEffect(() => {
    setWordIndex(0);
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % t.hero.words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [t.hero.words]);

  const particleCount = isMobile ? 1 : 4;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <AnimatePresence>{secretMode && <SecretMode />}</AnimatePresence>

      {!isMobile && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent-cyan/8 rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-accent-purple/6 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent-green/5 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass mb-10 border border-accent-green/20"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-accent-green animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green" />
          </span>
          <span className="text-sm font-medium text-accent-green">
            {t.hero.badge}
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-sm text-muted flex items-center gap-2">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] border border-accent-cyan/20 text-accent-cyan tracking-wide">
              v0.68
            </span>
            68% to launch
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-accent-cyan/20"
            style={{ borderStyle: "dashed" }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border border-accent-purple/15"
          />
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-accent-cyan/30 via-accent-purple/20 to-accent-green/30 blur-xl animate-glow-pulse" />

          <AnimatePresence>
            {funMsg && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                transition={{ type: "spring", damping: 18 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap px-4 py-2 rounded-xl glass-strong border border-accent-cyan/25 text-xs font-medium text-white shadow-[0_0_25px_rgba(0,229,255,0.2)] z-30"
              >
                {funMsg}
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#08080f] border-r border-b border-accent-cyan/25" />
              </motion.div>
            )}
          </AnimatePresence>

          {burstId && (
            <div key={burstId} className="absolute inset-0 pointer-events-none z-20">
              {Array.from({ length: 14 }).map((_, i) => {
                const angle = (i / 14) * Math.PI * 2;
                const dist = 85 + ((i * 37) % 40);
                return (
                  <motion.span
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: i % 2 === 0 ? "#00e5ff" : "#b967ff", boxShadow: `0 0 8px ${i % 2 === 0 ? "#00e5ff" : "#b967ff"}` }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                );
              })}
            </div>
          )}

          <motion.div
            onClick={handleOrbClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            title="Click me"
            className="absolute inset-10 rounded-full bg-gradient-to-br from-accent-cyan/40 to-accent-purple/40 flex items-center justify-center cursor-pointer z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_0_60px_rgba(0,229,255,0.4)]"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
          </motion.div>

          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 8 + i * 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
              style={{ animationDelay: `${i * 2}s` }}
            >
              <div
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{
                  transform: `translate(-50%, -50%) translateX(${70 + i * 15}px)`,
                  background: i % 2 === 0 ? "#00e5ff" : "#b967ff",
                  boxShadow: `0 0 10px ${i % 2 === 0 ? "#00e5ff" : "#b967ff"}`,
                }}
              />
            </motion.div>
          ))}

          <motion.div
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.3, 0, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-accent-cyan/30"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.2, 0, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
            className="absolute inset-0 rounded-full border border-accent-purple/20"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="block text-gradient-shimmer">{t.hero.title1}</span>
          <span className="relative block text-gradient mt-1 h-[1.1em] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={t.hero.words[wordIndex]}
                initial={{ y: "60%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-60%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {t.hero.words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-3 leading-relaxed"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-muted/50 mb-12 flex items-center justify-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
          {lang === "sv" ? "Utvecklad av" : "Developed by"}{" "}
          <a
            href="https://discord.com/users/353944097301594123"
            target="_blank"
            rel="noopener noreferrer"
            className="relative text-accent-cyan font-medium hover:text-white transition-colors duration-300 group"
          >
            Stilledev
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent-cyan group-hover:w-full transition-all duration-300" />
          </a>
          <span className="text-muted/30">·</span>
          <span>Sweden</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#waitlist"
            className="group relative px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl font-semibold text-white text-lg overflow-hidden transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(0,229,255,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.hero.ctaSecondary}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a
            href="#playground"
            className="group px-8 py-4 glass rounded-xl font-semibold text-white text-lg hover:bg-white/5 transition-all hover:scale-[1.02]"
          >
            {t.hero.ctaPrimary}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Sparkles, label: "AI-Driven" },
            { icon: Code2, label: "Code Generation" },
            { icon: Zap, label: "Automation" },
            { icon: Shield, label: "Enterprise-Ready" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70">
              <item.icon className="w-4 h-4 text-accent-cyan" />
              {item.label}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted/40 uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-5 h-5 text-muted/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
