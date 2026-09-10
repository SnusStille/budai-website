"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Sparkles,
  Zap,
  Brain,
  Wand2,
  RotateCcw,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  StopCircle,
  Maximize2,
  Minimize2,
  Clock,
  Share2,
  Dice5,
  Languages,
  X,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

interface Msg {
  id: number;
  type: "user" | "ai";
  text: string;
  dual?: { title: string; body: string }[];
  picked?: number;
  ts?: number;
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
    return <span key={i}>{part}</span>;
  });
}

const RANDOM_PROMPTS_SV = [
  "Skriv en skarp 60-sekunders board-brief för en svensk SaaS: MRR +18% QoQ, churn 2.1%, tre risker och ett konkret beslut idag.",
  "Bygg en churn-riskmodell i ord: 5 signaler hos nordiska B2B-kunder, vikter, och en intervention-playbook vecka för vecka.",
  "Skriv 3 kalla mejl på svenska till CFO:er på mid-market bolag i Stockholm. Ämnesrad + body. Premium, kort. Erbjudande: AI som sparar 8h/vecka.",
  "Designa en automatiserad veckorapport-pipeline: källor → transform → AI-sammanfattning → Slack + e-post. Arkitektur, felhantering, cron.",
  "Checklista för generativ AI lagligt för svenskt bolag: personuppgifter, lagring i Norden, loggar, DPA, vad man aldrig skickar till en modell.",
  "Specificera en AI-agent som bokar discovery-calls: intents, verktyg, guardrails, eskalering. Exempel-dialog på svenska.",
  "Sammanfatta hur ett litet e-handelsbolag sparar 10 timmar/vecka med AI — konkret stack och ROI-kalkyl.",
  "Skriv en onboarding-mailsekvens (3 mejl) för early-access till BudAI med tonen premium men varm.",
  "Jämför tre arkitekturer för RAG på svenska dokument: för- och nackdelar, kostnad, latency.",
  "Ge mig en 7-dagars plan för att gå från idé till MVP för en intern AI-assistent i ett konsultbolag.",
];

const RANDOM_PROMPTS_EN = [
  "Write a sharp 60-second board brief for a Swedish SaaS: MRR +18% QoQ, churn 2.1%, three risks, one decision today.",
  "Design a churn-risk model: 5 signals for Nordic B2B, weights, week-by-week intervention playbook.",
  "Write 3 cold emails to CFOs at Stockholm mid-market firms. Subject + body. Premium, short. Offer: AI that saves 8h/week on reporting.",
  "Design weekly report pipeline: sources → transform → AI summary → Slack + email. Architecture, failures, cron.",
  "Checklist for legal generative AI in a Swedish company: personal data, Nordic storage, logs, DPA, what never to send to a model.",
  "Specify an AI agent that books discovery calls: intents, tools, guardrails, escalation. Sample dialogue.",
  "Explain how a small e-commerce team saves 10 hours/week with AI — concrete stack and ROI sketch.",
  "Write a 3-email onboarding sequence for BudAI early access — premium but warm tone.",
  "Compare three RAG architectures for Swedish documents: pros, cons, cost, latency.",
  "Give a 7-day plan from idea to MVP for an internal AI assistant at a consultancy.",
];

type Mode = "single" | "dual" | "concise";

