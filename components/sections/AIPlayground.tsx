"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  BrainCircuit,
  Command,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Trash2,
  X,
  Download,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  type ChatMessage,
  type MemoryItem,
  type AiActivity,
  type AttachmentDraft,
  type Mode,
  newId,
  titleFromMessages,
  memoryToPromptBlock,
  looksLikeImageGen,
} from "@/lib/playground/types";
import {
  loadLocalConversations,
  deleteLocalConversation,
  persistLocalMessages,
  loadSettings,
  saveSettings,
} from "@/lib/playground/localStore";
import * as cloud from "@/lib/playground/cloudStore";

import ChatEmptyState from "@/components/playground/ChatEmptyState";
import ChatMessageRow from "@/components/playground/ChatMessageRow";
import ChatComposer from "@/components/playground/ChatComposer";
import ChatSidebar from "@/components/playground/ChatSidebar";
import ThinkingBubble from "@/components/playground/ThinkingBubble";
import { WorkspacePanel, WorkspaceSheet, type WorkspaceDoc } from "@/components/playground/WorkspacePanel";
import {
  INTENT_PRESETS,
  INSPIRE_PROMPTS,
  fileToBase64,
  groupByDate,
  isWorkspaceWorthy,
  workspaceTitle,
  type HistoryItem,
  type Lang,
} from "@/components/playground/presets";

/**
 * BudAI Playground — the centre of stilledev.se.
 *
 * Everything here is live: the request goes to /api/playground (Claude via
 * Anthropic), conversations persist to Supabase for signed-in users and to
 * localStorage for guests. No mocked replies.
 */
