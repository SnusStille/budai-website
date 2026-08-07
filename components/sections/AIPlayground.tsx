"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Zap, Brain, Target, TrendingUp, FileText, Wand2, Trash2, Clock } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";

interface Msg {
  id: number;
  type: "user" | "ai";
  text: string;
  timestamp?: Date;
}

const STORAGE_KEY = "budai-playground-chat";

export default function AIPlayground() {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch { return []; }
    }
    return [
      { id: 0, type: "ai", text: lang === "sv" ? "Hej! Jag är BudAI. Fråga mig vad som helst — jag kan hjälpa med allt från kod och affärsfrågor till kreativa projekt." : "Hey! I'm BudAI. Ask me anything — I can help with everything from coding and business questions to creative projects.", timestamp: new Date() },
    ];
  });
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1);

  const presets = [
    { label: lang === "sv" ? "Skapa en marknadsföringsplan" : "Create a marketing plan", icon: Target },
    { label: lang === "sv" ? "Analysera Q3-försäljning" : "Analyze Q3 sales data", icon: TrendingUp },
    { label: lang === "sv" ? "Skriv ett professionellt mejl" : "Draft a professional email", icon: FileText },
    { label: lang === "sv" ? "Förklara kvantdatorer" : "Explain quantum computing", icon: Brain },
    { label: lang === "sv" ? "Skriv Python för web scraping" : "Write Python web scraper", icon: Zap },
    { label: lang === "sv" ? "Hjälp mig brainstorma" : "Help me brainstorm ideas", icon: Sparkles },
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingText]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    const welcome = { id: 0, type: "ai" as const, text: lang === "sv" ? "Hej! Jag är BudAI. Fråga mig vad som helst — jag kan hjälpa med allt från kod och affärsfrågor till kreativa projekt." : "Hey! I'm BudAI. Ask me anything — I can help with everything from coding and business questions to creative projects.", timestamp: new Date() };
    setMessages([welcome]);
    idRef.current = 1;
    localStorage.removeItem(STORAGE_KEY);
  };

  const typeResponse = async (fullText: string) => {
    setTypingText("");
    const lines = fullText.split("\n");
    let current = "";
    for (let i = 0; i < lines.length; i++) {
      current += lines[i];
      if (i < lines.length - 1) current += "\n";
      setTypingText(current);
      await new Promise((r) => setTimeout(r, 15 + Math.random() * 30));
    }
    setTypingText("");
    setMessages((prev) => [...prev, { id: idRef.current++, type: "ai", text: fullText, timestamp: new Date() }]);
  };

  const callBudAI = async (text: string, history: Msg[]): Promise<string> => {
    try {
      const historyForAPI = history.slice(-10).map(m => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historyForAPI }),
      });

      if (res.status === 429) {
        return lang === "sv"
          ? "Du har nått demons meddelandegräns för tillfället — försök igen om en stund."
          : "You've hit the demo's message limit for now — please try again in a bit.";
      }

      if (!res.ok) {
        return lang === "sv" ? "Något gick fel på min sida. Kan du försöka igen?" : "Something went wrong on my end. Mind trying that again?";
      }

      const data = await res.json();
      return data.reply || (lang === "sv" ? "Jag är inte säker på hur jag ska svara på det — kan du omformulera?" : "I'm not sure how to respond to that — could you rephrase?");
    } catch {
      return lang === "sv" ? "Jag har problem med att ansluta just nu. Försök igen om en stund." : "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handlePreset = async (text: string) => {
    if (thinking) return;
    setActivePreset(text);
    const newMsg = { id: idRef.current++, type: "user" as const, text, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(() => setConfidence((c) => Math.min(c + Math.random() * 15, 98)), 200);

    const reply = await callBudAI(text, [...messages, newMsg]);

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
    const newMsg = { id: idRef.current++, type: "user" as const, text, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(() => setConfidence((c) => Math.min(c + Math.random() * 12, 95)), 250);

    const reply = await callBudAI(text, [...messages, newMsg]);

    clearInterval(confInterval);
    setConfidence(95);
    setThinking(false);
    await typeResponse(reply);
    setConfidence(0);
  };

  return (
    <section id="playground" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent-purple/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4"
            whileHover={{ scale: 1.05 }}
          >
            {t.playground.badge}
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t.playground.title} <span className="text-gradient">{t.playground.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t.playground.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="rounded-3xl glass-strong overflow-hidden border border-white/[0.06] shadow-[0_0_80px_rgba(0,229,255,0.06)] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 via-transparent to-accent-purple/5 opacity-50" />
              <div className="relative flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.25)]">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple animate-pulse opacity-30" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">BudAI Assistant</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                    </span>
                    {t.playground.online}
                  </div>
                </div>
              </div>
              <div className="relative flex items-center gap-3">
                {messages.length > 2 && (
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-white hover:bg-white/5 transition-colors"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
                {thinking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs"
                  >
                    <Brain className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                    <span className="text-accent-cyan">{t.playground.thinking}</span>
                    {confidence > 0 && (
                      <span className="text-muted">{Math.round(confidence)}% {t.playground.confidence}</span>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-[420px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-black/10">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <motion.div
                      className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${
                        msg.type === "ai"
                          ? "bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                          : "bg-white/10"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {msg.type === "ai" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                    </motion.div>
                    <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-lg ${
                      msg.type === "ai"
                        ? "glass text-white/90 border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                        : "bg-gradient-to-r from-accent-cyan/15 to-accent-purple/15 border border-accent-cyan/20 text-white shadow-[0_4px_20px_rgba(0,229,255,0.08)]"
                    }`}>
                      {msg.text}
                      {msg.timestamp && (
                        <div className={`mt-1.5 flex items-center gap-1 text-[10px] text-muted/40 ${msg.type === "user" ? "justify-end" : ""}`}>
                          <Clock className="w-3 h-3" />
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {typingText && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass px-5 py-3.5 rounded-2xl text-sm text-white/90 whitespace-pre-wrap border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                      {typingText}
                      <span className="inline-block w-2 h-4 bg-accent-cyan ml-0.5 animate-pulse align-middle rounded-sm" />
                    </div>
                  </motion.div>
                )}

                {thinking && !typingText && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                      <Bot className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="glass px-5 py-3.5 rounded-2xl flex items-center gap-3 border border-white/[0.06]">
                      <div className="flex gap-1">
                        <motion.div className="w-2 h-2 rounded-full bg-accent-cyan" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                        <motion.div className="w-2 h-2 rounded-full bg-accent-purple" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-2 h-2 rounded-full bg-accent-green" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                      </div>
                      <span className="text-sm text-muted">{t.playground.analyzing}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Presets */}
            <div className="px-6 py-3 border-t border-white/[0.04] flex gap-2 overflow-x-auto bg-white/[0.01]">
              {presets.map((p) => (
                <motion.button
                  key={p.label}
                  onClick={() => handlePreset(p.label)}
                  disabled={thinking}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs rounded-full transition-all duration-300 disabled:opacity-50 border ${
                    activePreset === p.label
                      ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30 shadow-[0_0_12px_rgba(0,229,255,0.1)]"
                      : "glass text-muted hover:text-white hover:bg-white/5 border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <p.icon className="w-3.5 h-3.5" />
                  {p.label}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.04] bg-white/[0.01]">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.playground.placeholder}
                    disabled={thinking}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/30 focus:shadow-[0_0_20px_rgba(0,229,255,0.08)] transition-all disabled:opacity-50"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Wand2 className="w-4 h-4 text-muted/30" />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={thinking || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,229,255,0.15)] hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] transition-shadow"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}