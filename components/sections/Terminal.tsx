"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal as TermIcon, Copy, Check, Brain, Cpu, Database, Zap, Shield, Activity } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";

interface TLine {
  id: number;
  type: "cmd" | "out" | "sys" | "think" | "success" | "warn";
  text: string;
}

const NEURAL_LOGS = [
  "[INFERENCE] Tokenizing input sequence...",
  "[ATTENTION] Computing self-attention weights | heads: 32",
  "[EMBED] Loading Swedish semantic embeddings | dim: 4096",
  "[KV_CACHE] Hit ratio: 94.2% | Tokens cached: 2,847",
  "[ROPE] Applying rotary position embeddings | theta: 10000",
  "[FFN] Feed-forward activation | SwiGLU | dim: 11008",
  "[NORM] RMS pre-normalization | eps: 1e-6",
  "[GENERATE] Sampling | temperature: 0.7 | top_p: 0.9",
  "[CLADE] Routing to Claude API | model: claude-sonnet-4",
  "[API] POST /v1/messages | latency: 847ms",
  "[STREAM] Receiving SSE chunks | chunk_size: 4096",
  "[PARSE] Extracting structured response | confidence: 97.3%",
  "[TOOL] Calling data_parser | args: {quarter: 'Q3'}",
  "[TOOL] data_parser returned: 1247 rows | 2.4MB",
  "[ANALYZE] Running trend detection | algorithm: STL",
  "[ANALYZE] Seasonality detected | period: 91 days",
  "[REASON] Chain-of-thought step 3/7 | confidence: 94.1%",
  "[MEMORY] Storing to vector DB | collection: conversations",
  "[GUARD] PII scan complete | detections: 0 | SAFE",
  "[RATE] Token bucket: 847/1000 | reset: 45s",
  "[OPTIM] Flash Attention 2 | memory saved: 42%",
  "[QUANT] Q4_K_M dequantize | overhead: 3.2ms",
  "[BATCH] Prefill batch | seq_len: 2048 | throughput: 847 tok/s",
  "[DECODE] Autoregressive generation | token: 1847 | 'företag'",
  "[POST] Applying post-processing | grammar: formal-sv",
  "[VALIDATE] Output checksum | sha256: a3f7...9e2d | OK",
  "[LOG] Request completed | total_tokens: 2847 | cost: $0.0042",
  "[CACHE] Warm start | model loaded from shared memory",
  "[SCHED] Next inference scheduled | priority: high",
  "[MONITOR] GPU utilization: 78% | VRAM: 18.4/24GB",
  "[NETWORK] Keep-alive ping | nordic-pool-1 | 11ms",
];

