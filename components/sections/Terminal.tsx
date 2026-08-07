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
    const text = lines.map((l) => l.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeColors: Record<string, string> = {
    cmd: "text-accent-cyan",
    out: "text-white/70",
    sys: "text-accent-purple",
    think: "text-yellow-400/80",
    success: "text-accent-green",
    warn: "text-yellow-400",
    code: "text-white/80",
  };

  const typeIcons: Record<string, React.ElementType> = {
    cmd: TermIcon,
    out: Activity,
    sys: Database,
    think: Brain,
    success: Check,
    warn: Shield,
    code: Cpu,
  };

  return (
    <section id="terminal" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/3 rounded-full blur-[200px] pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">{t.terminal.badge}</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t.terminal.title} <span className="text-gradient-green">{t.terminal.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{t.terminal.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="rounded-2xl glass-strong border border-white/[0.06] overflow-hidden shadow-[0_0_60px_rgba(0,255,157,0.05)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-3 text-xs text-muted font-mono">budai@stilledev:~</span>
              </div>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.terminal.copied : t.terminal.copy}
              </button>
            </div>

            <div ref={scrollRef} className="h-[420px] overflow-y-auto p-5 font-mono text-xs leading-relaxed space-y-1 scrollbar-thin">
              {lines.map((line) => {
                const Icon = typeIcons[line.type] || Activity;
                return (
                  <div key={line.id} className={`flex gap-2 ${typeColors[line.type]}`}>
                    {line.type === "cmd" && <span className="text-accent-cyan shrink-0 select-none">$</span>}
                    {line.type === "code" && <span className="text-muted/30 shrink-0 select-none">│</span>}
                    {line.type === "think" && <Icon className="w-3 h-3 mt-0.5 shrink-0 opacity-60" />}
                    {line.type === "success" && <Icon className="w-3 h-3 mt-0.5 shrink-0 text-accent-green" />}
                    <span className={line.type === "code" ? "font-mono" : ""}>
                      {line.type === "code" ? highlightCode(line.text) : line.text}
                    </span>
                  </div>
                );
              })}

              {typing && (
                <div className={`flex gap-2 ${typeColors[typingType]}`}>
                  <span className="text-accent-cyan shrink-0 select-none">$</span>
                  <span>
                    {typing}
                    <span className={`inline-block w-2 h-3.5 ml-0.5 align-middle ${cursorVisible ? "bg-accent-cyan/60" : "bg-transparent"}`} />
                  </span>
                </div>
              )}

              {isComplete && neuralLogs.map((log, i) => (
                <motion.div key={`log-${logIndex}-${i}`} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-muted/40 text-[10px]">
                  {log}
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}