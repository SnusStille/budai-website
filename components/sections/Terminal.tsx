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
  { type: "sys", text: "  BUDAI · v0.93 · nordic · stilledev", delay: 20 },
  { type: "cmd", text: "budai status --live", delay: 200, typeSpeed: 12 },
  { type: "out", text: "  engine     online   8.7B params", delay: 40 },
  { type: "out", text: "  nodes      3/3      sto · osl · hel", delay: 40 },
  { type: "out", text: "  security   A+       TLS 1.3 · GDPR", delay: 40 },
  { type: "success", text: "  ✓ ready for inference · 11ms avg", delay: 90 },
  { type: "sys", text: "  streaming tasks…", delay: 100 },
];

function codeLines(lines: string[], speed = 3) {
  return lines.map((text) => ({ type: "code" as const, text, delay: 6, typeSpeed: speed }));
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
];

const NEURAL = [
  "attention · 32 heads",
  "embed · swedish pack",
  "kv-cache · 94% hit",
  "stream · sse",
  "guard · pii safe",
  "gpu · 72%",
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

    const stillActive = () => activeRunner.current === mySession && !signal.cancelled;
    const append = (type: TLine["type"], text: string) => {
      if (!stillActive()) return;
      setLines((p) => {
        const next = [...p, { id: lineId.current++, type, text }];
        return next.length > 100 ? next.slice(-100) : next;
      });
    };

    const runPhase = async (phase: { type: string; text: string; delay: number; typeSpeed?: number }) => {
      if (!stillActive()) return;
      if (phase.type === "cmd" || phase.type === "code") {
        setTyping("");
        setTypingType(phase.type as "cmd" | "code");
        const speed = phase.typeSpeed ?? (phase.type === "code" ? 3 : 12);
        for (let j = 0; j <= phase.text.length; j++) {
          if (!stillActive()) return;
          setTyping(phase.text.slice(0, j));
          await sleep(phase.type === "code" ? speed : 5 + Math.random() * speed, signal);
        }
        await sleep(phase.type === "code" ? 6 : 40, signal);
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
        await sleep(400, signal);
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
        return next.length > 4 ? next.slice(-4) : next;
      });
    }, 1600);
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

  const color = (type: string) => {
    switch (type) {
      case "success":
        return "text-accent-green";
      case "sys":
        return "text-accent-cyan/65";
      case "think":
        return "text-accent-purple/80";
      default:
        return "text-muted/75";
    }
  };

  return (
    <section id="terminal" ref={sectionRef} className="relative section-hairline py-20 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,560px)] h-[min(90vw,560px)] bg-accent-green/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <CodeBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-10 sm:mb-14">
          <span className="section-badge text-accent-green mb-4">{t.terminal.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
            {t.terminal.title} <span className="text-gradient-cyan">{t.terminal.titleHighlight}</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl mx-auto">{t.terminal.subtitle}</p>
          <p className="mt-3 text-[11px] text-muted/50 font-mono">
            {lang === "sv" ? "illustration · inte live-shell" : "illustration · not a live shell"}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.09] bg-[#06060c] shadow-[0_0_80px_rgba(0,229,255,0.08)]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/55 to-transparent z-20" />

            {/* Title bar */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 border-b border-white/[0.05] bg-[#0a0a12]/95 relative z-10 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/90 shrink-0" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/90 shrink-0" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/90 shrink-0" />
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-[11px] font-mono text-muted/50 truncate">
                  neural-shell
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-muted/60 font-mono shrink-0">
                <TermIcon className="w-3.5 h-3.5 text-accent-cyan/70" />
                <span className="hidden xs:inline sm:inline">budai@stilledev</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => {
                    activeRunner.current = 0;
                    setRunKey((k) => k + 1);
                  }}
                  className="p-1.5 rounded-md hover:bg-white/5 text-muted hover:text-white transition-colors"
                  aria-label="Replay"
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
              className="p-3 sm:p-5 h-[320px] sm:h-[420px] md:h-[460px] overflow-y-auto font-mono text-[11px] sm:text-[12.5px] leading-relaxed terminal-scroll relative z-10"
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
                  if (l.type === "code" && /^\s*(\/\/|#|--)\s*\S+\.(tsx?|jsx?|py|sql)\b/.test(l.text)) codeLineNo = 0;
                  if (l.type === "code") codeLineNo += 1;
                  return (
                    <div key={l.id} className="mb-0.5">
                      {l.type === "cmd" ? (
                        <div className="flex items-start gap-2">
                          <span className="text-accent-green shrink-0 select-none">❯</span>
                          <span className="text-white break-all">{l.text}</span>
                        </div>
                      ) : l.type === "code" ? (
                        <div className="flex items-start gap-2 sm:gap-3 overflow-x-auto">
                          <span className="shrink-0 select-none text-muted/20 text-[10px] w-4 text-right tabular-nums">
                            {codeLineNo}
                          </span>
                          <span className="whitespace-pre">{l.text.length ? highlightCode(l.text) : "\u00a0"}</span>
                        </div>
                      ) : (
                        <div className={`${color(l.type)} break-all`}>{l.text}</div>
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
                        <span className="text-accent-green shrink-0">❯</span>
                        <span className="text-white break-all">{typing}</span>
                        <span className={`w-1.5 h-3.5 bg-accent-cyan ml-0.5 mt-0.5 shrink-0 ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
                      </div>
                    )}
                    {typing && typingType === "code" && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="shrink-0 text-muted/20 text-[10px] w-4 text-right tabular-nums">{codeLineNo}</span>
                        <span className="whitespace-pre">
                          {highlightCode(typing)}
                          <span className={`inline-block w-1.5 h-3 bg-accent-cyan ml-0.5 align-middle ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}

              {isComplete && neuralLogs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="text-[9px] text-muted/40 mb-1.5 uppercase tracking-[0.2em]">live</div>
                  {neuralLogs.map((log, i) => (
                    <div key={`${log}-${i}`} className="text-accent-cyan/50 text-[11px] mb-0.5">
                      <span className="text-accent-cyan/30 mr-1.5">›</span>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-t border-white/[0.05] bg-[#0a0a12] text-[9px] sm:text-[10px] font-mono text-muted/55 flex-wrap gap-2 relative z-10">
              <div className="flex items-center gap-2.5 sm:gap-4">
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-accent-purple/70" /> 8.7B
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-accent-cyan/70" /> 11ms
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <Database className="w-3 h-3" /> 3 nodes
                </span>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-4">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-accent-green" /> A+
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-accent-green" /> 99.97%
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-accent-cyan" /> v0.93
                </span>
                {clock && <span className="text-accent-cyan/45 tabular-nums hidden sm:inline">{clock}</span>}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
