"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, X, User } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import LabsHeader from "@/components/labs/LabsHeader";
import StilledevLogo from "@/components/ui/StilledevLogo";
import {
  WELCOME_MESSAGE_SV,
  WELCOME_MESSAGE_EN,
  STARTER_PROMPTS_SV,
  STARTER_PROMPTS_EN,
  MIN_TURNS_BEFORE_CONTACT,
} from "@/lib/labs/prompt";
import {
  extractProfile,
  extractSummary,
  mergeProfile,
  detectContactRequest,
  detectContactInfo,
} from "@/lib/labs/profile";
import { useLabsTranslation } from "@/lib/labs/i18n";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
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

export default function LabsChat() {
  const { lang } = useLang();
  const t = useLabsTranslation(lang);

  const isSv = lang === "sv";
  const welcomeMessage = isSv ? WELCOME_MESSAGE_SV : WELCOME_MESSAGE_EN;
  const starters = isSv ? STARTER_PROMPTS_SV : STARTER_PROMPTS_EN;

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
  const [errorMsg, setErrorMsg] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  // Load conversations list
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

  // Load existing conversation from URL on mount
  useEffect(() => {
    const match = window.location.pathname.match(/\/(?:sv\/)?labs\/([a-f0-9-]+)/i);
    if (match) {
      void openConversation(match[1]);
    }
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
    setHistoryOpen(false);
    window.history.replaceState({}, "", isSv ? "/sv/labs" : "/labs");
    textareaRef.current?.focus();
  };

  const sendMessage = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isStreaming) return;

    // Abort any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setErrorMsg("");
    setIsStreaming(true);
    setStreamingCursor(true);

    // Add empty assistant message that will stream into
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    const newUserCount = userMessageCount + 1;
    setUserMessageCount(newUserCount);

    try {
      const res = await fetch("/api/labs/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId, lang }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMsg(t.errors.rateLimited);
        } else if (res.status === 503) {
          setErrorMsg(t.errors.dbUnavailable);
        } else {
          setErrorMsg(t.errors.sendFailed);
        }
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
      let metaReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Split on metadata delimiter (null byte)
        const parts = chunk.split("\u0000");
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1 && !done) {
            // Last part of a non-final chunk might be incomplete text; append to buffer
            fullText += part;
          } else if (part.startsWith("{") && i === parts.length - 1 || (part.startsWith("{") && done)) {
            // This is likely metadata JSON
            try {
              const meta = JSON.parse(part);
              if (meta.conversationId && !conversationId) {
                setConversationId(meta.conversationId);
                const newPath = isSv ? `/sv/labs/${meta.conversationId}` : `/labs/${meta.conversationId}`;
                window.history.replaceState({}, "", newPath);
              }
              metaReceived = true;
              continue;
            } catch {
              fullText += part;
            }
          } else {
            fullText += part;
          }
        }

        // Strip [[PROFILE:]] and [[SUMMARY:]] blocks from visible text
        cleanText = fullText.replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "").trim();

        // Check for contact request phrases mid-stream
        if (!receivedContactRequest && !contactSubmitted && newUserCount >= MIN_TURNS_BEFORE_CONTACT) {
          if (detectContactRequest(cleanText + fullText, lang)) {
            receivedContactRequest = true;
            // Auto-detect email/phone from full conversation
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

        // Update the assistant message with clean text (no markers visible)
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: cleanText };
          return updated;
        });
      }

      setStreamingCursor(false);
      setIsStreaming(false);

      // After stream completes, show contact form if detected
      if (receivedContactRequest && !contactOpen && !contactSubmitted) {
        setContactOpen(true);
      }

      // Refresh conversation list
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

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }
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
        // Add confirmation message
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

  // Handle starter click
  const handleStarter = (prompt: string) => {
    if (!isStreaming) void sendMessage(prompt);
  };

  const isWelcome = messages.length === 0;

  return (
    <div className="labs-container">
      <LabsHeader
        onToggleHistory={() => setHistoryOpen(true)}
        onNewChat={startNewChat}
        showHistoryButton={!isWelcome || conversations.length > 0}
      />

      <main className="labs-main">
        {errorMsg && (
          <div className="labs-error" role="alert">{errorMsg}</div>
        )}

        {isWelcome ? (
          <div className="labs-welcome">
            <div className="labs-welcome-mark">
              <StilledevLogo size="lg" animated />
            </div>
            <h1 className="labs-welcome-title">
              {isSv ? (
                <>Berätta om din <em>idé</em>.</>
              ) : (
                <>Tell me about your <em>idea</em>.</>
              )}
            </h1>
            <p className="labs-welcome-subtitle">{t.welcome.subtitle}</p>
            <p className="labs-welcome-honest">{t.welcome.honest}</p>
            <div className="labs-starters">
              {t.starters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStarter(starter)}
                  className="labs-starter-btn"
                  disabled={isStreaming}
                >
                  {starter}
                </button>
              ))}
            </div>
            <p className="labs-welcome-assistant">{t.welcome.assistant}</p>
          </div>
        ) : (
          <div className="labs-messages" role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={`labs-message ${msg.role}`}>
                <div className={`labs-message-avatar ${msg.role}`} aria-hidden>
                  {msg.role === "user" ? (
                    <User size={14} />
                  ) : (
                    <span style={{ fontSize: 10 }}>S</span>
                  )}
                </div>
                <div className="labs-message-body">
                  <div className="labs-message-role">
                    {msg.role === "user"
                      ? (isSv ? "Du" : "You")
                      : "BudAI"}
                  </div>
                  <div className="labs-message-content">
                    {msg.content}
                    {streamingCursor && i === messages.length - 1 && msg.role === "assistant" && (
                      <span className="labs-streaming-cursor" aria-hidden />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="labs-messages-end" />
          </div>
        )}

        {!isWelcome && (
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
            <div className="labs-input-footer">
              <div className="labs-kbd-hint">
                <span className="labs-kbd">⏎</span> {isSv ? "Skicka" : "Send"}
                <span style={{ margin: "0 4px" }}>·</span>
                <span className="labs-kbd">⇧⏎</span> {isSv ? "Ny rad" : "New line"}
              </div>
              {!isWelcome && userMessageCount < MIN_TURNS_BEFORE_CONTACT && (
                <p className="labs-disclaimer">{t.footer.disclaimer}</p>
              )}
            </div>
          </div>
        )}

        {isWelcome && (
          <div className="labs-input-wrap" style={{ paddingTop: 0 }}>
            <div className="labs-input-container">
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
            <div className="labs-input-footer" style={{ justifyContent: "center" }}>
              <p className="labs-disclaimer">{t.footer.disclaimer}</p>
            </div>
          </div>
        )}
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
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="labs-history-close"
                  aria-label={t.nav.close}
                >
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
                        {c.title || (isSv ? "Namnlös konversation" : "Untitled conversation")}
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
                  <input
                    id="labs-contact-name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className={`labs-input ${contactErrors.name ? "error" : ""}`}
                    placeholder={isSv ? "T.ex. Anna Andersson" : "e.g. Jane Smith"}
                    autoFocus
                  />
                  {contactErrors.name && <p className="labs-field-error">{contactErrors.name}</p>}
                </div>

                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-email">{t.contact.email}</label>
                  <input
                    id="labs-contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className={`labs-input ${contactErrors.email ? "error" : ""}`}
                    placeholder="name@company.com"
                  />
                  {contactErrors.email && <p className="labs-field-error">{contactErrors.email}</p>}
                </div>

                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-phone">{t.contact.phone}</label>
                  <input
                    id="labs-contact-phone"
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="labs-input"
                    placeholder={isSv ? "+46 70 123 45 67" : "+1 555 123 4567"}
                  />
                </div>

                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-company">{t.contact.company}</label>
                  <input
                    id="labs-contact-company"
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    className="labs-input"
                    placeholder={isSv ? "Företagsnamn" : "Company name"}
                  />
                </div>

                <div className="labs-field">
                  <label className="labs-field-label">{t.contact.preferredContact}</label>
                  <div className="labs-contact-options">
                    {([
                      ["email", t.contact.contactEmail],
                      ["phone", t.contact.contactPhone],
                      ["digital_meeting", t.contact.contactMeeting],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setContactForm({ ...contactForm, preferredContact: value })}
                        className={`labs-contact-option ${contactForm.preferredContact === value ? "active" : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="labs-submit-btn">
                  {t.contact.submit}
                </button>

                <p className="labs-privacy-note">{t.contact.privacyNote}</p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
