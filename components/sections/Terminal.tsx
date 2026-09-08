"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal as TermIcon,
  Copy,
  Check,
  Brain,
  Cpu,
  Database,
  Zap,
  Shield,
  Activity,
  RotateCcw,
} from "lucide-react";
import CodeBackground from "@/components/effects/CodeBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";

interface TLine {
  id: number;
  type: "cmd" | "out" | "sys" | "think" | "success" | "code";
  text: string;
}

function highlightCode(text: string) {
  const tokens: { re: RegExp; className: string }[] = [
    { re: /(\/\/.*$)/, className: "text-muted/40 italic" },
    { re: /(".*?"|'.*?'|`.*?`)/, className: "text-accent-green" },
    {
      re: /\b(const|let|var|function|return|import|export|from|async|await|interface|type|if|else|for|of|in|new|class|def|SELECT|FROM|WHERE)\b/,
      className: "text-accent-purple font-medium",
    },
    { re: /\b(useState|useEffect|React|NextResponse|BudAI)\b/, className: "text-accent-cyan" },
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

const BOOT: { type: TLine["type"]; text: string; delay: number; typeSpeed?: number }[] = [
  { type: "sys", text: "  BUDAI NEURAL INTERFACE v0.92  ·  Stilledev Systems", delay: 20 },
  { type: "sys", text: "  region=nordic  kernel=budai-core-4.2  build=2026.09", delay: 30 },
  { type: "cmd", text: "budai init --enterprise --secure", delay: 220, typeSpeed: 14 },
  { type: "out", text: "  memory     16GB  ████████████  ok", delay: 45 },
  { type: "out", text: "  model      8.7B  Q4_K_M        ok", delay: 45 },
  { type: "out", text: "  nodes      sto · osl · hel     ok", delay: 45 },
  { type: "success", text: "  ✓ neural engine ready · 11ms avg · TLS 1.3", delay: 100 },
  { type: "sys", text: "  streaming live tasks…", delay: 120 },
];

function codeLines(lines: string[], speed = 3) {
  return lines.map((text) => ({
    type: "code" as const,
    text,
    delay: 6,
    typeSpeed: speed,
  }));
}

const LIVE = [
  ...codeLines([
    "// api/revenue/route.ts",
    'import { NextResponse } from "next/server";',
    'import { getQuarterlyRevenue } from "@/lib/analytics";',
    "",
    "export async function GET(req: Request) {",
    '  const q = new URL(req.url).searchParams.get("q") ?? "Q3";',
    "  const data = await getQuarterlyRevenue(q);",
    "  return NextResponse.json({ quarter: q, ...data });",
    "}",
    "",
  ]),
  ...codeLines(
    [
      "# jobs/weekly_digest.py",
      "from budai.reports import RevenueReport",
      "from budai.mailer import send_email",
      "",
      "def run(recipients: list[str]) -> None:",
      "    report = RevenueReport.for_week()",
      '    send_email(recipients, subject="Weekly Digest", body=report.render())',
      "",
    ],
    2
  ),
  ...codeLines(
    [
      "-- queries/churn_risk.sql",
      "SELECT c.company_name, c.mrr_sek,",
      "  DATEDIFF(day, c.last_active_at, CURRENT_DATE) AS days_inactive",
      "FROM customers c",
      "WHERE c.status = 'active'",
      "ORDER BY c.mrr_sek DESC;",
      "",
    ],
    2
  ),
];

const NEURAL = [
  "tokenize · 32 heads",
  "embed · swedish pack",
  "kv-cache · 94.2% hit",
  "stream · sse flowing",
  "guard · pii safe",
  "gpu · 72% · 18.1/24GB",
  "flash-attn 2 · active",
  "nordic-pool · 11ms",
];

function sleep(ms: number, signal?: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      const check = setInterval(() => {
        if (signal.cancelled) {
          clearTimeout(t);
          clearInterval(check);
          resolve();
        }
      }, 40);
      setTimeout(() => clearInterval(check), ms + 10);
    }
  });
}

