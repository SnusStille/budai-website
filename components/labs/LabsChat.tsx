"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, X, User, ChevronRight, ArrowLeft } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import LabsHeader from "@/components/labs/LabsHeader";
import StilledevWordmark from "@/components/ui/StilledevWordmark";
import {
  WELCOME_MESSAGE_SV,
  WELCOME_MESSAGE_EN,
  MIN_TURNS_BEFORE_CONTACT,
} from "@/lib/labs/prompt";
import {
  extractProfile,
  extractSummary,
  mergeProfile,
  detectContactRequest,
  detectContactInfo,
  type ProjectProfile,
} from "@/lib/labs/profile";
import { useLabsTranslation } from "@/lib/labs/i18n";
import { SERVICES, type ServiceCategory, type ServiceDef } from "@/lib/labs/services";
import ProjectBlueprint from "@/components/labs/ProjectBlueprint";
import { renderMarkdown } from "@/lib/labs/markdown";
import { WebsiteDemo, WebAppDemo, GameDemo, RobloxDemo, AutomationDemo } from "./SolutionDemos";
import ProjectJourney from "./ProjectJourney";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  blueprint?: ProjectProfile | null;
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
  project_category?: string;
  priority_score?: number;
};

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  preferredContact: "email" | "phone" | "digital_meeting";
};

const EMPTY_CONTACT: ContactForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  preferredContact: "email",
};

/** Service icons — geometric SVG marks, no generic icon library symbols */
function ServiceIcon({ icon }: { icon: ServiceDef["icon"] }) {
  const paths: Record<ServiceDef["icon"], JSX.Element> = {
    globe: (
      <>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M6 16h20M16 6a14 14 0 0 1 0 20M16 6a14 14 0 0 0 0 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </>
    ),
    layout: (
      <>
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="8" y="8" width="16" height="4" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="8" y="14" width="10" height="10" rx="1" fill="currentColor" opacity="0.6" />
      </>
    ),
    device: (
      <>
        <rect x="7" y="3" width="18" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="12" y1="25" x2="20" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    gamepad: (
      <>
        <path d="M7 11h18a3 3 0 0 1 3 3v4a3 3 0 0 1-5 2l-3-3H12l-3 3a3 3 0 0 1-5-2v-4a3 3 0 0 1 3-3z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <circle cx="11" cy="15" r="1" fill="currentColor" />
        <circle cx="15" cy="15" r="1" fill="currentColor" />
      </>
    ),
    code: (
      <>
        <polyline points="8 10 4 16 8 22" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="24 10 28 16 24 22" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="18" y1="7" x2="14" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 4l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
        <path d="M22 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.5" />
      </>
    ),
    help: (
      <>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M12 12a4 4 0 0 1 8 0c0 2-2 3-4 3v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="16" cy="21" r="1" fill="currentColor" />
      </>
    ),
  };
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      {paths[icon]}
    </svg>
  );
}

