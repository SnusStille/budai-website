"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Zap, Brain, Target, TrendingUp, FileText } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface Msg {
  id: number;
  type: "user" | "ai";
  text: string;
}

const presets = [
  { label: "Create a marketing plan", icon: Target },
  { label: "Analyze Q3 sales data", icon: TrendingUp },
  { label: "Draft a professional email", icon: FileText },
  { label: "Automate weekly reporting", icon: Zap },
  { label: "Write a job description", icon: FileText },
  { label: "Improve my workflow", icon: Brain },
];

export default function AIPlayground() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, type: "ai", text: "Hello! I'm BudAI. Ask me anything about your business, or try one of the examples below." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

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
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 50));
    }
    setTypingText("");
    setMessages((prev) => [...prev, { id: idRef.current++, type: "ai", text: fullText }]);
  };

  // Calls the real backend route, which calls Claude.
  const callBudAI = async (text: string): Promise<string> => {
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.status === 429) {
        return "You've hit the demo's message limit for now — please try again in a bit, or request early access to keep exploring BudAI's full capabilities.";
      }

      if (!res.ok) {
        return "Something went wrong on my end. Mind trying that again?";
      }

      const data = await res.json();
      return data.reply || "I'm not sure how to respond to that — could you rephrase?";
    } catch {
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handlePreset = async (text: string) => {
    if (thinking) return;
    setMessages((prev) => [...prev, { id: idRef.current++, type: "user", text }]);
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(() => setConfidence((c) => Math.min(c + Math.random() * 15, 98)), 200);

    const reply = await callBudAI(text);

    clearInterval(confInterval);
    setConfidence(98);
    setThinking(false);
    await typeResponse(reply);
    setConfidence(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || thinking) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: idRef.current++, type: "user", text }]);
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(() => setConfidence((c) => Math.min(c + Math.random() * 12, 95)), 250);

    const reply = await callBudAI(text);

    clearInterval(confInterval);
    setConfidence(95);
    setThinking(false);
    await typeResponse(reply);
    setConfidence(0);
  };

  return (
    <section id="playground" className="relative py-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-purple/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4">AI Playground</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Experience <span className="text-gradient">BudAI</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Try BudAI right now. See how it will interact with your business.
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
                    Online — Developer Preview
                  </div>
                </div>
              </div>
              {thinking && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 text-xs">
                  <Brain className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                  <span className="text-accent-cyan">Thinking...</span>
                  {confidence > 0 && (
                    <span className="text-muted">{Math.round(confidence)}% confidence</span>
                  )}
                </div>
              )}
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
                      <span className="text-sm text-muted">BudAI is analyzing...</span>
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
                  placeholder="Ask BudAI anything..."
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
