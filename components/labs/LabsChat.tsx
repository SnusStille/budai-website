"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, X, User, ChevronRight, ChevronDown, ArrowLeft, MessageSquare, Lightbulb, UserCheck, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/components/ui/LanguageContext";
import LabsHeader from "@/components/labs/LabsHeader";
import StilledevWordmark from "@/components/ui/StilledevWordmark";
import {
  WELCOME_MESSAGE_SV,
  WELCOME_MESSAGE_EN,
  MIN_TURNS_BEFORE_CONTACT,
  STARTER_PROMPTS_SV,
  STARTER_PROMPTS_EN,
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
import { PROCESS } from "@/lib/labs/knowledge";
import ProjectBlueprint from "@/components/labs/ProjectBlueprint";
import { renderMarkdown } from "@/lib/labs/markdown";
import ProjectJourney from "./ProjectJourney";
import ProjectSummaryCard from "./ProjectSummaryCard";
import SmartSuggestions from "./SmartSuggestions";
import LiveUnderstanding from "./LiveUnderstanding";
import FeedbackButton from "@/components/ui/FeedbackButton";
import TypingIndicator from "./TypingIndicator";
import ProjectBriefCard from "./ProjectBriefCard";
import RequirementsMap from "./RequirementsMap";
import MissingPieces from "./MissingPieces";
import WhatsNew from "@/components/ui/WhatsNew";
import BackToBudAI from "@/components/ui/BackToBudAI";
import LabsFooter from "./LabsFooter";

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
  const searchParams = useSearchParams();

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

  const [blueprintShown, setBlueprintShown] = useState(false);
  const [summaryShown, setSummaryShown] = useState(false);
  const [summaryProfile, setSummaryProfile] = useState<any | null>(null);
  const [summaryConfirmed, setSummaryConfirmed] = useState(false);
  const [summarySubmitted, setSummarySubmitted] = useState(false);
  const [submittingBrief, setSubmittingBrief] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [liveProfile, setLiveProfile] = useState<any | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [briefDockVisible, setBriefDockVisible] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Track whether user is pinned to bottom — controls auto-scroll behavior
  const isAtBottomRef = useRef(true);
  // Track whether we just sent a message (force-scroll on assistant response start)
  const justSentRef = useRef(false);
  // Timestamp of last programmatic scroll — briefly ignore wheel/touch events to prevent feedback loops
  const lastProgrammaticScrollRef = useRef(0);
  // Mirror isStreaming in a ref for the RAF-throttled scroll handler
  const isStreamingRef = useRef(false);
  // Detect explicit user scroll intent (wheel / touch / key) to immediately unpin
  const userScrollingRef = useRef(false);

  /** Auto-scroll logic: only scroll to bottom if user is pinned to bottom,
   *  or if they just sent a message. Never fight the user's scroll position. */
  const maybeScrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    if (userScrollingRef.current) return; // user is actively scrolling away — never hijack
    if (isAtBottomRef.current || justSentRef.current) {
      lastProgrammaticScrollRef.current = performance.now();
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
      justSentRef.current = false;
    }
  }, []);

  // Scroll to bottom when new message is added (complete message, not every token)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      // Smooth scroll on new user message; instant on final assistant message
      const isUser = lastMsg.role === "user";
      maybeScrollToBottom(isUser ? "smooth" : "auto");
    }
  // Only react when message count changes, not content updates during streaming
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Textarea auto-resize without layout jumps
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  // Track user-initiated scroll: RAF-throttled to prevent jank
  useEffect(() => {
    let ticking = false;
    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const fromBottom = docHeight - scrollY;
      isAtBottomRef.current = fromBottom < 80;
      setScrolled(scrollY > 8);
      setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
      setShowScrollBtn(isStreamingRef.current && !isAtBottomRef.current && fromBottom > 200);
      setShowBackToTop(scrollY > 500);
      setBriefDockVisible(scrollY > 200 && messages.length > 2);
      ticking = false;
    };
    const onScroll = () => {
      // Ignore scroll events that occur right after a programmatic scrollIntoView
      const sinceProgrammatic = performance.now() - lastProgrammaticScrollRef.current;
      if (sinceProgrammatic < 150) return;
      // User is driving the scroll — clear the "force pin" flag
      userScrollingRef.current = true;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScrollState);
    };
    // Mark user intent immediately on wheel / touch / key scroll
    const markUserIntent = () => { userScrollingRef.current = true; };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", markUserIntent, { passive: true });
    window.addEventListener("touchmove", markUserIntent, { passive: true });
    window.addEventListener("keydown", (e) => {
      if (["PageUp","PageDown","Home","End","ArrowUp","ArrowDown"," "].includes(e.key)) {
        userScrollingRef.current = true;
      }
    });
    updateScrollState();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", markUserIntent);
      window.removeEventListener("touchmove", markUserIntent);
    };
  }, []);

  // When streaming starts, reset userScrollingRef if we were at bottom
  useEffect(() => {
    if (isStreaming) {
      isStreamingRef.current = true;
      // If the user just sent (they're at bottom by definition), allow auto-scroll
      if (justSentRef.current) userScrollingRef.current = false;
    } else {
      isStreamingRef.current = false;
      // When streaming ends, allow new auto-scroll on next message send
      userScrollingRef.current = false;
    }
  }, [isStreaming]);

  // During streaming, keep at bottom if pinned (throttled — only every ~150ms, NOT every frame)
  useEffect(() => {
    if (!isStreaming) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      maybeScrollToBottom("auto");
    };
    const id = window.setInterval(tick, 150);
    // Initial nudge
    const start = setTimeout(tick, 120);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearTimeout(start);
    };
  }, [isStreaming, maybeScrollToBottom]);

  const scrollToBottom = useCallback(() => {
    userScrollingRef.current = false;
    isAtBottomRef.current = true;
    lastProgrammaticScrollRef.current = performance.now();
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
    if (match) { void openConversation(match[1]); return; }
    // Handle URL intent: ?intent=existing or ?intent=idea
    const intent = searchParams.get("intent");
    if (intent === "existing" || intent === "idea") {
      const flow = t.scenarios.dedicatedFlows?.[intent as "existing" | "idea"];
      if (flow) {
        setTimeout(() => {
          setInput(flow.prompt);
          setTimeout(() => textareaRef.current?.focus(), 100);
        }, 600);
      }
    }
    const ref = searchParams.get("ref");
    if (ref) {
      sessionStorage.setItem("labs_ref", ref);
    }
    // Auto-focus textarea on desktop after hero animations
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (!isMobile) {
      setTimeout(() => textareaRef.current?.focus(), 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape key closes modals/drawers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (contactOpen && !contactSubmitted) { setContactOpen(false); return; }
      if (historyOpen) { setHistoryOpen(false); return; }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contactOpen, contactSubmitted, historyOpen]);

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
    setBlueprintShown(false);
    setSummaryShown(false);
    setSummaryProfile(null);
    setSummaryConfirmed(false);
    setSummarySubmitted(false);
    setLiveProfile(null);
    setHistoryOpen(false);
    window.history.replaceState({}, "", isSv ? "/sv/labs" : "/labs");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const confirmBrief = async () => {
    if (submittingBrief || summarySubmitted || summaryConfirmed) return;
    setSubmittingBrief(true);
    setSummaryConfirmed(true);

    // Check if we already have contact info (email) from the conversation
    let hasEmail = false;
    let hasName = false;
    try {
      // Scan all messages for email/name
      const allText = messages.map(m => m.content).join("\n");
      const detected = detectContactInfo(allText);
      const emailVal = detected.email;
      const phoneVal = detected.phone;
      if (emailVal) {
        hasEmail = true;
        setContactForm(prev => ({ ...prev, email: emailVal, phone: phoneVal || prev.phone }));
      }
      // Detect name from profile
      const profName = summaryProfile?.customer?.name;
      if (profName) {
        hasName = true;
        setContactForm(prev => ({ ...prev, name: profName }));
      } else {
        const nameMatch = allText.match(/(?:jag heter|mitt namn är|my name is|i(?:'| a)m )([a-zåäö][a-zåäö]+)/i);
        if (nameMatch && nameMatch[1].length >= 2) {
          hasName = true;
          const capName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
          setContactForm(prev => ({ ...prev, name: capName }));
        }
      }
    } catch {}

    try {
      if (!hasEmail && !contactSubmitted) {
        // Open contact form so customer can provide email before final submission
        setContactOpen(true);
        setSubmittingBrief(false);
        // Don't send the message yet — the contact form submission will trigger final send
        return;
      }

      const confirmMsg = isSv
        ? "Jag bekräftar sammanfattningen. Den ser korrekt ut. Skicka den till Oliver."
        : "I confirm the summary. It looks correct. Please send it to Oliver.";
      await sendMessage(confirmMsg);
    } catch {
      setSummaryConfirmed(false);
    } finally {
      setSubmittingBrief(false);
    }
  };

  const editBriefField = (field: string, currentValue?: string) => {
    const fieldLabelsSv: Record<string,string> = {
      need: "Jag vill korrigera mitt behov: ",
      audience: "Jag vill förtydliga målgruppen: ",
      budget: "Min budget är: ",
      timeline: "Föredragen tidsplan är: ",
    };
    const fieldLabelsEn: Record<string,string> = {
      need: "I'd like to correct what I need: ",
      audience: "I'd like to clarify the audience: ",
      budget: "My budget is: ",
      timeline: "Preferred timeline: ",
    };
    const prefix = (isSv ? fieldLabelsSv : fieldLabelsEn)[field] || (isSv ? "Jag vill ändra: " : "I want to change: ");
    setInput(prefix);
    setSummaryShown(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      const el = textareaRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    }, 50);
  };

  const addToBrief = () => {
    const prefix = isSv ? "Jag vill lägga till: " : "I want to add: ";
    setInput(prefix);
    setSummaryShown(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      const el = textareaRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    }, 50);
  };

  const copyContinueLink = async () => {
    if (!conversationId) return;
    const base = window.location.origin;
    const prefix = isSv ? "/sv/labs/" : "/labs/";
    const url = base + prefix + conversationId;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopiedToast(true); setTimeout(() => setCopiedToast(false), 2200); } catch {}
      ta.remove();
    }
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
    isStreamingRef.current = true;
    setStreamingCursor(true);
    // When user sends a message, force scroll to bottom for the response
    justSentRef.current = true;
    isAtBottomRef.current = true;

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
    isStreamingRef.current = false;
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
      let pendingFragment = ""; // holds possible partial metadata between chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const parts = chunk.split("\u0000");
        for (let i = 0; i < parts.length; i++) {
          let part = parts[i];
          if (i === 0 && pendingFragment) {
            part = pendingFragment + part;
            pendingFragment = "";
          }
          if (!part) continue;

          // Incomplete fragment at the end of a chunk — may continue in next chunk
          if (i === parts.length - 1 && !done) {
            // If the fragment looks like the start of a JSON metadata object, hold it
            // instead of appending to visible text (prevents metadata leaks)
            const trimmed = part.trimStart();
            if (trimmed.startsWith("{") || trimmed.startsWith("[{")) {
              pendingFragment = part;
            } else {
              fullText += part;
            }
            continue;
          }

          // Try to parse as JSON metadata (conversationId, stage, etc.)
          // Metadata chunks are complete JSON objects (or arrays of them) surrounded by \u0000
          const trimmedPart = part.trim();
          const looksLikeMetadata =
            (trimmedPart.startsWith("{") && trimmedPart.endsWith("}")) ||
            (trimmedPart.startsWith("[{") && trimmedPart.endsWith("}]"));
          if (looksLikeMetadata && /"conversationId"/.test(trimmedPart)) {
            try {
              const parsed = JSON.parse(trimmedPart);
              // Handle both {"conversationId":...} and [{"conversationId":...}]
              const meta = Array.isArray(parsed) ? parsed[0] : parsed;
              if (meta && typeof meta === "object") {
                if (meta.conversationId && !conversationId) {
                  setConversationId(meta.conversationId);
                  const newPath = isSv ? `/sv/labs/${meta.conversationId}` : `/labs/${meta.conversationId}`;
                  window.history.replaceState({}, "", newPath);
                }
                if (meta.stage) setJourneyStage(meta.stage);
                continue;
              }
            } catch {
              /* not JSON — fall through to text */
            }
          }

          // Regular text token
          fullText += part;
        }

        // On stream end, discard any buffered pendingFragment that looks like metadata
        // (don't let it leak into visible text)
        if (done && pendingFragment) {
          const trimmed = pendingFragment.trim();
          if (!/^[\{\[]/.test(trimmed)) {
            // Doesn't look like JSON — append as final text
            fullText += pendingFragment;
          }
          pendingFragment = "";
        }

        // Strip [[PROFILE:]] / [[SUMMARY:]] blocks and any leaked JSON metadata objects
        // (metadata JSON is always {"conversationId":…,"done":…,"stage":…} shape — never valid prose)
        cleanText = fullText
          .replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "")
          .replace(/\[\s*\{\s*"conversationId"[\s\S]*?\}\s*\]/g, "")
          .replace(/\{\s*"conversationId"[\s\S]*?\}/g, "")
          .trim();

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

        // Extract profile from AI response (v4 profile with all metadata)
        const prof = extractProfile(fullText);
        const shouldShowBlueprint = prof.profile?.blueprint_ready && !blueprintShown;
        if (shouldShowBlueprint && prof.profile) setBlueprintShown(true);

        // Live understanding — update visible profile for the panel
        if (prof.profile) setLiveProfile(prof.profile);

        // v4: Detect when AI proposes a summary (awaiting_confirmation stage)
        if (prof.profile?.conversation_stage === "awaiting_confirmation" && !summaryShown && prof.profile) {
          setSummaryShown(true);
          setSummaryProfile(prof.profile);
        }
        if (prof.profile?.conversation_stage === "submitted") {
          setSummarySubmitted(true);
        }

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
    isStreamingRef.current = false;
      if (receivedContactRequest && !contactOpen && !contactSubmitted) setContactOpen(true);
      void loadConversations();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setErrorMsg(t.errors.networkError);
        setMessages((prev) => prev.slice(0, -1));
      }
      setIsStreaming(false);
    isStreamingRef.current = false;
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

        // If customer was confirming the summary, now also send the brief confirmation
        if (summaryConfirmed && summaryShown && !summarySubmitted) {
          const briefConfirmMsg = isSv
            ? "Jag har angett mina kontaktuppgifter. Skicka projektbriefen till Oliver."
            : "I've provided my contact details. Please send the project brief to Oliver.";
          // Small delay so the contact-success message shows first
          setTimeout(() => {
            void sendMessage(briefConfirmMsg);
            setSummarySubmitted(true);
          }, 400);
        }

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

  // Idea Sparks — context-aware empty-input suggestions based on what's still unknown
  const ideaSparks = useMemo(() => {
    if (!isChatActive) return [] as string[];
    const sparks: string[] = [];
    const p = liveProfile;
    const sv = lang === "sv";
    const hasGoal = !!p?.customer_goal;
    const featureCount = p?.key_features?.length ?? 0;
    const hasBudget = p?.budget_info?.amount || p?.budget_info?.range || p?.budget_info?.constraint;
    const hasTimeline = !!p?.timeline?.target_date || !!p?.timeline?.preference;
    const hasAudience = !!p?.target_audience?.primary;
    const hasPlatform = !!p?.technical_assumptions?.preferred_platform?.length;
    const hasDesign = p?.design_preferences?.existing_assets !== undefined;

    if (!hasGoal && featureCount === 0) {
      if (sv) {
        sparks.push("Beskriv din idé med dina egna ord");
        sparks.push("Jag vill bygga en webbapp där användare kan...");
        sparks.push("Vilka projekt bygger du oftast?");
      } else {
        sparks.push("Describe your idea in your own words");
        sparks.push("I want to build a web app where users can...");
        sparks.push("What projects do you usually take on?");
      }
      return sparks.slice(0, 3);
    }
    if (!hasBudget) sparks.push(sv ? "Min budget ligger runt..." : "My budget is around...");
    if (!hasTimeline) sparks.push(sv ? "Jag vill helst lansera inom..." : "I'd like to launch within...");
    if (!hasAudience && featureCount > 0) sparks.push(sv ? "Målgruppen är främst..." : "The target audience is mainly...");
    if (!hasPlatform && featureCount > 1) sparks.push(sv ? "Jag tänker mig en webbplats först" : "I'm thinking website first");
    if (featureCount < 3 && hasGoal) sparks.push(sv ? "Viktigaste funktionerna är..." : "The key features are...");
    if (hasBudget && hasTimeline && featureCount >= 3 && !hasDesign) sparks.push(sv ? "Jag har redan skisser i Figma" : "I already have Figma mockups");
    if (featureCount >= 2 && hasGoal && (journeyStage === "scoping" || journeyStage === "assessment")) {
      sparks.push(sv ? "Vad skulle en MVP kosta?" : "What would an MVP cost?");
      sparks.push(sv ? "Kan du sammanfatta projektet?" : "Can you summarize the project?");
    }
    if (journeyStage === "blueprint_ready" || journeyStage === "awaiting_confirmation" || journeyStage === "contact_ready") {
      sparks.push(sv ? "Jag vill gå vidare och boka möte" : "I want to proceed and book a call");
    }
    return sparks.slice(0, 4);
  }, [isChatActive, liveProfile, lang, journeyStage]);

  return (
    <div className="labs-container">
      <LabsHeader
        onToggleHistory={() => setHistoryOpen(true)}
        onNewChat={startNewChat}
        showHistoryButton={conversations.length > 0 || isChatActive}
        scrolled={scrolled}
        scrollProgress={scrollProgress}
      />

      {/* Ambient floating particles — subtle, calming, adds life without distraction */}
      <div className="labs-ambient-particles" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => {
          const size = 2 + Math.random() * 4;
          const left = Math.random() * 100;
          const delay = Math.random() * 25;
          const duration = 22 + Math.random() * 25;
          const opacity = 0.3 + Math.random() * 0.4;
          return (
            <span
              key={i}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                opacity,
              }}
            />
          );
        })}
      </div>

      <main ref={mainRef} className="labs-main">
        {errorMsg && (
          <div className="labs-error" role="alert">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="labs-error-dismiss"
              aria-label={isSv ? "Stäng felmeddelande" : "Dismiss error"}
            >
              ×
            </button>
          </div>
        )}

        {/* Top nav — Back to BudAI, same position/vibe as Contact & Oliver Stille pages */}
        <nav className="labs-top-nav" aria-label={isSv ? "Sidnavigering" : "Page navigation"}>
          <BackToBudAI href={isSv ? "/sv" : "/"} lang={lang} />
        </nav>

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
                <StilledevWordmark size="xl" showTagline={false} suffix="Labs" />
              </div>
              <span className="labs-hero-eyebrow">{t.hero.eyebrow}</span>
              <h1 className="labs-hero-title">
                {t.hero.title}{" "}
                <em>{t.hero.titleAccent}</em>
              </h1>
              <p className="labs-hero-subtitle">{t.hero.subtitle}</p>

              {/* How it works — 3 clear steps */}
              <div className="labs-how-it-works">
                {t.howItWorks.steps.map((step, i) => {
                  const icons = [<MessageSquare key="0" size={12} />, <Lightbulb key="1" size={12} />, <UserCheck key="2" size={12} />];
                  return (
                    <div key={i} className="labs-hiw-step">
                      <span className="labs-hiw-icon">{icons[i]}</span>
                      <span className="labs-hiw-num">{i + 1}</span>
                      <span className="labs-hiw-title">{step.title}</span>
                      <span className="labs-hiw-desc">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick starters — example prompts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="labs-quick-starters"
              style={{ justifyContent: "center" }}
            >
              {(isSv ? STARTER_PROMPTS_SV : STARTER_PROMPTS_EN).slice(0, 4).map((p, i) => (
                <motion.button
                  key={i}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  className="labs-quick-starter"
                  onClick={() => { setInput(p); setTimeout(() => textareaRef.current?.focus(), 50); }}
                >
                  {p}
                </motion.button>
              ))}
            </motion.div>

            {/* Built by Oliver — trust section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="labs-builder-section"
            >
              <div className="labs-builder-inner">
                <h3 className="labs-builder-title">{t.builder.title}</h3>
                <p className="labs-builder-body">{t.builder.body}</p>
                <div className="labs-trust-row">
                  <span>✓ {t.trust.noAccount}</span>
                  <span className="labs-trust-dot" />
                  <span>✓ {t.trust.personalReview}</span>
                  <span className="labs-trust-dot" />
                  <span>✓ {t.trust.noObligation}</span>
                </div>
              </div>
            </motion.div>
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

            <ProjectJourney stage={journeyStage} lang={lang} visible={isChatActive} />

            {/* Compact dock — visible when scrolled, keeps key brief data in view */}
            <AnimatePresence>
              {briefDockVisible && liveProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="pbc-dock"
                >
                  <div className="pbc-dock-left">
                    <span className="pbc-dock-icon"><FileText size={11} /></span>
                    <span className="pbc-dock-title">
                      {(() => {
                        const t = liveProfile.project_title || liveProfile.customer_goal || (isSv ? "Projekt" : "Project");
                        return t.length > 50 ? t.slice(0, 50).replace(/\s+\S*$/, "") + "…" : t;
                      })()}
                    </span>
                  </div>
                  <div className="pbc-dock-score">
                    {Math.round(liveProfile.confidence?.overall_score || 0)}%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Project Brief Card — shows the project taking shape */}
            {isChatActive && liveProfile && (
              <ProjectBriefCard data={liveProfile} lang={lang} isStreaming={isStreaming} />
            )}

            {/* Requirements Map — intelligent "you'll also need" detection */}
            {isChatActive && liveProfile && (
              <RequirementsMap data={liveProfile} lang={lang} />
            )}

            {/* Missing Pieces — plain-language "what we still need to know" */}
            {isChatActive && liveProfile && (
              <MissingPieces data={liveProfile} lang={lang} />
            )}

            {/* Live Understanding panel — discrete real-time "what we know" */}
            {isChatActive && liveProfile && (
              <LiveUnderstanding profile={liveProfile} lang={lang} labels={t.liveUnderstanding} stage={journeyStage} />
            )}

            <div ref={messagesContainerRef} className="labs-messages" role="log" aria-live="polite">
              {messages.map((msg, i) => (
                <div key={i} className={`labs-message ${msg.role} ${streamingCursor && i === messages.length - 1 && msg.role === "assistant" ? "labs-thinking" : ""}`}>
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
                      {msg.role === "assistant" && msg.content.length === 0 && isStreaming && i === messages.length - 1 ? (
                        <TypingIndicator lang={lang} />
                      ) : msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                      {streamingCursor && i === messages.length - 1 && msg.role === "assistant" && msg.content.length > 0 && (
                        <span className="labs-streaming-cursor" aria-hidden />
                      )}
                    </div>
                    {msg.blueprint && (
                      <ProjectBlueprint data={msg.blueprint} lang={lang} />
                    )}
                    {/* Smart Suggestions: after last assistant message, done streaming, no summary */}
                    {i === messages.length - 1 && msg.role === "assistant" && !isStreaming && !summaryShown && msg.content.length > 20 && (
                      <SmartSuggestions
                        lastMessage={msg.content}
                        lang={lang}
                        stage={journeyStage}
                        onPick={(text) => { setInput(text); setTimeout(() => textareaRef.current?.focus(), 30); }}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="labs-messages-end" />
            </div>

            {/* Category chips — shown after first exchange when user hasn't picked a category yet */}
            {isChatActive && !selectedService && messages.length >= 2 && messages.length <= 6 && !summaryShown && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="labs-category-hint"
              >
                <span className="labs-category-hint-label">
                  {isSv ? "Vad handlar ditt projekt om?" : "What's your project about?"}
                </span>
                <div className="labs-category-chips">
                  {SERVICES.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="labs-category-chip"
                      onClick={() => selectService(s)}
                    >
                      <ServiceIcon icon={s.icon} />
                      {isSv ? s.labelSv : s.labelEn}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Project Summary Card — shows when AI reaches awaiting_confirmation */}
            {summaryShown && summaryProfile && !summarySubmitted && (
              <ProjectSummaryCard
                data={{
                  project_title: summaryProfile.project_title,
                  customer_goal: summaryProfile.customer_goal,
                  target_audience: summaryProfile.target_audience,
                  problem: summaryProfile.problem,
                  proposed_solution: summaryProfile.proposed_solution,
                  key_features: summaryProfile.key_features,
                  nice_to_have_features: summaryProfile.nice_to_have_features,
                  budget: summaryProfile.budget,
                  timeline: summaryProfile.timeline,
                  recommended_mvp: summaryProfile.recommended_mvp || summaryProfile.executive_summary,
                  labels: t.summary,
                }}
                onConfirm={() => void confirmBrief()}
                onInlineEdit={editBriefField}
                onAddInfo={addToBrief}
                confirmed={summaryConfirmed}
                submitted={summarySubmitted}
                confidence={summaryProfile.summary_confidence || 70}
                lang={lang}
              />
            )}

            {/* Post-submission confirmation with next steps */}
            {summarySubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.36, 1] }}
                className="labs-submitted-banner"
              >
                <div className="labs-submitted-check">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="13" stroke="#34d399" strokeWidth="1.5" />
                    <path d="M8 14.5l4 4 8-9" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>{t.submitted.title}</h4>
                <p>{t.submitted.body}</p>
                <div className="labs-next-steps">
                  <p className="labs-next-steps-label">
                    {isSv ? "Vad händer nu?" : "What happens next?"}
                  </p>
                  <ol className="labs-next-steps-list">
                    {(isSv ? PROCESS.sv.slice(1) : PROCESS.en.slice(1)).map((step, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                      >
                        <span className="labs-ns-num">{i + 1}</span>
                        <span>{step}</span>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}

          </>
        )}

        {/* Idea Sparks — contextual nudges when input is empty (chat state only) */}
        {!input.trim() && ideaSparks.length > 0 && !isStreaming && !summarySubmitted && isChatActive && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="labs-idea-sparks"
          >
            <span className="labs-sparks-label">
              <Lightbulb size={11} />
              {isSv ? "Idéer att ta vidare" : "Ideas to explore"}
            </span>
            <div className="labs-sparks-row">
              {ideaSparks.map((s, i) => (
                <motion.button
                  key={s}
                  type="button"
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.06, ease: [0.16, 1, 0.36, 1] }}
                  className="labs-spark-chip"
                  onClick={() => { setInput(s); setTimeout(() => textareaRef.current?.focus(), 50); }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SINGLE SHARED TEXTAREA (always visible — the ONLY input on the page) ── */}
        <div className={`labs-input-wrap ${isWelcome ? "labs-input-wrap-welcome" : ""}`}>
          <div className={`labs-input-container ${isWelcome ? "labs-hero-input" : ""}`} style={isWelcome ? { maxWidth: "600px", margin: "0 auto" } : undefined}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? t.chat.typing + "…" : t.chat.placeholder}
              className="labs-textarea"
              rows={isWelcome ? 2 : 1}
              disabled={isStreaming}
              aria-label={t.chat.newMessage}
              enterKeyHint="send"
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
            <div className="labs-input-footer-left">
              {conversationId && isChatActive && (
                <button
                  type="button"
                  className="labs-continue-later"
                  onClick={copyContinueLink}
                  title={t.continueLater.label}
                >
                  {t.continueLater.label}
                </button>
              )}
            </div>
            <p className="labs-disclaimer">{t.footer.disclaimer}</p>
          </div>
        </div>

        {/* Copied-to-clipboard toast */}
        <AnimatePresence>
          {copiedToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="labs-copied-toast"
            >
              {t.continueLater.copied}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation progress bar (only during active chat) */}
        {isChatActive && (
          <div className="labs-conv-progress labs-conv-progress-inline" aria-hidden>
            <span>{isSv ? "Framsteg" : "Progress"}</span>
            <span className="labs-conv-dots">
              {["discovery","scoping","assessment","blueprint_ready","conclusion_proposed","submitted"].map((stage, idx) => {
                const stages = ["discovery","scoping","assessment","blueprint_ready","conclusion_proposed","submitted"];
                const curIdx = stages.indexOf(journeyStage);
                const state = idx < curIdx ? "done" : idx === curIdx ? "active" : "";
                return <span key={stage} className={`labs-conv-dot ${state}`} />;
              })}
            </span>
          </div>
        )}
      </main>

      {/* Full Labs footer */}
      <LabsFooter journeyStage={journeyStage} />

      {/* Feedback FAB */}
      <FeedbackButton />

      {/* Scroll to bottom during streaming */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            type="button"
            className="labs-scroll-bottom"
            onClick={scrollToBottom}
            aria-label={isSv ? "Scrolla till botten" : "Scroll to bottom"}
            title={isSv ? "Scrolla till botten" : "Scroll to bottom"}
          >
            <ChevronDown size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Back to top button — matches main BudAI site */}
      <AnimatePresence>
        {showBackToTop && !showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            type="button"
            className="labs-back-to-top"
            onClick={scrollToTop}
            aria-label={isSv ? "Till toppen" : "Back to top"}
            title={isSv ? "Till toppen" : "Back to top"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </motion.button>
        )}
      </AnimatePresence>

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
              role="dialog"
              aria-modal="true"
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
          <div className="labs-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="labs-contact-modal-title" onClick={(e) => {
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
                <h2 id="labs-contact-modal-title" className="labs-modal-title">{t.contact.title}</h2>
                <button type="button" onClick={() => setContactOpen(false)} className="labs-modal-close" aria-label={t.nav.close}>
                  <X size={18} />
                </button>
              </div>
              {summaryConfirmed && !summarySubmitted && (
                <div className="labs-contact-context">
                  {isSv
                    ? "Nästan klart! Fyll i dina uppgifter nedan så skickas projektbriefen direkt till Oliver. Han återkommer personligen inom 1 arbetsdag."
                    : "Almost done! Fill in your details below and the project brief will be sent directly to Oliver. He'll get back to you personally within 1 working day."}
                </div>
              )}
              <p className="labs-modal-subtitle">{t.contact.subtitle}</p>
              <form onSubmit={submitContact}>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-name">{t.contact.name}</label>
                  <input id="labs-contact-name" type="text" value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className={`labs-input ${contactErrors.name ? "error" : ""}`}
                    placeholder={isSv ? "T.ex. Anna Andersson" : "e.g. Jane Smith"}
                    autoComplete="name" autoFocus />
                  {contactErrors.name && <p className="labs-field-error">{contactErrors.name}</p>}
                </div>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-email">{t.contact.email}</label>
                  <input id="labs-contact-email" type="email" value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className={`labs-input ${contactErrors.email ? "error" : ""}`} placeholder="name@company.com"
                    autoComplete="email" />
                  {contactErrors.email && <p className="labs-field-error">{contactErrors.email}</p>}
                </div>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-phone">{t.contact.phone}</label>
                  <input id="labs-contact-phone" type="tel" value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="labs-input" placeholder={isSv ? "+46 70 123 45 67" : "+1 555 123 4567"}
                    autoComplete="tel" />
                </div>
                <div className="labs-field">
                  <label className="labs-field-label" htmlFor="labs-contact-company">{t.contact.company}</label>
                  <input id="labs-contact-company" type="text" value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    className="labs-input" placeholder={isSv ? "Företagsnamn" : "Company name"}
                    autoComplete="organization" />
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

      {/* What's New panel — shared with BudAI main site */}
      <WhatsNew />
    </div>
  );
}