export default function AIPlayground() {
  const { t, lang } = useLang();
  const greet =
    lang === "sv"
      ? "Hej — jag är BudAI. Skriv en fråga, eller tryck Random för en överraskning. Single är standard; slå på Dual om du vill ha två alternativ."
      : "Hey — I'm BudAI. Ask anything, or hit Random for a surprise. Single is default; flip Dual when you want two options.";

  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, type: "ai", text: greet, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [latency, setLatency] = useState(11);
  const [mode, setMode] = useState<Mode>("single");
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [randomOpen, setRandomOpen] = useState(false);
  const [pendingRandom, setPendingRandom] = useState<{ sv: string; en: string } | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const idRef = useRef(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingText, thinking]);

  useEffect(() => {
    const id = setInterval(() => {
      setLatency((l) => Math.max(7, Math.min(18, l + (Math.random() - 0.5) * 2)));
      if (thinking) setTokens((tok) => tok + Math.floor(Math.random() * 12 + 4));
    }, 1200);
    return () => clearInterval(id);
  }, [thinking]);

  const typeResponse = async (fullText: string) => {
    setTypingText("");
    abortRef.current = false;
    const words = fullText.split(/(\s+)/);
    let current = "";
    for (let i = 0; i < words.length; i++) {
      if (abortRef.current) {
        setTypingText("");
        return false;
      }
      current += words[i];
      if (i % 3 === 0 || i === words.length - 1) {
        setTypingText(current);
        await new Promise((r) => setTimeout(r, 6 + Math.random() * 10));
      }
    }
    setTypingText("");
    setMessages((prev) => [
      ...prev,
      { id: idRef.current++, type: "ai", text: fullText, ts: Date.now() },
    ]);
    return true;
  };

  const callBudAI = async (
    history: { role: "user" | "assistant"; content: string }[],
    replyLang: "sv" | "en" = lang
  ) => {
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          lang: replyLang,
          dual: mode === "dual",
          concise: mode === "concise",
        }),
      });
      if (res.status === 429) {
        return {
          dual: false as const,
          reply:
            replyLang === "sv"
              ? "Meddelandegräns nådd — försök snart igen, eller begär tidig åtkomst."
              : "Message limit reached — try again soon, or request early access.",
        };
      }
      if (res.status === 503) {
        return {
          dual: false as const,
          reply:
            replyLang === "sv"
              ? "Playground offline — API-nyckel saknas i den här miljön."
              : "Playground offline — API key missing in this environment.",
        };
      }
      if (!res.ok) {
        return {
          dual: false as const,
          reply: replyLang === "sv" ? "Något gick fel. Försök igen?" : "Something went wrong. Try again?",
        };
      }
      const data = await res.json();
      if (data.dual && Array.isArray(data.replies) && data.replies.length >= 2) {
        return {
          dual: true as const,
          replies: data.replies as { title: string; body: string }[],
        };
      }
      return {
        dual: false as const,
        reply:
          (data.reply as string) ||
          (replyLang === "sv" ? "Kan du omformulera?" : "Could you rephrase?"),
      };
    } catch {
      return {
        dual: false as const,
        reply:
          replyLang === "sv"
            ? "Anslutningsproblem. Försök snart igen."
            : "Connection issue. Try again soon.",
      };
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
    setMessages([{ id: 0, type: "ai", text: greet, ts: Date.now() }]);
    idRef.current = 1;
    setTokens(0);
    setLastPrompt(null);
    setFeedback({});
  };

  const stopGen = () => {
    abortRef.current = true;
    setThinking(false);
    setTypingText("");
    setConfidence(0);
  };

  const runPrompt = async (text: string, replyLang: "sv" | "en" = lang) => {
    if (thinking) return;
    setLastPrompt(text);
    setTokens(0);
    abortRef.current = false;
    const history = toHistory(text);
    setMessages((prev) => [
      ...prev,
      { id: idRef.current++, type: "user", text, ts: Date.now() },
    ]);
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(
      () => setConfidence((c) => Math.min(c + Math.random() * 15, 98)),
      200
    );
    const result = await callBudAI(history, replyLang);
    clearInterval(confInterval);
    if (abortRef.current) {
      setThinking(false);
      setConfidence(0);
      return;
    }
    setConfidence(98);
    setThinking(false);
    if (result.dual) {
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          type: "ai",
          text: result.replies[0].body,
          dual: result.replies,
          picked: undefined,
          ts: Date.now(),
        },
      ]);
    } else {
      await typeResponse(result.reply);
    }
    setConfidence(0);
  };

  const pickDual = (msgId: number, idx: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.dual ? { ...m, picked: idx, text: m.dual[idx].body } : m
      )
    );
  };

  const regenerate = async () => {
    if (!lastPrompt || thinking) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === "ai" && prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
    const text = lastPrompt;
    setTokens(0);
    abortRef.current = false;
    const history = toHistory(text).slice(0, -1);
    const hist =
      history.length && history[history.length - 1].role === "user"
        ? history
        : [...history, { role: "user" as const, content: text }];
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(
      () => setConfidence((c) => Math.min(c + Math.random() * 15, 98)),
      200
    );
    const result = await callBudAI(hist);
    clearInterval(confInterval);
    setConfidence(98);
    setThinking(false);
    if (result.dual) {
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          type: "ai",
          text: result.replies[0].body,
          dual: result.replies,
          ts: Date.now(),
        },
      ]);
    } else {
      await typeResponse(result.reply);
    }
    setConfidence(0);
  };

  const openRandom = () => {
    if (thinking) return;
    const i = Math.floor(Math.random() * RANDOM_PROMPTS_SV.length);
    setPendingRandom({ sv: RANDOM_PROMPTS_SV[i], en: RANDOM_PROMPTS_EN[i] });
    setRandomOpen(true);
  };

  const confirmRandom = (replyLang: "sv" | "en") => {
    if (!pendingRandom) return;
    const text = replyLang === "sv" ? pendingRandom.sv : pendingRandom.en;
    setRandomOpen(false);
    setPendingRandom(null);
    void runPrompt(text, replyLang);
  };

  const copyMsg = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const shareMsg = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "BudAI",
          text: text.slice(0, 500),
          url: window.location.origin + "/#playground",
        });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || thinking) return;
    const text = input.trim();
    setInput("");
    await runPrompt(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !thinking) {
        const text = input.trim();
        setInput("");
        void runPrompt(text);
      }
    }
  };

  const modes: { id: Mode; label: string; hint: string }[] = [
    {
      id: "single",
      label: lang === "sv" ? "Single" : "Single",
      hint: lang === "sv" ? "Ett djupt svar" : "One deep answer",
    },
    {
      id: "dual",
      label: lang === "sv" ? "Dual" : "Dual",
      hint: lang === "sv" ? "Två alternativ" : "Two options",
    },
    {
      id: "concise",
      label: lang === "sv" ? "Kort" : "Concise",
      hint: lang === "sv" ? "Snabb" : "Fast",
    },
  ];

  return (
    <section id="playground" className="relative py-20 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,800px)] h-[min(100vw,800px)] bg-accent-purple/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 sm:mb-12">
          <span className="section-badge text-accent-purple mb-4">{t.playground.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
            {t.playground.title}{" "}
            <span className="text-gradient">{t.playground.titleHighlight}</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl mx-auto">
            {t.playground.subtitle}
          </p>
          <p className="mt-3 text-xs sm:text-sm text-accent-cyan/70 max-w-xl mx-auto">
            {lang === "sv"
              ? "Enda live-testet före launch — random, dual, regenerera, expandera."
              : "The only live trial before launch — random, dual, regenerate, expand."}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div
            className={`rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.1] bg-[#06060c]/96 shadow-[0_0_120px_rgba(0,229,255,0.12)] relative ${
              expanded ? "fixed inset-3 sm:inset-6 z-[80] max-w-none rounded-2xl" : ""
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent z-20" />
            {!expanded && (
              <>
                <div className="absolute -top-24 -right-16 w-56 h-56 bg-accent-purple/12 rounded-full blur-[80px] pointer-events-none playground-orb" />
                <div className="absolute -bottom-20 -left-12 w-44 h-44 bg-accent-cyan/8 rounded-full blur-[70px] pointer-events-none playground-orb-rev" />
              </>
            )}

            {/* Header */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-3.5 border-b border-white/[0.06] relative bg-[#080810]/85 backdrop-blur-md">
              <div className="relative flex items-center gap-2.5 sm:gap-3 min-w-0">
                <BudAILogo size="sm" animated={false} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                    BudAI Playground
                    <span className="hidden sm:inline text-[10px] font-mono font-normal text-accent-green/90 px-1.5 py-0.5 rounded-md bg-accent-green/10 border border-accent-green/20">
                      live
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted font-mono">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                    </span>
                    <span className="truncate">{t.playground.online}</span>
                    <span className="text-white/15">·</span>
                    <span className="tabular-nums text-accent-cyan/70">{latency.toFixed(0)}ms</span>
                    {tokens > 0 && (
                      <>
                        <span className="text-white/15 hidden sm:inline">·</span>
                        <span className="tabular-nums hidden sm:inline">{tokens} tok</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative flex items-center gap-1.5 shrink-0">
                {thinking && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-[11px]">
                    <Brain className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                    <span className="text-accent-cyan">{t.playground.thinking}</span>
                    {confidence > 0 && (
                      <span className="text-muted tabular-nums">{Math.round(confidence)}%</span>
                    )}
                  </div>
                )}
                {thinking ? (
                  <button
                    type="button"
                    onClick={stopGen}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] text-red-300 hover:bg-red-500/10 border border-red-500/20"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === "sv" ? "Stopp" : "Stop"}</span>
                  </button>
                ) : (
                  <>
                    {lastPrompt && messages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => void regenerate()}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] text-muted hover:text-white hover:bg-white/5 border border-white/[0.06]"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{lang === "sv" ? "Igen" : "Retry"}</span>
                      </button>
                    )}
                    {messages.length > 1 && (
                      <button
                        type="button"
                        onClick={resetChat}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] text-muted hover:text-white hover:bg-white/5 border border-white/[0.06]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {lang === "sv" ? "Ny" : "New"}
                        </span>
                      </button>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 border border-white/[0.06]"
                  aria-label={expanded ? "Minimize" : "Expand"}
                >
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Toolbar: modes + random */}
            <div className="px-3 sm:px-5 py-2.5 border-b border-white/[0.05] bg-white/[0.015] flex flex-wrap items-center gap-2 justify-between">
              <div className="inline-flex p-0.5 rounded-lg bg-black/35 border border-white/[0.06]">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={thinking}
                    onClick={() => setMode(m.id)}
                    className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      mode === m.id
                        ? "bg-white/10 text-white border border-white/15"
                        : "text-muted hover:text-white border border-transparent"
                    }`}
                    title={m.hint}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={thinking}
                  onClick={openRandom}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-accent-cyan border border-accent-cyan/30 bg-accent-cyan/10 hover:bg-accent-cyan/15 disabled:opacity-40 transition-colors"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  Random
                </button>
                <span className="hidden sm:inline text-[10px] text-muted/50 font-mono items-center gap-1">
                  <Clock className="w-3 h-3 inline" /> Enter · Shift+Enter
                </span>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className={`overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 relative terminal-scroll ${
                expanded ? "h-[calc(100vh-14rem)]" : "h-[340px] sm:h-[400px] md:h-[440px]"
              }`}
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 20% 0%, rgba(0,229,255,0.045), transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(185,103,255,0.05), transparent 45%)",
              }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 sm:gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center ${
                        msg.type === "ai"
                          ? "bg-gradient-to-br from-accent-cyan/80 to-accent-purple/80 p-1.5 shadow-[0_0_16px_rgba(0,229,255,0.18)]"
                          : "bg-white/10 border border-white/10"
                      }`}
                    >
                      {msg.type === "ai" ? (
                        <BudAILogo size="xs" animated={false} className="!w-full !h-full" />
                      ) : (
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    <div className="max-w-[88%] sm:max-w-[84%] min-w-0 group/msg">
                      <div
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.type === "ai"
                            ? "bg-white/[0.04] text-white/90 border border-white/[0.07]"
                            : "bg-gradient-to-br from-accent-cyan/20 to-accent-purple/15 border border-accent-cyan/25 text-white"
                        }`}
                      >
                        {msg.type === "ai" ? (
                          <>
                            {msg.dual && msg.picked === undefined ? (
                              <div className="space-y-3">
                                <p className="text-[11px] text-accent-cyan/80 font-mono uppercase tracking-wider">
                                  {lang === "sv" ? "Välj ett svar" : "Choose an answer"}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {msg.dual.map((opt, oi) => (
                                    <button
                                      key={oi}
                                      type="button"
                                      onClick={() => pickDual(msg.id, oi)}
                                      className="w-full text-left rounded-xl border border-white/[0.08] bg-black/25 hover:border-accent-cyan/40 hover:bg-accent-cyan/[0.06] p-3 transition-colors"
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="text-xs font-semibold text-white">
                                          {opt.title}
                                        </span>
                                        <span
                                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                            oi === 0
                                              ? "text-accent-cyan bg-accent-cyan/10"
                                              : "text-accent-purple bg-accent-purple/10"
                                          }`}
                                        >
                                          {oi === 0 ? "A" : "B"}
                                        </span>
                                      </div>
                                      <div className="text-[12px] text-white/80 leading-relaxed line-clamp-5 whitespace-pre-wrap">
                                        {renderMarkdown(
                                          opt.body.slice(0, 380) + (opt.body.length > 380 ? "…" : "")
                                        )}
                                      </div>
                                      <div className="mt-2 text-[10px] text-accent-cyan/70 font-medium">
                                        {lang === "sv" ? "Välj →" : "Choose →"}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.dual && msg.picked !== undefined && (
                                  <div className="text-[10px] font-mono text-accent-cyan/70 mb-1.5">
                                    {msg.dual[msg.picked].title} ·{" "}
                                    {lang === "sv" ? "valt" : "selected"}
                                  </div>
                                )}
                                {renderMarkdown(msg.text)}
                              </>
                            )}
                          </>
                        ) : (
                          msg.text
                        )}
                      </div>

                      {msg.type === "ai" &&
                        msg.id !== 0 &&
                        !(msg.dual && msg.picked === undefined) && (
                          <div className="mt-1.5 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/msg:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => copyMsg(msg.id, msg.text)}
                              className="p-1.5 rounded-md text-muted hover:text-white hover:bg-white/5"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-accent-green" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => shareMsg(msg.text)}
                              className="p-1.5 rounded-md text-muted hover:text-white hover:bg-white/5"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeedback((f) => ({ ...f, [msg.id]: "up" }))}
                              className={`p-1.5 rounded-md hover:bg-white/5 ${
                                feedback[msg.id] === "up" ? "text-accent-green" : "text-muted"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeedback((f) => ({ ...f, [msg.id]: "down" }))}
                              className={`p-1.5 rounded-md hover:bg-white/5 ${
                                feedback[msg.id] === "down" ? "text-red-400" : "text-muted"
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                    </div>
                  </motion.div>
                ))}

                {typingText && (
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan/80 to-accent-purple/80 p-1.5">
                      <BudAILogo size="xs" animated={false} className="!w-full !h-full" />
                    </div>
                    <div className="bg-white/[0.04] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[13px] sm:text-sm text-white/90 whitespace-pre-wrap border border-white/[0.07]">
                      {renderMarkdown(typingText)}
                      <span className="inline-block w-2 h-4 bg-accent-cyan ml-0.5 animate-pulse align-middle rounded-sm" />
                    </div>
                  </div>
                )}

                {thinking && !typingText && (
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan/80 to-accent-purple/80 p-1.5">
                      <BudAILogo size="xs" animated={false} className="!w-full !h-full" />
                    </div>
                    <div className="bg-white/[0.04] px-3 sm:px-4 py-3 rounded-2xl flex items-center gap-2.5 border border-white/[0.07]">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              d === 0 ? "bg-accent-cyan" : d === 1 ? "bg-accent-purple" : "bg-accent-green"
                            }`}
                            style={{ animationDelay: `${d * 0.15}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-muted">{t.playground.analyzing}</span>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="p-3 sm:p-4 border-t border-white/[0.05] bg-[#080810]"
            >
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder={
                      lang === "sv"
                        ? "Ställ en fråga… eller tryck Random"
                        : "Ask anything… or hit Random"
                    }
                    disabled={thinking}
                    className="w-full px-3.5 sm:px-5 py-3 sm:py-3.5 pr-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-muted/70 focus:outline-none focus:border-accent-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] disabled:opacity-50 resize-none min-h-[48px] max-h-32"
                  />
                  <Wand2 className="absolute right-3 top-3.5 w-4 h-4 text-muted/35 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={thinking || !input.trim()}
                  className="px-3.5 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white disabled:opacity-40 shadow-[0_0_20px_rgba(0,229,255,0.18)] active:scale-95 transition-transform h-12"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted/45">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {mode === "dual" ? "Dual" : mode === "concise" ? "Concise" : "Single"}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {lang === "sv" ? "Stopp när som helst" : "Stop anytime"}
                </span>
              </div>
            </form>
          </div>
        </ScrollReveal>

        {expanded && (
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/50"
            aria-label="Close expanded"
            onClick={() => setExpanded(false)}
          />
        )}
      </div>

      {/* Random language picker */}
      <AnimatePresence>
        {randomOpen && pendingRandom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => {
                setRandomOpen(false);
                setPendingRandom(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0a12] p-5 shadow-[0_0_60px_rgba(0,229,255,0.12)]"
            >
              <button
                type="button"
                onClick={() => {
                  setRandomOpen(false);
                  setPendingRandom(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <Dice5 className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-base font-semibold text-white">
                  {lang === "sv" ? "Random fråga" : "Random prompt"}
                </h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-4 border border-white/[0.06] rounded-xl bg-white/[0.03] p-3">
                {lang === "sv" ? pendingRandom.sv : pendingRandom.en}
              </p>
              <p className="text-xs text-muted mb-3 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" />
                {lang === "sv"
                  ? "Vilket språk vill du ha svaret på?"
                  : "Which language should the answer use?"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => confirmRandom("sv")}
                  className="py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white hover:border-accent-cyan/40 hover:bg-accent-cyan/10 transition-colors"
                >
                  Svenska
                </button>
                <button
                  type="button"
                  onClick={() => confirmRandom("en")}
                  className="py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white hover:border-accent-purple/40 hover:bg-accent-purple/10 transition-colors"
                >
                  English
                </button>
              </div>
              <button
                type="button"
                onClick={openRandom}
                className="mt-3 w-full text-[11px] text-muted hover:text-white py-1.5"
              >
                {lang === "sv" ? "Slå om tärningen 🎲" : "Roll again 🎲"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
