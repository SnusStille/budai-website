"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  Target,
  TrendingUp,
  FileText,
  Wand2,
  RotateCcw,
  Layers,
  ShieldCheck,
  LineChart,
  Mail,
  Cpu,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

interface Msg {
  id: number;
  type: "user" | "ai";
  text: string;
  timestamp?: Date;
}

function renderMarkdown(text: string): ReactNode[] {
  const pattern = /(\*\*.+?\*\*|`.+?`)/g;
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-white/10 text-accent-cyan text-[0.85em] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const PRESETS_SV = [
  {
    short: "Board-brief på 60s",
    prompt:
      "Skriv en skarp 60-sekunders board-brief för en svensk SaaS: MRR +18% QoQ, churn 2.1%, tre risker och ett konkret beslut att fatta idag.",
    icon: Target,
    tag: "Strategy",
  },
  {
    short: "Churn-radar",
    prompt:
      "Du är BudAI. Bygg en churn-riskmodell i ord: vilka 5 signaler spårar du hos nordiska B2B-kunder, hur viktar du dem, och hur ser en intervention-playbook ut vecka för vecka?",
    icon: LineChart,
    tag: "Revenue",
  },
  {
    short: "Kalla mejl som konverterar",
    prompt:
      "Skriv 3 kalla mejl på svenska till CFO:er på mid-market bolag i Stockholm. Ämnesrad + body. Ton: premium, kort, ingen hype. Erbjudande: AI som sparar 8h/vecka på rapportering.",
    icon: Mail,
    tag: "Sales",
  },
  {
    short: "Auto-pipeline",
    prompt:
      "Designa en automatiserad veckorapport-pipeline: datakällor → transform → AI-sammanfattning → Slack + e-post. Ge arkitektur, felhantering och exakt cron. Stack: Supabase, Vercel, Claude.",
    icon: Layers,
    tag: "Ops",
  },
  {
    short: "GDPR-proof AI",
    prompt:
      "Ge en konkret checklista för att köra generativ AI lagligt för ett svenskt bolag: personuppgifter, lagring i Norden, loggar, DPA, och vad man absolut inte får skicka till en modell.",
    icon: ShieldCheck,
    tag: "Trust",
  },
  {
    short: "Agent som bokar möten",
    prompt:
      "Specificera en AI-agent som bokar discovery-calls: intents, verktyg (kalender, CRM, mejl), guardrails, och hur den eskalerar till människa. Inkludera ett exempel-dialogflöde på svenska.",
    icon: Cpu,
    tag: "Agents",
  },
];

const PRESETS_EN = [
  {
    short: "60s board brief",
    prompt:
      "Write a sharp 60-second board brief for a Swedish SaaS: MRR +18% QoQ, churn 2.1%, three risks, and one decision to make today.",
    icon: Target,
    tag: "Strategy",
  },
  {
    short: "Churn radar",
    prompt:
      "Act as BudAI. Design a churn-risk model in plain language: 5 signals for Nordic B2B customers, weights, and a week-by-week intervention playbook.",
    icon: LineChart,
    tag: "Revenue",
  },
  {
    short: "Cold email that converts",
    prompt:
      "Write 3 cold emails to CFOs at Stockholm mid-market firms. Subject + body. Tone: premium, short, no hype. Offer: AI that saves 8h/week on reporting.",
    icon: Mail,
    tag: "Sales",
  },
  {
    short: "Auto pipeline",
    prompt:
      "Design an automated weekly report pipeline: sources → transform → AI summary → Slack + email. Architecture, failure modes, exact cron. Stack: Supabase, Vercel, Claude.",
    icon: Layers,
    tag: "Ops",
  },
  {
    short: "GDPR-proof AI",
    prompt:
      "Give a concrete checklist for running generative AI legally for a Swedish company: personal data, Nordic storage, logs, DPA, and what must never be sent to a model.",
    icon: ShieldCheck,
    tag: "Trust",
  },
  {
    short: "Meeting-booking agent",
    prompt:
      "Specify an AI agent that books discovery calls: intents, tools (calendar, CRM, email), guardrails, and human escalation. Include a sample dialogue in English.",
    icon: Cpu,
    tag: "Agents",
  },
];

export default function AIPlayground() {
  const { t, lang } = useLang();
  const greet =
    lang === "sv"
      ? "Hej — jag är BudAI. Testa ett skarpt scenario nedan, eller skriv något om ditt bolag. Jag svarar som om det vore skarpt läge."
      : "Hey — I'm BudAI. Try a sharp scenario below, or tell me about your company. I'll answer like it's production.";
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, type: "ai", text: greet, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [tokens, setTokens] = useState(0);
  const [latency, setLatency] = useState(11);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  const presets = lang === "sv" ? PRESETS_SV : PRESETS_EN;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingText]);

  // Subtle live metrics when idle / thinking
  useEffect(() => {
    const id = setInterval(() => {
      setLatency((l) => Math.max(7, Math.min(18, l + (Math.random() - 0.5) * 2)));
      if (thinking) setTokens((t) => t + Math.floor(Math.random() * 12 + 4));
    }, 900);
    return () => clearInterval(id);
  }, [thinking]);

  const typeResponse = async (fullText: string) => {
    setTypingText("");
    const lines = fullText.split("\n");
    let current = "";
    for (let i = 0; i < lines.length; i++) {
      current += lines[i];
      if (i < lines.length - 1) current += "\n";
      setTypingText(current);
      await new Promise((r) => setTimeout(r, 16 + Math.random() * 28));
    }
    setTypingText("");
    setMessages((prev) => [
      ...prev,
      { id: idRef.current++, type: "ai", text: fullText, timestamp: new Date() },
    ]);
  };

  const callBudAI = async (
    history: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> => {
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, lang }),
      });

      if (res.status === 429) {
        return lang === "sv"
          ? "Du har nått demons meddelandegräns för tillfället — försök igen om en stund, eller begär tidig åtkomst för att fortsätta utforska BudAI:s fulla kapacitet."
          : "You've hit the demo's message limit for now — please try again in a bit, or request early access to keep exploring BudAI's full capabilities.";
      }

      if (res.status === 503) {
        return lang === "sv"
          ? "Playground är tillfälligt offline — API-nyckeln saknas i den här miljön. Begär åtkomst så hör vi av oss snart."
          : "Playground is temporarily offline — the API key isn't configured in this environment. Request access and we'll be in touch soon.";
      }

      if (!res.ok) {
        return lang === "sv"
          ? "Något gick fel på min sida. Kan du försöka igen?"
          : "Something went wrong on my end. Mind trying that again?";
      }

      const data = await res.json();
      return (
        data.reply ||
        (lang === "sv"
          ? "Jag är inte säker på hur jag ska svara på det — kan du omformulera?"
          : "I'm not sure how to respond to that — could you rephrase?")
      );
    } catch {
      return lang === "sv"
        ? "Jag har problem med att ansluta just nu. Försök igen om en stund."
        : "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const toHistory = (newText: string) => {
    const prior = messages
      .filter((m, idx) => !(idx === 0 && m.type === "ai"))
      .map((m) => ({
        role: (m.type === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.text,
      }));
    return [...prior, { role: "user" as const, content: newText }];
  };

  const resetChat = () => {
    if (thinking) return;
    setMessages([{ id: 0, type: "ai", text: greet, timestamp: new Date() }]);
    idRef.current = 1;
    setTokens(0);
  };

  const runPrompt = async (text: string, key?: string) => {
    if (thinking) return;
    setActivePreset(key ?? text);
    setTokens(0);
    const history = toHistory(text);
    setMessages((prev) => [...prev, { id: idRef.current++, type: "user", text, timestamp: new Date() }]);
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(
      () => setConfidence((c) => Math.min(c + Math.random() * 15, 98)),
      180
    );

    const reply = await callBudAI(history);

    clearInterval(confInterval);
    setConfidence(98);
    setThinking(false);
    await typeResponse(reply);
    setConfidence(0);
    setActivePreset(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || thinking) return;
    const text = input.trim();
    setInput("");
    await runPrompt(text);
  };

  return (
    <section id="playground" className="relative py-28 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent-purple/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12 md:mb-14">
          <span className="section-badge text-accent-purple mb-4">{t.playground.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {t.playground.title} <span className="text-gradient">{t.playground.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto">{t.playground.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="rounded-3xl overflow-hidden border border-white/[0.09] bg-[#07070e]/90 shadow-[0_0_120px_rgba(0,229,255,0.12)] relative backdrop-blur-xl">
            {/* Living top edge */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent z-20" />
            <div className="absolute -top-28 -right-20 w-72 h-72 bg-accent-purple/15 rounded-full blur-[90px] pointer-events-none playground-orb" />
            <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-accent-cyan/10 rounded-full blur-[80px] pointer-events-none playground-orb-rev" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-white/[0.05] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/[0.04] via-transparent to-accent-purple/[0.05]" />
              <div className="relative flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <BudAILogo size="sm" animated />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                    BudAI Assistant
                    <span className="hidden sm:inline text-[10px] font-mono font-normal text-accent-cyan/70 px-1.5 py-0.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/20">
                      live
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                    </span>
                    <span className="truncate">{t.playground.online}</span>
                    <span className="text-white/15">·</span>
                    <span className="tabular-nums text-accent-cyan/70">{latency.toFixed(0)}ms</span>
                    {tokens > 0 && (
                      <>
                        <span className="text-white/15">·</span>
                        <span className="tabular-nums">{tokens} tok</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative flex items-center gap-2 shrink-0">
                {thinking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-[11px]"
                  >
                    <Brain className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                    <span className="text-accent-cyan">{t.playground.thinking}</span>
                    {confidence > 0 && (
                      <span className="text-muted tabular-nums">{Math.round(confidence)}%</span>
                    )}
                  </motion.div>
                )}
                {!thinking && messages.length > 1 && (
                  <button
                    onClick={resetChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-muted hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {lang === "sv" ? "Ny chatt" : "New chat"}
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-[360px] sm:h-[400px] overflow-y-auto p-4 sm:p-6 space-y-4 relative terminal-scroll"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 20% 0%, rgba(0,229,255,0.04), transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(185,103,255,0.05), transparent 45%)",
              }}
            >
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                        msg.type === "ai"
                          ? "bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_18px_rgba(0,229,255,0.25)]"
                          : "bg-white/10 border border-white/10"
                      }`}
                    >
                      {msg.type === "ai" ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[82%] px-4 sm:px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.type === "ai"
                          ? "bg-white/[0.04] text-white/90 border border-white/[0.07] shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                          : "bg-gradient-to-br from-accent-cyan/20 to-accent-purple/15 border border-accent-cyan/25 text-white"
                      }`}
                    >
                      {msg.type === "ai" ? renderMarkdown(msg.text) : msg.text}
                    </div>
                  </motion.div>
                ))}

                {typingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_18px_rgba(0,229,255,0.25)]">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/[0.04] px-5 py-3 rounded-2xl text-sm text-white/90 whitespace-pre-wrap border border-white/[0.07]">
                      {renderMarkdown(typingText)}
                      <span className="inline-block w-2 h-4 bg-accent-cyan ml-0.5 animate-pulse align-middle rounded-sm" />
                    </div>
                  </motion.div>
                )}

                {thinking && !typingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple">
                      <Bot className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-white/[0.04] px-5 py-3.5 rounded-2xl flex items-center gap-3 border border-white/[0.07]">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            className={`w-2 h-2 rounded-full ${
                              d === 0 ? "bg-accent-cyan" : d === 1 ? "bg-accent-purple" : "bg-accent-green"
                            }`}
                            animate={{ scale: [1, 1.35, 1], opacity: [0.45, 1, 0.45] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted">{t.playground.analyzing}</span>
                      <span className="text-[10px] font-mono text-accent-cyan/60 tabular-nums">
                        {Math.round(confidence)}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Impressive preset grid */}
            <div className="px-4 sm:px-5 py-3 border-t border-white/[0.05] bg-white/[0.015]">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted/50 mb-2.5 px-0.5">
                {lang === "sv" ? "Prova något som imponerar" : "Try something impressive"}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {presets.map((p) => {
                  const active = activePreset === p.short;
                  return (
                    <button
                      key={p.short}
                      onClick={() => runPrompt(p.prompt, p.short)}
                      disabled={thinking}
                      className={`group text-left rounded-xl px-3 py-2.5 border transition-all duration-300 disabled:opacity-50 ${
                        active
                          ? "bg-accent-cyan/12 border-accent-cyan/35 shadow-[0_0_20px_rgba(0,229,255,0.12)]"
                          : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p.icon
                          className={`w-3.5 h-3.5 ${active ? "text-accent-cyan" : "text-muted group-hover:text-accent-cyan"} transition-colors`}
                        />
                        <span className="text-[10px] font-mono text-muted/60 uppercase tracking-wide">
                          {p.tag}
                        </span>
                      </div>
                      <div className="text-xs sm:text-[13px] font-medium text-white/90 leading-snug">
                        {p.short}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 border-t border-white/[0.05] bg-[#080810]">
              <div className="flex gap-2.5">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      lang === "sv"
                        ? "Beskriv ett riktigt problem — t.ex. 'Minska churn i vår SaaS'…"
                        : "Describe a real problem — e.g. 'Cut churn in our SaaS'…"
                    }
                    disabled={thinking}
                    className="w-full px-4 sm:px-5 py-3.5 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-muted/70 focus:outline-none focus:border-accent-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] disabled:opacity-50 transition-shadow"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Wand2 className="w-4 h-4 text-muted/35" />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={thinking || !input.trim()}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(0,229,255,0.2)] hover:shadow-[0_0_36px_rgba(0,229,255,0.35)] transition-shadow"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </div>
        </ScrollReveal>

        {/* Capability chips under chat — living strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: Sparkles, label: lang === "sv" ? "Resonemang" : "Reasoning" },
            { icon: Zap, label: lang === "sv" ? "Automation" : "Automation" },
            { icon: TrendingUp, label: lang === "sv" ? "Analys" : "Analytics" },
            { icon: FileText, label: lang === "sv" ? "Dokument" : "Documents" },
            { icon: Brain, label: lang === "sv" ? "Agenter" : "Agents" },
          ].map((c) => (
            <span
              key={c.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-muted border border-white/[0.06] bg-white/[0.02]"
            >
              <c.icon className="w-3 h-3 text-accent-cyan/70" />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