const BOOT_PHASES = [
  { type: "sys", text: "═══════════════════════════════════════════════════════════════", delay: 0 },
  { type: "sys", text: "  BUDAI NEURAL INTERFACE v1.0.4 — Stilledev Systems", delay: 50 },
  { type: "sys", text: "  Build: 2026.08.05-release | Kernel: budai-core-4.2.1", delay: 50 },
  { type: "sys", text: "═══════════════════════════════════════════════════════════════", delay: 100 },
  { type: "cmd", text: "budai --init --mode=enterprise --region=nordic", delay: 600, typeSpeed: 30 },
  { type: "out", text: "", delay: 150 },
  { type: "think", text: "[MEMORY] Allocating neural workspace...", delay: 300 },
  { type: "out", text: "  → L1 Cache:     512MB  ████████████████████  OK", delay: 100 },
  { type: "out", text: "  → L2 Cache:     2GB    ████████████████████  OK", delay: 100 },
  { type: "out", text: "  → Working Mem:  16GB   ████████████████████  OK", delay: 100 },
  { type: "out", text: "  → GPU VRAM:     24GB   ████████████████████  OK", delay: 100 },
  { type: "out", text: "", delay: 80 },
  { type: "think", text: "[MODEL] Loading BudAI Enterprise v0.9.2...", delay: 400 },
  { type: "out", text: "  → tokenizer.json        [====================] 100%  2.1s", delay: 150 },
  { type: "out", text: "  → model.safetensors     [====================] 100%  4.8s", delay: 150 },
  { type: "out", text: "  → config.yaml           [====================] 100%  0.3s", delay: 150 },
  { type: "out", text: "  → embeddings.bin        [====================] 100%  1.2s", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "success", text: "✓ Model loaded: 8.7B parameters | Quantization: Q4_K_M", delay: 250 },
  { type: "out", text: "", delay: 150 },
  { type: "think", text: "[NEURAL] Initializing transformer architecture...", delay: 400 },
  { type: "out", text: "  → Attention heads: 32  |  Layers: 32  |  Dim: 4096", delay: 150 },
  { type: "out", text: "  → RoPE theta: 10000  |  Context: 128K tokens", delay: 150 },
  { type: "out", text: "  → Flash Attention 2: ENABLED", delay: 150 },
  { type: "out", text: "  → KV Cache: Optimized for Swedish language patterns", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "think", text: "[DATA] Connecting to Nordic data centers...", delay: 500 },
  { type: "out", text: "  → Stockholm (se-sto-1)  11ms  ✓", delay: 150 },
  { type: "out", text: "  → Oslo (no-osl-1)      8ms  ✓", delay: 150 },
  { type: "out", text: "  → Helsinki (fi-hel-1) 14ms  ✓", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "success", text: "✓ Connected to 3/3 nodes | Avg latency: 11ms | TLS 1.3 active", delay: 250 },
  { type: "out", text: "", delay: 150 },
  { type: "think", text: "[SECURITY] Running integrity checks...", delay: 400 },
  { type: "out", text: "  → AES-256-GCM encryption:     VERIFIED", delay: 120 },
  { type: "out", text: "  → Model signature:              VALID (SHA-256)", delay: 120 },
  { type: "out", text: "  → PII filter:                   ACTIVE", delay: 120 },
  { type: "out", text: "  → Rate limiter:                 100 req/min", delay: 120 },
  { type: "out", text: "  → GDPR compliance:              FULL", delay: 120 },
  { type: "out", text: "", delay: 80 },
  { type: "success", text: "✓ Security layer: ENTERPRISE-GRADE | Score: A+", delay: 250 },
  { type: "out", text: "", delay: 150 },
  { type: "sys", text: "  [Neural engine ready. Starting live inference stream...]", delay: 400 },
  { type: "out", text: "", delay: 100 },
];

