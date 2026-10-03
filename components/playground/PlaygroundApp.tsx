"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  StopCircle,
  X,
  Trash2,
  Plus,
  PanelLeft,
  ImagePlus,
  Mic,
  MicOff,
  LogIn,
  LogOut,
  BrainCircuit,
  Download,
  Wand2,
  Search,
  Pencil,
  Check,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  MessageSquarePlus,
  RefreshCw,
  Copy,
  PanelRight,
  PanelRightClose,
  FileDown,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Shield,
  Pin,
  WifiOff,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import EmptyState from "@/components/playground/EmptyState";
import CookieConsent from "@/components/ui/CookieConsent";
import { useLang } from "@/components/ui/LanguageContext";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  type ChatMessage,
  type Conversation,
  type MemoryItem,
  type AiActivity,
  type AttachmentDraft,
  type Mode,
  newId,
  memoryToPromptBlock,
  looksLikeImageGen,
} from "@/lib/playground/types";
import {
  loadLocalConversations,
  deleteLocalConversation,
  persistLocalMessages,
  pinLocalConversation,
  loadSettings,
  saveSettings,
  loadDraft,
  saveDraft,
} from "@/lib/playground/localStore";
import * as cloud from "@/lib/playground/cloudStore";
import { renderMarkdown } from "@/lib/playground/markdown";
import { INTENT_PRESETS } from "@/lib/playground/prompts";
import {
  fileToBase64,
  activityLabel,
  groupByDate,
  isWorkspaceWorthy,
  workspaceTitle,
  findPreviousUserText,
  formatMsgTime,
  suggestFollowUps,
} from "@/lib/playground/helpers";

const COMPOSER_PH = {
  sv: ["Skriv till BudAI…", "Planera dagen…", "Utkast till mejl…", "Tänk högt…"],
  en: ["Message BudAI…", "Plan the day…", "Draft an email…", "Think out loud…"],
};

