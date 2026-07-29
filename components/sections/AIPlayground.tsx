"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Zap, Brain, Target, TrendingUp, Lightbulb, FileText } from "lucide-react";
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

const responses: Record<string, string> = {
  "Create a marketing plan": `Analyzing your business goals...
Identifying target audience segments...
Generating channel strategy...

📊 MARKETING PLAN DRAFT

1. TARGET AUDIENCE
   • Primary: Swedish SMEs (25-100 employees)
   • Secondary: Enterprise decision-makers

2. CHANNEL STRATEGY
   • LinkedIn B2B campaigns
   • Google Ads (SE market)
   • Industry newsletter partnerships

3. CONTENT PILLARS
   • AI efficiency case studies
   • Swedish business automation guides
   • Product comparison reports

4. BUDGET ALLOCATION
   • Paid social: 40%
   • Content & SEO: 35%
   • Events & PR: 25%

Would you like me to expand any section?`,

  "Analyze Q3 sales data": `Loading sales data...
Processing 2,847 transactions...
Running predictive models...

📈 Q3 SALES ANALYSIS

Revenue: 4.2M SEK (+23% YoY)
Transactions: 2,847 (+18%)
Avg. deal size: 14,800 SEK

🔍 KEY INSIGHTS
• Top performer: Enterprise tier (+41%)
• Underperformer: Starter tier (-8%)
• Churn rate: 4.2% (industry avg: 6.1%)

💡 RECOMMENDATIONS
1. Increase Starter tier value proposition
2. Double down on Enterprise outreach
3. Introduce mid-tier "Growth" plan
4. Target Q4 revenue: 5.1M SEK`,

  "Draft a professional email": `Analyzing tone preferences...
Generating draft in Swedish...
Optimizing for response rate...

✉️ EMAIL DRAFT

Ämne: Uppföljning av vårt samtal – nästa steg

Hej [Namn],

Tack för ett givande samtal tidigare i veckan.

Som vi diskuterade ser jag stora möjligheter för [Företag] att effektivisera era digitala arbetsflöden med hjälp av AI.

Jag har bifogat en kort presentation som täcker:
• Identifierade effektiviseringsmöjligheter
• Uppskattad ROI inom 6 månader
• Implementeringsplan i tre steg

Kan vi boka ett 30-minuters uppföljningssamtal nästa vecka?

Med vänliga hälsningar,
[Your Name]`,

  "Automate weekly reporting": `Scanning current workflow...
Identifying data sources...
Building automation pipeline...

⚙️ AUTOMATION WORKFLOW CREATED

Name: Weekly Business Report
Schedule: Every Monday 08:00
Recipients: management@company.se

📋 DATA SOURCES
• CRM: HubSpot API
• Finance: Fortnox integration
• Analytics: Google Analytics 4
• Support: Zendesk metrics

📊 REPORT SECTIONS
1. Executive Summary (auto-generated)
2. Sales Pipeline Overview
3. Revenue & Forecast
4. Customer Satisfaction Score
5. Team Performance Metrics

✅ Status: ACTIVE
Next run: Monday, 08:00 CET`,

  "Write a job description": `Analyzing role requirements...
Researching market standards...
Optimizing for Swedish labor market...

📝 JOB DESCRIPTION DRAFT

Senior AI Solutions Architect
Stockholm / Hybrid

ABOUT THE ROLE
We're seeking an experienced AI Solutions Architect to lead the design and implementation of cutting-edge AI systems for our enterprise clients.

RESPONSIBILITIES
• Design scalable AI architectures
• Lead cross-functional technical teams
• Client-facing solution consulting
• Stay ahead of AI/ML industry trends

REQUIREMENTS
• 5+ years in software architecture
• Deep knowledge of LLMs and NLP
• Experience with cloud platforms
• Fluent in Swedish and English

WE OFFER
• Competitive salary + equity
• Flexible hybrid work
• Continuous learning budget
• Cutting-edge tech stack`,

  "Improve my workflow": `Analyzing current workflow...
Identifying inefficiencies...
Generating optimization recommendations...

⚡ WORKFLOW OPTIMIZATION REPORT

CURRENT STATE ANALYSIS
• Manual data entry: 12 hrs/week
• Email management: 8 hrs/week
• Meeting scheduling: 4 hrs/week
• Report generation: 6 hrs/week

🎯 OPTIMIZATION OPPORTUNITIES

1. AUTOMATE DATA ENTRY
   • Implement AI data extraction
   • Estimated savings: 10 hrs/week
   • ROI: 340% in 6 months

2. SMART EMAIL MANAGEMENT
   • AI-powered email categorization
   • Auto-draft responses
   • Estimated savings: 5 hrs/week

3. INTELLIGENT SCHEDULING
   • AI calendar optimization
   • Auto-meeting summaries
   • Estimated savings: 3 hrs/week

💰 TOTAL POTENTIAL SAVINGS
• 18 hours/week recovered
• 936 hours/year per employee
• Estimated annual value: 468,000 SEK`,
};

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

  const handlePreset = async (text: string) => {
    if (thinking) return;
    setMessages((prev) => [...prev, { id: idRef.current++, type: "user", text }]);
    setThinking(true);
    setConfidence(0);
    const confInterval = setInterval(() => setConfidence((c) => Math.min(c + Math.random() * 15, 98)), 200);
    await new Promise((r) => setTimeout(r, 1800));
    clearInterval(confInterval);
    setConfidence(98);
    setThinking(false);
    await typeResponse(responses[text] || "I'm still learning. Could you rephrase that?");
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
    await new Promise((r) => setTimeout(r, 2200));
    clearInterval(confInterval);
    setConfidence(95);
    setThinking(false);
    await typeResponse(
      `I received your request: "${text}"\n\nAs a Developer Preview, my full response capabilities are still being trained. In the final version, I will:\n\n• Understand your specific business context\n• Access relevant data sources\n• Generate tailored, actionable outputs\n• Learn from your feedback over time\n\nTry one of the preset examples above to see a full demonstration of my capabilities.`
    );
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
