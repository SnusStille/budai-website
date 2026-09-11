"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  StopCircle,
  Maximize2,
  Minimize2,
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
  Shield,
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
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BudAILogo from "@/components/ui/BudAILogo";
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

/* ─── helpers ─────────────────────────────────────────── */

function renderMarkdown(text: string): ReactNode[] {
  const pattern = /(\*\*.+?\*\*|`.+?`)/g;
  return text.split(pattern).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={i}
          className="px-1 py-0.5 rounded bg-white/10 text-accent-cyan text-[0.9em] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    return <span key={i}>{part}</span>;
  });
}

function fileToBase64(file: File): Promise<{ b64: string; media: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = String(r.result || "");
      const m = res.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
      if (!m) reject(new Error("bad image"));
      else resolve({ b64: m[2], media: m[1] });
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function activityLabel(a: AiActivity, lang: "sv" | "en"): string {
  const map: Record<AiActivity, [string, string]> = {
    idle: ["", ""],
    thinking: ["Tänker…", "Thinking…"],
    reading_image: ["Läser bild…", "Reading image…"],
    analyzing: ["Analyserar…", "Analyzing…"],
    generating_image: ["Skapar bild…", "Creating image…"],
    remembering: ["Sparar minne…", "Saving memory…"],
    listening: ["Lyssnar…", "Listening…"],
    typing: ["Skriver…", "Writing…"],
    error: ["Fel", "Error"],
  };
  return lang === "sv" ? map[a][0] : map[a][1];
}

function groupByDate(
  items: Pick<Conversation, "id" | "title" | "updatedAt">[],
  lang: "sv" | "en"
) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYday = startToday - 86400000;
  const startWeek = startToday - 7 * 86400000;
  const buckets: { label: string; items: typeof items }[] = [
    { label: lang === "sv" ? "Idag" : "Today", items: [] },
    { label: lang === "sv" ? "Igår" : "Yesterday", items: [] },
    { label: lang === "sv" ? "Senaste 7 dagarna" : "Previous 7 days", items: [] },
    { label: lang === "sv" ? "Äldre" : "Older", items: [] },
  ];
  for (const c of items) {
    if (c.updatedAt >= startToday) buckets[0].items.push(c);
    else if (c.updatedAt >= startYday) buckets[1].items.push(c);
    else if (c.updatedAt >= startWeek) buckets[2].items.push(c);
    else buckets[3].items.push(c);
  }
  return buckets.filter((b) => b.items.length);
}

const CAPABILITY_CARDS = {
  sv: [
    {
      icon: "vision" as const,
      title: "Se en bild",
      prompt: "Analysera den här bilden och berätta vad du ser — detaljerat.",
      needsImage: true,
    },
    {
      icon: "gen" as const,
      title: "Skapa en bild",
      prompt: "Skapa en bild av en futuristisk stockholmsk skyline i skymning",
      gen: true,
    },
    {
      icon: "voice" as const,
      title: "Prata in",
      prompt: "",
      voice: true,
    },
    {
      icon: "memory" as const,
      title: "Kom ihåg mig",
      prompt: "Jag heter Alex och jobbar med produkt i Stockholm. Hjälp mig planera veckan.",
    },
    {
      icon: "create" as const,
      title: "Kreativt",
      prompt: "Skriv en kort, varm produktpitch för BudAI på svenska — tre meningar.",
    },
    {
      icon: "analyze" as const,
      title: "Analysera",
      prompt: "Ge mig en ärlig SWOT för att rulla ut AI-assistenter i ett svenskt SME.",
    },
  ],
  en: [
    {
      icon: "vision" as const,
      title: "See an image",
      prompt: "Analyze this image and tell me what you see — in detail.",
      needsImage: true,
    },
    {
      icon: "gen" as const,
      title: "Create an image",
      prompt: "Create an image of a futuristic Stockholm skyline at dusk",
      gen: true,
    },
    {
      icon: "voice" as const,
      title: "Speak",
      prompt: "",
      voice: true,
    },
    {
      icon: "memory" as const,
      title: "Remember me",
      prompt: "My name is Alex and I work in product in Stockholm. Help me plan the week.",
    },
    {
      icon: "create" as const,
      title: "Create",
      prompt: "Write a short, warm product pitch for BudAI in three sentences.",
    },
    {
      icon: "analyze" as const,
      title: "Analyze",
      prompt: "Give me an honest SWOT for rolling out AI assistants in a Swedish SME.",
    },
  ],
};