const LIVE_TASKS = [
  { type: "cmd", text: "budai --task 'analyze Q3 revenue' --depth=comprehensive", delay: 800, typeSpeed: 30 },
  { type: "out", text: "", delay: 150 },
  { type: "think", text: "[REASONING] Analyzing request...", delay: 300 },
  { type: "out", text: "  → Intent detected: financial_analysis", delay: 150 },
  { type: "out", text: "  → Confidence: 97.3%", delay: 150 },
  { type: "out", text: "  → Tools required: [data_parser, trend_analyzer, report_gen]", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "think", text: "[THINKING] Processing Q3 financial data...", delay: 400 },
  { type: "out", text: "  → Parsing revenue.csv (2.4MB)...", delay: 200 },
  { type: "out", text: "  → Detected 1,247 transactions across 4 quarters", delay: 200 },
  { type: "out", text: "  → Running trend analysis...", delay: 300 },
  { type: "out", text: "", delay: 80 },
  { type: "out", text: "  ┌─────────────────────────────────────────┐", delay: 150 },
  { type: "out", text: "  │  Q3 ANALYSIS RESULTS                    │", delay: 150 },
  { type: "out", text: "  ├─────────────────────────────────────────┤", delay: 150 },
  { type: "out", text: "  │  YoY Growth:        +23.4%            │", delay: 150 },
  { type: "out", text: "  │  Revenue:            4.2M SEK          │", delay: 150 },
  { type: "out", text: "  │  Top Segment:        Enterprise SaaS   │", delay: 150 },
  { type: "out", text: "  │  Opportunities:     3 identified      │", delay: 150 },
  { type: "out", text: "  └─────────────────────────────────────────┘", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "success", text: "✓ Report generated: /reports/q3_analysis_2026.pdf", delay: 250 },
  { type: "out", text: "", delay: 200 },
  { type: "cmd", text: "budai --assist 'draft email to stakeholders' --tone=formal --lang=sv", delay: 1000, typeSpeed: 28 },
  { type: "out", text: "", delay: 150 },
  { type: "think", text: "[REASONING] Generating professional communication...", delay: 400 },
  { type: "out", text: "  → Tone analysis: Formal | Language: Swedish", delay: 150 },
  { type: "out", text: "  → Token generation: 187 tokens | Temp: 0.7", delay: 150 },
  { type: "out", text: "  → Grammar check: PASSED", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "out", text: "  Subject: Q3 Resultat — Stark Tillväxt och Nya Möjligheter", delay: 150 },
  { type: "out", text: "  Length: 180 ord | Läsbarhet: B2-nivå", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "success", text: "✓ Draft ready for review. Suggestions: 2 clarity improvements found.", delay: 250 },
  { type: "out", text: "", delay: 200 },
  { type: "cmd", text: "budai --automate 'weekly report' --schedule=weekly --time=08:00", delay: 900, typeSpeed: 32 },
  { type: "out", text: "", delay: 150 },
  { type: "think", text: "[AUTOMATION] Creating workflow...", delay: 350 },
  { type: "out", text: "  → Trigger: Every Monday 08:00 CET", delay: 150 },
  { type: "out", text: "  → Data sources: [sales_db, analytics_api, crm_export]", delay: 150 },
  { type: "out", text: "  → Format: PDF + Dashboard update", delay: 150 },
  { type: "out", text: "  → Recipients: management@company.se", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "success", text: "✓ Workflow ACTIVE | Next run: 2026-08-10 08:00 CET", delay: 250 },
  { type: "out", text: "", delay: 200 },
  { type: "cmd", text: "budai --status --verbose", delay: 700, typeSpeed: 25 },
  { type: "out", text: "", delay: 150 },
  { type: "out", text: "  Status:        OPERATIONAL", delay: 150 },
  { type: "out", text: "  Neural nets:   ACTIVE (8.7B params)", delay: 150 },
  { type: "out", text: "  Data pipes:    RUNNING (3 nodes)", delay: 150 },
  { type: "out", text: "  Security:      ENTERPRISE-GRADE (A+)", delay: 150 },
  { type: "out", text: "  Uptime:        99.97% (47d 12h 33m)", delay: 150 },
  { type: "out", text: "  Tasks today:   1,247 processed", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "cmd", text: "budai --version", delay: 500, typeSpeed: 20 },
  { type: "out", text: "", delay: 150 },
  { type: "out", text: "  BudAI Developer Preview v0.9.2", delay: 150 },
  { type: "out", text: "  Built by Stilledev | Sweden", delay: 150 },
  { type: "out", text: "  © 2026 All rights reserved.", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "sys", text: "  [System ready. Awaiting input...]", delay: 300 },
];

