"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send,
  Plus,
  Menu,
  X,
  Check,
  ArrowLeft,
  User,
} from "lucide-react";
import {
  WELCOME_MESSAGE_SV,
  WELCOME_MESSAGE_EN,
  STARTER_PROMPTS_SV,
  STARTER_PROMPTS_EN,
  MIN_TURNS_BEFORE_CONTACT,
} from "@/lib/labs/prompt";
import { detectContactRequest, detectContactInfo } from "@/lib/labs/profile";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
};

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  preferredContact: "email" | "phone" | "digital_meeting";
};

type LabsChatProps = {
  lang: "sv" | "en";
  initialConversationId?: string | null;
  initialMessages?: Message[];
};

const genId = () => Math.random().toString(36).slice(2, 11);

export default function LabsChat({
  lang = "sv",
  initialConversationId = null,
  initialMessages = [],
}: LabsChatProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    company: "",
    preferredContact: "email",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [streamingCursor, setStreamingCursor] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isSv = lang === "sv";
  const welcome = isSv ? WELCOME_MESSAGE_SV : WELCOME_MESSAGE_EN;
  const starters = isSv ? STARTER_PROMPTS_SV : STARTER_PROMPTS_EN;

  const welcomeMessage: Message = useMemo(() => ({
    id: "welcome",
    role: "assistant",
    content: welcome,
  }), [welcome]);

  const showWelcome = messages.length === 0;
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  // Auto-scroll to bottom
  useEffect(() => {
    const el = messagesEndRef.current;
    if (el) el.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth", block: "end" });
  }, [messages, isStreaming]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/labs/conversations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  // Focus input once we have messages (after welcome)
  useEffect(() => {
    if (!showWelcome && !isStreaming) {
      inputRef.current?.focus();
    }
  }, [showWelcome, isStreaming]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  // Keyboard: Enter = send, Shift+Enter = newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setFieldErrors({});
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      const userMsg: Message = { id: genId(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingCursor(true);

      const assistantId = genId();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const res = await fetch("/api/labs/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, conversationId, lang }),
          signal: abort.signal,
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error ||
            (isSv ? "Kunde inte skicka meddelande." : "Failed to send message.")
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let currentConvId = conversationId;
        let foundMeta = false;
        let receivedContactRequest = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const parts = chunk.split("\u0000");

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i < parts.length - 1 || foundMeta) {
              const maybeJson = part.trim();
              if (maybeJson.startsWith("{") && maybeJson.includes("conversationId")) {
                try {
                  const meta = JSON.parse(maybeJson);
                  if (meta.conversationId && !currentConvId) {
                    currentConvId = meta.conversationId;
                    setConversationId(meta.conversationId);
                    window.history.replaceState({}, "", `/labs/${meta.conversationId}`);
                  }
                  foundMeta = true;
                  continue;
                } catch { /* not JSON */ }
              }
              if (part.length > 0) fullText += part;
            } else {
              fullText += part;
            }
          }

          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
          );

          // Detect contact request mid-stream (after minimum turns)
          const newUserCount = userMessageCount + 1;
          if (
            !receivedContactRequest &&
            newUserCount >= MIN_TURNS_BEFORE_CONTACT &&
            detectContactRequest(fullText, lang)
          ) {
            receivedContactRequest = true;
            // Auto-detect email/phone from full conversation
            const allText = [...messages.map((m) => m.content), trimmed, fullText].join(" ");
            const detected = detectContactInfo(allText);
            if (detected.email) {
              const email = detected.email;
              setContactForm((f) => ({ ...f, email }));
            }
            if (detected.phone) {
              const phone = detected.phone;
              setContactForm((f) => ({ ...f, phone }));
            }
          }
        }

        // After stream completes, show contact form if detected
        setStreamingCursor(false);
        const finalUserCount = userMessageCount + 1;
        if (receivedContactRequest && finalUserCount >= MIN_TURNS_BEFORE_CONTACT) {
          setTimeout(() => setShowContactForm(true), 800);
        }

        void loadConversations();
      } catch (err) {
        setStreamingCursor(false);
        if (err instanceof Error && err.name === "AbortError") {
          // cancelled — keep streamed partial
        } else {
          const message = err instanceof Error
            ? err.message
            : (isSv ? "Ett fel uppstod." : "An error occurred.");
          setError(message);
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversationId, isStreaming, lang, isSv, loadConversations, messages, userMessageCount]
  );

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setShowContactForm(false);
    setContactSubmitted(false);
    setFieldErrors({});
    setShowHistory(false);
    window.history.replaceState({}, "", isSv ? "/sv/labs" : "/labs");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const openConversation = async (id: string) => {
    setShowHistory(false);
    setError(null);
    try {
      const res = await fetch(`/api/labs/conversations?id=${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConversationId(id);
        setMessages(
          (data.messages || []).map((m: { id: string; role: "user" | "assistant"; content: string; created_at: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content.replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "").trim(),
            createdAt: m.created_at,
          }))
        );
        window.history.replaceState({}, "", `/labs/${id}`);
      }
    } catch {
      setError(isSv ? "Kunde inte ladda konversationen." : "Could not load conversation.");
    }
  };

  const submitContact = async () => {
    const errors: Record<string, string> = {};
    if (!contactForm.name.trim() || contactForm.name.trim().length < 2) {
      errors.name = isSv ? "Ange ditt namn." : "Please enter your name.";
    }
    if (!contactForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = isSv ? "Ange en giltig e-postadress." : "Please enter a valid email.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (!conversationId) return;

    setContactSubmitting(true);
    setFieldErrors({});
    setError(null);

    try {
      const res = await fetch("/api/labs/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, ...contactForm }),
      });

      if (res.ok) {
        setContactSubmitted(true);
        setShowContactForm(false);
        const firstName = contactForm.name.split(" ")[0];
        const contactMethod = contactForm.preferredContact === "phone"
          ? (isSv ? "telefon" : "phone")
          : contactForm.preferredContact === "digital_meeting"
          ? (isSv ? "ett digitalt möte" : "a digital meeting")
          : (isSv ? "e-post" : "email");

        const confirmMsg: Message = {
          id: genId(),
          role: "assistant",
          content: isSv
            ? `Tack, ${firstName}! Dina kontaktuppgifter är sparade. Oliver kommer att läsa igenom vår konversation och höra av sig via ${contactMethod} inom kort.\n\nUnder tiden får du gärna fortsätta att ställa frågor eller förtydliga dina tankar här — jag finns kvar.`
            : `Thanks, ${firstName}! Your contact details are saved. Oliver will review our conversation and reach out via ${contactMethod} shortly.\n\nFeel free to keep asking questions or clarifying your thoughts here in the meantime — I'm still here.`,
        };
        setMessages((prev) => [...prev, confirmMsg]);
        void loadConversations();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || (isSv ? "Kunde inte spara." : "Could not save."));
      }
    } catch {
      setError(isSv ? "Nätverksfel. Försök igen." : "Network error. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="labs-container">
      {/* Header */}
      <header className="labs-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="labs-header-btn"
            onClick={() => setShowHistory(true)}
            aria-label={isSv ? "Konversationshistorik" : "Conversation history"}
          >
            <Menu size={15} />
          </button>
          <a href={isSv ? "/" : "/"} className="labs-wordmark" aria-label="Stilledev Labs home">
            <div className="labs-wordmark-mark">B</div>
            <span className="labs-wordmark-text">STILLEDEV LABS</span>
          </a>
        </div>
        <div className="labs-header-actions">
          <button
            type="button"
            className="labs-header-btn"
            onClick={startNewChat}
            aria-label={isSv ? "Ny konversation" : "New conversation"}
            title={isSv ? "Ny konversation" : "New conversation"}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">{isSv ? "Ny" : "New"}</span>
          </button>
        </div>
      </header>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              className="labs-history-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              className="labs-history-panel"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="labs-history-header">
                <h2>{isSv ? "Konversationer" : "Conversations"}</h2>
                <button
                  type="button"
                  className="labs-history-close"
                  onClick={() => setShowHistory(false)}
                  aria-label={isSv ? "Stäng" : "Close"}
                >
                  <X size={16} />
                </button>
              </div>
              <button type="button" className="labs-new-chat-btn" onClick={startNewChat}>
                <Plus size={15} />
                {isSv ? "Ny konversation" : "New conversation"}
              </button>
              {conversations.length === 0 ? (
                <p className="labs-history-empty">
                  {isSv ? "Inga tidigare konversationer." : "No previous conversations."}
                </p>
              ) : (
                <ul className="labs-history-list">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`labs-history-item ${c.id === conversationId ? "active" : ""}`}
                        onClick={() => openConversation(c.id)}
                        title={c.title}
                      >
                        {c.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="labs-history-footer">
                <a href={isSv ? "/" : "/"} className="labs-history-link">
                  <ArrowLeft size={13} />
                  {isSv ? "Tillbaka till Stilledev" : "Back to Stilledev"}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main chat */}
      <main className="labs-main">
        {showWelcome ? (
          <div className="labs-welcome">
            <div className="labs-welcome-mark">B</div>
            <h1 className="labs-welcome-title">
              Every great project starts with a conversation.
            </h1>
            <p className="labs-welcome-subtitle">
              {isSv
                ? "Beskriv din idé, ditt problem eller något du vill bygga. Jag hjälper dig att utveckla tanken, ifrågasätta det som inte håller och förstå vad som faktiskt krävs."
                : "Describe your idea, your problem, or something you want to build. I'll help you develop the thought, challenge what doesn't hold up, and understand what it actually takes."}
            </p>
            <p className="labs-welcome-assistant">
              {isSv
                ? "Jag är BudAI, Oliver Stilles projektassistent. Projekt genomförs personligen av Oliver på Stilledev."
                : "I'm BudAI, Oliver Stille's project assistant. Projects are personally delivered by Oliver at Stilledev."}
            </p>
            <div className="labs-starters">
              {starters.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="labs-starter-btn"
                  onClick={() => void sendMessage(prompt)}
                  disabled={isStreaming}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="labs-messages">
            <div style={{ padding: "8px 0 0" }}>
              <button
                type="button"
                onClick={startNewChat}
                className="labs-header-btn"
                style={{ fontSize: 11, padding: "5px 10px" }}
              >
                <Plus size={12} />
                {isSv ? "Ny konversation" : "New chat"}
              </button>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={`labs-message ${msg.role}`}>
                <div className={`labs-message-avatar ${msg.role}`}>
                  {msg.role === "user" ? <User size={13} /> : "B"}
                </div>
                <div className="labs-message-body">
                  <div className="labs-message-role">
                    {msg.role === "user" ? (isSv ? "Du" : "You") : "BudAI"}
                  </div>
                  <div
                    className={`labs-message-content ${
                      msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id && streamingCursor
                        ? "labs-streaming-cursor"
                        : ""
                    }`}
                  >
                    {msg.content || ""}
                  </div>
                </div>
              </div>
            ))}
            {error && (
              <div className="labs-error">
                <span>{error}</span>
                <button type="button" onClick={() => setError(null)} aria-label="Dismiss">×</button>
              </div>
            )}
            <div ref={messagesEndRef} className="labs-messages-end" />
          </div>
        )}

        {/* Input area */}
        <div className="labs-input-wrap">
          <div className="labs-input-container">
            <textarea
              ref={inputRef}
              className="labs-input"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isSv ? "Berätta vad du vill skapa..." : "Tell me what you want to create..."}
              rows={1}
              disabled={isStreaming}
              aria-label={isSv ? "Skriv ditt meddelande" : "Type your message"}
              autoComplete="off"
            />
            <button
              type="button"
              className="labs-send-btn"
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              aria-label={isSv ? "Skicka" : "Send"}
            >
              <Send size={15} />
            </button>
          </div>
          <p className="labs-input-hint">
            <kbd>Enter</kbd> <span>{isSv ? "sänd" : "send"}</span>
            <span style={{ margin: "0 2px" }}>·</span>
            <kbd>Shift</kbd>+<kbd>Enter</kbd> <span>{isSv ? "radbyte" : "new line"}</span>
          </p>
        </div>

        <div className="labs-disclaimer">
          {isSv ? (
            <>
              BudAI är en AI-assistent. Projekt genomförs personligen av{" "}
              <a href="/oliver-stille">Oliver Stille</a>.{" "}
              <a href="/legal/privacy">{isSv ? "Integritet" : "Privacy"}</a>
            </>
          ) : (
            <>
              BudAI is an AI assistant. Projects are personally delivered by{" "}
              <a href="/oliver-stille">Oliver Stille</a>.{" "}
              <a href="/legal/privacy">Privacy</a>
            </>
          )}
        </div>
      </main>

      {/* Contact form modal */}
      <AnimatePresence>
        {showContactForm && !contactSubmitted && (
          <motion.div
            className="labs-contact-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              className="labs-contact-modal"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{isSv ? "Lämna dina kontaktuppgifter" : "Leave your contact details"}</h3>
              <p>
                {isSv
                  ? "Oliver kommer att läsa igenom konversationen och höra av sig personligen för att diskutera projekt, upplägg och nästa steg."
                  : "Oliver will review the conversation and reach out personally to discuss the project, approach, and next steps."}
              </p>

              <div className="labs-field">
                <label>
                  {isSv ? "Namn" : "Name"} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder={isSv ? "Ditt namn" : "Your name"}
                  autoFocus
                />
                {fieldErrors.name && <p className="labs-field-error">{fieldErrors.name}</p>}
              </div>

              <div className="labs-field">
                <label>
                  E-post <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder={isSv ? "din@email.se" : "your@email.com"}
                />
                {fieldErrors.email && <p className="labs-field-error">{fieldErrors.email}</p>}
              </div>

              <div className="labs-field">
                <label>{isSv ? "Telefon (valfritt)" : "Phone (optional)"}</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder={isSv ? "070 123 45 67" : "+46 70 123 45 67"}
                />
              </div>

              <div className="labs-field">
                <label>{isSv ? "Företag (valfritt)" : "Company (optional)"}</label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  placeholder={isSv ? "Företagsnamn" : "Company name"}
                />
              </div>

              <div className="labs-field">
                <label>{isSv ? "Föredragen kontaktväg" : "Preferred contact method"}</label>
                <select
                  value={contactForm.preferredContact}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      preferredContact: e.target.value as ContactForm["preferredContact"],
                    })
                  }
                >
                  <option value="email">E-post</option>
                  <option value="phone">{isSv ? "Telefon" : "Phone"}</option>
                  <option value="digital_meeting">
                    {isSv ? "Digitalt möte" : "Digital meeting"}
                  </option>
                </select>
              </div>

              {error && (
                <p className="labs-field-error" style={{ marginBottom: 8 }}>
                  {error}
                </p>
              )}

              <button
                type="button"
                className="labs-contact-submit"
                onClick={() => void submitContact()}
                disabled={contactSubmitting}
              >
                {contactSubmitting
                  ? (isSv ? "Skickar..." : "Sending...")
                  : (isSv ? "Skicka" : "Submit")}
              </button>
              <button
                type="button"
                className="labs-contact-cancel"
                onClick={() => setShowContactForm(false)}
              >
                {isSv ? "Jag vill fortsätta chatta först" : "I want to keep chatting first"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