/* ─── component ───────────────────────────────────────── */

export default function AIPlayground() {
  const { t, lang } = useLang();
  const auth = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activity, setActivity] = useState<AiActivity>("idle");
  const [typingText, setTypingText] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [expanded, setExpanded] = useState(false);
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<{ stop: () => void } | null>(null);
  const persistTimer = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bootRef = useRef(false);

  const busy = activity !== "idle" && activity !== "error" && activity !== "listening";

  const showToast = useCallback((kind: "ok" | "warn" | "err", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  /* boot sidebar on desktop */
  useEffect(() => {
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  /* auth flash */
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
    // On login transition: clear guest draft into fresh state
    if (!bootRef.current) {
      bootRef.current = true;
      return;
    }
  }, [auth.ready, auth.isMember, reloadSidebar]);

  // When membership flips, reset active thread to avoid leaking guest into cloud id
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingText, activity]);

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

  /** Ensure we have a conversation id before first message (New Chat fix) */
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

  // Debounced persist after messages change
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
        await new Promise((r) => setTimeout(r, 4 + Math.random() * 6));
      }
    }
    setTypingText("");
    setActivity("idle");
    setMessages((prev) => [
      ...prev,
      {
        id: newId("m"),
        role: "assistant",
        content: fullText,
        ts: Date.now(),
        ...extra,
      },
    ]);
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

  const pushError = (text: string, retry?: { text: string; image?: AttachmentDraft | null; gen?: boolean }) => {
    setActivity("idle");
    setMessages((prev) => [
      ...prev,
      {
        id: newId("m"),
        role: "assistant",
        content: text,
        ts: Date.now(),
        error: true,
      },
    ]);
    if (retry) setLastFailed(retry);
  };

  const runPrompt = async (text: string, opts?: { image?: AttachmentDraft | null; forceGen?: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const wantGen = opts?.forceGen || genMode || looksLikeImageGen(trimmed);
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

    const userMsg: ChatMessage = {
      id: newId("m"),
      role: "user",
      content: trimmed,
      ts: Date.now(),
      imageUrl: img?.preview,
    };
    const nextList = [...messages, userMsg];
    setMessages(nextList);
    setInput("");
    setAttach(null);
    setLastFailed(null);
    abortRef.current = false;
    setActivity(img ? "reading_image" : "thinking");

    await bumpServer("messages");
    if (img) await bumpServer("images");

    // Build API history from nextList
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

      const res = await fetch("/api/playground", {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          messages: apiHistory,
          lang,
          dual: mode === "dual",
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
          {
            id: mid,
            role: "assistant",
            content: data.replies[0].body,
            ts: Date.now(),
          },
        ]);
      } else {
        await typeResponse(data.reply || "…");
      }
    } catch (e) {
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

  const runImageGen = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || busy) return;
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
    setInput("");
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
            ? "Bildgenerering är inte aktiverad här ännu (OPENAI_API_KEY saknas). Text-chatten fungerar."
            : "Image generation isn’t enabled here yet (OPENAI_API_KEY missing). Text chat still works."
        );
        return;
      }
      if (!res.ok) {
        pushError(
          data.error || (lang === "sv" ? "Kunde inte generera." : "Could not generate."),
          { text: trimmed, gen: true }
        );
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attach) return;
    if (genMode) void runImageGen(input || "image");
    else void runPrompt(input || (attach ? (lang === "sv" ? "Vad ser du?" : "What do you see?") : ""));
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
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
    } catch {
      showToast("err", lang === "sv" ? "Kunde inte läsa filen" : "Could not read file");
    }
  };

  const toggleMic = () => {
    const w = window as Window & {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: ((ev: { error?: string }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: ((ev: { error?: string }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
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

  const newChat = async (opts?: { temporary?: boolean }) => {
    if (creatingChat) return;
    setCreatingChat(true);
    stopAll();
    setAttach(null);
    setGenMode(false);
    setInput("");
    setDualPick({});
    setLastFailed(null);
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

  const loadConvo = async (id: string) => {
    stopAll();
    setDualPick({});
    setLastFailed(null);
    setTemporary(false);
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

  const commitRename = async (id: string) => {
    const title = renameVal.trim().slice(0, 80);
    setRenamingId(null);
    if (!title) return;
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

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter((c) => c.title.toLowerCase().includes(q));
  }, [history, search]);

  const grouped = useMemo(() => groupByDate(filteredHistory, lang), [filteredHistory, lang]);
  const caps = CAPABILITY_CARDS[lang];
  const isEmpty = messages.length === 0 && activity === "idle";
  const rem = auth.remaining.messages;
  const lim = auth.limits.messagesPerDay;

  const autoResize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  /* ─── sidebar content (desktop + mobile drawer) ─── */
  const SidebarBody = (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-white/[0.06] space-y-2">
        <button
          type="button"
          disabled={creatingChat}
          onClick={() => void newChat()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan/90 to-accent-purple/90 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {lang === "sv" ? "Ny chatt" : "New chat"}
        </button>
        {auth.isMember && (
          <button
            type="button"
            onClick={() => void newChat({ temporary: true })}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] text-muted hover:text-white border border-white/[0.06]"
            title={lang === "sv" ? "Ingen minnessparning" : "No memory saved"}
          >
            <Clock className="w-3 h-3" />
            {lang === "sv" ? "Tillfällig chatt" : "Temporary chat"}
          </button>
        )}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "sv" ? "Sök…" : "Search…"}
            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-white placeholder:text-muted/50 focus:outline-none focus:border-accent-cyan/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3 min-h-0">
        {grouped.length === 0 && (
          <p className="text-[11px] text-muted/50 px-2 py-4 leading-relaxed">
            {auth.isGuest
              ? lang === "sv"
                ? "Gästhistorik sparas tillfälligt på enheten."
                : "Guest history is temporary on this device."
              : lang === "sv"
                ? "Inga chattar ännu — starta en ny."
                : "No chats yet — start a new one."}
          </p>
        )}
        {grouped.map((g) => (
          <div key={g.label}>
            <div className="text-[10px] uppercase tracking-wider text-muted/50 px-2 mb-1">{g.label}</div>
            <div className="space-y-0.5">
              {g.items.map((c) => (
                <div
                  key={c.id}
                  className={`group flex gap-0.5 rounded-xl px-1.5 py-1.5 ${
                    convoId === c.id
                      ? "bg-accent-cyan/10 border border-accent-cyan/20"
                      : "hover:bg-white/[0.03] border border-transparent"
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
                        <div className="text-[12px] text-white/85 truncate">{c.title}</div>
                      </button>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-white"
                        onClick={() => {
                          setRenamingId(c.id);
                          setRenameVal(c.title);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-300"
                        onClick={() => void removeConvo(c.id)}
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
            className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-[11px] text-muted hover:text-white hover:bg-white/[0.04]"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-accent-purple" />
            {lang === "sv" ? "Minne" : "Memory"}
            <span className="ml-auto font-mono text-accent-purple">{memory.length}</span>
            {!memoryEnabled && <EyeOff className="w-3 h-3 text-muted" />}
          </button>
        )}
        <div className="px-2 py-1 text-[10px] text-muted/40 font-mono">
          {rem}/{lim} {lang === "sv" ? "msg idag" : "msg today"}
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="playground"
      className="relative section-hairline py-12 sm:py-20 md:py-24 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,720px)] h-[min(100vw,720px)] bg-accent-purple/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-6 sm:mb-8">
          <span className="section-badge text-accent-cyan mb-4">{t.playground.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {t.playground.title}{" "}
            <span className="text-gradient">{t.playground.titleHighlight}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">{t.playground.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div
            className={`rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.1] bg-[#05050a]/98 shadow-[0_0_80px_rgba(0,229,255,0.1)] flex ${
              expanded
                ? "fixed inset-0 sm:inset-3 z-[80] rounded-none sm:rounded-3xl"
                : "min-h-[min(78vh,720px)]"
            }`}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent z-20" />

            {/* Desktop sidebar */}
            <AnimatePresence initial={false}>
              {sidebarOpen && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:flex flex-col border-r border-white/[0.06] bg-[#08080f] shrink-0 overflow-hidden"
                  style={{ maxWidth: 240 }}
                >
                  {SidebarBody}
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Main column */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2 border-b border-white/[0.06] bg-[#080810]/90 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.innerWidth < 768) setMobileDrawer(true);
                      else setSidebarOpen((v) => !v);
                    }}
                    className="p-2 rounded-lg border border-white/[0.06] text-muted hover:text-white"
                    aria-label="Sidebar"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </button>
                  <BudAILogo size="xs" animated={false} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      BudAI
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
                          auth.isMember
                            ? "text-accent-cyan border-accent-cyan/25 bg-accent-cyan/10"
                            : "text-muted border-white/10"
                        }`}
                      >
                        {auth.isMember
                          ? lang === "sv"
                            ? "konto"
                            : "account"
                          : lang === "sv"
                            ? "gäst"
                            : "guest"}
                      </span>
                      {temporary && (
                        <span className="text-[10px] text-amber-200/90 border border-amber-400/25 px-1.5 py-0.5 rounded-md">
                          {lang === "sv" ? "tillfällig" : "temp"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {busy ? (
                    <button
                      type="button"
                      onClick={stopAll}
                      className="p-2 rounded-lg border border-red-500/25 text-red-300"
                      title="Stop"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void newChat()}
                      className="p-2 rounded-lg border border-white/[0.06] text-muted hover:text-white"
                      title={lang === "sv" ? "Ny chatt" : "New chat"}
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                    </button>
                  )}
                  {auth.isMember ? (
                    <button
                      type="button"
                      onClick={() => void auth.signOut()}
                      className="p-2 rounded-lg border border-white/[0.06] text-muted hover:text-white"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => auth.openAuth()}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent-cyan/15 border border-accent-cyan/25 text-accent-cyan text-[11px] font-semibold"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{lang === "sv" ? "Logga in" : "Sign in"}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="p-2 rounded-lg border border-white/[0.06] text-muted hover:text-white hidden sm:inline-flex"
                  >
                    {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mode strip */}
              <div className="flex flex-wrap items-center gap-1 px-2.5 sm:px-3 py-1.5 border-b border-white/[0.05] bg-black/20 shrink-0">
                {(["single", "dual", "concise"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                      mode === m
                        ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25"
                        : "text-muted border border-transparent hover:text-white"
                    }`}
                  >
                    {m === "concise"
                      ? lang === "sv"
                        ? "Kort"
                        : "Concise"
                      : m === "dual"
                        ? lang === "sv"
                          ? "Dubbel"
                          : "Dual"
                        : lang === "sv"
                          ? "Enkel"
                          : "Single"}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGenMode((g) => !g)}
                  className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                    genMode
                      ? "border-accent-purple/40 bg-accent-purple/15 text-accent-purple"
                      : "border-transparent text-muted hover:text-white"
                  }`}
                >
                  <Wand2 className="w-3 h-3" />
                  {lang === "sv" ? "Bild" : "Image"}
                </button>
              </div>

              {/* Messages / empty */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 min-h-0"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {isEmpty && (
                  <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] px-2">
                    <div className="mb-5">
                      <BudAILogo size="lg" animated />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 tracking-tight">
                      {lang === "sv" ? "Vad vill du göra?" : "What do you want to do?"}
                    </h3>
                    <p className="text-sm text-muted mb-6 text-center max-w-md leading-relaxed">
                      {lang === "sv"
                        ? "Multimodalt: text, bild, röst och minne — i en yta."
                        : "Multimodal: text, image, voice, and memory — one surface."}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
                      {caps.map((c) => (
                        <button
                          key={c.title}
                          type="button"
                          onClick={() => {
                            if (c.voice) {
                              toggleMic();
                              return;
                            }
                            if (c.needsImage) {
                              fileRef.current?.click();
                              setInput(c.prompt);
                              return;
                            }
                            if (c.gen) {
                              setGenMode(true);
                              setInput(c.prompt);
                              taRef.current?.focus();
                              return;
                            }
                            void runPrompt(c.prompt);
                          }}
                          className="text-left rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-accent-cyan/30 hover:bg-accent-cyan/[0.05] p-3 transition-colors group"
                        >
                          <div className="text-accent-cyan mb-1.5 opacity-80 group-hover:opacity-100">
                            {c.icon === "vision" && <Eye className="w-4 h-4" />}
                            {c.icon === "gen" && <Wand2 className="w-4 h-4" />}
                            {c.icon === "voice" && <Mic className="w-4 h-4" />}
                            {c.icon === "memory" && <BrainCircuit className="w-4 h-4" />}
                            {c.icon === "create" && <Sparkles className="w-4 h-4" />}
                            {c.icon === "analyze" && <Shield className="w-4 h-4" />}
                          </div>
                          <div className="text-[13px] font-medium text-white/90">{c.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-white/10"
                          : "bg-gradient-to-br from-accent-cyan/80 to-accent-purple/80 p-1.5"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-white/70" />
                      ) : (
                        <BudAILogo size="xs" animated={false} className="!w-full !h-full" />
                      )}
                    </div>
                    <div
                      className={`min-w-0 max-w-[min(100%,560px)] space-y-2 ${
                        msg.role === "user" ? "items-end" : ""
                      }`}
                    >
                      {msg.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setLightbox(msg.imageUrl!)}
                          className="block overflow-hidden rounded-xl border border-white/10 max-w-[min(100%,280px)] shadow-lg"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={msg.imageUrl} alt="" className="w-full h-auto" />
                        </button>
                      )}

                      {dualPick[msg.id] && dualPick[msg.id]!.length >= 2 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dualPick[msg.id]!.map((opt, oi) => (
                            <button
                              key={oi}
                              type="button"
                              onClick={() => {
                                setMessages((p) =>
                                  p.map((m) =>
                                    m.id === msg.id ? { ...m, content: opt.body } : m
                                  )
                                );
                                setDualPick((d) => {
                                  const n = { ...d };
                                  delete n[msg.id];
                                  return n;
                                });
                              }}
                              className="text-left p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-accent-cyan/35"
                            >
                              <div className="text-xs font-semibold text-accent-cyan mb-1">
                                {opt.title}
                              </div>
                              <div className="text-[13px] text-white/80 line-clamp-6">
                                {renderMarkdown(opt.body)}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-[13px] sm:text-sm whitespace-pre-wrap border leading-relaxed ${
                            msg.role === "user"
                              ? "bg-accent-cyan/10 border-accent-cyan/20 text-white"
                              : msg.error
                                ? "bg-red-500/10 border-red-400/25 text-red-100"
                                : "bg-white/[0.04] border-white/[0.07] text-white/90"
                          }`}
                        >
                          {msg.error && (
                            <AlertCircle className="w-3.5 h-3.5 inline mr-1.5 mb-0.5 text-red-300" />
                          )}
                          {renderMarkdown(msg.content)}
                        </div>
                      )}

                      {msg.error && lastFailed && (
                        <button
                          type="button"
                          onClick={() => {
                            const f = lastFailed;
                            setLastFailed(null);
                            // remove last error bubble
                            setMessages((p) => p.filter((m) => m.id !== msg.id));
                            if (f.gen) void runImageGen(f.text);
                            else void runPrompt(f.text, { image: f.image });
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] text-accent-cyan hover:text-white"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {lang === "sv" ? "Försök igen" : "Retry"}
                        </button>
                      )}

                      {msg.generated && msg.imageUrl && (
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={msg.imageUrl}
                            download="budai-image.png"
                            className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-white"
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
                            className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-white"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {lang === "sv" ? "Variation" : "Variation"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Live activity */}
                {(typingText || (busy && activity !== "typing")) && (
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-cyan/80 to-accent-purple/80 p-1.5">
                      <BudAILogo size="xs" animated className="!w-full !h-full" />
                    </div>
                    <div className="bg-white/[0.04] px-3.5 py-2.5 rounded-2xl border border-white/[0.07] text-sm text-white/90 min-w-[120px]">
                      {typingText ? (
                        <>
                          {renderMarkdown(typingText)}
                          <span className="inline-block w-1.5 h-4 bg-accent-cyan ml-0.5 animate-pulse align-middle" />
                        </>
                      ) : (
                        <span className="text-muted text-xs flex items-center gap-2">
                          <span className="flex gap-1">
                            {[0, 1, 2].map((d) => (
                              <span
                                key={d}
                                className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"
                                style={{ animationDelay: `${d * 0.12}s` }}
                              />
                            ))}
                          </span>
                          {activityLabel(activity, lang)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="shrink-0 border-t border-white/[0.06] bg-gradient-to-b from-[#0a0a12] to-[#07070c] p-2.5 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {attach && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attach.preview}
                        alt={attach.name}
                        className="h-16 w-16 object-cover rounded-xl border border-white/15"
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
                    <div className="text-[11px] text-muted">
                      <div className="text-white/80 truncate max-w-[160px]">{attach.name}</div>
                      <div>{(attach.size / 1024).toFixed(0)} KB · ready</div>
                      <button
                        type="button"
                        className="text-accent-cyan hover:underline"
                        onClick={() => fileRef.current?.click()}
                      >
                        {lang === "sv" ? "Byt" : "Replace"}
                      </button>
                    </div>
                  </div>
                )}

                {genMode && (
                  <div className="mb-2 text-[11px] text-accent-purple flex items-center gap-1.5 px-1">
                    <Wand2 className="w-3.5 h-3.5" />
                    {lang === "sv"
                      ? "Bildläge — beskriv vad som ska skapas"
                      : "Image mode — describe what to create"}
                  </div>
                )}
                {listening && (
                  <div className="mb-2 text-[11px] text-accent-green flex items-center gap-1.5 px-1">
                    <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                    {lang === "sv" ? "Lyssnar — prata nu" : "Listening — speak now"}
                  </div>
                )}

                <form onSubmit={onSubmit} className="flex gap-1.5 items-end">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void onFile(e)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="shrink-0 h-11 w-10 rounded-xl border border-white/[0.08] text-muted hover:text-accent-cyan flex items-center justify-center"
                    title="Attach image"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`shrink-0 h-11 w-10 rounded-xl border flex items-center justify-center ${
                      listening
                        ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                        : "border-white/[0.08] text-muted hover:text-white"
                    }`}
                    title="Voice"
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <textarea
                    ref={taRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      autoResize();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if ((input.trim() || attach) && !busy) {
                          if (genMode) void runImageGen(input);
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
                      genMode
                        ? lang === "sv"
                          ? "Beskriv bilden…"
                          : "Describe the image…"
                        : lang === "sv"
                          ? "Skriv till BudAI…"
                          : "Message BudAI…"
                    }
                    disabled={busy}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.09] text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-accent-cyan/40 resize-none min-h-[44px] max-h-[140px]"
                  />
                  {busy ? (
                    <button
                      type="button"
                      onClick={stopAll}
                      className="shrink-0 h-11 px-3.5 rounded-2xl border border-red-400/30 text-red-200"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={(!input.trim() && !attach) || busy}
                      className="shrink-0 h-11 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white disabled:opacity-40 flex items-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted/40 px-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {auth.isGuest
                      ? lang === "sv"
                        ? "Gästgräns"
                        : "Guest limits"
                      : lang === "sv"
                        ? "Kontoläge"
                        : "Account"}
                  </span>
                  {auth.displayName && (
                    <span className="truncate max-w-[140px]">{auth.displayName}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Mobile drawer */}
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
              aria-label="Close"
              onClick={() => setMobileDrawer(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute left-0 top-0 bottom-0 w-[min(300px,88vw)] bg-[#08080f] border-r border-white/[0.08] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold text-white">BudAI</span>
                <button type="button" onClick={() => setMobileDrawer(false)} className="p-2 text-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {SidebarBody}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory panel */}
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
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => setMemoryOpen(false)}
              aria-label="Close"
            />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-white/[0.1] bg-[#0a0a12] p-5 max-h-[85vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setMemoryOpen(false)}
                className="absolute top-3 right-3 p-1.5 text-muted"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-accent-purple" />
                {lang === "sv" ? "Långtidsminne" : "Long-term memory"}
              </h3>
              <p className="text-xs text-muted mb-3 leading-relaxed">
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
                className="mb-4 w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm"
              >
                <span className="text-white/85 flex items-center gap-2">
                  {memoryEnabled ? <Eye className="w-4 h-4 text-accent-cyan" /> : <EyeOff className="w-4 h-4" />}
                  {lang === "sv" ? "Autominnes" : "Auto-memory"}
                </span>
                <span className={`font-mono text-xs ${memoryEnabled ? "text-accent-green" : "text-muted"}`}>
                  {memoryEnabled ? "ON" : "OFF"}
                </span>
              </button>

              <div className="space-y-2 mb-3">
                {memory.length === 0 && (
                  <p className="text-sm text-muted/60 text-center py-8">
                    {lang === "sv" ? "Inget sparat ännu." : "Nothing saved yet."}
                  </p>
                )}
                {memory.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                  >
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
                          className="w-full px-2 py-1.5 rounded-lg bg-black/30 border border-white/10 text-sm text-white"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="text-xs text-accent-cyan">
                            {lang === "sv" ? "Spara" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMem(null)}
                            className="text-xs text-muted"
                          >
                            {lang === "sv" ? "Avbryt" : "Cancel"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <span className="text-sm text-white/85 flex-1 leading-relaxed">{m.text}</span>
                        <button
                          type="button"
                          className="text-muted hover:text-white p-1"
                          onClick={() => {
                            setEditingMem(m.id);
                            setEditMemText(m.text);
                          }}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:text-red-300 p-1"
                          onClick={() => void cloud.deleteMemory(m.id).then(() => reloadSidebar())}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="text-[10px] text-muted/50 mt-1 font-mono">
                      {m.source} · {new Date(m.createdAt).toLocaleDateString()}
                    </div>
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
                  className="text-[11px] text-muted hover:text-red-300"
                >
                  {lang === "sv" ? "Rensa allt minne" : "Clear all memory"}
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
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/85"
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

      {/* Toasts */}
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
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[96] px-3 py-1.5 rounded-full border border-accent-purple/30 bg-[#121018] text-[11px] text-purple-100 flex items-center gap-1.5 shadow-lg"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-accent-purple" />
            {lang === "sv" ? "Minne uppdaterat" : "Memory updated"}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