export default function Terminal() {
  const { t } = useLang();
  const [lines, setLines] = useState<TLine[]>([]);
  const [typing, setTyping] = useState("");
  const [copied, setCopied] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [neuralLogs, setNeuralLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const lineId = useRef(0);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const allPhases = [...BOOT_PHASES, ...LIVE_TASKS];
    const run = async () => {
      for (const phase of allPhases) {
        if (phase.type === "cmd") {
          setTyping("");
          const speed = phase.typeSpeed || 30;
          for (let j = 0; j <= phase.text.length; j++) {
            setTyping(phase.text.slice(0, j));
            await new Promise((r) => setTimeout(r, 10 + Math.random() * speed));
          }
          await new Promise((r) => setTimeout(r, 150));
          setLines((p) => [...p, { id: lineId.current++, type: "cmd", text: phase.text }]);
          setTyping("");
        } else {
          await new Promise((r) => setTimeout(r, phase.delay));
          setLines((p) => [
  ...p,
  { 
    id: lineId.current++, 
    type: phase.type as TLine["type"], 
    text: phase.text 
  }
]);
        }
      }
      setIsComplete(true);
    };
    run();
  }, []);

  useEffect(() => {
    if (!isComplete) return;
    const interval = setInterval(() => {
      setNeuralLogs((prev) => {
        const next = [...prev, NEURAL_LOGS[logIndex % NEURAL_LOGS.length]];
        if (next.length > 8) next.shift();
        return next;
      });
      setLogIndex((prev) => prev + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [isComplete, logIndex]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, typing, neuralLogs]);

  const copy = () => {
    const text = lines.map((l) => (l.type === "cmd" ? `$ ${l.text}` : l.text)).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case "cmd": return "text-white";
      case "think": return "text-accent-purple/80";
      case "success": return "text-accent-green";
      case "warn": return "text-yellow-400";
      case "sys": return "text-accent-cyan/60";
      default: return "text-muted/70";
    }
  };

  const getPrefix = (type: string) => {
    switch (type) {
      case "cmd": return { icon: "$", color: "text-accent-green" };
      case "think": return { icon: "◆", color: "text-accent-purple" };
      case "success": return { icon: "✓", color: "text-accent-green" };
      case "warn": return { icon: "!", color: "text-yellow-400" };
      case "sys": return { icon: "▸", color: "text-accent-cyan/50" };
      default: return { icon: " ", color: "text-transparent" };
    }
  };

  return (
    <section id="terminal" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-green/3 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">
            {t.terminal.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t.terminal.title} <span className="text-gradient-cyan">{t.terminal.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t.terminal.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass-strong border border-white/[0.06] shadow-[0_0_60px_rgba(0,229,255,0.05)]"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-[#0c0c14]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted/60 font-mono">
                <TermIcon className="w-4 h-4" />
                <span>budai@stilledev:~</span>
              </div>
              <button
                onClick={copy}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
              >
                {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div
              ref={scrollRef}
              className="p-5 h-[520px] overflow-y-auto font-mono text-[12px] leading-relaxed bg-[#0a0a12] terminal-scroll"
              style={{
                backgroundImage: "linear-gradient(rgba(0,229,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.015) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            >
              {lines.map((l) => {
                const prefix = getPrefix(l.type);
                return (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                    className="mb-0.5"
                  >
                    {l.type === "cmd" ? (
                      <div className="flex items-start gap-2">
                        <span className={`${prefix.color} shrink-0 select-none font-bold`}>{prefix.icon}</span>
                        <span className="text-white">{l.text}</span>
                      </div>
                    ) : (
                      <div className={`${getLineColor(l.type)} pl-4`}>{l.text}</div>
                    )}
                  </motion.div>
                );
              })}

              {typing && (
                <div className="flex items-start gap-2">
                  <span className="text-accent-green shrink-0 select-none font-bold">$</span>
                  <span className="text-white">{typing}</span>
                  <span className={`w-2 h-4 bg-accent-cyan ml-0.5 ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
                </div>
              )}

              {isComplete && neuralLogs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="text-[10px] text-accent-purple/50 mb-2 uppercase tracking-wider">Live Neural Activity</div>
                  {neuralLogs.map((log, i) => (
                    <motion.div
                      key={`${log}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-2 mb-0.5"
                    >
                      <span className="text-accent-cyan/40 shrink-0 select-none text-[10px]">›</span>
                      <span className="text-accent-cyan/50 text-[11px]">{log}</span>
                    </motion.div>
                  ))}
                  <div className="flex items-start gap-2 mt-1">
                    <span className="text-accent-cyan/40 shrink-0 select-none text-[10px]">›</span>
                    <span className="w-1.5 h-3 bg-accent-cyan/50 animate-pulse" />
                  </div>
                </div>
              )}

              {isComplete && neuralLogs.length === 0 && (
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-accent-green shrink-0 select-none font-bold">$</span>
                  <span className="w-2 h-4 bg-accent-cyan animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-[#0c0c14] text-[10px] font-mono text-muted/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> 8.7B params</span>
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> 11ms</span>
                <span className="flex items-center gap-1"><Database className="w-3 h-3" /> 3 nodes</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-accent-green" /> A+</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-accent-green" /> 99.97%</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-accent-cyan" /> <ClientOnlyClock /></span>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                background: "linear-gradient(transparent 50%, rgba(0,229,255,0.1) 50%)",
                backgroundSize: "100% 4px",
              }}
            />
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function ClientOnlyClock() {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const update = () => setTime(new Date().toLocaleTimeString("sv-SE", { hour12: false }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  if (!mounted) return <span>--:--:--</span>;
  return <span>{time}</span>;
}
