"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Zap, Brain, Target, TrendingUp, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";

interface Msg {
  id: number;
  type: "user" | "ai";
  text: string;
}

export default function AIPlayground() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, type: "ai", text: language === "sv" ? "Hej! Jag är BudAI. Fråga mig vad som helst, eller prova ett av exemplen nedan." : "Hello! I'm BudAI. Ask me anything, or try one of the examples below." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  const presets = [
    { label: language === "sv" ? "Skapa en marknadsplan" : "Create a marketing plan", icon: Target },
    { label: language === "sv" ? "Analysera försäljningsdata" : "Analyze sales data", icon: TrendingUp },
    { label: language === "sv" ? "Skriv ett professionellt mejl" : "Draft a professional email", icon: FileText },
    { label: language === "sv" ? "Automatisera veckorapportering" : "Automate weekly reporting", icon: Zap },
    { label: language === "sv" ? "Skriv en platsannons" : "Write a job description", icon: FileText },
    { label: language === "sv" ? "Förbättra mitt arbetsflöde" : "Improve my workflow", icon: Brain },
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingText]);

  const typeResponse = async (fullText: string) => {
    setTypingText("");
    const lines = fullText.split("\n");
    let current = "";
    for (let i = 0; i < lines.length; i++) {
      current += lines[i];
      if (i < lines.length - 1) current += "\n";
      setTypingText(current);
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 30));
    }
    setTypingText("");
    setMessages((prev) => [...prev, { id: idRef.current++, type: "ai", text: fullText }]);
  };

  const callBudAI = async (text: string): Promise<string> => {
    try {
      const payload = {
        message: text,
        memoryEnabled,
        history: memoryEnabled ? messages.slice(-4).map(m => ({ role: m.type, content: m.text })) : []
      };

      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        return language === "sv" ? "Du har nått gränsen för meddelanden i betan — försök igen om en stund." : "You've hit the beta message limit for now — please try again in a bit.";
      }

      if (!res.ok) {
        return language === "sv" ? "Något gick fel. Vill du försöka igen?" : "Something went wrong on my end. Mind trying that again?";
      }

      const data = await res.json();
      return data.reply || (language === "sv" ? "Jag är inte säker på hur jag ska svara på det — kan du formulera om frågan?" : "I'm not sure how to respond to that — could you rephrase?");
    } catch {
      return language === "sv" ? "Jag har problem med anslutningen just nu. Försök igen om en stund." : "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handlePreset = async (text: string) => {
    if (thinking) return;
    setMessages((prev) => [...prev, { id: idRef.current++, type: "user", text }]);
    setThinking(true);
    const reply = await callBudAI(text);
    setThinking(false);
    await typeResponse(reply);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || thinking) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: idRef.current++, type: "user", text }]);
    setThinking(true);
    const reply = await callBudAI(text);
    setThinking(false);
    await typeResponse(reply);
  };

  return (
    <section id="playground" className="relative py-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-purple/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4">{t.nav.playground}</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {language === "sv" ? "Upplev " : "Experience "}<span className="text-gradient">BudAI</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {language === "sv" ? "Prova BudAI direkt. Se hur den interagerar och kommer ihåg sammanhanget." : "Try BudAI right now. See how it interacts and remembers context."}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="rounded-3xl glass-strong overflow-hidden border border-white/[0.06]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">BudAI Assistant</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                    </span>
                    Online — Beta
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMemoryEnabled(!memoryEnabled)}
                  className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors"
                  title={language === "sv" ? "När aktiverat kommer BudAI ihåg tidigare meddelanden." : "When enabled, BudAI remembers recent messages for context."}
                >
                  <Brain className={`w-4 h-4 ${memoryEnabled ? 'text-accent-cyan' : ''}`} />
                  <span className="hidden sm:inline">{language === "sv" ? "Minne" : "Memory"}</span>
                  {memoryEnabled ? <ToggleRight className="w-5 h-5 text-accent-cyan" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                {thinking && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 text-xs">
                    <Brain className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                    <span className="text-accent-cyan">{language === "sv" ? "Tänker..." : "Thinking..."}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-[420px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                      msg.type === "ai" ? "bg-gradient-to-br from-accent-cyan to-accent-purple" : "bg-white/10"
                    }`}>
                      {msg.type === "ai" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.type === "ai" ? "glass text-white/90" : "bg-accent-cyan/10 border border-accent-cyan/20 text-white"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {typingText && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass px-4 py-3 rounded-2xl text-sm text-white/90 whitespace-pre-wrap">
                      {typingText}
                      <span className="inline-block w-2 h-4 bg-accent-cyan ml-0.5 animate-pulse align-middle" />
                    </div>
                  </motion.div>
                )}

                {thinking && !typingText && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-purple">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass px-4 py-3 rounded-2xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-accent-cyan animate-spin" />
                      <span className="text-sm text-muted">{language === "sv" ? "BudAI analyserar..." : "BudAI is analyzing..."}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Presets */}
            <div className="px-6 py-3 border-t border-white/[0.04] flex gap-2 overflow-x-auto">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.label)}
                  disabled={thinking}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full glass text-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <p.icon className="w-3 h-3" />
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.04]">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === "sv" ? "Fråga BudAI vad som helst..." : "Ask BudAI anything..."}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={thinking || !input.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
