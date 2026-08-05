"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal as TermIcon, Copy, Check } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const cmds = [
  { cmd: "budai --init", out: "Initializing BudAI Core v0.9.2...", delay: 700 },
  { cmd: "budai --load-model enterprise", out: "Loading enterprise model... ████████████ 100%", delay: 1100 },
  { cmd: "budai --connect --region=nordic", out: "Connected to Nordic data centers. Latency: 11ms", delay: 500 },
  { cmd: "budai --status", out: "Status: OPERATIONAL\nNeural networks: ACTIVE\nData pipelines: RUNNING\nSecurity: ENTERPRISE-GRADE", delay: 900 },
  { cmd: "budai --task 'analyze Q3 revenue'", out: "Analyzing Q3 financial data...\nDetected 23% YoY growth\nIdentified 3 optimization opportunities\nReport: /reports/q3_analysis.pdf", delay: 1400 },
  { cmd: "budai --assist 'draft email'", out: "Drafting professional email...\nTone: Formal | Language: Swedish\nLength: 180 words\nDraft ready for review.", delay: 1100 },
  { cmd: "budai --automate 'weekly report'", out: "Automation workflow created.\nSchedule: Every Monday 08:00\nRecipients: management@company.se\nStatus: ACTIVE", delay: 800 },
  { cmd: "budai --version", out: "BudAI Developer Preview 0.9.2\nBuilt by Stilledev\n© 2026 All rights reserved.", delay: 400 },
];

export default function Terminal() {
  const [lines, setLines] = useState<{ type: "cmd" | "out"; text: string }[]>([]);
  const [typing, setTyping] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      for (const { cmd, out, delay } of cmds) {
        setTyping("");
        for (let j = 0; j <= cmd.length; j++) {
          setTyping(cmd.slice(0, j));
          await new Promise((r) => setTimeout(r, 25 + Math.random() * 35));
        }
        await new Promise((r) => setTimeout(r, 180));
        setLines((p) => [...p, { type: "cmd", text: cmd }]);
        setTyping("");
        await new Promise((r) => setTimeout(r, 250));
        for (const line of out.split("\n")) {
          setLines((p) => [...p, { type: "out", text: line }]);
          await new Promise((r) => setTimeout(r, 60));
        }
        await new Promise((r) => setTimeout(r, delay));
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, typing]);

  const copy = () => {
    const text = lines.map((l) => (l.type === "cmd" ? `$ ${l.text}` : l.text)).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="terminal" className="relative py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">Command Interface</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            See BudAI <span className="text-gradient-cyan">In Action</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            A live preview of how BudAI will interact with your business systems through the command line.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass-strong border border-white/[0.06]"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted font-mono">
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

            <div ref={scrollRef} className="p-5 h-[420px] overflow-y-auto font-mono text-sm leading-relaxed">
              {lines.map((l, i) => (
                <div key={i} className="mb-1">
                  {l.type === "cmd" ? (
                    <div className="flex items-start gap-2">
                      <span className="text-accent-green shrink-0 select-none">$</span>
                      <span className="text-white">{l.text}</span>
                    </div>
                  ) : (
                    <div className="text-muted/80 pl-4">{l.text}</div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex items-start gap-2">
                  <span className="text-accent-green shrink-0 select-none">$</span>
                  <span className="text-white">{typing}</span>
                  <span className="w-2 h-4 bg-accent-cyan animate-pulse ml-0.5" />
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
