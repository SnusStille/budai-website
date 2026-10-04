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
  Copy,
  ListTodo,
  Dices,
  PanelRightClose,
  PanelRight,
  FileDown,
  GripHorizontal,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Globe2,
  Command,
} from "lucide-react";
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

function renderInlineMd(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*.+?\*\*|`.+?`)/g;
  return text.split(pattern).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong
          key={`${keyPrefix}-b-${i}`}
          className="text-white font-semibold"
        >
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={`${keyPrefix}-c-${i}`}
          className="px-1 py-0.5 rounded bg-white/10 text-accent-cyan text-[0.9em] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
  });
}

function renderTextBlock(text: string, keyPrefix: string): ReactNode {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let listBuf: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuf || !listBuf.items.length) {
      listBuf = null;
      return;
    }
    const Tag = listBuf.ordered ? "ol" : "ul";
    const cls = listBuf.ordered
      ? "list-decimal pl-5 my-2 space-y-1 text-white/90"
      : "list-disc pl-5 my-2 space-y-1 text-white/90";
    nodes.push(
      <Tag key={`${keyPrefix}-list-${nodes.length}`} className={cls}>
        {listBuf.items.map((it, i) => (
          <li key={i} className="leading-relaxed">
            {renderInlineMd(it, `${keyPrefix}-li-${i}`)}
          </li>
        ))}
      </Tag>,
    );
    listBuf = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const bullet = raw.match(/^\s*[-*•]\s+(.+)$/);
    const numbered = raw.match(/^\s*(\d+)[.)]\s+(.+)$/);
    const heading = raw.match(/^#{1,3}\s+(.+)$/);
    const quote = raw.match(/^>\s?(.*)$/);

    if (bullet) {
      if (!listBuf || listBuf.ordered) {
        flushList();
        listBuf = { ordered: false, items: [] };
      }
      listBuf.items.push(bullet[1]);
      continue;
    }
    if (numbered) {
      if (!listBuf || !listBuf.ordered) {
        flushList();
        listBuf = { ordered: true, items: [] };
      }
      listBuf.items.push(numbered[2]);
      continue;
    }
    flushList();

    if (heading) {
      nodes.push(
        <div
          key={`${keyPrefix}-h-${i}`}
          className="font-semibold text-white mt-2 mb-1 tracking-tight"
        >
          {renderInlineMd(heading[1], `${keyPrefix}-h-${i}`)}
        </div>,
      );
      continue;
    }
    if (quote) {
      nodes.push(
        <div
          key={`${keyPrefix}-q-${i}`}
          className="border-l-2 border-accent-cyan/40 pl-3 my-1.5 text-muted italic"
        >
          {renderInlineMd(quote[1], `${keyPrefix}-q-${i}`)}
        </div>,
      );
      continue;
    }
    if (raw.trim() === "") {
      nodes.push(<div key={`${keyPrefix}-sp-${i}`} className="h-2" />);
      continue;
    }
    nodes.push(
      <div key={`${keyPrefix}-p-${i}`} className="leading-relaxed">
        {renderInlineMd(raw, `${keyPrefix}-p-${i}`)}
      </div>,
    );
  }
  flushList();
  return <div className="space-y-0.5">{nodes}</div>;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const { lang } = useLang();
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(timer);
  }, [state]);
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black/30">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-mono text-muted">
          {language || "code"}
        </span>
        <button
          type="button"
          className="text-xs text-muted hover:text-white p-1"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setState("copied");
            } catch {
              setState("error");
            }
          }}
        >
          {state === "copied"
            ? lang === "sv"
              ? "Kopierat ✓"
              : "Copied ✓"
            : state === "error"
              ? lang === "sv"
                ? "Markera och kopiera"
                : "Select and copy"
              : lang === "sv"
                ? "Kopiera kod"
                : "Copy code"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderMarkdown(text: string): ReactNode[] {
  // Splitting fences also renders an unfinished code block while streaming.
  return text.split("```").map((block, i) => {
    if (i % 2) {
      const nl = block.indexOf("\n");
      return (
        <CodeBlock
          key={i}
          language={nl >= 0 ? block.slice(0, nl).trim() : ""}
          code={nl >= 0 ? block.slice(nl + 1) : block}
        />
      );
    }
    return <div key={i}>{renderTextBlock(block, `b${i}`)}</div>;
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
  lang: "sv" | "en",
) {
  const now = new Date();
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startYday = startToday - 86400000;
  const startWeek = startToday - 7 * 86400000;
  const buckets: { label: string; items: typeof items }[] = [
    { label: lang === "sv" ? "Idag" : "Today", items: [] },
    { label: lang === "sv" ? "Igår" : "Yesterday", items: [] },
    {
      label: lang === "sv" ? "Senaste 7 dagarna" : "Previous 7 days",
      items: [],
    },
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

function isWorkspaceWorthy(content: string): boolean {
  if (!content || content.length < 280) return false;
  if (/```[\s\S]*?```/.test(content)) return true;
  const lines = content.split("\n").filter((l) => l.trim());
  const structured =
    lines.filter((l) => /^(\s*[-*•]|\s*\d+[.)]|#{1,3}\s)/.test(l)).length >= 4;
  return structured || content.length >= 520;
}

function workspaceTitle(content: string, lang: "sv" | "en"): string {
  const m = content.match(/^#{1,3}\s+(.+)$/m);
  if (m) return m[1].trim().slice(0, 64);
  const code = content.match(/```(\w+)?/);
  if (code)
    return lang === "sv"
      ? `Kod${code[1] ? ` · ${code[1]}` : ""}`
      : `Code${code[1] ? ` · ${code[1]}` : ""}`;
  const first = content.replace(/\s+/g, " ").trim().slice(0, 48);
  return first + (content.length > 48 ? "…" : "");
}

const INTENT_PRESETS = {
  sv: [
    {
      id: "chat",
      label: "Chatt",
      hint: "Vardaglig hjälp",
      prefix: "",
      mode: "single" as const,
    },
    {
      id: "research",
      label: "Research",
      hint: "Djupare + källor-stil",
      prefix:
        "Arbeta som research-assistent. Strukturera med: Sammanfattning, Nyckelpunkter, Antaganden, Nästa steg. Var konkret.\n\nFråga: ",
      mode: "single" as const,
    },
    {
      id: "create",
      label: "Skapa",
      hint: "Text & pitch",
      prefix:
        "Skriv i skarp, publicerbar ton. Ge en färdig leverans (inte meta-råd).\n\nUppgift: ",
      mode: "single" as const,
    },
    {
      id: "analyze",
      label: "Analys",
      hint: "Beslut & risk",
      prefix:
        "Analysera systematiskt. Använd rubriker, bullets och tydlig rekommendation.\n\nCase: ",
      mode: "single" as const,
    },
    {
      id: "dual",
      label: "2 vinklar",
      hint: "Välj mellan svar",
      prefix: "",
      mode: "dual" as const,
    },
  ],
  en: [
    {
      id: "chat",
      label: "Chat",
      hint: "Everyday help",
      prefix: "",
      mode: "single" as const,
    },
    {
      id: "research",
      label: "Research",
      hint: "Deeper structured",
      prefix:
        "Act as a research assistant. Structure with: Summary, Key points, Assumptions, Next steps. Be concrete.\n\nQuestion: ",
      mode: "single" as const,
    },
    {
      id: "create",
      label: "Create",
      hint: "Copy & drafts",
      prefix:
        "Write in a sharp, publishable voice. Deliver a finished piece (not meta-advice).\n\nTask: ",
      mode: "single" as const,
    },
    {
      id: "analyze",
      label: "Analyze",
      hint: "Decisions & risk",
      prefix:
        "Analyze systematically. Use headings, bullets, and a clear recommendation.\n\nCase: ",
      mode: "single" as const,
    },
    {
      id: "dual",
      label: "2 angles",
      hint: "Pick a reply",
      prefix: "",
      mode: "dual" as const,
    },
  ],
} as const;

const INSPIRE_PROMPTS = {
  sv: [
    "Skriv en skarp 5-punkts agenda för mitt första kundmöte om AI-assistenter — varm men proffsig.",
    "Jag drunknar i mejl. Ge mig ett 20-minuters system för att rensa inboxen utan att missa det viktiga.",
    "Omvandla den här idén till en one-pager: BudAI hjälper svenska SME att fatta snabbare beslut.",
    "Ge mig tre ärliga invändningar en CFO har mot AI-verktyg — och hur jag bemöter varje.",
    "Bygg en veckoplan: 3 deep-work-block, 2 möten, 1 review. Inkludera buffertar.",
    "Skriv ett kort, respektfullt nej-mejl till en förfrågan jag inte kan ta just nu.",
    "Förklara GDPR-minded AI för en icke-teknisk VD på 8 meningar.",
    "Jag ska pitcha BudAI på 60 sekunder. Manus + pauser + en stark avslutning.",
  ],
  en: [
    "Write a sharp 5-point agenda for my first client meeting about AI assistants — warm but professional.",
    "I'm drowning in email. Give me a 20-minute system to clear the inbox without missing what matters.",
    "Turn this idea into a one-pager: BudAI helps Swedish SMEs make faster decisions.",
    "Give me three honest CFO objections to AI tools — and how I answer each.",
    "Build a week plan: 3 deep-work blocks, 2 meetings, 1 review. Include buffers.",
    "Write a short, respectful no-email to a request I can't take right now.",
    "Explain GDPR-minded AI to a non-technical CEO in 8 sentences.",
    "I need a 60-second BudAI pitch. Script + pauses + a strong close.",
  ],
} as const;

/* ─── component ───────────────────────────────────────── */

export default function AIPlayground() {
  const { t, lang } = useLang();
  const auth = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activity, setActivity] = useState<AiActivity>("idle");
  const [typingText, setTypingText] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [intentId, setIntentId] = useState<string>("chat");
  const [feedback, setFeedback] = useState<
    Record<string, "up" | "down" | undefined>
  >({});
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [answerLang, setAnswerLang] = useState<"sv" | "en">(lang);
  const [inspireSpin, setInspireSpin] = useState(false);
  const [workspace, setWorkspace] = useState<{
    msgId: string;
    title: string;
    body: string;
  } | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [history, setHistory] = useState<
    Pick<
      Conversation,
      "id" | "title" | "updatedAt" | "createdAt" | "temporary" | "pinned"
    >[]
  >([]);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [attach, setAttach] = useState<AttachmentDraft | null>(null);
  const [listening, setListening] = useState(false);
  const [genMode, setGenMode] = useState(false);
  const [imageGenEnabled, setImageGenEnabled] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    kind: "ok" | "warn" | "err";
    text: string;
  } | null>(null);
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
  const followRef = useRef(true);
  const requestRef = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const sendingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<{ stop: () => void } | null>(null);
  const persistTimer = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bootRef = useRef(false);

  const busy =
    activity !== "idle" && activity !== "error" && activity !== "listening";

  const showToast = useCallback((kind: "ok" | "warn" | "err", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);
  useEffect(
    () => () => {
      requestRef.current?.abort();
      recogRef.current?.stop();
    },
    [],
  );

  /* Keep answer language aligned with site lang until user overrides */
  useEffect(() => {
    setAnswerLang(lang);
  }, [lang]);

  /* Feature flags — image gen only if server has OPENAI_API_KEY */
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
        })),
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
      requestId.current++;
      sendingRef.current = false;
      requestRef.current?.abort();
      setActivity("idle");
      setTypingText("");
      setMessages([]);
      setConvoId(null);
      setTemporary(false);
      void reloadSidebar();
    }
  }, [auth.isMember, reloadSidebar]);

  useEffect(() => {
    if (scrollRef.current && followRef.current) {
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
            : "Needs an account or higher limit.",
      );
      if (auth.isGuest)
        auth.openAuth(
          lang === "sv" ? "Lås upp mer BudAI" : "Unlock more BudAI",
        );
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
        body: JSON.stringify({
          kind,
          guest: auth.isGuest ? auth.guestKey : undefined,
        }),
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
      const id = await cloud.createConversation(
        lang === "sv" ? "Ny chatt" : "New chat",
      );
      if (!id) {
        showToast(
          "err",
          lang === "sv" ? "Kunde inte skapa chatt" : "Could not create chat",
        );
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
        })),
      );
      return convo.id;
    },
    [auth.isMember, temporary, reloadSidebar],
  );

  // Debounced persist after messages change
  useEffect(() => {
    if (!messages.length || !convoId) return;
    window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      void persistMessages(messages, convoId).catch(() =>
        showToast(
          "warn",
          lang === "sv"
            ? "Kunde inte spara chatten. Exportera den för att behålla en kopia."
            : "Could not save this chat. Export it to keep a copy.",
        ),
      );
    }, 600);
    return () => window.clearTimeout(persistTimer.current);
  }, [messages, convoId, persistMessages, showToast, lang]);

  const typeResponse = async (
    fullText: string,
    extra?: Partial<ChatMessage>,
  ) => {
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
    const mid = newId("m");
    setMessages((prev) => [
      ...prev,
      {
        id: mid,
        role: "assistant",
        content: fullText,
        ts: Date.now(),
        ...extra,
      },
    ]);
    return true;
  };

  const contextBlock = () => {
    if (!auth.isMember || !memoryEnabled || temporary || !memory.length)
      return "";
    return memoryToPromptBlock(memory, lang);
  };

  const stopAll = () => {
    abortRef.current = true;
    requestRef.current?.abort();
    sendingRef.current = false;
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
    retry?: { text: string; image?: AttachmentDraft | null; gen?: boolean },
  ) => {
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

  const runPrompt = async (
    text: string,
    opts?: {
      image?: AttachmentDraft | null;
      forceGen?: boolean;
      history?: ChatMessage[];
    },
  ) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const wantGen =
      imageGenEnabled &&
      (opts?.forceGen || genMode || looksLikeImageGen(trimmed));
    if (wantGen && !opts?.image) {
      setGenMode(false);
      return runImageGen(trimmed);
    }
    // If user asked to generate but feature off — honest message, no fake image
    if (!imageGenEnabled && !opts?.image && looksLikeImageGen(trimmed)) {
      // fall through as normal chat; model can explain limits
    }

    if (!checkQuota("messages")) return;

    const img = opts?.image !== undefined ? opts.image : attach;
    if (img && auth.isGuest) {
      auth.openAuth(
        lang === "sv"
          ? "Bildanalys kräver konto"
          : "Image analysis needs an account",
      );
      return;
    }
    if (img && !checkQuota("images")) return;

    if (sendingRef.current) return;
    sendingRef.current = true;
    const runId = ++requestId.current;
    let cid: string | null;
    try {
      cid = await ensureConversation();
    } catch {
      sendingRef.current = false;
      showToast(
        "err",
        lang === "sv"
          ? "Kunde inte öppna chatten. Försök igen."
          : "Could not open the conversation. Please try again.",
      );
      return;
    }
    if (runId !== requestId.current) return;
    if (!cid && auth.isMember) {
      sendingRef.current = false;
      return;
    }

    const userMsg: ChatMessage = {
      id: newId("m"),
      role: "user",
      content: trimmed,
      ts: Date.now(),
      imageUrl: img?.preview,
    };
    const nextList = [...(opts?.history ?? messages), userMsg];
    setMessages(nextList);
    setInput("");
    setAttach(null);
    setLastFailed(null);
    abortRef.current = false;
    setActivity(img ? "reading_image" : "thinking");

    auth.bumpUsage("messages");
    if (img) auth.bumpUsage("images");
    followRef.current = true;

    // Build API history from nextList
    const apiHistory = nextList
      .filter((m) => !m.error)
      .map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as
          "user" | "assistant",
        content: m.content,
      }));

    let streamed = "";
    let requestTimeout: number | undefined;
    try {
      const headers = await authHeaders();
      const controller = new AbortController();
      if (abortRef.current || runId !== requestId.current) return;
      requestRef.current = controller;
      requestTimeout = window.setTimeout(() => controller.abort(), 90_000);

      const intent =
        (INTENT_PRESETS[lang] || INTENT_PRESETS.en).find(
          (x) => x.id === intentId,
        ) || INTENT_PRESETS.en[0];
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
          stream: true,
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
      if (abortRef.current || runId !== requestId.current) return;
      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/x-ndjson") &&
        res.body
      ) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;
        setActivity("typing");
        try {
          while (true) {
            const chunk = await reader.read();
            if (runId !== requestId.current) return;
            if (chunk.done) break;
            buffer += decoder.decode(chunk.value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.trim()) continue;
              const event = JSON.parse(line);
              if (event.error) throw new Error(event.error);
              if (typeof event.text === "string") {
                streamed = event.text;
                setTypingText(streamed);
              }
              if (event.done) {
                done = true;
                if (event.memory) void reloadSidebar();
              }
            }
          }
          if (!done) throw new Error("Stream interrupted");
          if (runId !== requestId.current) return;
          setMessages((prev) => [
            ...prev,
            {
              id: newId("m"),
              role: "assistant",
              content: streamed || "…",
              ts: Date.now(),
            },
          ]);
          setTypingText("");
          setActivity("idle");
          return;
        } finally {
          reader.releaseLock();
        }
      }
      if (abortRef.current || runId !== requestId.current) return;

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
          lang === "sv"
            ? "Sessionen gick ut. Logga in igen."
            : "Session expired. Sign in again.",
          { text: trimmed, image: img },
        );
        auth.openAuth();
        return;
      }
      if (!res.ok) {
        pushError(
          data.error ||
            (lang === "sv"
              ? "Något gick fel. Försök igen."
              : "Something went wrong. Try again."),
          { text: trimmed, image: img },
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
      if (runId !== requestId.current) return;
      setTypingText("");
      if (streamed)
        setMessages((prev) => [
          ...prev,
          {
            id: newId("m"),
            role: "assistant",
            content: streamed,
            ts: Date.now(),
          },
        ]);
      if (abortRef.current) {
        setActivity("idle");
        return;
      }
      pushError(
        lang === "sv"
          ? "Svaret avbröts. Försök igen — din fråga finns kvar."
          : "The response was interrupted. Try again — your question is still here.",
        { text: trimmed, image: img },
      );
    } finally {
      window.clearTimeout(requestTimeout);
      if (runId === requestId.current) {
        requestRef.current = null;
        sendingRef.current = false;
      }
    }
  };

  const runImageGen = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || busy) return;
    if (!imageGenEnabled) {
      showToast(
        "warn",
        lang === "sv"
          ? "Bildgenerering kommer snart — bifoga en bild för analys i stället."
          : "Image generation coming soon — attach an image to analyze instead.",
      );
      setGenMode(false);
      return;
    }
    if (auth.isGuest) {
      auth.openAuth(
        lang === "sv"
          ? "Bildgenerering kräver konto"
          : "Image generation needs an account",
      );
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
            : "Image generation isn’t enabled here yet (OPENAI_API_KEY missing). Text chat still works.",
        );
        return;
      }
      if (!res.ok) {
        pushError(
          data.error ||
            (lang === "sv" ? "Kunde inte generera." : "Could not generate."),
          { text: trimmed, gen: true },
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
        pushError(
          lang === "sv" ? "Ingen bild returnerades." : "No image returned.",
          {
            text: trimmed,
            gen: true,
          },
        );
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
      pushError(lang === "sv" ? "Nätverksfel." : "Network error.", {
        text: trimmed,
        gen: true,
      });
    }
  };

  const exportThread = () => {
    if (!messages.length) {
      showToast(
        "err",
        lang === "sv" ? "Ingen tråd att exportera" : "No thread to export",
      );
      return;
    }
    const lines = messages.map((m) => {
      const who =
        m.role === "user" ? "You" : m.role === "assistant" ? "BudAI" : m.role;
      return `## ${who}\n${m.content}\n`;
    });
    const threadTitle =
      history.find((c) => c.id === convoId)?.title ||
      (lang === "sv" ? "Chatt" : "Chat");
    const md = `# BudAI · ${threadTitle}\n\n${lines.join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budai-${
      threadTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .slice(0, 40) || "chat"
    }.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      "ok",
      lang === "sv" ? "Tråd exporterad (.md)" : "Thread exported (.md)",
    );
  };

  const openWorkspace = (msgId: string, content: string) => {
    setWorkspace({
      msgId,
      title: workspaceTitle(content, lang),
      body: content,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable;
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (toolsOpen) {
          setToolsOpen(false);
          return;
        }
        if (workspace) {
          setWorkspace(null);
          return;
        }
        if (mobileDrawer) {
          setMobileDrawer(false);
          return;
        }
        if (expanded) {
          setExpanded(false);
          return;
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e" && !inField) {
        e.preventDefault();
        exportThread();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b" && !inField) {
        e.preventDefault();
        setWorkspace((w) => {
          if (w) return null;
          const last = [...messages]
            .reverse()
            .find((m) => m.role === "assistant" && m.content);
          if (!last) return null;
          return {
            msgId: last.id,
            title: workspaceTitle(last.content, lang),
            body: last.content,
          };
        });
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showShortcuts,
    toolsOpen,
    workspace,
    mobileDrawer,
    messages,
    lang,
    expanded,
  ]);

  const runInspire = () => {
    if (busy) return;
    const pool = INSPIRE_PROMPTS[answerLang] || INSPIRE_PROMPTS.en;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setInspireSpin(true);
    window.setTimeout(() => setInspireSpin(false), 600);
    setInput(pick);
    // Auto-send after a beat so it feels magical
    window.setTimeout(() => {
      void runPrompt(pick);
    }, 280);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attach) return;
    if (genMode && imageGenEnabled) void runImageGen(input || "image");
    else
      void runPrompt(
        input ||
          (attach ? (lang === "sv" ? "Vad ser du?" : "What do you see?") : ""),
      );
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      showToast(
        "warn",
        lang === "sv" ? "Endast bilder just nu" : "Images only for now",
      );
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      showToast("warn", "Max 4 MB");
      return;
    }
    if (auth.isGuest) {
      auth.openAuth(
        lang === "sv"
          ? "Bifoga bild med konto"
          : "Attach images with an account",
      );
      return;
    }
    try {
      const { b64, media } = await fileToBase64(f);
      if (attach?.preview?.startsWith("blob:"))
        URL.revokeObjectURL(attach.preview);
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
      showToast(
        "err",
        lang === "sv" ? "Kunde inte läsa filen" : "Could not read file",
      );
    }
  };

  const toggleMic = () => {
    const w = window as Window & {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult:
          | ((ev: {
              results: ArrayLike<ArrayLike<{ transcript: string }>>;
            }) => void)
          | null;
        onerror: ((ev: { error?: string }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult:
          | ((ev: {
              results: ArrayLike<ArrayLike<{ transcript: string }>>;
            }) => void)
          | null;
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
          : "Voice not supported in this browser (try Chrome).",
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
            lang === "sv"
              ? "Mikrofon nekad i webbläsaren."
              : "Microphone permission denied.",
          );
        } else if (err && err !== "aborted") {
          showToast(
            "warn",
            lang === "sv"
              ? "Röstfel — försök igen."
              : "Voice error — try again.",
          );
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
      showToast(
        "err",
        lang === "sv"
          ? "Kunde inte starta mikrofon."
          : "Could not start microphone.",
      );
    }
  };

  const newChat = async (opts?: { temporary?: boolean }) => {
    if (creatingChat) return;
    setCreatingChat(true);
    stopAll();
    requestId.current++;
    window.clearTimeout(persistTimer.current);
    if (messages.length && convoId)
      await persistMessages(messages, convoId).catch(() => {});
    setAttach(null);
    setGenMode(false);
    setInput("");
    setDualPick({});
    setLastFailed(null);
    setWorkspace(null);
    setToolsOpen(false);
    setFeedback({});
    setTemporary(!!opts?.temporary);

    try {
      if (auth.isMember && !opts?.temporary) {
        const id = await cloud.createConversation(
          lang === "sv" ? "Ny chatt" : "New chat",
        );
        if (!id) {
          showToast(
            "err",
            lang === "sv" ? "Kunde inte skapa chatt" : "Could not create chat",
          );
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
    requestId.current++;
    window.clearTimeout(persistTimer.current);
    if (messages.length && convoId)
      await persistMessages(messages, convoId).catch(() => {});
    setDualPick({});
    setLastFailed(null);
    setWorkspace(null);
    setTemporary(false);
    if (auth.isMember) {
      const c = await cloud.loadConversation(id);
      if (!c) {
        showToast(
          "err",
          lang === "sv" ? "Kunde inte ladda chatt" : "Could not load chat",
        );
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

  const grouped = useMemo(
    () => groupByDate(filteredHistory, lang),
    [filteredHistory, lang],
  );
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
            <div className="text-[10px] uppercase tracking-wider text-muted/50 px-2 mb-1">
              {g.label}
            </div>
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
                        <div className="text-[12px] text-white/85 truncate">
                          {c.title}
                        </div>
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
            <span className="ml-auto font-mono text-accent-purple">
              {memory.length}
            </span>
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

      <div className="site-width relative z-10">
        <div className="pg-section-head">
          <h2>
            <span>01 /</span> Playground <span>PREVIEW</span>
          </h2>
          <p>
            {lang === "sv"
              ? "En liten inblick. Riktig AI."
              : "A little preview. Real intelligence."}
          </p>
        </div>
        <div className={`pg-shell ${expanded ? "pg-expanded" : ""}`}>
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

          {/* Main column + optional Workspace */}
          <div className="flex-1 flex min-w-0 min-h-0">
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
                  <BudAILogo size="sm" animated />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      Bud<span className="text-accent-cyan">AI</span>
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
                      aria-label={
                        lang === "sv" ? "Stoppa svar" : "Stop response"
                      }
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
                  <button
                    type="button"
                    onClick={exportThread}
                    disabled={!messages.length}
                    className="p-2 rounded-lg border border-white/[0.06] text-muted hover:text-white disabled:opacity-30"
                    title={
                      lang === "sv"
                        ? "Exportera tråd (.md) · ⌘E"
                        : "Export thread (.md) · ⌘E"
                    }
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShortcuts(true)}
                    className="hidden sm:inline-flex p-2 rounded-lg border border-white/[0.06] text-muted hover:text-white"
                    title={lang === "sv" ? "Genvägar · ⌘/" : "Shortcuts · ⌘/"}
                  >
                    <Command className="w-4 h-4" />
                  </button>
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
                      <span className="hidden sm:inline">
                        {lang === "sv" ? "Logga in" : "Sign in"}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={
                      expanded ? "Exit fullscreen" : "Open fullscreen"
                    }
                    onClick={() => setExpanded((e) => !e)}
                    className="p-2 rounded-lg border border-white/[0.06] text-muted hover:text-white inline-flex"
                  >
                    {expanded ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {toolsOpen && (
                <>
                  {/* Intent + controls strip — ChatGPT/Claude/Perplexity-inspired, honest */}
                  <div className="pg-tools-strip flex flex-col gap-2 px-2.5 sm:px-3 py-2 border-b border-white/[0.06] bg-gradient-to-b from-black/35 to-black/15 shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(INTENT_PRESETS[lang] || INTENT_PRESETS.en).map((it) => (
                        <button
                          key={it.id}
                          type="button"
                          title={it.hint}
                          onClick={() => {
                            setIntentId(it.id);
                            setMode(
                              it.id === "dual"
                                ? "dual"
                                : mode === "concise"
                                  ? "concise"
                                  : "single",
                            );
                          }}
                          className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                            intentId === it.id
                              ? "bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border-accent-cyan/40 text-white shadow-[0_0_20px_rgba(0,229,255,0.12)]"
                              : "border-white/[0.08] text-muted hover:text-white hover:border-white/20 bg-white/[0.02]"
                          }`}
                        >
                          {it.label}
                        </button>
                      ))}
                      <div className="ml-auto flex items-center gap-1.5">
                        <div
                          className="flex p-0.5 rounded-full bg-black/50 border border-white/[0.08]"
                          role="group"
                          aria-label={
                            lang === "sv" ? "Svarspråk" : "Answer language"
                          }
                        >
                          {(["en", "sv"] as const).map((code) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => setAnswerLang(code)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                answerLang === code
                                  ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                                  : "text-muted/70 hover:text-white"
                              }`}
                            >
                              {code.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setMode((m) =>
                              m === "concise" ? "single" : "concise",
                            )
                          }
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium border ${
                            mode === "concise"
                              ? "border-accent-purple/40 text-accent-purple bg-accent-purple/10"
                              : "border-white/[0.06] text-muted hover:text-white"
                          }`}
                          title={
                            lang === "sv" ? "Korta svar" : "Concise replies"
                          }
                        >
                          {lang === "sv" ? "Kort" : "Short"}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted/50 px-0.5">
                      <Globe2 className="w-3 h-3" />
                      <span className="truncate">
                        {(INTENT_PRESETS[lang] || INTENT_PRESETS.en).find(
                          (x) => x.id === intentId,
                        )?.hint ||
                          (lang === "sv"
                            ? "Välj läge ovan"
                            : "Pick a mode above")}
                      </span>
                      <span className="ml-auto font-mono text-muted/40 hidden sm:inline">
                        {lang === "sv" ? "⌘/ för fokus" : "⌘/ for tips"}
                      </span>
                    </div>
                  </div>
                </>
              )}
              <span className="sr-only" role="status">
                {busy
                  ? activityLabel(activity, lang)
                  : lang === "sv"
                    ? "Redo"
                    : "Ready"}
              </span>
              {/* Messages / empty */}
              <div
                ref={scrollRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  followRef.current =
                    el.scrollHeight - el.scrollTop - el.clientHeight < 90;
                }}
                className="pg-scroll flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 min-h-0"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {isEmpty && (
                  <div className="pg-empty">
                    <BudAILogo size="lg" animated />
                    <h3>
                      {lang === "sv"
                        ? "Vad vill du få gjort?"
                        : "What’s on your mind?"}
                    </h3>
                    <p>
                      {lang === "sv"
                        ? "En idé, en fråga eller början på något bra."
                        : "An idea, a question, or the start of something good."}
                    </p>
                    <div className="pg-suggestions">
                      {(lang === "sv"
                        ? [
                            [
                              "Skriv ett mejl",
                              "Hitta rätt ord",
                              "Hjälp mig skriva ett tydligt och vänligt mejl. Fråga mig först om mottagare och syfte.",
                            ],
                            [
                              "Tänk tillsammans",
                              "Gör en idé tydligare",
                              "Hjälp mig tänka igenom en idé. Ställ tre bra frågor innan du ger förslag.",
                            ],
                            [
                              "Analysera en bild",
                              "Se det viktiga",
                              "Analysera den här bilden och sammanfatta de viktigaste detaljerna.",
                            ],
                            [
                              "Planera min vecka",
                              "Skapa plats för fokus",
                              "Hjälp mig planera en realistisk arbetsvecka. Fråga om mina prioriteringar och möten först.",
                            ],
                          ]
                        : [
                            [
                              "Draft an email",
                              "Find the right words",
                              "Help me write a clear, friendly email. First ask who it is for and what I want to say.",
                            ],
                            [
                              "Think it through",
                              "Bring clarity to an idea",
                              "Help me think through an idea. Ask three useful questions before suggesting a direction.",
                            ],
                            [
                              "Analyze an image",
                              "See the bigger picture",
                              "Analyze this image and summarize the most important details.",
                            ],
                            [
                              "Plan my week",
                              "Make room for focus",
                              "Help me build a realistic week plan. First ask about my priorities and meetings.",
                            ],
                          ]
                      ).map(([title, hint, prompt], i) => {
                        const Icon = [Pencil, Sparkles, Eye, ListTodo][i];
                        return (
                          <button
                            type="button"
                            key={title}
                            onClick={() => {
                              setInput(prompt);
                              if (i === 2) fileRef.current?.click();
                              else taRef.current?.focus();
                            }}
                          >
                            <Icon />
                            <span>
                              <strong>{title}</strong>
                              <small>{hint}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 pg-msg-enter ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-white/10"
                          : "bg-white/[0.03] p-1"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-white/70" />
                      ) : (
                        <BudAILogo
                          size="xs"
                          animated
                          className="!w-full !h-full"
                        />
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
                          <img
                            src={msg.imageUrl}
                            alt=""
                            className="w-full h-auto"
                          />
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
                                    m.id === msg.id
                                      ? { ...m, content: opt.body }
                                      : m,
                                  ),
                                );
                                setDualPick((d) => {
                                  const n = { ...d };
                                  delete n[msg.id];
                                  return n;
                                });
                                if (isWorkspaceWorthy(opt.body)) {
                                  openWorkspace(msg.id, opt.body);
                                }
                              }}
                              className="text-left p-3.5 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:border-accent-cyan/40 hover:shadow-[0_8px_32px_rgba(0,229,255,0.12)] transition-all"
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
                          className={`px-3.5 py-2.5 rounded-2xl text-[13px] sm:text-sm border leading-relaxed ${
                            msg.role === "user"
                              ? "bg-accent-cyan/10 border-accent-cyan/20 text-white whitespace-pre-wrap"
                              : msg.error
                                ? "bg-red-500/10 border-red-400/25 text-red-100 whitespace-pre-wrap"
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
                            setMessages((p) =>
                              p.filter((m) => m.id !== msg.id),
                            );
                            if (f.gen) void runImageGen(f.text);
                            else {
                              const lastUser = messages
                                .map((m) => m.role)
                                .lastIndexOf("user");
                              void runPrompt(f.text, {
                                image: f.image,
                                history: messages.slice(
                                  0,
                                  Math.max(0, lastUser),
                                ),
                              });
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] text-accent-cyan hover:text-white"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {lang === "sv" ? "Försök igen" : "Retry"}
                        </button>
                      )}

                      {msg.role === "assistant" &&
                        !msg.error &&
                        !dualPick[msg.id] && (
                          <div className="flex flex-wrap gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                            {isWorkspaceWorthy(msg.content) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openWorkspace(msg.id, msg.content)
                                }
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/15"
                              >
                                <PanelRight className="w-3 h-3" />
                                {lang === "sv" ? "Workspace" : "Workspace"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    msg.content,
                                  );
                                  showToast(
                                    "ok",
                                    lang === "sv" ? "Kopierat" : "Copied",
                                  );
                                } catch {
                                  showToast("err", "Copy failed");
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-white px-1.5 py-1"
                            >
                              <Copy className="w-3 h-3" />
                              {lang === "sv" ? "Kopiera" : "Copy"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const idx = messages.findIndex(
                                  (m) => m.id === msg.id,
                                );
                                for (let i = idx - 1; i >= 0; i--) {
                                  if (messages[i].role === "user") {
                                    if (messages[i].imageUrl) {
                                      showToast(
                                        "warn",
                                        lang === "sv"
                                          ? "Bifoga bilden igen för att göra en ny analys."
                                          : "Please attach the image again for a new analysis.",
                                      );
                                      return;
                                    }
                                    void runPrompt(messages[i].content, {
                                      history: messages.slice(0, i),
                                    });
                                    break;
                                  }
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-white px-1.5 py-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              {lang === "sv" ? "Generera om" : "Regenerate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const prompt =
                                  lang === "sv"
                                    ? "Fortsätt på det senaste svaret — gå djupare och gör det mer konkret."
                                    : "Continue from your last answer — go deeper and make it more concrete.";
                                void runPrompt(prompt);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-white px-1.5 py-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              {lang === "sv" ? "Fortsätt" : "Continue"}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    msg.content,
                                  );
                                  showToast(
                                    "ok",
                                    lang === "sv"
                                      ? "Svar kopierat — klistra in var du vill"
                                      : "Reply copied — paste anywhere",
                                  );
                                } catch {
                                  showToast("err", "Share failed");
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-white px-1.5 py-1"
                            >
                              <Share2 className="w-3 h-3" />
                              {lang === "sv" ? "Dela" : "Share"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFeedback((f) => ({ ...f, [msg.id]: "up" }));
                                showToast(
                                  "ok",
                                  lang === "sv"
                                    ? "Tack — sparat lokalt"
                                    : "Thanks — saved locally",
                                );
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-1 ${
                                feedback[msg.id] === "up"
                                  ? "text-accent-green"
                                  : "text-muted hover:text-white"
                              }`}
                              title="Good"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFeedback((f) => ({
                                  ...f,
                                  [msg.id]: "down",
                                }));
                                showToast(
                                  "ok",
                                  lang === "sv"
                                    ? "Tack — vi tar det vidare"
                                    : "Thanks — noted",
                                );
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-1 ${
                                feedback[msg.id] === "down"
                                  ? "text-red-300"
                                  : "text-muted hover:text-white"
                              }`}
                              title="Bad"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
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
                                  : `Variation of: ${messages.find((m) => m.role === "user" && m.ts <= msg.ts)?.content || "the image"}`,
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

                {/* Live activity — cinematic thinking */}
                {(typingText || (busy && activity !== "typing")) && (
                  <div className="flex gap-2.5">
                    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan/90 to-accent-purple/90 p-[2px] shrink-0 shadow-[0_0_24px_rgba(0,229,255,0.35)]">
                      <div className="w-full h-full rounded-[10px] bg-[#0a0a12] flex items-center justify-center overflow-hidden">
                        <BudAILogo
                          size="xs"
                          animated
                          className="!w-[22px] !h-[22px]"
                        />
                      </div>
                      {busy && !typingText && (
                        <span className="absolute -inset-1 rounded-xl border border-accent-cyan/30 logo-pulse-ring pointer-events-none" />
                      )}
                    </div>
                    <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-3.5 py-2.5 rounded-2xl border border-accent-cyan/20 text-sm text-white/90 min-w-[140px] max-w-[min(100%,520px)] overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.08)]">
                      <div className="absolute inset-0 pointer-events-none opacity-40">
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(0,229,255,0.12)_45%,transparent_70%)] playground-shimmer" />
                      </div>
                      {typingText ? (
                        <div className="relative whitespace-pre-wrap leading-relaxed">
                          {renderMarkdown(typingText)}
                          <span className="inline-block w-1.5 h-4 bg-accent-cyan ml-0.5 align-middle animate-pulse" />
                        </div>
                      ) : (
                        <div className="relative space-y-2">
                          <div className="flex items-center gap-2 text-[12px] text-accent-cyan font-medium">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-50" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
                            </span>
                            {activityLabel(activity, lang)}
                          </div>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((d) => (
                              <span
                                key={d}
                                className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden"
                              >
                                <span
                                  className="block h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                                  style={{
                                    width: "40%",
                                    animation: `playground-bar 1.1s ease-in-out ${d * 0.12}s infinite alternate`,
                                  }}
                                />
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted/70 font-mono">
                            {lang === "sv"
                              ? "BudAI · developed by stilledev"
                              : "BudAI · developed by stilledev"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="pg-composer shrink-0">
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
                          if (attach.preview.startsWith("blob:"))
                            URL.revokeObjectURL(attach.preview);
                          setAttach(null);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[11px] text-muted">
                      <div className="text-white/80 truncate max-w-[160px]">
                        {attach.name}
                      </div>
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

                {genMode && imageGenEnabled && (
                  <div className="mb-2 text-[11px] text-accent-purple flex items-center gap-1.5 px-1">
                    <Wand2 className="w-3.5 h-3.5" />
                    {lang === "sv"
                      ? "Bildgenerering — beskriv vad som ska skapas"
                      : "Image generation — describe what to create"}
                  </div>
                )}
                {listening && (
                  <div className="mb-2 text-[11px] text-accent-green flex items-center gap-1.5 px-1">
                    <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                    {lang === "sv"
                      ? "Lyssnar — prata nu"
                      : "Listening — speak now"}
                  </div>
                )}

                {toolsOpen && (
                  <div className="mb-2 flex flex-wrap gap-1.5 p-2 rounded-xl border border-white/[0.07] bg-black/30">
                    <button
                      type="button"
                      onClick={() => {
                        fileRef.current?.click();
                        setToolsOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-white/85 border border-white/[0.08] hover:border-accent-cyan/30 hover:bg-accent-cyan/10"
                    >
                      <ImagePlus className="w-3.5 h-3.5 text-accent-cyan" />
                      {lang === "sv" ? "Bild" : "Image"}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border ${
                        listening
                          ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                          : "text-white/85 border-white/[0.08] hover:border-accent-green/30"
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {lang === "sv" ? "Röst" : "Voice"}
                    </button>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-muted/50 border border-white/[0.05] cursor-default"
                      title={
                        lang === "sv"
                          ? "PDF/dokument kommer snart"
                          : "PDF/docs coming soon"
                      }
                    >
                      <FileDown className="w-3.5 h-3.5 opacity-40" />
                      {lang === "sv" ? "PDF · snart" : "PDF · soon"}
                    </span>
                    {imageGenEnabled ? (
                      <button
                        type="button"
                        onClick={() => {
                          setGenMode((g) => !g);
                          setToolsOpen(false);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border ${
                          genMode
                            ? "border-accent-purple/40 bg-accent-purple/15 text-accent-purple"
                            : "text-white/85 border-white/[0.08]"
                        }`}
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        {lang === "sv" ? "Skapa bild" : "Create image"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-muted/45 border border-white/[0.05]">
                        <Wand2 className="w-3.5 h-3.5 opacity-40" />
                        {lang === "sv" ? "Bildgen · snart" : "Image gen · soon"}
                      </span>
                    )}
                  </div>
                )}

                <form
                  onSubmit={onSubmit}
                  className={`flex gap-1.5 items-end rounded-2xl transition-colors ${
                    dragOver
                      ? "ring-2 ring-accent-cyan/40 bg-accent-cyan/[0.04]"
                      : ""
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
                    if (f && f.type.startsWith("image/")) {
                      const dt = new DataTransfer();
                      dt.items.add(f);
                      if (fileRef.current) {
                        fileRef.current.files = dt.files;
                        void onFile({
                          target: fileRef.current,
                        } as unknown as React.ChangeEvent<HTMLInputElement>);
                      }
                    } else if (f) {
                      showToast(
                        "warn",
                        lang === "sv"
                          ? "Bara bilder just nu (PDF snart)."
                          : "Images only for now (PDF soon).",
                      );
                    }
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void onFile(e)}
                  />
                  <button
                    type="button"
                    onClick={() => setToolsOpen((v) => !v)}
                    className={`shrink-0 h-11 w-10 rounded-xl border flex items-center justify-center ${
                      toolsOpen
                        ? "border-accent-cyan/35 bg-accent-cyan/10 text-accent-cyan"
                        : "border-white/[0.08] text-muted hover:text-accent-cyan"
                    }`}
                    title={lang === "sv" ? "Verktyg" : "Tools"}
                    aria-expanded={toolsOpen}
                  >
                    <Plus
                      className={`w-4 h-4 transition-transform ${toolsOpen ? "rotate-45" : ""}`}
                    />
                  </button>
                  <textarea
                    ref={taRef}
                    aria-label={
                      lang === "sv" ? "Meddelande till BudAI" : "Message BudAI"
                    }
                    maxLength={3500}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      autoResize();
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing &&
                        window.matchMedia("(pointer: fine)").matches
                      ) {
                        e.preventDefault();
                        if ((input.trim() || attach) && !busy) {
                          if (genMode && imageGenEnabled)
                            void runImageGen(input);
                          else
                            void runPrompt(
                              input ||
                                (attach
                                  ? lang === "sv"
                                    ? "Vad ser du?"
                                    : "What do you see?"
                                  : ""),
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
                      aria-label={
                        lang === "sv" ? "Stoppa svar" : "Stop response"
                      }
                      className="shrink-0 h-11 px-3.5 rounded-2xl border border-red-400/30 text-red-200"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      aria-label={
                        lang === "sv" ? "Skicka meddelande" : "Send message"
                      }
                      disabled={(!input.trim() && !attach) || busy}
                      className="pg-send shrink-0 h-11 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white disabled:opacity-40 flex items-center shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_28px_rgba(0,229,255,0.4)] transition-shadow"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted/40 px-0.5">
                  <span className="hidden sm:inline text-muted/35">
                    {lang === "sv"
                      ? "Enter skickar · Shift+Enter för ny rad"
                      : "Enter to send · Shift+Enter for a new line"}
                  </span>
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
                    <span className="truncate max-w-[140px]">
                      {auth.displayName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BudAI Workspace — substantial outputs side panel */}
            {workspace && (
              <aside className="hidden lg:flex w-[min(42%,420px)] shrink-0 flex-col border-l border-white/[0.08] bg-[#07070e] min-h-0">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06] shrink-0">
                  <GripHorizontal className="w-3.5 h-3.5 text-muted/50" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-accent-cyan/80 font-medium">
                      Workspace
                    </div>
                    <div className="text-xs text-white/90 font-semibold truncate">
                      {workspace.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(workspace.body);
                        showToast("ok", lang === "sv" ? "Kopierat" : "Copied");
                      } catch {
                        showToast("err", "Copy failed");
                      }
                    }}
                    className="p-1.5 rounded-lg text-muted hover:text-white border border-transparent hover:border-white/10"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([workspace.body], {
                        type: "text/markdown;charset=utf-8",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `budai-workspace-${Date.now()}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-1.5 rounded-lg text-muted hover:text-white border border-transparent hover:border-white/10"
                    title="Download"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspace(null)}
                    className="p-1.5 rounded-lg text-muted hover:text-white"
                    aria-label="Close workspace"
                  >
                    <PanelRightClose className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 text-[13px] text-white/90 leading-relaxed workspace-scroll">
                  {renderMarkdown(workspace.body)}
                </div>
                <div className="shrink-0 p-2.5 border-t border-white/[0.06] flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const improve =
                        lang === "sv"
                          ? "Förbättra workspace-resultatet: gör det skarpare, mer strukturerat och mer handlingsbart."
                          : "Improve the workspace result: make it sharper, more structured, and more actionable.";
                      void runPrompt(improve);
                    }}
                    disabled={busy}
                    className="flex-1 text-[11px] font-medium py-2 rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/15 disabled:opacity-40"
                  >
                    {lang === "sv" ? "Förbättra" : "Improve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(workspace.body.slice(0, 2000));
                      taRef.current?.focus();
                    }}
                    className="flex-1 text-[11px] font-medium py-2 rounded-xl border border-white/[0.08] text-muted hover:text-white"
                  >
                    {lang === "sv" ? "Redigera i chatt" : "Edit in chat"}
                  </button>
                </div>
              </aside>
            )}
          </div>
        </div>
        <p className="pg-bottom-note">
          {lang === "sv"
            ? "BudAI kan göra fel. Kontrollera viktiga uppgifter. Bildanalys och minne kräver konto."
            : "BudAI can make mistakes. Check important details. Image analysis and memory require an account."}
        </p>
      </div>

      {/* Mobile workspace sheet */}
      <AnimatePresence>
        {workspace && (
          <motion.div
            key="workspace-mobile-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[91] lg:hidden flex flex-col justify-end"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setWorkspace(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "40%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative max-h-[85vh] rounded-t-3xl border border-white/[0.1] bg-[#08080f] flex flex-col shadow-2xl"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-accent-cyan">
                    Workspace
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {workspace.title}
                  </div>
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
                  className="p-2 text-muted hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspace(null)}
                  className="p-2 text-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-sm text-white/90">
                {renderMarkdown(workspace.body)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <button
                  type="button"
                  onClick={() => setMobileDrawer(false)}
                  className="p-2 text-muted"
                >
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
                  {memoryEnabled ? (
                    <Eye className="w-4 h-4 text-accent-cyan" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  {lang === "sv" ? "Autominnes" : "Auto-memory"}
                </span>
                <span
                  className={`font-mono text-xs ${memoryEnabled ? "text-accent-green" : "text-muted"}`}
                >
                  {memoryEnabled ? "ON" : "OFF"}
                </span>
              </button>

              <div className="space-y-2 mb-3">
                {memory.length === 0 && (
                  <p className="text-sm text-muted/60 text-center py-8">
                    {lang === "sv"
                      ? "Inget sparat ännu."
                      : "Nothing saved yet."}
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
                          void cloud
                            .updateMemory(m.id, editMemText)
                            .then(() => {
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
                          <button
                            type="submit"
                            className="text-xs text-accent-cyan"
                          >
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
                        <span className="text-sm text-white/85 flex-1 leading-relaxed">
                          {m.text}
                        </span>
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
                          onClick={() =>
                            void cloud
                              .deleteMemory(m.id)
                              .then(() => reloadSidebar())
                          }
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
                    if (
                      confirm(
                        lang === "sv"
                          ? "Rensa allt minne?"
                          : "Clear all memory?",
                      )
                    ) {
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

      {/* Keyboard shortcuts palette */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
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
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c14] shadow-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Command className="w-4 h-4 text-accent-cyan" />
                <h3 className="text-sm font-semibold text-white">
                  {lang === "sv"
                    ? "Tangentbordsgenvägar"
                    : "Keyboard shortcuts"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(false)}
                  className="ml-auto p-1 text-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-2 text-[12px]">
                {[
                  {
                    keys: "⌘ /",
                    desc: lang === "sv" ? "Visa genvägar" : "Show shortcuts",
                  },
                  {
                    keys: "⌘ N",
                    desc: lang === "sv" ? "Ny chatt" : "New chat",
                  },
                  {
                    keys: "⌘ E",
                    desc:
                      lang === "sv"
                        ? "Exportera tråd (.md)"
                        : "Export thread (.md)",
                  },
                  {
                    keys: "⌘ B",
                    desc:
                      lang === "sv" ? "Växla Workspace" : "Toggle Workspace",
                  },
                  {
                    keys: "Esc",
                    desc: lang === "sv" ? "Stäng paneler" : "Close panels",
                  },
                  {
                    keys: "Enter",
                    desc: lang === "sv" ? "Skicka meddelande" : "Send message",
                  },
                ].map((row) => (
                  <li
                    key={row.keys}
                    className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0"
                  >
                    <span className="text-muted">{row.desc}</span>
                    <kbd className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-white/90">
                      {row.keys}
                    </kbd>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] text-muted/60 leading-relaxed">
                {lang === "sv"
                  ? "Använd + vid meddelandefältet för att välja läge, bifoga en bild eller använda rösten."
                  : "Use + beside the message field to choose a mode, attach an image, or use your voice."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