export default function LabsChat() {
  const { lang } = useLang();
  const t = useLabsTranslation(lang);
  const isSv = lang === "sv";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingCursor, setStreamingCursor] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>(EMPTY_CONTACT);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [journeyStage, setJourneyStage] = useState<"discovery"|"scoping"|"assessment"|"blueprint_ready"|"conclusion_proposed"|"awaiting_confirmation"|"contact_ready"|"submitted"|"closed">("discovery");
  const [errorMsg, setErrorMsg] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [showProcess, setShowProcess] = useState(false);
  const [blueprintShown, setBlueprintShown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/labs/conversations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const match = window.location.pathname.match(/\/(?:sv\/)?labs\/([a-f0-9-]+)/i);
    if (match) void openConversation(match[1]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/labs/conversations?id=${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setConversationId(id);
        setHistoryOpen(false);
        setContactSubmitted(!!data.project?.contact_collected_at);
        setSelectedService(null);
        setShowProcess(false);
        const userMsgs = (data.messages || []).filter((m: Message) => m.role === "user");
        setUserMessageCount(userMsgs.length);
      }
    } catch { /* silent */ }
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setConversationId(null);
    setContactOpen(false);
    setContactSubmitted(false);
    setErrorMsg("");
    setUserMessageCount(0);
    setSelectedService(null);
    setShowProcess(false);
    setBlueprintShown(false);
    setHistoryOpen(false);
    window.history.replaceState({}, "", isSv ? "/sv/labs" : "/labs");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const selectService = (service: ServiceDef) => {
    setSelectedService(service.id);
    const prompt = isSv
      ? `Jag är intresserad av ${service.shortSv.toLowerCase()}.`
      : `I'm interested in ${service.shortEn.toLowerCase()}.`;
    void sendMessage(prompt, service.id);
  };

  const selectCategory = (id: ServiceCategory, contextHint?: string) => {
    const svc = SERVICES.find((s) => s.id === id);
    if (!svc) return;
    setSelectedService(id);
    const base = isSv ? svc.shortSv.toLowerCase() : svc.shortEn.toLowerCase();
    const prompt = contextHint
      ? (isSv ? `Jag är intresserad av ${contextHint} (inom ${base}).` : `I'm interested in ${contextHint} (within ${base}).`)
      : (isSv ? `Jag är intresserad av ${base}.` : `I'm interested in ${base}.`);
    void sendMessage(prompt, id);
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sendMessage = async (text?: string, serviceId?: ServiceCategory | null) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setErrorMsg("");
    setIsStreaming(true);
    setStreamingCursor(true);
    setShowProcess(false);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    const newUserCount = userMessageCount + 1;
    setUserMessageCount(newUserCount);

    // Pass selected service info as first system context
    const serviceContext = serviceId && !conversationId
      ? `\n\n[User selected service category: ${serviceId}. Begin by acknowledging their interest and asking one targeted first question appropriate for this category.]`
      : "";

    try {
      const res = await fetch("/api/labs/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed + serviceContext,
          conversationId,
          lang,
          selectedService: serviceId || selectedService,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 429) setErrorMsg(t.errors.rateLimited);
        else if (res.status === 503) setErrorMsg(t.errors.dbUnavailable);
        else setErrorMsg(t.errors.sendFailed);
        setIsStreaming(false);
        setStreamingCursor(false);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullText = "";
      let cleanText = "";
      let receivedContactRequest = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const parts = chunk.split("\u0000");
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1 && !done) {
            fullText += part;
          } else if (part.startsWith("{") && (i === parts.length - 1 || done)) {
            try {
              const meta = JSON.parse(part);
              if (meta.conversationId && !conversationId) {
                setConversationId(meta.conversationId);
                const newPath = isSv ? `/sv/labs/${meta.conversationId}` : `/labs/${meta.conversationId}`;
                window.history.replaceState({}, "", newPath);
              }
              if (meta.stage) setJourneyStage(meta.stage);
              continue;
            } catch {
              fullText += part;
            }
          } else {
            fullText += part;
          }
        }

        cleanText = fullText.replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "").trim();

        if (!receivedContactRequest && !contactSubmitted && newUserCount >= MIN_TURNS_BEFORE_CONTACT) {
          if (detectContactRequest(cleanText + fullText, lang)) {
            receivedContactRequest = true;
            const allText = [...messages.map((m) => m.content), trimmed, cleanText, fullText].join(" ");
            const detected = detectContactInfo(allText);
            setContactForm((prev) => {
              const next = { ...prev };
              if (detected.email) next.email = detected.email;
              if (detected.phone) next.phone = detected.phone;
              return next;
            });
            setContactOpen(true);
          }
        }

        // Check if this response contains a blueprint-ready profile
        const prof = extractProfile(fullText);
        const shouldShowBlueprint = prof.profile?.blueprint_ready && !blueprintShown;
        if (shouldShowBlueprint && prof.profile) setBlueprintShown(true);

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: cleanText,
            blueprint: shouldShowBlueprint ? prof.profile : null,
          };
          return updated;
        });
      }

      setStreamingCursor(false);
      setIsStreaming(false);
      if (receivedContactRequest && !contactOpen && !contactSubmitted) setContactOpen(true);
      void loadConversations();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setErrorMsg(t.errors.networkError);
        setMessages((prev) => prev.slice(0, -1));
      }
      setIsStreaming(false);
      setStreamingCursor(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (contactForm.name.trim().length < 2) errors.name = t.contact.nameRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) errors.email = t.contact.emailRequired;
    if (Object.keys(errors).length > 0) { setContactErrors(errors); return; }
    setContactErrors({});

    try {
      const res = await fetch("/api/labs/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          phone: contactForm.phone.trim() || undefined,
          company: contactForm.company.trim() || undefined,
          preferredContact: contactForm.preferredContact,
        }),
      });
      if (res.ok) {
        setContactSubmitted(true);
        setContactOpen(false);
        const confirmMsg: Message = {
          role: "assistant",
          content: isSv
            ? `**${t.contact.successTitle}** ${t.contact.successMessage}`
            : `**${t.contact.successTitle}** ${t.contact.successMessage}`,
        };
        setMessages((prev) => [...prev, confirmMsg]);
        void loadConversations();
      } else {
        setErrorMsg(t.errors.sendFailed);
      }
    } catch {
      setErrorMsg(t.errors.networkError);
    }
  };

  const isWelcome = messages.length === 0 && !selectedService;
  const isChatActive = messages.length > 0 || !!selectedService;

  return (
    <div className="labs-container">
      <LabsHeader
        onToggleHistory={() => setHistoryOpen(true)}
        onNewChat={startNewChat}
        showHistoryButton={conversations.length > 0 || isChatActive}
      />

      <main className="labs-main">
        {errorMsg && <div className="labs-error" role="alert">{errorMsg}</div>}

        {isWelcome ? (
          <div className="labs-welcome-state">
            {/* Hero section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.36, 1] }}
              className="labs-hero"
            >
              <div className="labs-hero-mark">
                <StilledevWordmark size="xl" showTagline={false} />
              </div>
              <span className="labs-hero-eyebrow">{t.hero.eyebrow}</span>
              <h1 className="labs-hero-title">
                {t.hero.title}{" "}
                <em>{t.hero.titleAccent}</em>
              </h1>
              <p className="labs-hero-subtitle">{t.hero.subtitle}</p>
            </motion.div>

            {/* Service grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.36, 1] }}
              className="labs-services-section"
            >
              <p className="labs-section-label">{t.hero.servicesLabel}</p>
              <div className="labs-service-grid">
                {SERVICES.slice(0, 6).map((s, i) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.36, 1] }}
                    onClick={() => selectService(s)}
                    className="labs-service-card"
                  >
                    <span className="labs-service-icon"><ServiceIcon icon={s.icon} /></span>
                    <span className="labs-service-name">{isSv ? s.labelSv : s.labelEn}</span>
                    <span className="labs-service-desc">{isSv ? s.shortSv : s.shortEn}</span>
                    <span className="labs-service-arrow"><ChevronRight size={14} /></span>
                  </motion.button>
                ))}
              </div>

              {/* Unsure option */}
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                onClick={() => selectService(SERVICES[6])}
                className="labs-unsure-btn"
              >
                <ServiceIcon icon="help" />
                <span>{isSv ? SERVICES[6].labelSv : SERVICES[6].labelEn} — {isSv ? SERVICES[6].descSv : SERVICES[6].descEn}</span>
              </motion.button>
            </motion.div>

            {/* Scenarios — "Build something different" */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="labs-scenarios-section"
            >
              <p className="labs-section-label">{t.scenarios.label}</p>
              <div className="labs-scenarios-grid">
                {t.scenarios.items.map((item, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 + i * 0.04 }}
                    onClick={() => {
                      setInput(item.text);
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                    className="labs-scenario-card"
                  >
                    <span className="labs-scenario-tag">{item.tag}</span>
                    <span className="labs-scenario-text">{item.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Process section — 5 steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="labs-process-section"
            >
              <button
                type="button"
                onClick={() => setShowProcess(!showProcess)}
                className="labs-process-toggle"
              >
                {showProcess ? "−" : "+"} {t.process.title}
              </button>
              <AnimatePresence>
                {showProcess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="labs-process-grid"
                  >
                    {[1, 2, 3, 4, 5].map((n) => {
                      const key = `step${n}Title` as keyof typeof t.process;
                      const descKey = `step${n}Desc` as keyof typeof t.process;
                      return (
                        <div key={n} className="labs-process-step">
                          <span className="labs-process-num">{n}</span>
                          <span className="labs-process-title">{t.process[key] as string}</span>
                          <span className="labs-process-desc">{t.process[descKey] as string}</span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Built by Oliver */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="labs-builder-section"
            >
              <div className="labs-builder-inner">
                <StilledevWordmark size="sm" showTagline={false} />
                <h3 className="labs-builder-title">{t.builder.title}</h3>
                <p className="labs-builder-body">{t.builder.body}</p>
                <div className="labs-trust-row">
                  <span>{t.trust.noAccount}</span>
                  <span className="labs-trust-dot" />
                  <span>{t.trust.noObligation}</span>
                  <span className="labs-trust-dot" />
                  <span>{t.trust.personalReview}</span>
                </div>
              </div>
            </motion.div>

            {/* Solution explorer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="labs-explorer-section"
            >
              <div className="labs-section-label">{t.explorer.label}</div>
              <h2 className="labs-section-title">{t.explorer.title}</h2>
              <div className="labs-explorer-grid">
                <WebsiteDemo onExplore={() => selectCategory("website")} title={t.explorer.website} exploreLabel={t.explorer.exploreBtn} conceptLabel={t.explorer.conceptLabel} lang={lang} />
                <WebAppDemo onExplore={() => selectCategory("webapp")} title={t.explorer.webapp} exploreLabel={t.explorer.exploreBtn} conceptLabel={t.explorer.conceptLabel} lang={lang} />
                <GameDemo onExplore={() => selectCategory("game", isSv ? "FiveM-servrar och inventory-system" : "FiveM servers and inventory systems")} title={t.explorer.game} exploreLabel={t.explorer.exploreBtn} conceptLabel={t.explorer.conceptLabel} lang={lang} />
                <RobloxDemo onExplore={() => selectCategory("game", isSv ? "Roblox-spel och Luau-script" : "Roblox games and Luau scripts")} title={t.explorer.roblox} exploreLabel={t.explorer.exploreBtn} conceptLabel={t.explorer.conceptLabel} lang={lang} />
                <AutomationDemo onExplore={() => selectCategory("ai_automation")} title={t.explorer.automation} exploreLabel={t.explorer.exploreBtn} conceptLabel={t.explorer.conceptLabel} lang={lang} />
              </div>
              <p className="labs-explorer-hint">{t.explorer.hint}</p>
            </motion.div>

            {/* Value props */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.54 }}
              className="labs-valueprops-section"
            >
              <div className="labs-valueprops-grid">
                {([
                  ["directTitle", "directBody", "→"],
                  ["honestTitle", "honestBody", "✓"],
                  ["deliveryTitle", "deliveryBody", "◈"],
                ] as const).map(([titleKey, bodyKey, sym], i) => (
                  <motion.div
                    key={titleKey}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.56 + i * 0.05 }}
                    className="labs-valueprop"
                  >
                    <span className="labs-valueprop-symbol">{sym}</span>
                    <h4 className="labs-valueprop-title">{(t.valueProps as any)[titleKey]}</h4>
                    <p className="labs-valueprop-body">{(t.valueProps as any)[bodyKey]}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Direct input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.62 }}
              className="labs-direct-input"
            >
              <p className="labs-section-label">{t.hero.orDescribe}</p>
              <div className="labs-input-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.chat.placeholder}
                  className="labs-textarea"
                  rows={1}
                  aria-label={t.chat.newMessage}
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!input.trim()}
                  className="labs-send-btn"
                  aria-label={t.chat.send}
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="labs-welcome-assistant"
            >
              {t.welcome.assistant}
            </motion.p>
          </div>
        ) : (
          <>
            {/* Service indicator when in a categorized chat */}
            {selectedService && messages.length <= 2 && (
              <div className="labs-service-indicator">
                <span>{isSv
                  ? SERVICES.find((s) => s.id === selectedService)?.shortSv
                  : SERVICES.find((s) => s.id === selectedService)?.shortEn}
                </span>
                {!isWelcome && messages.length > 0 && (
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="labs-back-to-services"
                  >
                    <ArrowLeft size={12} /> {t.welcome.backToServices}
                  </button>
                )}
              </div>
            )}

            <ProjectJourney stage={journeyStage} lang={lang} visible={isChatActive && journeyStage !== "discovery"} />
            <div className="labs-messages" role="log" aria-live="polite">
              {messages.map((msg, i) => (
                <div key={i} className={`labs-message ${msg.role}`}>
                  <div className={`labs-message-avatar ${msg.role}`} aria-hidden>
                    {msg.role === "user" ? (
                      <User size={14} />
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 800 }}>S</span>
                    )}
                  </div>
                  <div className="labs-message-body">
                    <div className="labs-message-role">
                      {msg.role === "user" ? (isSv ? "Du" : "You") : "BudAI"}
                    </div>
                    <div className="labs-message-content">
                      {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                      {streamingCursor && i === messages.length - 1 && msg.role === "assistant" && (
                        <span className="labs-streaming-cursor" aria-hidden />
                      )}
                    </div>
                    {msg.blueprint && (
                      <ProjectBlueprint data={msg.blueprint} lang={lang} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="labs-messages-end" />
            </div>

            <div className="labs-input-wrap">
              <div className="labs-input-container">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isStreaming ? t.chat.typing + "…" : t.chat.placeholder}
                  className="labs-textarea"
                  rows={1}
                  disabled={isStreaming}
                  aria-label={t.chat.newMessage}
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="labs-send-btn"
                  aria-label={t.chat.send}
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="labs-input-footer" style={{ justifyContent: "center" }}>
                <p className="labs-disclaimer">{t.footer.disclaimer}</p>
              </div>
            </div>
          </>
        )}

        {/* FAQ & Privacy */}
        {!isChatActive && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="labs-faq-section"
          >
            <h2 className="labs-section-title">{t.faq.title}</h2>
            <div className="labs-faq-list">
              {t.faq.items.map((item, i) => (
                <div key={i} className={`labs-faq-item ${openFaq === i ? "labs-faq-open" : ""}`}>
                  <button
                    className="labs-faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{item.q}</span>
                    <ChevronRight size={16} className="labs-faq-chev" />
                  </button>
                  {openFaq === i && (
                    <div className="labs-faq-a">{renderMarkdown(item.a)}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="labs-privacy-note">
              <div className="labs-privacy-icon">◈</div>
              <div>
                <strong>{t.privacy.title}</strong>
                <p>{t.privacy.body}</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <footer className="labs-footer">
          <div className="labs-footer-brand">
            <StilledevWordmark size="sm" showTagline={false} />
          </div>
          <p className="labs-footer-text">{t.footer.tagline}</p>
          <div className="labs-footer-links">
            <a href={isSv ? "/sv" : "/"} className="labs-footer-link">
              {isSv ? "Stilledev" : "Stilledev"}
            </a>
            <span style={{ color: "var(--labs-text-faint)", fontSize: 8 }}>·</span>
            <span className="labs-footer-link" style={{ cursor: "default" }}>
              © {new Date().getFullYear()}
            </span>
          </div>
        </footer>
      </main>

      {/* History panel */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <div className="labs-history-overlay" onClick={() => setHistoryOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.36, 1] }}
              className="labs-history-panel"
              aria-label={t.history.title}
            >
              <div className="labs-history-header">
                <h2 className="labs-history-title">{t.history.title}</h2>
                <button type="button" onClick={() => setHistoryOpen(false)} className="labs-history-close" aria-label={t.nav.close}>
                  <X size={18} />
                </button>
              </div>
              {conversations.length === 0 ? (
                <p className="labs-history-empty">{t.history.empty}</p>
              ) : (
                <ul className="labs-history-list">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => void openConversation(c.id)}
                        className={`labs-history-item ${conversationId === c.id ? "active" : ""}`}
                      >
                        {c.title || (isSv ? "Ny konversation" : "New conversation")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="labs-history-footer">
                <button type="button" onClick={startNewChat} className="labs-history-new-btn">
                  <Plus size={14} />
                  {t.history.startNew}
                </button>
                <a href={isSv ? "/sv" : "/"} className="labs-history-link">
                  {t.history.viewSite}
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contact modal */}
      <AnimatePresence>
        {contactOpen && !contactSubmitted && (
          <div className="labs-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => {
            if (e.target === e.currentTarget) setContactOpen(false);
          }}>
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.36, 1] }}
              className="labs-modal"
            >
              <div className="labs-modal-header">
                <h2 className="labs-modal-title">{t.contact.title}</h2>
                <button type="button" onClick={() => setContactOpen(false)} className="labs-modal-close" aria-label={t.nav.close}>
                  <X size={18} />
                </button>
              </div>
              <p className="labs-modal-subtitle">{t.contact.subtitle}</p>
              <form onSubmit={submitContact}>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-name">{t.contact.name}</label>
                  <input id="labs-contact-name" type="text" value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className={`labs-input ${contactErrors.name ? "error" : ""}`}
                    placeholder={isSv ? "T.ex. Anna Andersson" : "e.g. Jane Smith"} autoFocus />
                  {contactErrors.name && <p className="labs-field-error">{contactErrors.name}</p>}
                </div>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-email">{t.contact.email}</label>
                  <input id="labs-contact-email" type="email" value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className={`labs-input ${contactErrors.email ? "error" : ""}`} placeholder="name@company.com" />
                  {contactErrors.email && <p className="labs-field-error">{contactErrors.email}</p>}
                </div>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-phone">{t.contact.phone}</label>
                  <input id="labs-contact-phone" type="tel" value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="labs-input" placeholder={isSv ? "+46 70 123 45 67" : "+1 555 123 4567"} />
                </div>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-company">{t.contact.company}</label>
                  <input id="labs-contact-company" type="text" value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    className="labs-input" placeholder={isSv ? "Företagsnamn" : "Company name"} />
                </div>
                <div className="labs-field">
                  <label className="labs-field-label">{t.contact.preferredContact}</label>
                  <div className="labs-contact-options">
                    {([["email", t.contact.contactEmail], ["phone", t.contact.contactPhone], ["digital_meeting", t.contact.contactMeeting]] as const).map(([value, label]) => (
                      <button key={value} type="button"
                        onClick={() => setContactForm({ ...contactForm, preferredContact: value })}
                        className={`labs-contact-option ${contactForm.preferredContact === value ? "active" : ""}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="labs-submit-btn">{t.contact.submit}</button>
                <p className="labs-privacy-note">{t.contact.privacyNote}</p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact success overlay in chat is handled by message add */}
    </div>
  );
}