export default function Terminal() {
  const { t, lang } = useLang();
  const [lines, setLines] = useState<TLine[]>([]);
  const [typing, setTyping] = useState("");
  const [typingType, setTypingType] = useState<"cmd" | "code">("cmd");
  const [copied, setCopied] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [neuralLogs, setNeuralLogs] = useState<string[]>([]);
  const [inView, setInView] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [clock, setClock] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const lineId = useRef(0);
  const sessionRef = useRef(0);
  const activeRunner = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.2 && rect.bottom > 0) setInView(true);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.08, rootMargin: "120px 0px" }
    );
    obs.observe(el);
    const failsafe = setTimeout(() => setInView(true), 8000);
    return () => {
      obs.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString(lang === "sv" ? "sv-SE" : "en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lang]);

  useEffect(() => {
    if (!inView) return;
    const mySession = ++sessionRef.current;
    activeRunner.current = mySession;
    const signal = { cancelled: false };

    setLines([]);
    setTyping("");
    setIsComplete(false);
    setNeuralLogs([]);
    lineId.current = 0;

    const MAX = 120;
    const stillActive = () => activeRunner.current === mySession && !signal.cancelled;

    const append = (type: TLine["type"], text: string) => {
      if (!stillActive()) return;
      setLines((p) => {
        const next = [...p, { id: lineId.current++, type, text }];
        return next.length > MAX ? next.slice(-MAX) : next;
      });
    };

    const runPhase = async (phase: {
      type: string;
      text: string;
      delay: number;
      typeSpeed?: number;
    }) => {
      if (!stillActive()) return;
      if (phase.type === "cmd" || phase.type === "code") {
        setTyping("");
        setTypingType(phase.type as "cmd" | "code");
        const speed = phase.typeSpeed ?? (phase.type === "code" ? 3 : 14);
        for (let j = 0; j <= phase.text.length; j++) {
          if (!stillActive()) return;
          setTyping(phase.text.slice(0, j));
          await sleep(phase.type === "code" ? speed : 5 + Math.random() * speed, signal);
        }
        await sleep(phase.type === "code" ? 6 : 50, signal);
        if (!stillActive()) return;
        append(phase.type as TLine["type"], phase.text);
        setTyping("");
      } else {
        await sleep(phase.delay, signal);
        if (!stillActive()) return;
        append(phase.type as TLine["type"], phase.text);
      }
    };

    (async () => {
      for (const phase of BOOT) {
        if (!stillActive()) return;
        await runPhase(phase);
      }
      if (!stillActive()) return;
      setIsComplete(true);
      while (stillActive()) {
        for (const phase of LIVE) {
          if (!stillActive()) return;
          await runPhase(phase);
        }
        await sleep(350, signal);
      }
    })();

    return () => {
      signal.cancelled = true;
    };
  }, [inView, runKey]);

  useEffect(() => {
    if (!isComplete) return;
    let i = 0;
    const interval = setInterval(() => {
      setNeuralLogs((prev) => {
        const next = [...prev, NEURAL[i % NEURAL.length]];
        i++;
        return next.length > 5 ? next.slice(-5) : next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isComplete, runKey]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, typing, neuralLogs]);

  const copy = useCallback(() => {
    const text = lines.map((l) => (l.type === "cmd" ? `$ ${l.text}` : l.text)).join("\n");
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [lines]);

  const replay = () => {
    activeRunner.current = 0;
    setRunKey((k) => k + 1);
  };

  const color = (type: string) => {
    switch (type) {
      case "cmd":
        return "text-white";
      case "code":
        return "text-white/90";
      case "think":
        return "text-accent-purple/85";
      case "success":
        return "text-accent-green";
      case "sys":
        return "text-accent-cyan/70";
      default:
        return "text-muted/75";
    }
  };

  return (
    <section id="terminal" ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-green/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <CodeBackground />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-12 md:mb-14">
          <span className="section-badge text-accent-green mb-4">{t.terminal.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {t.terminal.title}{" "}
            <span className="text-gradient-cyan">{t.terminal.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto">{t.terminal.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07070c] shadow-[0_0_100px_rgba(0,229,255,0.11)]">
            {/* Soft top glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-0 z-[5] opacity-[0.03] terminal-scanlines" />

            {/* Title bar — minimal */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-white/[0.05] bg-[#0a0a12]/90 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/90" />
                <span className="ml-2 text-[11px] font-mono text-muted/50 hidden sm:inline">
                  neural-shell
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted/60 font-mono">
                <TermIcon className="w-3.5 h-3.5 text-accent-cyan/70" />
                <span>budai@stilledev</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={replay}
                  className="p-1.5 rounded-md hover:bg-white/5 text-muted hover:text-white transition-colors"
                  aria-label="Replay"
                  title="Replay"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={copy}
                  className="p-1.5 rounded-md hover:bg-white/5 text-muted hover:text-white transition-colors"
                  aria-label="Copy"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="p-4 sm:p-5 h-[360px] sm:h-[460px] overflow-y-auto font-mono text-[11px] sm:text-[12.5px] leading-relaxed terminal-scroll relative z-10"
            >
              {!inView && (
                <div className="flex items-center gap-2 text-muted/50 py-10 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  {lang === "sv" ? "Väntar…" : "Waiting…"}
                </div>
              )}

              {inView && lines.length === 0 && !typing && (
                <div className="flex items-center gap-2 text-accent-cyan/60 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  boot…
                </div>
              )}

              {(() => {
                let codeLineNo = 0;
                const rendered = lines.map((l) => {
                  if (l.type === "cmd") codeLineNo = 0;
                  if (l.type === "code" && /^\s*(\/\/|#|--)\s*\S+\.(tsx?|jsx?|py|sql)\b/.test(l.text))
                    codeLineNo = 0;
                  if (l.type === "code") codeLineNo += 1;
                  return (
                    <div key={l.id} className="mb-0.5">
                      {l.type === "cmd" ? (
                        <div className="flex items-start gap-2">
                          <span className="text-accent-green shrink-0 select-none">❯</span>
                          <span className="text-white">{l.text}</span>
                        </div>
                      ) : l.type === "code" ? (
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 select-none text-muted/20 text-[10px] w-4 text-right tabular-nums">
                            {codeLineNo}
                          </span>
                          <span className="whitespace-pre">
                            {l.text.length ? highlightCode(l.text) : "\u00a0"}
                          </span>
                        </div>
                      ) : (
                        <div className={`${color(l.type)}`}>{l.text}</div>
                      )}
                    </div>
                  );
                });
                if (typing && typingType === "code") codeLineNo += 1;
                return (
                  <>
                    {rendered}
                    {typing && typingType === "cmd" && (
                      <div className="flex items-start gap-2">
                        <span className="text-accent-green shrink-0 select-none">❯</span>
                        <span className="text-white">{typing}</span>
                        <span
                          className={`w-1.5 h-3.5 bg-accent-cyan ml-0.5 mt-0.5 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                        />
                      </div>
                    )}
                    {typing && typingType === "code" && (
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 select-none text-muted/20 text-[10px] w-4 text-right tabular-nums">
                          {codeLineNo}
                        </span>
                        <span className="whitespace-pre">
                          {highlightCode(typing)}
                          <span
                            className={`inline-block w-1.5 h-3 bg-accent-cyan ml-0.5 align-middle ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                          />
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}

              {isComplete && neuralLogs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="text-[9px] text-muted/40 mb-1.5 uppercase tracking-[0.2em]">
                    live
                  </div>
                  {neuralLogs.map((log, i) => (
                    <div key={`${log}-${i}`} className="text-accent-cyan/50 text-[11px] mb-0.5">
                      <span className="text-accent-cyan/30 mr-1.5">›</span>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status bar — clean metrics */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.05] bg-[#0a0a12] text-[10px] font-mono text-muted/55 flex-wrap gap-2 relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-accent-purple/70" /> 8.7B
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-accent-cyan/70" /> 11ms
                </span>
                <span className="flex items-center gap-1 hidden sm:flex">
                  <Database className="w-3 h-3" /> 3 nodes
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-accent-green" /> A+
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-accent-green" /> 99.97%
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-accent-cyan" /> v0.92
                </span>
                {clock && (
                  <span className="text-accent-cyan/45 tabular-nums hidden sm:inline">{clock}</span>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
