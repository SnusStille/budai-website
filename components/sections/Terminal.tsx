"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal as TermIcon, Copy, Check, Brain, Cpu, Database, Zap, Shield, Activity } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";

interface TLine {
  id: number;
  type: "cmd" | "out" | "sys" | "think" | "success" | "warn" | "code";
  text: string;
}

// Small inline highlighter so the "code" lines in the terminal actually read
// like a syntax-highlighted editor rather than plain white monospace text.
function highlightCode(text: string) {
  const tokens: { re: RegExp; className: string }[] = [
    { re: /(\/\/.*$)/, className: "text-muted/40 italic" },
    { re: /(".*?"|'.*?'|`.*?`)/, className: "text-accent-green" },
    { re: /\b(const|let|var|function|return|import|export|from|async|await|interface|type|if|else|for|of|in|new|class|extends|default|try|catch|throw|def|SELECT|FROM|WHERE|GROUP BY|ORDER BY|JOIN|AS)\b/, className: "text-accent-purple font-medium" },
    { re: /\b(useState|useEffect|useMemo|React|NextResponse|Anthropic)\b/, className: "text-accent-cyan" },
    { re: /(\b\d+(\.\d+)?\b)/, className: "text-orange-300" },
  ];
  const parts: { text: string; className?: string }[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    let matched = false;
    for (const { re, className } of tokens) {
      const m = remaining.match(re);
      if (m && m.index !== undefined) {
        if (m.index > 0) parts.push({ text: remaining.slice(0, m.index) });
        parts.push({ text: m[0], className });
        remaining = remaining.slice(m.index + m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      parts.push({ text: remaining });
      break;
    }
  }
  return parts.map((p, i) => (
    <span key={i} className={p.className}>
      {p.text}
    </span>
  ));
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

// Helper to turn a plain code snippet into typed "code" phases, so each
// line streams in the same way the boot commands do — this is what makes it
// look like BudAI is actually writing the file, not just printing logs.
function codeLines(lines: string[], speed = 9): { type: string; text: string; delay: number; typeSpeed?: number }[] {
  return lines.map((text) => ({ type: "code", text, delay: 20, typeSpeed: speed }));
}

const LIVE_TASKS = [
  { type: "cmd", text: "budai generate --task 'revenue API route' --lang=ts", delay: 700, typeSpeed: 28 },
  { type: "think", text: "[PLAN] Scaffolding a typed Next.js route handler...", delay: 300 },
  { type: "sys", text: "  writing app/api/revenue/route.ts", delay: 150 },
  ...codeLines([
    "import { NextResponse } from \"next/server\";",
    "import { getQuarterlyRevenue } from \"@/lib/analytics\";",
    "",
    "export async function GET(req: Request) {",
    "  const { searchParams } = new URL(req.url);",
    "  const quarter = searchParams.get(\"q\") ?? \"Q3\";",
    "",
    "  const data = await getQuarterlyRevenue(quarter);",
    "  const yoyGrowth = ((data.current - data.previous) / data.previous) * 100;",
    "",
    "  return NextResponse.json({",
    "    quarter,",
    "    revenueSek: data.current,",
    "    yoyGrowth: Number(yoyGrowth.toFixed(1)),",
    "    topSegment: data.topSegment,",
    "  });",
    "}",
  ]),
  { type: "success", text: "✓ app/api/revenue/route.ts written · 0 type errors", delay: 250 },
  { type: "out", text: "", delay: 200 },

  { type: "cmd", text: "budai generate --task 'stakeholder digest' --lang=python", delay: 800, typeSpeed: 28 },
  { type: "think", text: "[PLAN] Writing a summarizer for the weekly digest job...", delay: 300 },
  { type: "sys", text: "  writing jobs/weekly_digest.py", delay: 150 },
  ...codeLines([
    "from datetime import datetime",
    "from budai.reports import RevenueReport",
    "from budai.mailer import send_email",
    "",
    "def build_weekly_digest(report: RevenueReport) -> str:",
    "    lines = [",
    "        f\"Revenue: {report.total_sek:,.0f} SEK\",",
    "        f\"YoY growth: {report.yoy_growth:.1f}%\",",
    "        f\"Top segment: {report.top_segment}\",",
    "    ]",
    "    return \"\\n\".join(lines)",
    "",
    "def run(recipients: list[str]) -> None:",
    "    report = RevenueReport.for_week(datetime.now())",
    "    send_email(recipients, subject=\"Weekly Digest\", body=build_weekly_digest(report))",
  ]),
  { type: "success", text: "✓ jobs/weekly_digest.py written · scheduled: Mon 08:00 CET", delay: 250 },
  { type: "out", text: "", delay: 200 },

  { type: "cmd", text: "budai generate --task 'churn risk query' --lang=sql", delay: 700, typeSpeed: 28 },
  { type: "think", text: "[PLAN] Drafting the churn-risk segment query...", delay: 300 },
  { type: "sys", text: "  writing queries/churn_risk.sql", delay: 150 },
  ...codeLines([
    "SELECT",
    "  c.customer_id,",
    "  c.company_name,",
    "  DATEDIFF(day, c.last_active_at, CURRENT_DATE) AS days_inactive,",
    "  c.mrr_sek",
    "FROM customers c",
    "LEFT JOIN usage_events u",
    "  ON u.customer_id = c.customer_id",
    "  AND u.created_at > DATEADD(day, -30, CURRENT_DATE)",
    "WHERE u.customer_id IS NULL",
    "  AND c.status = 'active'",
    "ORDER BY c.mrr_sek DESC;",
  ]),
  { type: "success", text: "✓ queries/churn_risk.sql written · 14 accounts flagged", delay: 250 },
  { type: "out", text: "", delay: 200 },

  { type: "cmd", text: "budai --status --verbose", delay: 600, typeSpeed: 25 },
  { type: "out", text: "  Status:        OPERATIONAL", delay: 150 },
  { type: "out", text: "  Neural nets:   ACTIVE (8.7B params)", delay: 150 },
  { type: "out", text: "  Data pipes:    RUNNING (3 nodes)", delay: 150 },
  { type: "out", text: "  Security:      ENTERPRISE-GRADE (A+)", delay: 150 },
  { type: "out", text: "  Files written today: 214", delay: 150 },
  { type: "out", text: "", delay: 80 },
  { type: "sys", text: "  [Live inference stream continuing...]", delay: 300 },
  { type: "out", text: "", delay: 200 },
];

export default function Terminal() {
  const { t } = useLang();
  const [lines, setLines] = useState<TLine[]>([]);
  const [typing, setTyping] = useState("");
  const [typingType, setTypingType] = useState<"cmd" | "code">("cmd");
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
    let cancelled = false;

    // Keeps state (and the DOM) bounded even though the terminal now loops
    // forever — without this, `lines` would grow without limit the longer
    // someone leaves the tab open.
    const MAX_LINES = 160;
    const appendLine = (type: TLine["type"], text: string) => {
      setLines((p) => {
        const next = [...p, { id: lineId.current++, type, text }];
        return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
      });
    };

    const runPhase = async (phase: { type: string; text: string; delay: number; typeSpeed?: number }) => {
      if (phase.type === "cmd" || phase.type === "code") {
        setTyping("");
        setTypingType(phase.type as "cmd" | "code");
        const speed = phase.typeSpeed || (phase.type === "code" ? 8 : 30);
        for (let j = 0; j <= phase.text.length; j++) {
          if (cancelled) return;
          setTyping(phase.text.slice(0, j));
          await new Promise((r) => setTimeout(r, phase.type === "code" ? speed : 10 + Math.random() * speed));
        }
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, phase.type === "code" ? 15 : 150));
        appendLine(phase.type as TLine["type"], phase.text);
        setTyping("");
      } else {
        await new Promise((r) => setTimeout(r, phase.delay));
        if (cancelled) return;
        appendLine(phase.type as TLine["type"], phase.text);
      }
    };

    const run = async () => {
      for (const phase of BOOT_PHASES) {
        if (cancelled) return;
        await runPhase(phase);
      }
      if (cancelled) return;
      setIsComplete(true);

      // The terminal must never stop: once boot finishes, keep replaying the
      // live task simulation indefinitely so it always looks like BudAI is
      // actively working, not frozen on a finished script.
      while (!cancelled) {
        for (const phase of LIVE_TASKS) {
          if (cancelled) return;
          await runPhase(phase);
        }
        if (cancelled) return;
        appendLine("sys", "  [Cycle complete. Restarting live inference loop...]");
        await new Promise((r) => setTimeout(r, 600));
      }
    };
    run();

    return () => {
      cancelled = true;
    };
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
      case "code": return "text-white/90";
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
              {(() => {
                let codeLineNo = 0;
                const rendered = lines.map((l) => {
                  const prefix = getPrefix(l.type);
                  if (l.type === "cmd") codeLineNo = 0;
                  if (l.type === "code") codeLineNo += 1;
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
                      ) : l.type === "code" ? (
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 select-none text-muted/25 text-[11px] w-5 text-right tabular-nums">{codeLineNo}</span>
                          <span className="whitespace-pre">{l.text.length ? highlightCode(l.text) : "\u00a0"}</span>
                        </div>
                      ) : (
                        <div className={`${getLineColor(l.type)} pl-4`}>{l.text}</div>
                      )}
                    </motion.div>
                  );
                });
                if (typing && typingType === "code") codeLineNo += 1;
                return (
                  <>
                    {rendered}
                    {typing && typingType === "cmd" && (
                      <div className="flex items-start gap-2">
                        <span className="text-accent-green shrink-0 select-none font-bold">$</span>
                        <span className="text-white">{typing}</span>
                        <span className={`w-2 h-4 bg-accent-cyan ml-0.5 ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
                      </div>
                    )}
                    {typing && typingType === "code" && (
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 select-none text-muted/25 text-[11px] w-5 text-right tabular-nums">{codeLineNo}</span>
                        <span className="whitespace-pre">
                          {highlightCode(typing)}
                          <span className={`inline-block w-1.5 h-3.5 bg-accent-cyan ml-0.5 align-middle ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}

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
