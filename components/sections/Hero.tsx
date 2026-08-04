"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Code2, Zap, Shield, ChevronDown, X } from "lucide-react";
import CodeBackground from "@/components/effects/CodeBackground";

export default function Hero({ devMode, onToggleDev }: { devMode: boolean; onToggleDev: () => void }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const particleCount = isMobile ? 1 : 4;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {!isMobile && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent-cyan/8 rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-accent-purple/6 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent-green/5 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass mb-10 border transition-all duration-500 ${
            devMode
              ? "border-accent-cyan/40 bg-accent-cyan/10 shadow-[0_0_30px_rgba(0,229,255,0.18)]"
              : "border-white/10"
          }`}
          onClick={onToggleDev}
          type="button"
          aria-pressed={devMode}
          aria-label="Toggle developer preview overlay"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${devMode ? "bg-accent-cyan animate-ping" : "bg-accent-green"}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${devMode ? "bg-accent-cyan" : "bg-accent-green"}`} />
          </span>
          <span className={`text-sm font-medium ${devMode ? "text-accent-cyan" : "text-accent-green"}`}>
            {devMode ? "Developer Mode" : "Developer Preview"}
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-sm text-muted">{devMode ? "Core systems boosted" : "v0.9.2 — Currently under development"}</span>
        </motion.button>

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
          <div className="absolute inset-10 rounded-full bg-gradient-to-br from-accent-cyan/40 to-accent-purple/40 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_0_60px_rgba(0,229,255,0.4)]"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
          </div>

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
          <span className="block">The Future of</span>
          <span className="block text-gradient mt-1">Digital Work</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-3 leading-relaxed"
        >
          BudAI is an advanced intelligence platform built for Swedish companies.
          Automate, analyze, and accelerate everything.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-muted/50 mb-12 flex items-center justify-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
          Developed by <span className="text-accent-cyan font-medium">Stilledev</span>
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
              Request Early Access
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a
            href="#playground"
            className="group px-8 py-4 glass rounded-xl font-semibold text-white text-lg hover:bg-white/5 transition-all hover:scale-[1.02]"
          >
            Try the Playground
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Sparkles, label: "AI-Powered" },
            { icon: Code2, label: "Code Generation" },
            { icon: Zap, label: "Automation" },
            { icon: Shield, label: "Enterprise Ready" },
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

        {devMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 pointer-events-auto bg-black/85" onClick={onToggleDev} />
            
            {/* Fast-moving code background */}
            <CodeBackground />
            
            {/* Grid pattern for subtle structure */}
            <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,229,255,.04)_25%,rgba(0,229,255,.04)_26%,transparent_27%,transparent_74%,rgba(0,229,255,.04)_75%,rgba(0,229,255,.04)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,229,255,.04)_25%,rgba(0,229,255,.04)_26%,transparent_27%,transparent_74%,rgba(0,229,255,.04)_75%,rgba(0,229,255,.04)_76%,transparent_77%,transparent)] bg-[length:80px_80px]" />
            
            {/* Center content */}
            <div className="relative z-50 pointer-events-auto text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="mb-6"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple">
                  <Code2 className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Dev Mode Activated
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted mb-8 max-w-sm mx-auto"
              >
                Core systems boosted. You're running on experimental features.
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleDev}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold hover:shadow-[0_0_40px_rgba(0,229,255,0.3)] transition-shadow"
              >
                Exit Dev Mode
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