export default function PlaygroundApp() {
  const { lang, setLang } = useLang();
  const auth = useAuth();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activity, setActivity] = useState<AiActivity>("idle");
  const [typingText, setTypingText] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [intentId, setIntentId] = useState("chat");
  const [feedback, setFeedback] = useState<Record<string, "up" | "down" | undefined>>({});
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [answerLang, setAnswerLang] = useState<"sv" | "en">(lang);
  const [workspace, setWorkspace] = useState<{ msgId: string; title: string; body: string } | null>(
    null
  );
  const [toolsOpen, setToolsOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [history, setHistory] = useState<
    Pick<Conversation, "id" | "title" | "updatedAt" | "createdAt" | "temporary" | "pinned">[]
  >([]);
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
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [memoryToast, setMemoryToast] = useState(false);
  const [editingMem, setEditingMem] = useState<string | null>(null);
  const [editMemText, setEditMemText] = useState("");
  const [dualPick, setDualPick] = useState<
    Record<string, { title: string; body: string }[] | undefined>
  >({});
  const [lastFailed, setLastFailed] = useState<{
    text: string;
    image?: AttachmentDraft | null;
    gen?: boolean;
  } | null>(null);
  const [guestBanner, setGuestBanner] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [phIdx, setPhIdx] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const userStopRef = useRef(false);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const overwriteAt = useRef<number | null>(null);
  const persistGen = useRef(0);
  const dragDepth = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<{ stop: () => void } | null>(null);
  const persistTimer = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bootRef = useRef(false);
  const qBoot = useRef(false);
  const runPromptRef = useRef<(text: string, opts?: { image?: AttachmentDraft | null; forceGen?: boolean }) => Promise<void>>(
    async () => {}
  );

  const busy = activity !== "idle" && activity !== "error" && activity !== "listening";

  const showToast = useCallback((kind: "ok" | "warn" | "err", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const ingestImageFile = useCallback(
    async (f: File) => {
      if (!f.type.startsWith("image/")) {
        showToast("warn", lang === "sv" ? "Endast bilder just nu" : "Images only for now");
        return;
      }
      if (f.size > 4 * 1024 * 1024) {
        showToast("warn", "Max 4 MB");
        return;
      }
      if (auth.isGuest) {
        auth.openAuth(lang === "sv" ? "Bifoga bild med konto" : "Attach images with an account");
        return;
      }
      try {
        const { b64, media } = await fileToBase64(f);
        setAttach((prev) => {
          if (prev?.preview?.startsWith("blob:")) URL.revokeObjectURL(prev.preview);
          return {
            id: newId("a"),
            kind: "image",
            preview: URL.createObjectURL(f),
            b64,
            media,
            name: f.name,
            size: f.size,
          };
        });
      } catch {
        showToast("err", lang === "sv" ? "Kunde inte läsa filen" : "Could not read file");
      }
    },
    [auth, lang, showToast]
  );

  const resetComposer = () => {
    setInput("");
    const el = taRef.current;
    if (el) {
      el.style.height = "auto";
      el.focus();
    }
  };

  useEffect(() => {
    if (window.innerWidth >= 1024) setSidebarOpen(true);
    const t = window.setTimeout(() => taRef.current?.focus(), 380);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setAnswerLang(lang);
  }, [lang]);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("q")) return;
    } catch {
      /* */
    }
    const d = loadDraft(convoId);
    setInput(d);
    window.setTimeout(() => {
      const el = taRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, 30);
  }, [convoId]);

  useEffect(() => {
    const t = window.setTimeout(() => saveDraft(convoId, input), 280);
    return () => window.clearTimeout(t);
  }, [input, convoId]);

  useEffect(() => {
    const t = window.setInterval(() => setPhIdx((i) => i + 1), 3400);
    return () => window.clearInterval(t);
  }, [lang]);

  useEffect(() => {
    const onUp = () => {
      const sel = window.getSelection();
      const text = (sel?.toString() || "").trim();
      if (text.length < 12 || text.length > 600) return;
      const node = sel?.anchorNode;
      const el = node instanceof Element ? node : node?.parentElement;
      if (!el?.closest("[data-pg-msg='assistant']")) return;
      setQuote(text.replace(/\s+/g, " "));
    };
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, []);

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
      showToast("ok", lang === "sv" ? "Inloggad" : "Signed in");
      auth.clearAuthFlash();
    }
  }, [auth.authFlash, auth, lang, showToast]);

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
    if (!bootRef.current) bootRef.current = true;
  }, [auth.ready, auth.isMember, reloadSidebar]);

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

  const updateStick = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(dist < 96);
  };

  useEffect(() => {
    if (!stickToBottom) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingText, activity, stickToBottom]);

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
        lang === "sv"
          ? kind === "messages"
            ? "Daglig gräns nådd. Logga in för mer."
            : "Kräver konto eller högre gräns."
          : kind === "messages"
            ? "Daily limit reached. Sign in for more."
            : "Needs an account or higher limit."
      );
      if (auth.isGuest) auth.openAuth(lang === "sv" ? "Lås upp mer BudAI" : "Unlock more BudAI");
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

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (convoId) return convoId;
    if (temporary) {
      const id = newId("tmp");
      setConvoId(id);
      return id;
    }
    if (auth.isMember) {
      const id = await cloud.createConversation(lang === "sv" ? "Ny chatt" : "New chat");
      if (!id) {
        showToast("err", lang === "sv" ? "Kunde inte skapa chatt" : "Could not create chat");
        return null;
      }
      setConvoId(id);
      void reloadSidebar();
      return id;
    }
    const id = newId("local");
    setConvoId(id);
    return id;
  }, [convoId, temporary, auth.isMember, lang, reloadSidebar, showToast]);

  const persistChain = useRef(Promise.resolve());
  const persistMessages = useCallback(
    async (list: ChatMessage[], id: string | null) => {
      if (!list.length || !id) return id;
      if (temporary) return id;
      const gen = persistGen.current;
      const run = async () => {
        if (gen !== persistGen.current) return id;
        if (auth.isMember) {
          if (overwriteAt.current === gen) {
            overwriteAt.current = null;
            await cloud.overwriteMessages(id, list);
          } else {
            await cloud.syncMessages(id, list);
          }
          if (gen !== persistGen.current) return id;
          void reloadSidebar();
          return id;
        }
        persistLocalMessages(id, list);
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
        return id;
      };
      const next = persistChain.current.then(run, run);
      persistChain.current = next.then(
        () => undefined,
        () => undefined
      );
      return next;
    },
    [auth.isMember, temporary, reloadSidebar]
  );

  useEffect(() => {
    if (!messages.length || !convoId) return;
    window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      void persistMessages(messages, convoId);
    }, 600);
    return () => window.clearTimeout(persistTimer.current);
  }, [messages, convoId, persistMessages]);

  const typeResponse = async (fullText: string, extra?: Partial<ChatMessage>) => {
    setActivity("typing");
    setTypingText("");
    abortRef.current = false;
    const words = fullText.split(/(\s+)/);
    let current = "";
    for (let i = 0; i < words.length; i++) {
      if (abortRef.current) {
        setTypingText("");
        setActivity("idle");
        const partial: ChatMessage = {
          id: newId("m"),
          role: "assistant",
          content: current || fullText,
          ts: Date.now(),
          ...extra,
        };
        setMessages((prev) => [...prev, partial]);
        return false;
      }
      current += words[i];
      if (i % 2 === 0 || i === words.length - 1) {
        setTypingText(current);
        await new Promise((r) => setTimeout(r, 2 + Math.random() * 4));
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
    userStopRef.current = true;
    try {
      fetchAbortRef.current?.abort();
    } catch {
      /* */
    }
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
    setMessages((prev) => [
      ...prev,
      { id: newId("m"), role: "assistant", content: text, ts: Date.now(), error: true },
    ]);
    if (retry) setLastFailed(retry);
  };

  const runImageGen = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || busy) return;
    if (!imageGenEnabled) {
      showToast(
        "warn",
        lang === "sv"
          ? "Bildgenerering kommer snart — bifoga en bild för analys i stället."
          : "Image generation coming soon — attach an image to analyze instead."
      );
      setGenMode(false);
      return;
    }
    if (auth.isGuest) {
      auth.openAuth(lang === "sv" ? "Bildgenerering kräver konto" : "Image generation needs an account");
      return;
    }
    if (!checkQuota("generations")) return;
    const cid = await ensureConversation();
    if (!cid) return;
    setMessages((prev) => [
      ...prev,
      { id: newId("m"), role: "user", content: trimmed, ts: Date.now() },
    ]);
    resetComposer();
    setStickToBottom(true);
    setGenMode(false);
    setActivity("generating_image");
    setLastFailed(null);
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
          lang === "sv"
            ? "Bildgenerering är inte aktiverad här ännu. Text-chatten fungerar."
            : "Image generation isn’t enabled here yet. Text chat still works."
        );
        return;
      }
      if (!res.ok) {
        pushError(data.error || (lang === "sv" ? "Kunde inte generera." : "Could not generate."), {
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
        pushError(lang === "sv" ? "Ingen bild returnerades." : "No image returned.", {
          text: trimmed,
          gen: true,
        });
        return;
      }
      setActivity("idle");
      setMessages((prev) => [
        ...prev,
        {
          id: newId("m"),
          role: "assistant",
          content:
            lang === "sv"
              ? "Här är din bild. Vill du ha en variation eller beskriva något mer?"
              : "Here’s your image. Want a variation or to describe something more?",
          ts: Date.now(),
          imageUrl: url,
          generated: true,
        },
      ]);
    } catch {
      pushError(lang === "sv" ? "Nätverksfel." : "Network error.", { text: trimmed, gen: true });
    }
  };

  const runPrompt = async (text: string, opts?: { image?: AttachmentDraft | null; forceGen?: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const wantGen = imageGenEnabled && (opts?.forceGen || genMode || looksLikeImageGen(trimmed));
    if (wantGen && !opts?.image) {
      setGenMode(false);
      return runImageGen(trimmed);
    }

    if (!checkQuota("messages")) return;

    const img = opts?.image !== undefined ? opts.image : attach;
    if (img && auth.isGuest) {
      auth.openAuth(lang === "sv" ? "Bildanalys kräver konto" : "Image analysis needs an account");
      return;
    }
    if (img && !checkQuota("images")) return;

    const cid = await ensureConversation();
    if (!cid && auth.isMember) return;

    const quoted = quote?.trim();
    const content = quoted
      ? lang === "sv"
        ? `Angående det här utdraget:\n«${quoted}»\n\n${trimmed}`
        : `Regarding this excerpt:\n«${quoted}»\n\n${trimmed}`
      : trimmed;
    setQuote(null);
    saveDraft(convoId, "");

    let base = messages;
    const editId = editingId;
    const prevEdit = editId ? messages.find((m) => m.id === editId) : null;
    if (editId) {
      const idx = messages.findIndex((m) => m.id === editId);
      if (idx >= 0) base = messages.slice(0, idx);
      setEditingId(null);
      persistGen.current += 1;
      overwriteAt.current = persistGen.current;
    }
    const userMsg: ChatMessage = {
      id: newId("m"),
      role: "user",
      content,
      ts: Date.now(),
      imageUrl: img?.preview || prevEdit?.imageUrl,
    };
    const nextList = [...base, userMsg];
    setMessages(nextList);
    setStickToBottom(true);
    resetComposer();
    setAttach(null);
    setToolsOpen(false);
    setModeOpen(false);
    setLastFailed(null);
    abortRef.current = false;
    userStopRef.current = false;
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
      fetchAbortRef.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), 90_000);
      const intent =
        (INTENT_PRESETS[lang] || INTENT_PRESETS.en).find((x) => x.id === intentId) ||
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
      fetchAbortRef.current = null;
      if (userStopRef.current || abortRef.current) {
        setActivity("idle");
        return;
      }
      const data = await res.json().catch(() => ({}));

      if (res.status === 429 || data.code === "limit") {
        pushError(data.error || "Limit", { text: trimmed, image: img });
        auth.openAuth();
        return;
      }
      if (res.status === 403) {
        pushError(data.error || "Forbidden", { text: trimmed, image: img });
        auth.openAuth(data.error);
        return;
      }
      if (res.status === 401) {
        pushError(
          lang === "sv" ? "Sessionen gick ut. Logga in igen." : "Session expired. Sign in again.",
          { text: trimmed, image: img }
        );
        auth.openAuth();
        return;
      }
      if (!res.ok) {
        pushError(
          data.error ||
            (lang === "sv" ? "Något gick fel. Försök igen." : "Something went wrong. Try again."),
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
      fetchAbortRef.current = null;
      if (userStopRef.current || abortRef.current) {
        setActivity("idle");
        setTypingText("");
        return;
      }
      const aborted = e instanceof Error && e.name === "AbortError";
      pushError(
        aborted
          ? lang === "sv"
            ? "Timeout — försök igen."
            : "Timed out — try again."
          : lang === "sv"
            ? "Nätverksfel. Kontrollera anslutningen."
            : "Network error. Check your connection.",
        { text: trimmed, image: img }
      );
    }
  };

  runPromptRef.current = runPrompt;

  useEffect(() => {
    if (qBoot.current) return;
    const q = searchParams.get("q");
    if (!q?.trim()) return;
    qBoot.current = true;
    const text = q.trim();
    try {
      window.history.replaceState({}, "", "/playground");
    } catch {
      /* */
    }
    const t = window.setTimeout(() => {
      void runPromptRef.current(text);
    }, 250);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  const exportThread = () => {
    if (!messages.length) {
      showToast("err", lang === "sv" ? "Ingen tråd att exportera" : "No thread to export");
      return;
    }
    const lines = messages.map((m) => {
      const who = m.role === "user" ? "You" : m.role === "assistant" ? "BudAI" : m.role;
      return `## ${who}\n${m.content}\n`;
    });
    const threadTitle =
      history.find((c) => c.id === convoId)?.title || (lang === "sv" ? "Chatt" : "Chat");
    const md = `# BudAI · ${threadTitle}\n\n${lines.join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budai-${threadTitle.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "chat"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ok", lang === "sv" ? "Tråd exporterad (.md)" : "Thread exported (.md)");
  };

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
    setToolsOpen(false);
    setFeedback({});
    setEditingId(null);
    setQuote(null);
    setPendingDelete(null);
    setStickToBottom(true);
    persistGen.current += 1;
    setTemporary(!!opts?.temporary);
    try {
      if (auth.isMember && !opts?.temporary) {
        const id = await cloud.createConversation(lang === "sv" ? "Ny chatt" : "New chat");
        if (!id) {
          showToast("err", lang === "sv" ? "Kunde inte skapa chatt" : "Could not create chat");
          setCreatingChat(false);
          return;
        }
        setConvoId(id);
        setMessages([]);
        await reloadSidebar();
      } else {
        const id = newId(opts?.temporary ? "tmp" : "local");
        setConvoId(id);
        setMessages([]);
      }
      setMobileDrawer(false);
      taRef.current?.focus();
    } finally {
      setCreatingChat(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField =
        tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (lightbox) {
          setLightbox(null);
          return;
        }
        if (memoryOpen) {
          setMemoryOpen(false);
          return;
        }
        if (toolsOpen) {
          setToolsOpen(false);
          return;
        }
        if (modeOpen) {
          setModeOpen(false);
          return;
        }
        if (workspace) {
          setWorkspace(null);
          return;
        }
        if (accountOpen) {
          setAccountOpen(false);
          return;
        }
        if (editingId) {
          setEditingId(null);
          resetComposer();
          return;
        }
        if (quote) {
          setQuote(null);
          return;
        }
        if (mobileDrawer) {
          setMobileDrawer(false);
          return;
        }
        return;
      }
      if (!inField && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1) {
        if (showShortcuts || memoryOpen || lightbox || mobileDrawer || busy) return;
        if (window.getSelection()?.toString()) return;
        e.preventDefault();
        setInput((v) => v + e.key);
        window.setTimeout(() => {
          taRef.current?.focus();
          const el = taRef.current;
          if (!el) return;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        }, 0);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b" && !inField) {
        e.preventDefault();
        if (window.innerWidth < 768) setMobileDrawer((v) => !v);
        else setSidebarOpen((v) => !v);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowShortcuts((s) => !s);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !inField) {
        e.preventDefault();
        void newChat();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/" && !inField) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const last = [...messages].reverse().find((m) => m.role === "assistant" && !m.error);
        if (last) {
          void navigator.clipboard.writeText(last.content).then(() => {
            setCopiedId(last.id);
            window.setTimeout(() => setCopiedId(null), 1400);
          });
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e" && !inField) {
        e.preventDefault();
        exportThread();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShortcuts, toolsOpen, modeOpen, workspace, accountOpen, mobileDrawer, messages, lang, lightbox, memoryOpen, editingId, quote]);

  useEffect(() => {
    if (!accountOpen && !modeOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("[data-popover]")) return;
      setAccountOpen(false);
      setModeOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [accountOpen, modeOpen]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.startsWith("/") && !input.includes(" ")) return;
    if (!input.trim() && !attach) return;
    if (genMode && imageGenEnabled) void runImageGen(input || "image");
    else
      void runPrompt(
        input || (attach ? (lang === "sv" ? "Vad ser du?" : "What do you see?") : "")
      );
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void ingestImageFile(f);
  };

  const toggleMic = () => {
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    type SpeechRec = {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: ((ev: { error?: string }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      showToast(
        "warn",
        lang === "sv"
          ? "Röst stöds inte i den här webbläsaren (prova Chrome)."
          : "Voice not supported in this browser (try Chrome)."
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
          showToast(
            "err",
            lang === "sv" ? "Mikrofon nekad i webbläsaren." : "Microphone permission denied."
          );
        } else if (err && err !== "aborted") {
          showToast("warn", lang === "sv" ? "Röstfel — försök igen." : "Voice error — try again.");
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
      showToast("err", lang === "sv" ? "Kunde inte starta mikrofon." : "Could not start microphone.");
    }
  };

  const loadConvo = async (id: string) => {
    stopAll();
    setDualPick({});
    setLastFailed(null);
    setWorkspace(null);
    setTemporary(false);
    setQuote(null);
    setEditingId(null);
    setPendingDelete(null);
    if (auth.isMember) {
      const c = await cloud.loadConversation(id);
      if (!c) {
        showToast("err", lang === "sv" ? "Kunde inte ladda chatt" : "Could not load chat");
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
    setStickToBottom(true);
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

  const beginEdit = (msg: ChatMessage) => {
    if (msg.role !== "user" || busy) return;
    setEditingId(msg.id);
    setInput(msg.content);
    setAttach(null);
    window.setTimeout(() => {
      const el = taRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }, 20);
  };

  const togglePin = async (id: string, next: boolean) => {
    if (auth.isMember) await cloud.pinConversation(id, next);
    else pinLocalConversation(id, next);
    void reloadSidebar();
  };

  const commitRename = async (id: string) => {
    const title = renameVal.trim().slice(0, 80);
    setRenamingId(null);
    if (!title) return;
    if (auth.isMember) await cloud.renameConversation(id, title);
    else {
      const list = loadLocalConversations();
      const c = list.find((x) => x.id === id);
      if (c) persistLocalMessages(id, c.messages, { title });
    }
    void reloadSidebar();
  };

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter((c) => c.title.toLowerCase().includes(q));
  }, [history, search]);

  const grouped = useMemo(() => groupByDate(filteredHistory, lang), [filteredHistory, lang]);
  const isEmpty = messages.length === 0 && activity === "idle";
  const rem = auth.remaining.messages;
  const lim = auth.limits.messagesPerDay;
  const usedPct = lim > 0 ? Math.min(100, ((lim - rem) / lim) * 100) : 0;
  const intents = INTENT_PRESETS[lang] || INTENT_PRESETS.en;
  const currentIntent = intents.find((x) => x.id === intentId) || intents[0];
  const threadTitle = history.find((c) => c.id === convoId)?.title;
  const slashOpen = /^\/[^\s]*$/.test(input);
  const slashItems = slashOpen
    ? intents.filter((it) => {
        const q = input.slice(1).toLowerCase();
        if (!q) return true;
        return it.label.toLowerCase().includes(q) || it.id.toLowerCase().includes(q);
      })
    : [];

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && !messages[i].error) return messages[i];
    }
    return null;
  }, [messages]);
  const followUps = useMemo(() => {
    if (!lastAssistant || busy || dualPick[lastAssistant.id]) return [];
    return suggestFollowUps(lastAssistant.content, lang);
  }, [lastAssistant, busy, dualPick, lang]);

  useEffect(() => {
    const t =
      threadTitle && threadTitle !== "New chat" && threadTitle !== "Ny chatt"
        ? `${threadTitle} · BudAI`
        : "Playground · BudAI";
    document.title = t;
  }, [threadTitle]);

  const autoResize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const sendDisabled = (!input.trim() && !attach) || busy;

  const SidebarBody = (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 space-y-2">
        <Link href="/" className="flex items-center gap-2.5 px-1 py-1 mb-1 group">
          <BudAILogo size="sm" animated />
          <span className="text-[15px] font-semibold tracking-tight">
            Bud<span className="text-accent-cyan">AI</span>
          </span>
        </Link>
        <button
          type="button"
          disabled={creatingChat}
          onClick={() => void newChat()}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {lang === "sv" ? "Ny chatt" : "New chat"}
        </button>
        {auth.isMember && (
          <button
            type="button"
            onClick={() => void newChat({ temporary: true })}
            className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] text-white/45 hover:text-white border border-white/[0.07]"
          >
            <Clock className="w-3 h-3" />
            {lang === "sv" ? "Tillfällig chatt" : "Temporary chat"}
          </button>
        )}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "sv" ? "Sök…" : "Search…"}
            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/16"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3 min-h-0">
        {grouped.length === 0 && (
          <p className="text-[11px] text-white/30 px-2 py-4 leading-relaxed">
            {search.trim()
              ? lang === "sv"
                ? "Inga träffar."
                : "No matches."
              : auth.isGuest
                ? lang === "sv"
                  ? "Gästhistorik sparas tillfälligt på enheten."
                  : "Guest history is temporary on this device."
                : lang === "sv"
                  ? "Inga chattar ännu."
                  : "No chats yet."}
          </p>
        )}
        {grouped.map((g) => (
          <div key={g.label}>
            <div className="text-[10px] uppercase tracking-wider text-white/30 px-2 mb-1">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((c) => (
                <div
                  key={c.id}
                  className={`pg-sidebar-item group flex gap-0.5 rounded-xl px-1.5 py-1.5 ${
                    convoId === c.id
                      ? "bg-white/[0.08] border border-white/[0.08]"
                      : "hover:bg-white/[0.045] border border-transparent"
                  }`}
                >
                  {renamingId === c.id ? (
                    <form
                      className="flex-1 flex gap-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void commitRename(c.id);
                      }}
                    >
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        className="flex-1 min-w-0 px-1.5 py-1 rounded-md bg-black/40 border border-white/10 text-[12px] text-white"
                      />
                      <button type="submit" className="p-1 text-accent-cyan">
                        <Check className="w-3 h-3" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void loadConvo(c.id)}
                        className="flex-1 min-w-0 text-left px-1"
                      >
                        <div className="text-[12px] text-white/85 truncate flex items-center gap-1">
                          {c.pinned && <Pin className="w-2.5 h-2.5 text-accent-cyan shrink-0" />}
                          <span className="truncate">{c.title}</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`p-1 ${c.pinned ? "text-accent-cyan opacity-100" : "opacity-0 group-hover:opacity-100 text-white/35 hover:text-white"}`}
                        onClick={() => void togglePin(c.id, !c.pinned)}
                        aria-label={c.pinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-1 text-white/35 hover:text-white"
                        onClick={() => {
                          setRenamingId(c.id);
                          setRenameVal(c.title);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className={`p-1 ${
                          pendingDelete === c.id
                            ? "opacity-100 text-red-300"
                            : "opacity-0 group-hover:opacity-100 text-white/35 hover:text-red-300"
                        }`}
                        title={
                          pendingDelete === c.id
                            ? lang === "sv"
                              ? "Klicka igen för att radera"
                              : "Click again to delete"
                            : lang === "sv"
                              ? "Radera"
                              : "Delete"
                        }
                        onClick={() => {
                          if (pendingDelete === c.id) {
                            setPendingDelete(null);
                            void removeConvo(c.id);
                          } else {
                            setPendingDelete(c.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-white/[0.06] space-y-1">
        {auth.isMember && (
          <button
            type="button"
            onClick={() => setMemoryOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-[11px] text-white/45 hover:text-white hover:bg-white/[0.04]"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-accent-cyan" />
            {lang === "sv" ? "Minne" : "Memory"}
            <span className="ml-auto font-mono text-white/40">{memory.length}</span>
            {!memoryEnabled && <EyeOff className="w-3 h-3" />}
          </button>
        )}
        <div className="px-2 py-1.5">
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full ${usedPct > 85 ? "bg-amber-400/80" : "bg-accent-cyan/70"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-white/25 font-mono">
            {rem}/{lim} {lang === "sv" ? "msg idag" : "msg today"}
          </div>
        </div>
        <div className="flex items-center gap-1 px-1 pt-1">
          {(["en", "sv"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                lang === code ? "bg-white text-zinc-950" : "text-white/35 hover:text-white"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 px-2 py-1.5 text-[11px] text-white/35">
          <Link href="/waitlist" className="hover:text-white transition-colors">
            {lang === "sv" ? "Väntelista" : "Waitlist"}
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            {lang === "sv" ? "Om" : "About"}
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="h-[100dvh] flex flex-col bg-background text-white overflow-hidden overscroll-none relative"
      onDragEnter={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return;
        e.preventDefault();
        dragDepth.current += 1;
        setDragOver(true);
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types && [...e.dataTransfer.types].includes("Files")) e.preventDefault();
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) void ingestImageFile(f);
      }}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center bg-[#0c1418]/80 border-2 border-dashed border-accent-cyan/40">
          <div className="px-5 py-3 rounded-2xl border border-accent-cyan/30 bg-[#101014] text-sm text-accent-cyan">
            {lang === "sv" ? "Släpp bilden här" : "Drop image here"}
          </div>
        </div>
      )}
      {!online && (
        <div className="shrink-0 h-8 px-3 flex items-center justify-center gap-2 text-[11px] text-amber-100 bg-amber-500/15 border-b border-amber-400/20">
          <WifiOff className="w-3.5 h-3.5" />
          {lang === "sv" ? "Ingen anslutning — utkast sparas lokalt." : "You’re offline — drafts stay on this device."}
        </div>
      )}
      <div className="flex-1 flex min-h-0">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 268, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex flex-col border-r border-white/[0.05] bg-[#08080b] shrink-0 overflow-hidden"
            >
              {SidebarBody}
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 flex min-w-0 min-h-0">
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="h-12 shrink-0 flex items-center justify-between gap-2 px-2 sm:px-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.innerWidth < 768) setMobileDrawer(true);
                    else setSidebarOpen((v) => !v);
                  }}
                  className="p-2 rounded-lg text-white/45 hover:text-white hover:bg-white/[0.05]"
                  aria-label="Sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
                <Link href="/" className="md:hidden flex items-center gap-2 shrink-0" aria-label="BudAI">
                  <BudAILogo size="xs" animated />
                  <span className="text-[13px] font-semibold">
                    Bud<span className="text-accent-cyan">AI</span>
                  </span>
                </Link>
                <div className="min-w-0 hidden sm:block">
                  {renamingId && renamingId === convoId ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (convoId) void commitRename(convoId);
                      }}
                    >
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={() => convoId && void commitRename(convoId)}
                        className="text-[13px] font-medium bg-transparent border-b border-white/20 text-white max-w-[240px] focus:outline-none"
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="text-[13px] font-medium text-white/90 truncate max-w-[40vw] text-left hover:text-white"
                      onClick={() => {
                        if (!convoId) return;
                        setRenamingId(convoId);
                        setRenameVal(threadTitle || "");
                      }}
                      title={lang === "sv" ? "Byt namn" : "Rename"}
                    >
                      {threadTitle || (lang === "sv" ? "Ny chatt" : "New chat")}
                    </button>
                  )}
                </div>
                {temporary && (
                  <span className="text-[10px] text-amber-200/80 border border-amber-400/20 px-1.5 py-0.5 rounded-md">
                    {lang === "sv" ? "tillfällig" : "temp"}
                  </span>
                )}
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-white/30"
                  title={online ? "Online · Preview" : lang === "sv" ? "Offline" : "Offline"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-accent-green" : "bg-amber-400"}`} />
                  Preview
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {busy ? (
                  <button
                    type="button"
                    onClick={stopAll}
                    className="p-2 rounded-lg text-red-300 hover:bg-red-500/10"
                    title="Stop"
                  >
                    <StopCircle className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void newChat()}
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05]"
                    title={lang === "sv" ? "Ny chatt" : "New chat"}
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={exportThread}
                  disabled={!messages.length}
                  className="hidden sm:inline-flex p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] disabled:opacity-30"
                  title={lang === "sv" ? "Exportera (.md)" : "Export (.md)"}
                >
                  <Download className="w-4 h-4" />
                </button>
                <Link
                  href="/waitlist"
                  className="hidden sm:inline-flex items-center h-8 px-2.5 text-[11px] text-white/40 hover:text-white"
                >
                  {lang === "sv" ? "Väntelista" : "Waitlist"}
                  <span className="ml-1 text-accent-cyan/80">10%</span>
                </Link>
                {auth.isMember ? (
                  <div className="relative" data-popover="account">
                    <button
                      type="button"
                      onClick={() => setAccountOpen((v) => !v)}
                      className="flex items-center gap-1.5 h-8 px-2 rounded-full text-white/55 hover:text-white hover:bg-white/[0.05]"
                      aria-expanded={accountOpen}
                      aria-label="Account"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-0 top-10 w-56 rounded-xl border border-white/10 bg-[#121218] shadow-xl p-1.5 z-30"
                        >
                          <div className="px-2.5 py-2 text-[11px] text-white/45 truncate">
                            {auth.displayName}
                          </div>
                          <Link
                            href="/waitlist"
                            onClick={() => setAccountOpen(false)}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] text-white/70 hover:text-white hover:bg-white/[0.05]"
                          >
                            {lang === "sv" ? "Väntelista" : "Waitlist"}
                            <span className="text-accent-cyan/90 text-[10px]">10%</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setAccountOpen(false);
                              void auth.signOut();
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-white/70 hover:text-white hover:bg-white/[0.05]"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            {lang === "sv" ? "Logga ut" : "Sign out"}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => auth.openAuth()}
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-white text-zinc-950 text-[11px] font-semibold"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === "sv" ? "Logga in" : "Sign in"}</span>
                  </button>
                )}
              </div>
            </div>

            {auth.isGuest && guestBanner && isEmpty && (
              <div className="shrink-0 px-3 py-2 border-b border-white/[0.05] bg-white/[0.02] flex items-center gap-2 text-[12px] text-white/50">
                <Shield className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                <span className="flex-1 min-w-0 truncate">
                  {lang === "sv"
                    ? "Gästläge — logga in för minne, historik och bilder."
                    : "Guest mode — sign in for memory, history, and images."}
                </span>
                <button
                  type="button"
                  onClick={() => auth.openAuth()}
                  className="text-white/80 hover:text-white font-medium shrink-0"
                >
                  {lang === "sv" ? "Logga in" : "Sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => setGuestBanner(false)}
                  className="p-1 text-white/30 hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div
              ref={scrollRef}
              onScroll={updateStick}
              className="flex-1 overflow-y-auto min-h-0"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {isEmpty ? (
                <EmptyState
                  lang={lang}
                  onPrompt={(p) => void runPrompt(p)}
                  onVoice={toggleMic}
                  resume={
                    history[0] && history[0].id !== convoId
                      ? {
                          title: history[0].title,
                          onOpen: () => void loadConvo(history[0].id),
                        }
                      : null
                  }
                />
              ) : (
                <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 space-y-7">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      data-pg-msg={msg.role === "assistant" ? "assistant" : "user"}
                      className={`group flex gap-3 pg-msg-enter ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-accent-cyan/85 to-violet-500/80 p-[3px]">
                          <BudAILogo size="xs" animated className="!w-full !h-full" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full shrink-0 hidden sm:flex items-center justify-center mt-0.5 bg-white/[0.08]">
                          <User className="w-3.5 h-3.5 text-white/55" />
                        </div>
                      )}
                      <div className={`min-w-0 flex-1 max-w-[min(100%,620px)] ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                        {msg.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setLightbox(msg.imageUrl!)}
                            className="block overflow-hidden rounded-xl border border-white/10 max-w-[min(100%,280px)] mb-2"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={msg.imageUrl} alt="" className="w-full h-auto" />
                          </button>
                        )}

                        {dualPick[msg.id] && dualPick[msg.id]!.length >= 2 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                            {dualPick[msg.id]!.map((opt, oi) => (
                              <button
                                key={oi}
                                type="button"
                                onClick={() => {
                                  setMessages((p) =>
                                    p.map((m) => (m.id === msg.id ? { ...m, content: opt.body } : m))
                                  );
                                  setDualPick((d) => {
                                    const n = { ...d };
                                    delete n[msg.id];
                                    return n;
                                  });
                                  if (isWorkspaceWorthy(opt.body)) {
                                    setWorkspace({
                                      msgId: msg.id,
                                      title: workspaceTitle(opt.body, lang),
                                      body: opt.body,
                                    });
                                  }
                                }}
                                className="text-left p-3.5 rounded-2xl border border-white/[0.1] bg-white/[0.03] hover:border-white/20 transition-colors"
                              >
                                <div className="text-xs font-semibold text-accent-cyan mb-1">
                                  {opt.title}
                                </div>
                                <div className="text-[13px] text-white/75 line-clamp-6">
                                  {renderMarkdown(opt.body)}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div
                            className={`${
                              msg.role === "user"
                                ? "pg-user-bubble px-4 py-2.5 text-[15px] leading-[1.65] text-white whitespace-pre-wrap"
                                : msg.error
                                  ? "bg-red-500/10 border border-red-400/20 px-3.5 py-2.5 rounded-2xl text-red-100 whitespace-pre-wrap text-[15px]"
                                  : "pg-prose"
                            }`}
                          >
                            {msg.error && (
                              <AlertCircle className="w-3.5 h-3.5 inline mr-1.5 mb-0.5 text-red-300" />
                            )}
                            {msg.role === "user" ? msg.content : renderMarkdown(msg.content)}
                          </div>
                        )}

                        {msg.role === "user" && (
                          <div className="mt-1 flex items-center gap-0.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white/25 px-1.5">{formatMsgTime(msg.ts, lang)}</span>
                            <IconBtn
                              onClick={() => beginEdit(msg)}
                              label={lang === "sv" ? "Redigera" : "Edit"}
                              icon={Pencil}
                            />
                            <IconBtn
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(msg.content);
                                  setCopiedId(msg.id);
                                  window.setTimeout(() => setCopiedId(null), 1400);
                                } catch {
                                  showToast("err", "Copy failed");
                                }
                              }}
                              label={
                                copiedId === msg.id
                                  ? lang === "sv"
                                    ? "Kopierat"
                                    : "Copied"
                                  : lang === "sv"
                                    ? "Kopiera"
                                    : "Copy"
                              }
                              icon={copiedId === msg.id ? Check : Copy}
                            />
                          </div>
                        )}

                        {msg.error && lastFailed && (
                          <button
                            type="button"
                            onClick={() => {
                              const f = lastFailed;
                              setLastFailed(null);
                              setMessages((p) => p.filter((m) => m.id !== msg.id));
                              if (f.gen) void runImageGen(f.text);
                              else void runPrompt(f.text, { image: f.image });
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-accent-cyan hover:text-white"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {lang === "sv" ? "Försök igen" : "Retry"}
                          </button>
                        )}

                        {msg.role === "assistant" && !msg.error && !dualPick[msg.id] && (
                          <div className="mt-1.5 flex flex-wrap gap-0.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {isWorkspaceWorthy(msg.content) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setWorkspace({
                                    msgId: msg.id,
                                    title: workspaceTitle(msg.content, lang),
                                    body: msg.content,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white px-1.5 py-1"
                              >
                                <PanelRight className="w-3 h-3" />
                                Workspace
                              </button>
                            )}
                            <IconBtn
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(msg.content);
                                  setCopiedId(msg.id);
                                  window.setTimeout(() => setCopiedId(null), 1400);
                                } catch {
                                  showToast("err", "Copy failed");
                                }
                              }}
                              label={
                                copiedId === msg.id
                                  ? lang === "sv"
                                    ? "Kopierat"
                                    : "Copied"
                                  : lang === "sv"
                                    ? "Kopiera"
                                    : "Copy"
                              }
                              icon={copiedId === msg.id ? Check : Copy}
                            />
                            <IconBtn
                              onClick={() => {
                                const userText = findPreviousUserText(messages, msg.id);
                                if (!userText) return;
                                setMessages((p) => p.filter((m) => m.id !== msg.id));
                                void runPrompt(userText);
                              }}
                              label={lang === "sv" ? "Generera om" : "Regenerate"}
                              icon={RefreshCw}
                            />
                            <IconBtn
                              onClick={() => {
                                void runPrompt(
                                  lang === "sv"
                                    ? "Fortsätt på det senaste svaret — gå djupare och gör det mer konkret."
                                    : "Continue from your last answer — go deeper and make it more concrete."
                                );
                              }}
                              label={lang === "sv" ? "Fortsätt" : "Continue"}
                              icon={Sparkles}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFeedback((f) => ({ ...f, [msg.id]: "up" }));
                                showToast("ok", lang === "sv" ? "Tack" : "Thanks");
                              }}
                              className={`p-1.5 ${feedback[msg.id] === "up" ? "text-accent-green" : "text-white/35 hover:text-white"}`}
                              aria-label="Good"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFeedback((f) => ({ ...f, [msg.id]: "down" }));
                                showToast("ok", lang === "sv" ? "Tack" : "Thanks");
                              }}
                              className={`p-1.5 ${feedback[msg.id] === "down" ? "text-red-300" : "text-white/35 hover:text-white"}`}
                              aria-label="Bad"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] text-white/25 px-1.5 self-center">
                              {formatMsgTime(msg.ts, lang)}
                            </span>
                          </div>
                        )}

                        {msg.id === lastAssistant?.id && !busy && followUps.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {followUps.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => void runPrompt(f.prompt)}
                                className="pg-suggest-chip px-2.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[12px] text-white/60 hover:text-white"
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {msg.generated && msg.imageUrl && (
                          <div className="mt-2 flex gap-2">
                            <a
                              href={msg.imageUrl}
                              download="budai-image.png"
                              className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white"
                            >
                              <Download className="w-3 h-3" /> Download
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                void runImageGen(
                                  lang === "sv"
                                    ? `Variation av: ${messages.find((m) => m.role === "user" && m.ts <= msg.ts)?.content || "bilden"}`
                                    : `Variation of: ${messages.find((m) => m.role === "user" && m.ts <= msg.ts)?.content || "the image"}`
                                )
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white"
                            >
                              <RotateCcw className="w-3 h-3" />
                              {lang === "sv" ? "Variation" : "Variation"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {(typingText || (busy && activity !== "typing")) && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-cyan/85 to-violet-500/80 p-[3px] shrink-0">
                        <BudAILogo size="xs" animated className="!w-full !h-full" />
                      </div>
                      <div className="min-w-0 flex-1 max-w-[640px]">
                        {typingText ? (
                          <div className="pg-prose">
                            {renderMarkdown(typingText)}
                            <span className="inline-block w-1.5 h-4 bg-accent-cyan/80 ml-0.5 align-middle animate-pulse" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-[13px] text-white/50 pt-1">
                            <span className="pg-think" aria-hidden>
                              <span />
                              <span />
                              <span />
                            </span>
                            <span className="pg-think-label">{activityLabel(activity, lang)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative shrink-0 px-3 sm:px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
              <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-background to-transparent" />
              {!stickToBottom && messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStickToBottom(true);
                    const el = scrollRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                  }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 h-8 w-8 rounded-full border border-white/12 bg-[#121218] text-white/70 hover:text-white shadow-lg flex items-center justify-center"
                  aria-label={lang === "sv" ? "Scrolla ner" : "Scroll to bottom"}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
              <div className="max-w-[720px] mx-auto">
                {attach && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attach.preview}
                        alt={attach.name}
                        className="h-14 w-14 object-cover rounded-xl border border-white/15"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (attach.preview.startsWith("blob:")) URL.revokeObjectURL(attach.preview);
                          setAttach(null);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[11px] text-white/40">
                      <div className="text-white/80 truncate max-w-[160px]">{attach.name}</div>
                      <div>{(attach.size / 1024).toFixed(0)} KB</div>
                    </div>
                  </div>
                )}
                {genMode && imageGenEnabled && (
                  <div className="mb-2 text-[11px] text-violet-300 flex items-center gap-1.5 px-1">
                    <Wand2 className="w-3.5 h-3.5" />
                    {lang === "sv" ? "Bildgenerering" : "Image generation"}
                  </div>
                )}
                {listening && (
                  <div className="mb-2 text-[11px] text-accent-green flex items-center gap-1.5 px-1">
                    <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                    {lang === "sv" ? "Lyssnar…" : "Listening…"}
                  </div>
                )}
                {editingId && (
                  <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-accent-cyan">
                    <span>{lang === "sv" ? "Redigerar meddelande — skicka för att köra om" : "Editing message — send to rerun"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        resetComposer();
                      }}
                      className="text-white/40 hover:text-white"
                    >
                      {lang === "sv" ? "Avbryt" : "Cancel"}
                    </button>
                  </div>
                )}
                {quote && (
                  <div className="mb-2 flex items-start gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[12px] text-white/65">
                    <span className="flex-1 min-w-0 line-clamp-3 leading-relaxed">
                      <span className="text-white/35 mr-1">{lang === "sv" ? "Citat" : "Quote"}</span>
                      «{quote}»
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuote(null)}
                      className="p-0.5 text-white/35 hover:text-white shrink-0"
                      aria-label={lang === "sv" ? "Ta bort citat" : "Remove quote"}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {slashOpen && slashItems.length > 0 && (
                  <div className="mb-2 rounded-xl border border-white/[0.1] bg-[#121218] overflow-hidden">
                    {slashItems.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          setIntentId(it.id);
                          setMode(it.id === "dual" ? "dual" : "single");
                          setInput("");
                          taRef.current?.focus();
                        }}
                        className="w-full text-left px-3 py-2 text-[12px] text-white/70 hover:text-white hover:bg-white/[0.05] flex items-center justify-between gap-2"
                      >
                        <span>
                          <span className="font-mono text-accent-cyan/80">/{it.id}</span>
                          <span className="ml-2">{it.label}</span>
                        </span>
                        <span className="text-[10px] text-white/30">{it.hint}</span>
                      </button>
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {toolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-2 flex flex-wrap gap-1.5 p-2 rounded-2xl border border-white/[0.07] bg-[#0c0c12]"
                    >
                      <ToolChip
                        onClick={() => {
                          fileRef.current?.click();
                          setToolsOpen(false);
                        }}
                        icon={ImagePlus}
                        label={lang === "sv" ? "Bild" : "Image"}
                      />
                      <ToolChip
                        onClick={toggleMic}
                        icon={listening ? MicOff : Mic}
                        label={lang === "sv" ? "Röst" : "Voice"}
                        active={listening}
                      />
                      {imageGenEnabled ? (
                        <ToolChip
                          onClick={() => {
                            setGenMode((g) => !g);
                            setToolsOpen(false);
                          }}
                          icon={Wand2}
                          label={lang === "sv" ? "Skapa bild" : "Create image"}
                          active={genMode}
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-white/30 border border-white/[0.05]">
                          <Wand2 className="w-3.5 h-3.5 opacity-40" />
                          {lang === "sv" ? "Bildgen · snart" : "Image gen · soon"}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={onSubmit}
                  className={`pg-composer relative rounded-[28px] border bg-[#121218] ${
                    dragOver
                      ? "border-accent-cyan/40 ring-2 ring-accent-cyan/15"
                      : editingId
                        ? "border-accent-cyan/28"
                        : "border-white/[0.1]"
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) void ingestImageFile(f);
                  }}
                >
                  {dragOver && (
                    <div className="absolute inset-0 z-10 rounded-[22px] bg-[#0c1418]/90 border border-accent-cyan/30 flex items-center justify-center text-sm text-accent-cyan pointer-events-none">
                      {lang === "sv" ? "Släpp bilden här" : "Drop image here"}
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void onFile(e)}
                  />
                  <textarea
                    ref={taRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      autoResize();
                    }}
                    onPaste={(e) => {
                      const item = Array.from(e.clipboardData.items).find((i) =>
                        i.type.startsWith("image/")
                      );
                      const f = item?.getAsFile();
                      if (!f) return;
                      e.preventDefault();
                      void ingestImageFile(f);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" && !e.shiftKey && !input && !busy) {
                        const lastUser = [...messages].reverse().find((m) => m.role === "user");
                        if (lastUser) {
                          e.preventDefault();
                          beginEdit(lastUser);
                        }
                        return;
                      }
                      if (e.key === "Enter" && !e.shiftKey && slashOpen) {
                        e.preventDefault();
                        const it = slashItems[0];
                        if (it) {
                          setIntentId(it.id);
                          setMode(it.id === "dual" ? "dual" : "single");
                          setInput("");
                        }
                        return;
                      }
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if ((input.trim() || attach) && !busy) {
                          if (genMode && imageGenEnabled) void runImageGen(input);
                          else
                            void runPrompt(
                              input ||
                                (attach
                                  ? lang === "sv"
                                    ? "Vad ser du?"
                                    : "What do you see?"
                                  : "")
                            );
                        }
                      }
                    }}
                    rows={1}
                    placeholder={
                      editingId
                        ? lang === "sv"
                          ? "Redigera och skicka…"
                          : "Edit and send…"
                        : genMode
                          ? lang === "sv"
                            ? "Beskriv bilden…"
                            : "Describe the image…"
                          : COMPOSER_PH[lang][phIdx % COMPOSER_PH[lang].length]
                    }
                    disabled={busy}
                    className="w-full bg-transparent px-4 pt-3.5 pb-2 text-[16px] text-white placeholder:text-white/32 focus:outline-none resize-none min-h-[48px] max-h-[180px]"
                  />
                  <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => setToolsOpen((v) => !v)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          toolsOpen
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                        }`}
                        aria-label={lang === "sv" ? "Verktyg" : "Tools"}
                      >
                        <Plus className={`w-4 h-4 transition-transform ${toolsOpen ? "rotate-45" : ""}`} />
                      </button>
                      <div className="relative" data-popover="mode">
                        <button
                          type="button"
                          onClick={() => setModeOpen((v) => !v)}
                          className="h-8 px-2 rounded-full text-[11px] text-white/45 hover:text-white inline-flex items-center gap-1"
                        >
                          {currentIntent.label}
                          {mode === "concise" ? " · Short" : ""}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <AnimatePresence>
                          {modeOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute bottom-10 left-0 w-44 rounded-xl border border-white/10 bg-[#121218] shadow-xl p-1 z-20"
                            >
                              {intents.map((it) => (
                                <button
                                  key={it.id}
                                  type="button"
                                  onClick={() => {
                                    setIntentId(it.id);
                                    setMode(it.id === "dual" ? "dual" : "single");
                                    setModeOpen(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] ${
                                    intentId === it.id
                                      ? "bg-white/[0.07] text-white"
                                      : "text-white/60 hover:text-white"
                                  }`}
                                >
                                  <div className="font-medium">{it.label}</div>
                                  <div className="text-[10px] text-white/35">{it.hint}</div>
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setMode((m) => (m === "concise" ? "single" : "concise"));
                                  setModeOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] ${
                                  mode === "concise" ? "text-white" : "text-white/60"
                                }`}
                              >
                                {lang === "sv" ? "Korta svar" : "Concise replies"}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="hidden sm:flex p-0.5 rounded-full border border-white/[0.06]">
                        {(["en", "sv"] as const).map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setAnswerLang(code)}
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                              answerLang === code ? "bg-white text-zinc-950" : "text-white/35"
                            }`}
                          >
                            {code.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    {busy ? (
                      <button
                        type="button"
                        onClick={stopAll}
                        className="h-8 w-8 rounded-full border border-red-400/30 text-red-200 flex items-center justify-center"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={sendDisabled}
                        className="h-9 w-9 rounded-full bg-white text-zinc-950 flex items-center justify-center disabled:opacity-28 hover:bg-zinc-100 active:scale-95 transition-all"
                        aria-label="Send"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
                <p className="mt-2 text-center text-[10px] text-white/25">
                  {lang === "sv"
                    ? "Enter skickar · / läge · markera för citat · ⌘K"
                    : "Enter to send · / mode · select to quote · ⌘K"}
                </p>
              </div>
            </div>
          </div>

          {workspace && (
            <aside className="hidden lg:flex w-[min(40%,400px)] shrink-0 flex-col border-l border-white/[0.07] bg-[#0b0b0f] min-h-0">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">Workspace</div>
                  <div className="text-xs text-white/90 font-semibold truncate">{workspace.title}</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(workspace.body);
                      showToast("ok", lang === "sv" ? "Kopierat" : "Copied");
                    } catch {
                      /* */
                    }
                  }}
                  className="p-1.5 text-white/35 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([workspace.body], { type: "text/markdown;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `budai-workspace-${Date.now()}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="p-1.5 text-white/35 hover:text-white"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setWorkspace(null)} className="p-1.5 text-white/35 hover:text-white">
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-[13px] text-white/85 leading-relaxed">
                {renderMarkdown(workspace.body)}
              </div>
              <div className="shrink-0 p-2.5 border-t border-white/[0.06] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void runPrompt(
                      lang === "sv"
                        ? "Förbättra workspace-resultatet: gör det skarpare, mer strukturerat och mer handlingsbart."
                        : "Improve the workspace result: make it sharper, more structured, and more actionable."
                    );
                  }}
                  disabled={busy}
                  className="flex-1 text-[11px] font-medium py-2 rounded-xl border border-white/10 text-white/70 hover:text-white disabled:opacity-40"
                >
                  {lang === "sv" ? "Förbättra" : "Improve"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput(workspace.body.slice(0, 2000));
                    taRef.current?.focus();
                  }}
                  className="flex-1 text-[11px] font-medium py-2 rounded-xl border border-white/10 text-white/70 hover:text-white"
                >
                  {lang === "sv" ? "Redigera i chatt" : "Edit in chat"}
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>

      <AnimatePresence>
        {workspace && (
          <motion.div
            key="ws-m"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[91] lg:hidden flex flex-col justify-end"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/65"
              aria-label="Close"
              onClick={() => setWorkspace(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "40%" }}
              className="relative max-h-[85vh] rounded-t-3xl border border-white/[0.1] bg-[#0b0b0f] flex flex-col"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-white/35">Workspace</div>
                  <div className="text-sm font-semibold truncate">{workspace.title}</div>
                </div>
                <button type="button" onClick={() => setWorkspace(null)} className="p-2 text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-sm text-white/85">
                {renderMarkdown(workspace.body)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileDrawer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Close"
              onClick={() => setMobileDrawer(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute left-0 top-0 bottom-0 w-[min(300px,88vw)] bg-[#0b0b0f] border-r border-white/[0.08] flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold">BudAI</span>
                <button type="button" onClick={() => setMobileDrawer(false)} className="p-2 text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {SidebarBody}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {memoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[92] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/65"
              onClick={() => setMemoryOpen(false)}
              aria-label="Close"
            />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-white/[0.1] bg-[#0c0c12] p-5 max-h-[85vh] overflow-y-auto"
            >
              <button type="button" onClick={() => setMemoryOpen(false)} className="absolute top-3 right-3 p-1.5 text-white/40">
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-accent-cyan" />
                {lang === "sv" ? "Långtidsminne" : "Long-term memory"}
              </h3>
              <p className="text-xs text-white/40 mb-3 leading-relaxed">
                {lang === "sv"
                  ? "BudAI sparar automatiskt hållbara fakta. Du styr allt."
                  : "BudAI automatically keeps durable facts. You’re in control."}
              </p>
              <button
                type="button"
                onClick={() => {
                  const next = !memoryEnabled;
                  setMemoryEnabled(next);
                  void cloud.setMemoryEnabled(next);
                  saveSettings({ ...loadSettings(), memoryEnabled: next });
                }}
                className="mb-4 w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/[0.08] text-sm"
              >
                <span className="text-white/85 flex items-center gap-2">
                  {memoryEnabled ? <Eye className="w-4 h-4 text-accent-cyan" /> : <EyeOff className="w-4 h-4" />}
                  {lang === "sv" ? "Autominnes" : "Auto-memory"}
                </span>
                <span className={`font-mono text-xs ${memoryEnabled ? "text-accent-green" : "text-white/35"}`}>
                  {memoryEnabled ? "ON" : "OFF"}
                </span>
              </button>
              <div className="space-y-2 mb-3">
                {memory.length === 0 && (
                  <p className="text-sm text-white/35 text-center py-8">
                    {lang === "sv" ? "Inget sparat ännu." : "Nothing saved yet."}
                  </p>
                )}
                {memory.map((m) => (
                  <div key={m.id} className="rounded-xl border border-white/[0.06] px-3 py-2">
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
                          onChange={(e) => setEditMemText(e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1.5 rounded-lg bg-black/30 border border-white/10 text-sm"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="text-xs text-accent-cyan">
                            {lang === "sv" ? "Spara" : "Save"}
                          </button>
                          <button type="button" onClick={() => setEditingMem(null)} className="text-xs text-white/40">
                            {lang === "sv" ? "Avbryt" : "Cancel"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <span className="text-sm text-white/85 flex-1 leading-relaxed">{m.text}</span>
                        <button
                          type="button"
                          className="text-white/35 hover:text-white p-1"
                          onClick={() => {
                            setEditingMem(m.id);
                            setEditMemText(m.text);
                          }}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          className="text-white/35 hover:text-red-300 p-1"
                          onClick={() => void cloud.deleteMemory(m.id).then(() => reloadSidebar())}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {memory.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(lang === "sv" ? "Rensa allt minne?" : "Clear all memory?")) {
                      void cloud.clearMemories().then(() => reloadSidebar());
                    }
                  }}
                  className="text-[11px] text-white/35 hover:text-red-300"
                >
                  {lang === "sv" ? "Rensa allt minne" : "Clear all memory"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/85"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[96] px-4 py-2.5 rounded-xl border text-sm shadow-xl max-w-[90vw] ${
              toast.kind === "err"
                ? "border-red-400/30 bg-[#1a1014] text-red-100"
                : toast.kind === "warn"
                  ? "border-amber-400/30 bg-[#121018] text-amber-100"
                  : "border-white/15 bg-[#121218] text-white"
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
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[96] px-3 py-1.5 rounded-full border border-white/10 bg-[#121218] text-[11px] text-white/80 flex items-center gap-1.5"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-accent-cyan" />
            {lang === "sv" ? "Minne uppdaterat" : "Memory updated"}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowShortcuts(false)} />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c14] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">{lang === "sv" ? "Genvägar" : "Shortcuts"}</h3>
                <button type="button" onClick={() => setShowShortcuts(false)} className="p-1 text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 mb-4">
                {[
                  {
                    label: lang === "sv" ? "Ny chatt" : "New chat",
                    run: () => {
                      setShowShortcuts(false);
                      void newChat();
                    },
                  },
                  {
                    label: lang === "sv" ? "Väntelista · 10%" : "Waitlist · 10%",
                    run: () => {
                      window.location.href = "/waitlist";
                    },
                  },
                  ...(auth.isMember
                    ? [
                        {
                          label: lang === "sv" ? "Minne" : "Memory",
                          run: () => {
                            setShowShortcuts(false);
                            setMemoryOpen(true);
                          },
                        },
                      ]
                    : [
                        {
                          label: lang === "sv" ? "Logga in" : "Sign in",
                          run: () => {
                            setShowShortcuts(false);
                            auth.openAuth();
                          },
                        },
                      ]),
                  {
                    label: lang === "sv" ? "Exportera tråd" : "Export thread",
                    run: () => {
                      setShowShortcuts(false);
                      exportThread();
                    },
                  },
                ].map((cmd) => (
                  <button
                    key={cmd.label}
                    type="button"
                    onClick={cmd.run}
                    className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-white/75 hover:text-white hover:bg-white/[0.05]"
                  >
                    {cmd.label}
                  </button>
                ))}
              </div>
              <ul className="space-y-2 text-[12px]">
                {[
                  { keys: "⌘ K", desc: lang === "sv" ? "Kommandon" : "Commands" },
                  { keys: "⌘ N", desc: lang === "sv" ? "Ny chatt" : "New chat" },
                  { keys: "⌘ ⇧ C", desc: lang === "sv" ? "Kopiera senaste svar" : "Copy last reply" },
                  { keys: "⌘ E", desc: lang === "sv" ? "Exportera" : "Export" },
                  { keys: "↑", desc: lang === "sv" ? "Redigera senaste" : "Edit last" },
                  { keys: "/", desc: lang === "sv" ? "Läge" : "Mode" },
                  { keys: "⌘ B", desc: lang === "sv" ? "Sidofält" : "Sidebar" },
                  { keys: "Esc", desc: lang === "sv" ? "Stäng" : "Close" },
                ].map((row) => (
                  <li key={row.keys} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-white/50">{row.desc}</span>
                    <kbd className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10">
                      {row.keys}
                    </kbd>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookieConsent />
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  icon: Icon,
}: {
  onClick: () => void;
  label: string;
  icon: typeof Copy;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white px-1.5 py-1"
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

function ToolChip({
  onClick,
  icon: Icon,
  label,
  active,
}: {
  onClick: () => void;
  icon: typeof ImagePlus;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border ${
        active
          ? "border-accent-cyan/35 bg-accent-cyan/10 text-accent-cyan"
          : "text-white/80 border-white/[0.08] hover:border-white/16"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