export default function AIPlayground() {
  const { lang } = useLang();
  const auth = useAuth();
  const sv = lang === "sv";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activity, setActivity] = useState<AiActivity>("idle");
  const [typingText, setTypingText] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [intentId, setIntentId] = useState<string>("chat");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [answerLang, setAnswerLang] = useState<Lang>(lang);
  const [inspireSpin, setInspireSpin] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceDoc | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [headerMenu, setHeaderMenu] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [temporary, setTemporary] = useState(false);
  const [attach, setAttach] = useState<AttachmentDraft | null>(null);
  const [listening, setListening] = useState(false);
  const [genMode, setGenMode] = useState(false);
  const [imageGenEnabled, setImageGenEnabled] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [memoryToast, setMemoryToast] = useState(false);
  const [editingMem, setEditingMem] = useState<string | null>(null);
  const [editMemText, setEditMemText] = useState("");
  const [dualPick, setDualPick] = useState<Record<string, { title: string; body: string }[] | undefined>>({});
  const [lastFailed, setLastFailed] = useState<{
    text: string;
    image?: AttachmentDraft | null;
    gen?: boolean;
  } | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<{ stop: () => void } | null>(null);
  const persistTimer = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bootRef = useRef(false);

  const busy = activity !== "idle" && activity !== "error" && activity !== "listening";
  const isEmpty = messages.length === 0 && !typingText && activity === "idle";
  const rem = auth.remaining.messages;
  const lim = auth.limits.messagesPerDay;

  const showToast = useCallback((kind: "ok" | "warn" | "err", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  /* ─── boot ─────────────────────────────────────────── */

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
      // Let the visitor type immediately — this is the point of the page.
      window.setTimeout(() => taRef.current?.focus({ preventScroll: true }), 450);
    }
  }, []);

  useEffect(() => setAnswerLang(lang), [lang]);

  /* Feature flags — image generation only when the server has a key */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/features")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setImageGenEnabled(!!d.imageGeneration);
      })
      .catch(() => {
        if (!cancelled) setImageGenEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (auth.authFlash === "signed-in") {
      showToast("ok", sv ? "Inloggad" : "Signed in");
      auth.clearAuthFlash();
    }
  }, [auth.authFlash, auth, sv, showToast]);

  /* ─── history / memory loading ─────────────────────── */

  const reloadSidebar = useCallback(async () => {
    if (auth.isMember) {
      try {
        const list = await cloud.listConversations(40);
        setHistory(list);
        setMemory(await cloud.fetchMemories());
        setMemoryEnabled(await cloud.getMemoryEnabled());
      } catch (e) {
        console.warn(e);
      }
    } else {
      setHistory(
        loadLocalConversations().map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt,
          temporary: c.temporary,
          pinned: c.pinned,
        }))
      );
      setMemory([]);
    }
  }, [auth.isMember]);

  useEffect(() => {
    if (!auth.ready) return;
    void reloadSidebar();
    if (!bootRef.current) {
      bootRef.current = true;
      return;
    }
  }, [auth.ready, auth.isMember, reloadSidebar]);

  // When membership flips, reset the active thread so a guest draft never leaks into a cloud id
  const prevMember = useRef(auth.isMember);
  useEffect(() => {
    if (prevMember.current !== auth.isMember) {
      prevMember.current = auth.isMember;
      setMessages([]);
      setConvoId(null);
      setTemporary(false);
      void reloadSidebar();
    }
  }, [auth.isMember, reloadSidebar]);

  /* ─── scrolling ────────────────────────────────────── */

  const setBottom = useCallback((v: boolean) => {
    atBottomRef.current = v;
    setAtBottom(v);
  }, []);

  const scrollToEnd = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
      setBottom(true);
    },
    [setBottom]
  );

  const onScrollMessages = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const next = distance < 120;
    if (next !== atBottomRef.current) setBottom(next);
  };

  // Follow the stream only while the visitor is already at the bottom.
  useEffect(() => {
    if (atBottom) scrollToEnd("auto");
  }, [messages, typingText, activity, atBottom, scrollToEnd]);

  /* ─── api plumbing ─────────────────────────────────── */

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const sbToken = auth.session?.access_token;
    if (sbToken) h.Authorization = `Bearer ${sbToken}`;
    return h;
  }, [auth.session]);

  const checkQuota = (kind: "messages" | "images" | "generations") => {
    if (auth.remaining[kind] <= 0) {
      showToast(
        "warn",
        kind === "messages"
          ? sv
            ? "Daglig gräns nådd. Logga in för fler meddelanden."
            : "Daily limit reached. Sign in for more messages."
          : sv
            ? "Kräver ett konto."
            : "Needs an account."
      );
      if (auth.isGuest) auth.openAuth(sv ? "Lås upp mer BudAI" : "Unlock more BudAI");
      return false;
    }
    return true;
  };

  const bumpServer = async (kind: "messages" | "images" | "generations") => {
    try {
      const headers = await authHeaders();
      await fetch("/api/usage", {
        method: "POST",
        headers,
        body: JSON.stringify({ kind, guest: auth.isGuest ? auth.guestKey : undefined }),
      });
      auth.bumpUsage(kind);
    } catch {
      auth.bumpUsage(kind);
    }
  };

  /** Make sure a conversation id exists before the first message is sent. */
  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (convoId) return convoId;
    if (temporary) {
      const id = newId("tmp");
      setConvoId(id);
      return id;
    }
    if (auth.isMember) {
      const id = await cloud.createConversation(sv ? "Ny chatt" : "New chat");
      if (!id) {
        showToast("err", sv ? "Kunde inte skapa chatt" : "Could not create chat");
        return null;
      }
      setConvoId(id);
      void reloadSidebar();
      return id;
    }
    const id = newId("local");
    setConvoId(id);
    return id;
  }, [convoId, temporary, auth.isMember, sv, reloadSidebar, showToast]);

  const persistMessages = useCallback(
    async (list: ChatMessage[], id: string | null) => {
      if (!list.length || !id) return id;
      if (temporary) return id;
      if (auth.isMember) {
        await cloud.syncMessages(id, list);
        void reloadSidebar();
        return id;
      }
      const convo = persistLocalMessages(id, list);
      setHistory(
        loadLocalConversations().map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt,
          temporary: c.temporary,
          pinned: c.pinned,
        }))
      );
      return convo.id;
    },
    [auth.isMember, temporary, reloadSidebar]
  );

  // Debounced persistence after messages change
  useEffect(() => {
    if (!messages.length || !convoId) return;
    window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      void persistMessages(messages, convoId);
    }, 600);
    return () => window.clearTimeout(persistTimer.current);
  }, [messages, convoId, persistMessages]);

  /* ─── response rendering ───────────────────────────── */

  const typeResponse = async (fullText: string, extra?: Partial<ChatMessage>) => {
    setActivity("typing");
    setTypingText("");
    abortRef.current = false;
    setBottom(true);
    const words = fullText.split(/(\s+)/);
    let current = "";
    for (let i = 0; i < words.length; i++) {
      if (abortRef.current) {
        setTypingText("");
        setActivity("idle");
        setMessages((prev) => [
          ...prev,
          {
            id: newId("m"),
            role: "assistant",
            content: current || fullText,
            ts: Date.now(),
            ...extra,
          },
        ]);
        return false;
      }
      current += words[i];
      if (i % 2 === 0 || i === words.length - 1) {
        setTypingText(current);
        await new Promise((r) => setTimeout(r, 4 + Math.random() * 6));
      }
    }
    setTypingText("");
    setActivity("idle");
    const mid = newId("m");
    setMessages((prev) => [
      ...prev,
      { id: mid, role: "assistant", content: fullText, ts: Date.now(), ...extra },
    ]);
    if (isWorkspaceWorthy(fullText) && typeof window !== "undefined" && window.innerWidth >= 1024) {
      setWorkspace({ msgId: mid, title: workspaceTitle(fullText, lang), body: fullText });
    }
    return true;
  };

  const contextBlock = () => {
    if (!auth.isMember || !memoryEnabled || temporary || !memory.length) return "";
    return memoryToPromptBlock(memory, lang);
  };

  const stopAll = () => {
    abortRef.current = true;
    setActivity("idle");
    setTypingText("");
    if (recogRef.current) {
      try {
        recogRef.current.stop();
      } catch {
        /* */
      }
      setListening(false);
    }
  };

  const pushError = (
    text: string,
    retry?: { text: string; image?: AttachmentDraft | null; gen?: boolean }
  ) => {
    setActivity("idle");
    setTypingText("");
    setMessages((prev) => [
      ...prev,
      { id: newId("m"), role: "assistant", content: text, ts: Date.now(), error: true },
    ]);
    if (retry) setLastFailed(retry);
  };

  /* ─── sending ──────────────────────────────────────── */

  const runPrompt = async (
    text: string,
    opts?: { image?: AttachmentDraft | null; forceGen?: boolean; base?: ChatMessage[] }
  ) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const base = opts?.base ?? messages;
    const wantGen = imageGenEnabled && (opts?.forceGen || genMode || looksLikeImageGen(trimmed));
    if (wantGen && !opts?.image) {
      setGenMode(false);
      return runImageGen(trimmed);
    }

    if (!checkQuota("messages")) return;

    const img = opts?.image !== undefined ? opts.image : attach;
    if (img && auth.isGuest) {
      auth.openAuth(sv ? "Bildanalys kräver ett konto" : "Image analysis needs an account");
      return;
    }
    if (img && !checkQuota("images")) return;

    const cid = await ensureConversation();
    if (!cid && auth.isMember) return;

    const userMsg: ChatMessage = {
      id: newId("m"),
      role: "user",
      content: trimmed,
      ts: Date.now(),
      imageUrl: img?.preview,
    };
    const nextList = [...base, userMsg];
    setMessages(nextList);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setAttach(null);
    setLastFailed(null);
    abortRef.current = false;
    setBottom(true);
    setActivity(img ? "reading_image" : "thinking");

    await bumpServer("messages");
    if (img) await bumpServer("images");

    const apiHistory = nextList
      .filter((m) => !m.error)
      .map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    try {
      const headers = await authHeaders();
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 90_000);

      const intent = (INTENT_PRESETS[lang] || INTENT_PRESETS.en).find((x) => x.id === intentId) ||
        INTENT_PRESETS.en[0];
      const apiMessages = apiHistory.map((m, i, arr) => {
        if (i === arr.length - 1 && m.role === "user" && intent.prefix) {
          return { ...m, content: intent.prefix + m.content };
        }
        return m;
      });

      const res = await fetch("/api/playground", {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          messages: apiMessages,
          lang: answerLang,
          dual: mode === "dual" || intent.id === "dual",
          concise: mode === "concise",
          context: contextBlock(),
          guest: auth.isGuest ? auth.guestKey : undefined,
          imageBase64: img?.b64,
          imageMediaType: img?.media,
          temporary: temporary || !memoryEnabled,
        }),
      });
      window.clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));

      if (res.status === 429 || data.code === "limit") {
        pushError(
          data.error || (sv ? "Gräns nådd för idag." : "Limit reached for today."),
          { text: trimmed, image: img }
        );
        auth.openAuth();
        return;
      }
      if (res.status === 403) {
        pushError(data.error || (sv ? "Åtkomst nekad." : "Forbidden."), { text: trimmed, image: img });
        auth.openAuth(data.error);
        return;
      }
      if (res.status === 401) {
        pushError(sv ? "Sessionen gick ut. Logga in igen." : "Session expired. Sign in again.", {
          text: trimmed,
          image: img,
        });
        auth.openAuth();
        return;
      }
      if (!res.ok) {
        pushError(
          data.error || (sv ? "Något gick fel. Försök igen." : "Something went wrong. Try again."),
          { text: trimmed, image: img }
        );
        return;
      }

      if (data.memory && auth.isMember && !temporary) {
        setMemoryToast(true);
        window.setTimeout(() => setMemoryToast(false), 2800);
        void reloadSidebar();
      }

      if (data.dual && data.replies?.length >= 2) {
        setActivity("idle");
        const mid = newId("m");
        setDualPick((d) => ({ ...d, [mid]: data.replies }));
        setMessages((prev) => [
          ...prev,
          { id: mid, role: "assistant", content: data.replies[0].body, ts: Date.now() },
        ]);
      } else {
        await typeResponse(data.reply || "…");
      }
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      pushError(
        aborted
          ? sv
            ? "Det tog för lång tid — försök igen."
            : "That timed out — try again."
          : sv
            ? "Nätverksfel. Kontrollera anslutningen."
            : "Network error. Check your connection.",
        { text: trimmed, image: img }
      );
    }
  };

  const runImageGen = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || busy) return;
    if (!imageGenEnabled) {
      showToast(
        "warn",
        sv
          ? "Bildgenerering kommer snart — bifoga en bild för analys i stället."
          : "Image generation is coming soon — attach an image to analyze instead."
      );
      setGenMode(false);
      return;
    }
    if (auth.isGuest) {
      auth.openAuth(sv ? "Bildgenerering kräver ett konto" : "Image generation needs an account");
      return;
    }
    if (!checkQuota("generations")) return;

    const cid = await ensureConversation();
    if (!cid) return;

    setMessages((prev) => [...prev, { id: newId("m"), role: "user", content: trimmed, ts: Date.now() }]);
    setInput("");
    setGenMode(false);
    setActivity("generating_image");
    setLastFailed(null);
    setBottom(true);
    await bumpServer("generations");

    try {
      const headers = await authHeaders();
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 501) {
        await typeResponse(
          sv
            ? "Bildgenerering är inte aktiverad här ännu (OPENAI_API_KEY saknas). Text-chatten fungerar."
            : "Image generation isn't enabled here yet (OPENAI_API_KEY missing). Text chat still works."
        );
        return;
      }
      if (!res.ok) {
        pushError(data.error || (sv ? "Kunde inte generera." : "Could not generate."), {
          text: trimmed,
          gen: true,
        });
        if (data.code === "auth") auth.openAuth();
        return;
      }
      const url = data.imageUrl
        ? data.imageUrl
        : data.imageBase64
          ? `data:image/png;base64,${data.imageBase64}`
          : null;
      if (!url) {
        pushError(sv ? "Ingen bild returnerades." : "No image returned.", { text: trimmed, gen: true });
        return;
      }
      setActivity("idle");
      setMessages((prev) => [
        ...prev,
        {
          id: newId("m"),
          role: "assistant",
          content: sv
            ? "Här är din bild. Vill du ha en variation eller justera något?"
            : "Here is your image. Want a variation or a tweak?",
          ts: Date.now(),
          imageUrl: url,
          generated: true,
        },
      ]);
    } catch {
      pushError(sv ? "Nätverksfel." : "Network error.", { text: trimmed, gen: true });
    }
  };

  const send = () => {
    if (busy) return;
    if (!input.trim() && !attach) return;
    if (genMode && imageGenEnabled) void runImageGen(input || "image");
    else void runPrompt(input || (attach ? (sv ? "Vad ser du?" : "What do you see?") : ""));
  };

  const regenerate = (msgId: string) => {
    if (busy) return;
    const idx = messages.findIndex((m) => m.id === msgId);
    let userText = "";
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userText = messages[i].content;
        break;
      }
    }
    if (!userText) return;
    const base = messages.slice(0, idx);
    setMessages(base);
    setDualPick((d) => {
      const n = { ...d };
      delete n[msgId];
      return n;
    });
    void runPrompt(userText, { base });
  };

  const continueLast = () => {
    if (busy) return;
    void runPrompt(
      sv
        ? "Fortsätt på ditt senaste svar — gå djupare och gör det mer konkret."
        : "Continue from your last answer — go deeper and make it more concrete."
    );
  };

  const retryFailed = (msgId: string) => {
    const f = lastFailed;
    if (!f) return;
    setLastFailed(null);
    const base = messages.filter((m) => m.id !== msgId);
    setMessages(base);
    if (f.gen) void runImageGen(f.text);
    else void runPrompt(f.text, { image: f.image, base });
  };

  const runInspire = () => {
    if (busy) return;
    const pool = INSPIRE_PROMPTS[answerLang] || INSPIRE_PROMPTS.en;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setInspireSpin(true);
    window.setTimeout(() => setInspireSpin(false), 600);
    setInput(pick);
    taRef.current?.focus({ preventScroll: true });
  };

  const pickExample = (prompt: string) => {
    setInput(prompt);
    taRef.current?.focus({ preventScroll: true });
    // Put the caret at the end so templates ("… Text: ") are ready to paste into.
    window.setTimeout(() => {
      const el = taRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    }, 0);
  };

  /* ─── attachments & voice ──────────────────────────── */

  const onFilePicked = async (f: File) => {
    if (!f.type.startsWith("image/")) {
      showToast("warn", sv ? "Endast bilder just nu" : "Images only for now");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      showToast("warn", sv ? "Max 4 MB" : "Max 4 MB");
      return;
    }
    if (auth.isGuest) {
      auth.openAuth(sv ? "Bifoga bilder med ett konto" : "Attach images with an account");
      return;
    }
    try {
      const { b64, media } = await fileToBase64(f);
      if (attach?.preview?.startsWith("blob:")) URL.revokeObjectURL(attach.preview);
      setAttach({
        id: newId("a"),
        kind: "image",
        preview: URL.createObjectURL(f),
        b64,
        media,
        name: f.name,
        size: f.size,
      });
      taRef.current?.focus({ preventScroll: true });
    } catch {
      showToast("err", sv ? "Kunde inte läsa filen" : "Could not read that file");
    }
  };

  const toggleMic = () => {
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechLike;
      webkitSpeechRecognition?: new () => SpeechLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      showToast(
        "warn",
        sv
          ? "Röst stöds inte i den här webbläsaren (prova Chrome)."
          : "Voice is not supported in this browser (try Chrome)."
      );
      return;
    }
    if (listening && recogRef.current) {
      recogRef.current.stop();
      setListening(false);
      setActivity("idle");
      return;
    }
    try {
      const r = new SR();
      r.lang = lang === "sv" ? "sv-SE" : "en-US";
      r.interimResults = true;
      r.continuous = false;
      r.onresult = (ev) => {
        let t = "";
        for (let i = 0; i < ev.results.length; i++) {
          const row = ev.results[i];
          if (row?.[0]?.transcript) t += row[0].transcript;
        }
        setInput(t);
      };
      r.onerror = (ev) => {
        setListening(false);
        setActivity("idle");
        const err = ev?.error || "";
        if (err === "not-allowed") {
          showToast("err", sv ? "Mikrofonen nekad i webbläsaren." : "Microphone permission denied.");
        } else if (err && err !== "aborted") {
          showToast("warn", sv ? "Röstfel — försök igen." : "Voice error — try again.");
        }
      };
      r.onend = () => {
        setListening(false);
        setActivity("idle");
      };
      recogRef.current = r;
      setListening(true);
      setActivity("listening");
      r.start();
    } catch {
      showToast("err", sv ? "Kunde inte starta mikrofonen." : "Could not start the microphone.");
    }
  };

  /* ─── conversations ────────────────────────────────── */

  const newChat = async (opts?: { temporary?: boolean }) => {
    if (creatingChat) return;
    setCreatingChat(true);
    stopAll();
    setAttach(null);
    setGenMode(false);
    setInput("");
    setDualPick({});
    setLastFailed(null);
    setWorkspace(null);
    setTemporary(!!opts?.temporary);

    try {
      if (auth.isMember && !opts?.temporary) {
        const id = await cloud.createConversation(sv ? "Ny chatt" : "New chat");
        if (!id) {
          showToast("err", sv ? "Kunde inte skapa chatt" : "Could not create chat");
          setCreatingChat(false);
          return;
        }
        setConvoId(id);
        setMessages([]);
        await reloadSidebar();
      } else {
        setConvoId(newId(opts?.temporary ? "tmp" : "local"));
        setMessages([]);
      }
      setMobileDrawer(false);
      taRef.current?.focus({ preventScroll: true });
    } finally {
      setCreatingChat(false);
    }
  };

  const loadConvo = async (id: string) => {
    stopAll();
    setDualPick({});
    setLastFailed(null);
    setWorkspace(null);
    setTemporary(false);
    if (auth.isMember) {
      const c = await cloud.loadConversation(id);
      if (!c) {
        showToast("err", sv ? "Kunde inte ladda chatten" : "Could not load that chat");
        return;
      }
      setConvoId(c.id);
      setMessages(c.messages);
    } else {
      const c = loadLocalConversations().find((x) => x.id === id);
      if (!c) return;
      setConvoId(c.id);
      setMessages(c.messages);
    }
    setMobileDrawer(false);
    setBottom(true);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const removeConvo = async (id: string) => {
    if (auth.isMember) await cloud.deleteConversation(id);
    else deleteLocalConversation(id);
    if (convoId === id) {
      setConvoId(null);
      setMessages([]);
    }
    void reloadSidebar();
  };

  const commitRename = async (id: string, title: string) => {
    if (auth.isMember) await cloud.renameConversation(id, title);
    else {
      const list = loadLocalConversations();
      const c = list.find((x) => x.id === id);
      if (c) {
        c.title = title;
        c.updatedAt = Date.now();
        persistLocalMessages(id, c.messages, { title });
      }
    }
    void reloadSidebar();
  };

  /* ─── export / workspace ───────────────────────────── */

  const exportThread = () => {
    if (!messages.length) {
      showToast("err", sv ? "Ingen tråd att exportera" : "No thread to export");
      return;
    }
    const lines = messages.map((m) => {
      const who = m.role === "user" ? "You" : m.role === "assistant" ? "BudAI" : m.role;
      return `## ${who}\n${m.content}\n`;
    });
    const threadTitle =
      history.find((c) => c.id === convoId)?.title || titleFromMessages(messages) || (sv ? "Chatt" : "Chat");
    const md = `# BudAI · ${threadTitle}\n\n${lines.join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budai-${threadTitle.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "chat"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ok", sv ? "Tråden exporterad (.md)" : "Thread exported (.md)");
  };

  const downloadWorkspace = (body: string) => {
    const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budai-workspace-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ok", sv ? "Workspace sparad (.md)" : "Workspace saved (.md)");
  };

  const copyText = async (text: string, okMsg?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("ok", okMsg || (sv ? "Kopierat" : "Copied"));
    } catch {
      showToast("err", sv ? "Kunde inte kopiera" : "Copy failed");
    }
  };

  const openWorkspace = (msgId: string, content: string) => {
    setWorkspace({ msgId, title: workspaceTitle(content, lang), body: content });
  };

  /* ─── keyboard shortcuts ───────────────────────────── */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField =
        tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        if (lightbox) return setLightbox(null);
        if (showShortcuts) return setShowShortcuts(false);
        if (memoryOpen) return setMemoryOpen(false);
        if (headerMenu) return setHeaderMenu(false);
        if (mobileDrawer) return setMobileDrawer(false);
        if (workspace) return setWorkspace(null);
        if (expanded) return setExpanded(false);
        return;
      }
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowShortcuts((s) => !s);
        return;
      }
      if (mod && e.key.toLowerCase() === "n" && !inField) {
        e.preventDefault();
        void newChat();
        return;
      }
      if (mod && e.key.toLowerCase() === "e" && !inField) {
        e.preventDefault();
        exportThread();
        return;
      }
      if (mod && e.key.toLowerCase() === "b" && !inField) {
        e.preventDefault();
        setWorkspace((w) => {
          if (w) return null;
          const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
          if (!last) return null;
          return { msgId: last.id, title: workspaceTitle(last.content, lang), body: last.content };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShortcuts, memoryOpen, headerMenu, mobileDrawer, workspace, lightbox, expanded, messages, lang]);

  /* Lock page scroll while the Playground owns the screen */
  useEffect(() => {
    if (!expanded && !mobileDrawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded, mobileDrawer]);

  /* ─── derived ──────────────────────────────────────── */

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter((c) => c.title.toLowerCase().includes(q));
  }, [history, search]);

  const groups = useMemo(() => groupByDate(filteredHistory, lang), [filteredHistory, lang]);
  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  const sidebar = (
    <ChatSidebar
      lang={lang}
      groups={groups}
      convoId={convoId}
      creatingChat={creatingChat}
      isMember={auth.isMember}
      search={search}
      onSearch={setSearch}
      onNewChat={() => void newChat()}
      onNewTemporary={() => void newChat({ temporary: true })}
      onLoad={(id) => void loadConvo(id)}
      onRename={(id, title) => void commitRename(id, title)}
      onDelete={(id) => void removeConvo(id)}
      memoryCount={memory.length}
      memoryEnabled={memoryEnabled}
      onOpenMemory={() => {
        setMemoryOpen(true);
        setMobileDrawer(false);
      }}
      remaining={rem}
      limit={lim}
      onUpgrade={auth.isGuest ? () => auth.openAuth(sv ? "Lås upp mer BudAI" : "Unlock more BudAI") : undefined}
      onClose={() => setMobileDrawer(false)}
    />
  );

  const shellBase =
    "flex overflow-hidden border border-white/[0.09] bg-[#06060c]/95 shadow-[0_50px_140px_-50px_rgba(0,0,0,0.95),0_0_140px_-70px_rgba(0,229,255,0.6)]";
  const shellClass = expanded
    ? `${shellBase} fixed inset-0 z-[80] sm:inset-4 sm:rounded-3xl`
    : `${shellBase} relative h-[calc(100svh-9rem)] max-h-[720px] min-h-[520px] rounded-[22px] sm:h-[calc(100svh-14rem)] sm:max-h-[820px] sm:min-h-[560px] sm:rounded-[26px] lg:h-[calc(100svh-24rem)] lg:max-h-[880px]`;

  /* ─── render ───────────────────────────────────────── */

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8">
      <div className={shellClass}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-accent-cyan/45 to-transparent" />

        {/* Desktop history rail */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 248, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="hidden shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#08080f] md:flex"
              style={{ maxWidth: 248 }}
            >
              {sidebar}
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex min-h-0 min-w-0 flex-1">
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] bg-[#08080f]/80 px-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.innerWidth < 768) setMobileDrawer(true);
                    else setSidebarOpen((v) => !v);
                  }}
                  aria-label={sv ? "Visa historik" : "Toggle history"}
                  title={sv ? "Historik" : "History"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>

                <BudAILogo size="xs" animated className="!h-6 !w-6" />
                <span className="text-[13.5px] font-semibold tracking-tight text-white">
                  Bud<span className="text-accent-cyan">AI</span>
                </span>

                <span className="preview-tag ml-0.5 hidden sm:inline-flex">
                  <span className="status-dot !h-[5px] !w-[5px]" />
                  {sv ? "live förhandsvisning" : "live preview"}
                </span>

                {!temporary && (
                  <span className="fig hidden lg:inline-flex">
                    {sv ? "modell: claude" : "model: claude"}
                  </span>
                )}

                {temporary && (
                  <span className="rounded-full border border-amber-400/25 px-2 py-[3px] text-[10.5px] text-amber-200/90">
                    {sv ? "tillfällig" : "temporary"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {auth.isMember ? (
                  <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 pl-1 pr-2.5 sm:flex">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan/70 to-accent-purple/70 text-[10px] font-bold text-white">
                      {(auth.displayName || "B").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="max-w-[110px] truncate text-[11.5px] text-white/80">
                      {auth.displayName}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => auth.openAuth()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.1] px-2.5 text-[11.5px] font-semibold text-accent-cyan transition-colors hover:border-accent-cyan/45 hover:bg-accent-cyan/[0.16]"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{sv ? "Logga in" : "Sign in"}</span>
                  </button>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setHeaderMenu((v) => !v)}
                    aria-label={sv ? "Fler åtgärder" : "More actions"}
                    aria-expanded={headerMenu}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      headerMenu ? "bg-white/[0.08] text-white" : "text-muted hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {headerMenu && (
                      <>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-hidden
                          className="fixed inset-0 z-[60] cursor-default"
                          onClick={() => setHeaderMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.14 }}
                          className="absolute right-0 top-10 z-[70] w-60 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0b0b14] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
                        >
                          <MenuItem
                            icon={<Download className="h-3.5 w-3.5" />}
                            label={sv ? "Exportera tråd (.md)" : "Export thread (.md)"}
                            hint="⌘E"
                            disabled={!messages.length}
                            onClick={() => {
                              setHeaderMenu(false);
                              exportThread();
                            }}
                          />
                          <MenuItem
                            icon={<Command className="h-3.5 w-3.5" />}
                            label={sv ? "Tangentbordsgenvägar" : "Keyboard shortcuts"}
                            hint="⌘K"
                            onClick={() => {
                              setHeaderMenu(false);
                              setShowShortcuts(true);
                            }}
                          />
                          {auth.isMember && (
                            <MenuItem
                              icon={<BrainCircuit className="h-3.5 w-3.5" />}
                              label={sv ? "Långtidsminne" : "Long-term memory"}
                              hint={String(memory.length)}
                              onClick={() => {
                                setHeaderMenu(false);
                                setMemoryOpen(true);
                              }}
                            />
                          )}
                          <MenuItem
                            icon={expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                            label={expanded ? (sv ? "Avsluta helskärm" : "Exit full screen") : sv ? "Helskärm" : "Full screen"}
                            onClick={() => {
                              setHeaderMenu(false);
                              setExpanded((e) => !e);
                            }}
                          />
                          {auth.isMember && (
                            <>
                              <div className="my-1 h-px bg-white/[0.07]" />
                              <MenuItem
                                icon={<LogOut className="h-3.5 w-3.5" />}
                                label={sv ? "Logga ut" : "Sign out"}
                                onClick={() => {
                                  setHeaderMenu(false);
                                  void auth.signOut();
                                }}
                              />
                            </>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  aria-label={expanded ? (sv ? "Avsluta helskärm" : "Exit full screen") : sv ? "Helskärm" : "Full screen"}
                  className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-white lg:inline-flex"
                >
                  {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              onScroll={onScrollMessages}
              className="pg-scroll-thin relative min-h-0 flex-1 overflow-y-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {isEmpty ? (
                <ChatEmptyState
                  lang={lang}
                  busy={busy}
                  isGuest={auth.isGuest}
                  remainingMessages={rem}
                  dailyLimit={lim}
                  listening={listening}
                  onPick={pickExample}
                  onSurprise={runInspire}
                  onAttach={() => fileRef.current?.click()}
                  onMic={toggleMic}
                  onSignIn={() => auth.openAuth(sv ? "Lås upp mer BudAI" : "Unlock more BudAI")}
                />
              ) : (
                <div className="mx-auto w-full max-w-3xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
                  {messages.map((msg) => (
                    <ChatMessageRow
                      key={msg.id}
                      msg={msg}
                      lang={lang}
                      busy={busy}
                      isLastAssistant={msg.id === lastAssistantId}
                      dualOptions={dualPick[msg.id]}
                      canRetry={Boolean(lastFailed) && Boolean(msg.error) && msg.id === messages[messages.length - 1]?.id}
                      onPickDual={(opt) => {
                        setMessages((p) => p.map((m) => (m.id === msg.id ? { ...m, content: opt.body } : m)));
                        setDualPick((d) => {
                          const n = { ...d };
                          delete n[msg.id];
                          return n;
                        });
                        if (isWorkspaceWorthy(opt.body) && window.innerWidth >= 1024) {
                          openWorkspace(msg.id, opt.body);
                        }
                      }}
                      onCopy={(text) => void copyText(text, sv ? "Svaret kopierat" : "Response copied")}
                      onRegenerate={() => regenerate(msg.id)}
                      onContinue={continueLast}
                      onWorkspace={() => openWorkspace(msg.id, msg.content)}
                      onRetry={() => retryFailed(msg.id)}
                      onOpenImage={(url) => setLightbox(url)}
                      onVariation={() =>
                        void runImageGen(
                          sv
                            ? `Variation av: ${messages.find((m) => m.role === "user" && m.ts <= msg.ts)?.content || "bilden"}`
                            : `Variation of: ${messages.find((m) => m.role === "user" && m.ts <= msg.ts)?.content || "the image"}`
                        )
                      }
                    />
                  ))}

                  {(busy || typingText.length > 0) && (
                    <ThinkingBubble lang={lang} activity={activity} typingText={typingText} />
                  )}
                </div>
              )}

              <AnimatePresence>
                {!atBottom && !isEmpty && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="pointer-events-none sticky bottom-3 z-30 flex justify-center"
                  >
                    <button
                      type="button"
                      onClick={() => scrollToEnd()}
                      aria-label={sv ? "Hoppa till senaste" : "Jump to latest"}
                      title={sv ? "Hoppa till senaste" : "Jump to latest"}
                      className="pointer-events-auto flex h-8 items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0b0b14]/95 px-3 text-[11.5px] text-muted shadow-lg backdrop-blur transition-colors hover:border-accent-cyan/35 hover:text-accent-cyan"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      {sv ? "Senaste" : "Latest"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ChatComposer
              lang={lang}
              input={input}
              onInputChange={setInput}
              onSend={send}
              onStop={stopAll}
              busy={busy}
              taRef={taRef}
              fileRef={fileRef}
              attach={attach}
              onRemoveAttach={() => {
                if (attach?.preview?.startsWith("blob:")) URL.revokeObjectURL(attach.preview);
                setAttach(null);
              }}
              onFilePicked={(f) => void onFilePicked(f)}
              listening={listening}
              onMic={toggleMic}
              genMode={genMode}
              onToggleGen={() => setGenMode((g) => !g)}
              imageGenEnabled={imageGenEnabled}
              intents={INTENT_PRESETS[lang] || INTENT_PRESETS.en}
              intentId={intentId}
              onIntent={(id) => {
                setIntentId(id);
                setMode(id === "dual" ? "dual" : mode === "concise" ? "concise" : "single");
              }}
              mode={mode}
              onToggleConcise={() => setMode((m) => (m === "concise" ? "single" : "concise"))}
              answerLang={answerLang}
              onAnswerLang={setAnswerLang}
              onSurprise={runInspire}
              inspireSpin={inspireSpin}
            />
          </div>

          {workspace && (
            <WorkspacePanel
              lang={lang}
              workspace={workspace}
              busy={busy}
              onCopy={(text) => void copyText(text)}
              onDownload={() => downloadWorkspace(workspace.body)}
              onClose={() => setWorkspace(null)}
              onImprove={() =>
                void runPrompt(
                  sv
                    ? "Förbättra resultatet i Workspace: gör det skarpare, mer strukturerat och mer handlingsbart."
                    : "Improve the workspace result: make it sharper, more structured, and more actionable."
                )
              }
              onEditInChat={() => {
                setInput(workspace.body.slice(0, 2000));
                setWorkspace(null);
                taRef.current?.focus({ preventScroll: true });
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile history drawer */}
      <AnimatePresence>
        {mobileDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] md:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label={sv ? "Stäng" : "Close"}
              onClick={() => setMobileDrawer(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="absolute bottom-0 left-0 top-0 flex w-[min(310px,88vw)] flex-col border-r border-white/[0.08] bg-[#08080f] shadow-2xl"
            >
              {sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile workspace sheet */}
      <AnimatePresence>
        {workspace && (
          <WorkspaceSheet
            key="workspace-sheet"
            lang={lang}
            workspace={workspace}
            onCopy={(text) => void copyText(text)}
            onClose={() => setWorkspace(null)}
          />
        )}
      </AnimatePresence>

      {/* Memory */}
      <AnimatePresence>
        {memoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[92] flex items-end justify-center p-0 sm:items-center sm:p-4"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => setMemoryOpen(false)}
              aria-label={sv ? "Stäng" : "Close"}
            />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pg-scroll-thin relative max-h-[85svh] w-full overflow-y-auto rounded-t-3xl border border-white/[0.1] bg-[#0a0a12] p-5 sm:max-w-md sm:rounded-2xl"
            >
              <button
                type="button"
                onClick={() => setMemoryOpen(false)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:bg-white/[0.06] hover:text-white"
                aria-label={sv ? "Stäng" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-white">
                <BrainCircuit className="h-5 w-5 text-accent-purple" />
                {sv ? "Långtidsminne" : "Long-term memory"}
              </h3>
              <p className="mb-4 text-[12.5px] leading-relaxed text-muted">
                {sv
                  ? "BudAI sparar hållbara fakta automatiskt — namn, roll, mål, preferenser. Du styr varje rad."
                  : "BudAI keeps durable facts automatically — name, role, goals, preferences. You control every row."}
              </p>

              <button
                type="button"
                onClick={() => {
                  const next = !memoryEnabled;
                  setMemoryEnabled(next);
                  void cloud.setMemoryEnabled(next);
                  saveSettings({ ...loadSettings(), memoryEnabled: next });
                }}
                className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm transition-colors hover:border-white/[0.14]"
              >
                <span className="flex items-center gap-2 text-white/85">
                  {memoryEnabled ? (
                    <Eye className="h-4 w-4 text-accent-cyan" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted" />
                  )}
                  {sv ? "Automatiskt minne" : "Auto-memory"}
                </span>
                <span className={`font-mono text-[11px] ${memoryEnabled ? "text-accent-green" : "text-muted"}`}>
                  {memoryEnabled ? "ON" : "OFF"}
                </span>
              </button>

              <div className="mb-3 space-y-2">
                {memory.length === 0 && (
                  <p className="py-8 text-center text-[13px] text-muted/60">
                    {sv ? "Inget sparat ännu." : "Nothing saved yet."}
                  </p>
                )}
                {memory.map((m) => (
                  <div key={m.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                    {editingMem === m.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void cloud.updateMemory(m.id, editMemText).then(() => {
                            setEditingMem(null);
                            void reloadSidebar();
                          });
                        }}
                        className="space-y-2"
                      >
                        <textarea
                          value={editMemText}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditMemText(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[13px] text-white focus:border-accent-cyan/40 focus:outline-none"
                        />
                        <div className="flex gap-3">
                          <button type="submit" className="text-[12px] font-medium text-accent-cyan hover:text-white">
                            {sv ? "Spara" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMem(null)}
                            className="text-[12px] text-muted hover:text-white"
                          >
                            {sv ? "Avbryt" : "Cancel"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <span className="flex-1 text-[13px] leading-relaxed text-white/85">{m.text}</span>
                        <button
                          type="button"
                          aria-label={sv ? "Redigera" : "Edit"}
                          className="rounded-md p-1 text-muted hover:bg-white/[0.06] hover:text-white"
                          onClick={() => {
                            setEditingMem(m.id);
                            setEditMemText(m.text);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          aria-label={sv ? "Ta bort" : "Delete"}
                          className="rounded-md p-1 text-muted hover:bg-red-500/10 hover:text-red-300"
                          onClick={() => void cloud.deleteMemory(m.id).then(() => reloadSidebar())}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div className="mt-1.5 font-mono text-[10px] text-muted/45">
                      {m.source} · {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {memory.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(sv ? "Rensa allt minne?" : "Clear all memory?")) {
                      void cloud.clearMemories().then(() => reloadSidebar());
                    }
                  }}
                  className="text-[11.5px] text-muted transition-colors hover:text-red-300"
                >
                  {sv ? "Rensa allt minne" : "Clear all memory"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setLightbox(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt=""
              className="max-h-[85vh] max-w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-6 left-1/2 z-[96] max-w-[90vw] -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm shadow-xl ${
              toast.kind === "err"
                ? "border-red-400/30 bg-[#1a1014] text-red-100"
                : toast.kind === "warn"
                  ? "border-amber-400/30 bg-[#14121a] text-amber-100"
                  : "border-accent-cyan/30 bg-[#0c1418] text-cyan-50"
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {memoryToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 left-1/2 z-[96] flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-accent-purple/30 bg-[#121018] px-3 py-1.5 text-[11px] text-purple-100 shadow-lg"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-accent-purple" />
            {sv ? "Minne uppdaterat" : "Memory updated"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            className="fixed inset-0 z-[97] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowShortcuts(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0c0c14] p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center gap-2">
                <Command className="h-4 w-4 text-accent-cyan" />
                <h3 className="text-sm font-semibold text-white">
                  {sv ? "Tangentbordsgenvägar" : "Keyboard shortcuts"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(false)}
                  className="ml-auto rounded-lg p-1 text-muted hover:bg-white/[0.06] hover:text-white"
                  aria-label={sv ? "Stäng" : "Close"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-1 text-[12.5px]">
                {[
                  { keys: "Enter", desc: sv ? "Skicka meddelande" : "Send message" },
                  { keys: "Shift + Enter", desc: sv ? "Ny rad" : "New line" },
                  { keys: "⌘ N", desc: sv ? "Ny chatt" : "New chat" },
                  { keys: "⌘ E", desc: sv ? "Exportera tråd (.md)" : "Export thread (.md)" },
                  { keys: "⌘ B", desc: sv ? "Växla Workspace" : "Toggle Workspace" },
                  { keys: "⌘ K", desc: sv ? "Öppna denna panel" : "Open this panel" },
                  { keys: "Esc", desc: sv ? "Stäng paneler" : "Close panels" },
                ].map((row) => (
                  <li
                    key={row.keys}
                    className="flex items-center justify-between gap-3 border-b border-white/[0.04] py-2 last:border-0"
                  >
                    <span className="text-muted">{row.desc}</span>
                    <kbd className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-white/90">
                      {row.keys}
                    </kbd>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11.5px] leading-relaxed text-muted/60">
                {sv
                  ? "Lägena Chatt / Research / Skapa / Analys styr hur BudAI formulerar svaret i API-anropet."
                  : "The Chat / Research / Create / Analyze modes steer how BudAI shapes the answer in the API call."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-35"
    >
      <span className="text-muted">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="font-mono text-[10.5px] text-muted/60">{hint}</span>}
    </button>
  );
}

type SpeechLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
