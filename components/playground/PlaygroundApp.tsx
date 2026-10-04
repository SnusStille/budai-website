"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  BarChart3,
  BrainCircuit,
  Command,
  Download,
  GalleryHorizontalEnd,
  Image as ImageIcon,
  Keyboard,
  Layers,
  LogIn,
  LogOut,
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  PanelLeft,
  PanelRight,
  Pencil,
  Settings2,
  Sparkles,
  SplitSquareHorizontal,
  StickyNote,
  SquareLibrary,
  X,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  estimateTokens,
  looksLikeImageGen,
  memoryToPromptBlock,
  newId,
  titleFromMessages,
  type AccentId,
  type AiActivity,
  type AttachmentDraft,
  type ChatMessage,
  type EffortId,
  type MemoryItem,
  type PersonaId,
  type PgSettings,
  type StyleId,
} from "@/lib/playground/types";
import {
  EFFORT_OPTIONS,
  GREETINGS,
  LIBRARY_PROMPTS,
  PERSONAS,
  PLACEHOLDERS,
  SPARKS,
  STYLE_OPTIONS,
  TRANSFORMS,
  type Transform,
} from "@/lib/playground/prompts";
import {
  clearNotes,
  deleteLocalConversation,
  deleteNote,
  loadLocalConversations,
  loadNotes,
  saveNote,
  type NoteItem,
  loadSettings,
  persistLocalMessages,
  saveSettings,
} from "@/lib/playground/localStore";
import * as cloud from "@/lib/playground/cloudStore";
import { consumePlaygroundPrefill, PLAYGROUND_PREFILL_EVENT } from "@/lib/playground/events";
import { playSound, setSoundEnabled } from "@/lib/playground/sound";
import VoiceMode from "./VoiceMode";
import Composer from "./Composer";
import Sidebar, { type HistoryItem } from "./Sidebar";
import MessageList, { type DualOption } from "./MessageList";
import {
  CommandPalette,
  GalleryPanel,
  InspectorPanel,
  MemoryPanel,
  NotesPanel,
  PromptLibrary,
  Portal,
  SettingsPanel,
  ShortcutsModal,
  StatsPanel,
  type PaletteAction,
} from "./Panels";

type Lang = "sv" | "en";

const META_MARK = "\u0000META";
const PINS_KEY = "budai.pg.pins.v1";

function readPins(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PINS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writePins(pins: string[]) {
  try {
    window.localStorage.setItem(PINS_KEY, JSON.stringify(pins));
  } catch {
    /* storage full or blocked */
  }
}

function applyPins(items: HistoryItem[]): HistoryItem[] {
  const pins = readPins();
  return items
    .map((c) => ({ ...c, pinned: pins.includes(c.id) }))
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.updatedAt - a.updatedAt);
}
const ERR_MARK = "\u0000ERR";

function stripMemoryTag(text: string) {
  const i = text.search(/\[\[MEMORY:/i);
  return i === -1 ? text : text.slice(0, i);
}

function groupHistory(items: HistoryItem[], lang: Lang) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86_400_000;
  const startWeek = startToday - 7 * 86_400_000;
  const buckets: { label: string; items: HistoryItem[] }[] = [
    { label: lang === "sv" ? "Idag" : "Today", items: [] },
    { label: lang === "sv" ? "Igår" : "Yesterday", items: [] },
    { label: lang === "sv" ? "Senaste 7 dagarna" : "Previous 7 days", items: [] },
    { label: lang === "sv" ? "Äldre" : "Older", items: [] },
  ];
  for (const item of items) {
    if (item.updatedAt >= startToday) buckets[0].items.push(item);
    else if (item.updatedAt >= startYesterday) buckets[1].items.push(item);
    else if (item.updatedAt >= startWeek) buckets[2].items.push(item);
    else buckets[3].items.push(item);
  }
  return buckets.filter((b) => b.items.length);
}

export default function PlaygroundApp() {
  const { lang } = useLang();
  const auth = useAuth();
  const isSv = lang === "sv";

  /* ── settings ── */
  const [settings, setSettings] = useState<PgSettings>({
    accent: "aurora",
    sound: true,
    stream: true,
    persona: "core",
    style: "balanced",
    effort: "balanced",
    answerLang: lang,
    showTimestamps: false,
    reduceEffects: false,
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...loadSettings() }));
    setNotes(loadNotes());
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    saveSettings(settings);
    setSoundEnabled(settings.sound !== false);
  }, [settings, settingsLoaded]);

  const patch = useCallback((next: Partial<PgSettings>) => {
    setSettings((prev) => ({ ...prev, ...next }));
  }, []);

  /* ── conversation state ── */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [attach, setAttach] = useState<AttachmentDraft | null>(null);
  const [activity, setActivity] = useState<AiActivity>("idle");
  const [typingText, setTypingText] = useState("");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [temporary, setTemporary] = useState(false);
  const [genMode, setGenMode] = useState(false);
  const [compare, setCompare] = useState(false);
  const [imageGenEnabled, setImageGenEnabled] = useState(false);
  const [dualPick, setDualPick] = useState<Record<string, DualOption[] | undefined>>({});
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [lastFailed, setLastFailed] = useState<{ prompt: string; image?: AttachmentDraft | null } | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  /* ── ui state ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspector, setInspector] = useState<{ title: string; body: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [improving, setImproving] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceReply, setVoiceReply] = useState<{ id: string; text: string } | null>(null);
  const [voiceTts, setVoiceTts] = useState(true);
  const [renamingTitle, setRenamingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<{ stop: () => void } | null>(null);
  const persistTimer = useRef(0);
  const bootRef = useRef(false);
  const pendingVariants = useRef<{ id: string; variants: string[] } | null>(null);
  const lastPromptRef = useRef<string>("");
  const placeholderRef = useRef(PLACEHOLDERS[lang][0]);

  const busy = activity !== "idle" && activity !== "error" && activity !== "listening";

  const showToast = useCallback((kind: "ok" | "warn" | "err", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  /* collapse the sidebar on small screens once we know the viewport */
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  /* rotating placeholder */
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[lang][0]);
  useEffect(() => {
    setPlaceholder(PLACEHOLDERS[lang][0]);
    const id = window.setInterval(() => {
      const list = PLACEHOLDERS[lang];
      const next = list[Math.floor(Math.random() * list.length)];
      placeholderRef.current = next;
      setPlaceholder(next);
    }, 9000);
    return () => window.clearInterval(id);
  }, [lang]);

  /* greeting */
  const greeting = useMemo(() => {
    const name = auth.displayName?.split(" ")[0];
    const base = GREETINGS[lang][Math.floor(Math.random() * GREETINGS[lang].length)];
    return name ? `${base}, ${name}` : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, auth.displayName]);

  /* first-visit tips */
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem("budai.pg.tips.v1");
      if (!seen) setTipOpen(true);
    } catch {
      /* storage blocked */
    }
  }, []);

  const dismissTips = useCallback(() => {
    setTipOpen(false);
    try {
      window.localStorage.setItem("budai.pg.tips.v1", "1");
    } catch {
      /* storage blocked */
    }
  }, []);

  /* feature flag */
  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((d) => setImageGenEnabled(Boolean(d.imageGeneration)))
      .catch(() => setImageGenEnabled(false));
  }, []);

  /* auth flash */
  useEffect(() => {
    if (auth.authFlash === "signed-in") {
      showToast("ok", isSv ? "Inloggad — minne och historik aktiverat" : "Signed in — memory and history enabled");
      auth.clearAuthFlash();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.authFlash]);

  /* ── history ── */
  const reloadHistory = useCallback(async () => {
    if (auth.isMember) {
      try {
        const list = await cloud.listConversations(40);
        setHistory(applyPins(list));
        setMemory(await cloud.fetchMemories());
        setMemoryEnabled(await cloud.getMemoryEnabled());
      } catch (error) {
        console.warn(error);
      }
    } else {
      setHistory(
        applyPins(
          loadLocalConversations().map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt,
            createdAt: c.createdAt,
            temporary: c.temporary,
            pinned: c.pinned,
          }))
        )
      );
      setMemory([]);
    }
  }, [auth.isMember]);

  useEffect(() => {
    if (!auth.ready) return;
    void reloadHistory();
    if (!bootRef.current) bootRef.current = true;
  }, [auth.ready, auth.isMember, reloadHistory]);

  /* clear the thread when membership changes (avoid leaking guest state into cloud) */
  const prevMember = useRef(auth.isMember);
  useEffect(() => {
    if (prevMember.current !== auth.isMember) {
      prevMember.current = auth.isMember;
      setMessages([]);
      setConvoId(null);
      setTemporary(false);
      setDualPick({});
      void reloadHistory();
    }
  }, [auth.isMember, reloadHistory]);

  /* prefill from hero / capabilities */
  useEffect(() => {
    const apply = (prompt: string) => {
      setInput(prompt);
      window.requestAnimationFrame(() => document.getElementById("pgx-input-anchor")?.scrollIntoView({ block: "center" }));
    };
    const onPrefill = (event: Event) => {
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) {
        consumePlaygroundPrefill();
        apply(prompt);
      }
    };
    window.addEventListener(PLAYGROUND_PREFILL_EVENT, onPrefill);
    const pending = consumePlaygroundPrefill();
    if (pending) apply(pending);
    return () => window.removeEventListener(PLAYGROUND_PREFILL_EVENT, onPrefill);
  }, []);

  /* ── persistence ── */
  const persist = useCallback(
    async (list: ChatMessage[], id: string | null) => {
      if (!list.length || !id || temporary) return;
      if (auth.isMember) {
        await cloud.syncMessages(id, list);
        void reloadHistory();
        return;
      }
      persistLocalMessages(id, list);
      setHistory(
        applyPins(
          loadLocalConversations().map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt,
            createdAt: c.createdAt,
            temporary: c.temporary,
            pinned: c.pinned,
          }))
        )
      );
    },
    [auth.isMember, temporary, reloadHistory]
  );

  useEffect(() => {
    if (!messages.length || !convoId) return;
    window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => void persist(messages, convoId), 700);
    return () => window.clearTimeout(persistTimer.current);
  }, [messages, convoId, persist]);

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (convoId) return convoId;
    if (temporary) {
      const id = newId("tmp");
      setConvoId(id);
      return id;
    }
    if (auth.isMember) {
      const id = await cloud.createConversation(isSv ? "Ny chatt" : "New chat");
      if (!id) {
        showToast("err", isSv ? "Kunde inte skapa chatt" : "Could not create chat");
        return null;
      }
      setConvoId(id);
      void reloadHistory();
      return id;
    }
    const id = newId("local");
    setConvoId(id);
    return id;
  }, [convoId, temporary, auth.isMember, isSv, reloadHistory, showToast]);

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = auth.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [auth.session]);

  const bumpServer = useCallback(
    async (kind: "messages" | "images" | "generations") => {
      try {
        const headers = await authHeaders();
        await fetch("/api/usage", {
          method: "POST",
          headers,
          body: JSON.stringify({ kind, guest: auth.isGuest ? auth.guestKey : undefined }),
        });
      } catch {
        /* optimistic */
      }
      auth.bumpUsage(kind);
    },
    [auth, authHeaders]
  );

  const checkQuota = useCallback(
    (kind: "messages" | "images" | "generations") => {
      if (auth.remaining[kind] > 0) return true;
      showToast(
        "warn",
        kind === "messages"
          ? isSv
            ? "Daglig gräns nådd — logga in för fler meddelanden."
            : "Daily limit reached — sign in for more messages."
          : isSv
            ? "Det här kräver ett konto."
            : "This one needs an account."
      );
      if (auth.isGuest) auth.openAuth(isSv ? "Lås upp mer BudAI" : "Unlock more BudAI");
      return false;
    },
    [auth, isSv, showToast]
  );

  /* ── conversation actions ── */
  const stopAll = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
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
  }, []);

  const newChat = useCallback(
    async (options?: { temporary?: boolean }) => {
      if (creating) return;
      setCreating(true);
      stopAll();
      setAttach(null);
      setGenMode(false);
      setInput("");
      setDualPick({});
      setLastFailed(null);
      setInspector(null);
      setTemporary(Boolean(options?.temporary));
      try {
        if (auth.isMember && !options?.temporary) {
          const id = await cloud.createConversation(isSv ? "Ny chatt" : "New chat");
          if (!id) {
            showToast("err", isSv ? "Kunde inte skapa chatt" : "Could not create chat");
            return;
          }
          setConvoId(id);
          setMessages([]);
          await reloadHistory();
        } else {
          setConvoId(newId(options?.temporary ? "tmp" : "local"));
          setMessages([]);
        }
        setDrawerOpen(false);
      } finally {
        setCreating(false);
      }
    },
    [auth.isMember, creating, isSv, reloadHistory, showToast, stopAll]
  );

  const loadConversation = useCallback(
    async (id: string) => {
      stopAll();
      setDualPick({});
      setLastFailed(null);
      setInspector(null);
      setTemporary(false);
      const found = auth.isMember
        ? await cloud.loadConversation(id)
        : loadLocalConversations().find((c) => c.id === id) ?? null;
      if (!found) {
        showToast("err", isSv ? "Kunde inte ladda chatten" : "Could not load the chat");
        return;
      }
      setConvoId(found.id);
      setMessages(found.messages);
      setDrawerOpen(false);
    },
    [auth.isMember, isSv, showToast, stopAll]
  );

  const removeConversation = useCallback(
    async (id: string) => {
      if (auth.isMember) await cloud.deleteConversation(id);
      else deleteLocalConversation(id);
      if (convoId === id) {
        setConvoId(null);
        setMessages([]);
      }
      void reloadHistory();
    },
    [auth.isMember, convoId, reloadHistory]
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      if (auth.isMember) {
        await cloud.renameConversation(id, title);
      } else {
        const list = loadLocalConversations();
        const found = list.find((c) => c.id === id);
        if (found) persistLocalMessages(id, found.messages, { title });
      }
      void reloadHistory();
    },
    [auth.isMember, reloadHistory]
  );

  const togglePin = useCallback((id: string) => {
    const pins = readPins();
    const next = pins.includes(id) ? pins.filter((x) => x !== id) : [...pins, id];
    writePins(next);
    setHistory((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: next.includes(id) } : c)));
  }, []);

  /* ── generation ── */
  const buildApiMessages = (list: ChatMessage[]) =>
    list
      .filter((m) => !m.error && m.content.trim())
      .map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

  const contextBlock = useCallback(() => {
    const parts: string[] = [];
    const instructions = (settings.customInstructions || "").trim();
    if (instructions) {
      parts.push(
        (isSv ? "[Användarens egna instruktioner]\n" : "[User's custom instructions]\n") + instructions
      );
    }
    if (auth.isMember && memoryEnabled && !temporary && memory.length) {
      parts.push(memoryToPromptBlock(memory, lang));
    }
    return parts.join("\n\n");
  }, [auth.isMember, isSv, lang, memory, memoryEnabled, settings.customInstructions, temporary]);

  const finishAnswer = useCallback(
    (promptId: string, content: string, meta?: { ms?: number; model?: string; memory?: string | null }) => {
      const pending = pendingVariants.current;
      pendingVariants.current = null;
      if (pending) {
        const variants = [...pending.variants, content];
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pending.id
              ? { ...m, variants, variantIndex: variants.length - 1, content, ms: meta?.ms, model: meta?.model }
              : m
          )
        );
        setVoiceReply({ id: `${pending.id}-${variants.length}`, text: content });
        playSound("receive");
        return;
      }
      const message: ChatMessage = {
        id: newId("m"),
        role: "assistant",
        content,
        ts: Date.now(),
        promptId,
        ms: meta?.ms,
        model: meta?.model,
        tokens: estimateTokens(content),
      };
      setMessages((prev) => [...prev, message]);
      setVoiceReply({ id: message.id, text: content });
      if (meta?.memory && auth.isMember && !temporary) {
        showToast("ok", isSv ? "BudAI sparade ett minne" : "BudAI saved a memory");
        void reloadHistory();
      }
    },
    [auth.isMember, temporary, isSv, showToast, reloadHistory]
  );

  const runPrompt = useCallback(
    async (rawText: string, options?: { image?: AttachmentDraft | null; history?: ChatMessage[]; replaceId?: string }) => {
      const text = rawText.trim();
      if (!text || busy) return;

      if (!imageGenEnabled && looksLikeImageGen(text)) {
        /* the model explains the limitation honestly — no fake images */
      } else if (imageGenEnabled && genMode && !options?.image) {
        setGenMode(false);
        return runImageGenRef.current?.(text);
      }

      if (!checkQuota("messages")) return;

      const image = options?.image !== undefined ? options.image : attach;
      if (image && auth.isGuest) {
        auth.openAuth(isSv ? "Bildanalys kräver ett konto" : "Image analysis needs an account");
        return;
      }
      if (image && !checkQuota("images")) return;

      const id = await ensureConversation();
      if (!id && auth.isMember) return;

      const promptId = newId("p");
      const userMessage: ChatMessage = {
        id: promptId,
        role: "user",
        content: text,
        ts: Date.now(),
        imageUrl: image?.preview,
      };

      lastPromptRef.current = text;
      const base = options?.history ?? messages;
      const nextList = [...base, userMessage];
      setMessages(nextList);
      setInput("");
      setAttach(null);
      setLastFailed(null);
      setTypingText("");
      setActivity(image ? "reading_image" : "thinking");
      setThinkingStep(0);
      setElapsedMs(0);
      playSound("send");

      void bumpServer("messages");
      if (image) void bumpServer("images");

      const started = Date.now();
      const timer = window.setInterval(() => {
        setElapsedMs(Date.now() - started);
        setThinkingStep((step) => (step < 4 ? step + 1 : step));
      }, 900);

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), 120_000);

      const apiMessages = buildApiMessages(nextList).map((m, index, arr) =>
        index === arr.length - 1 && m.role === "user" && image?.text
          ? { ...m, content: `${m.content}\n\n[Bifogad fil: ${image.name}]\n${image.text.slice(0, 6000)}` }
          : m
      );

      try {
        const headers = await authHeaders();

        if (settings.stream !== false && !compare) {
          const response = await fetch("/api/playground", {
            method: "POST",
            headers,
            signal: controller.signal,
            body: JSON.stringify({
              messages: apiMessages,
              lang: settings.answerLang || lang,
              stream: !compare,
              dual: compare,
              persona: settings.persona,
              style: settings.style,
              effort: settings.effort,
              context: contextBlock(),
              guest: auth.isGuest ? auth.guestKey : undefined,
              imageBase64: image?.b64,
              imageMediaType: image?.media,
              temporary: temporary || !memoryEnabled,
            }),
          });

          if (!response.ok || !response.body) {
            const data = await response.json().catch(() => ({}));
            window.clearInterval(timer);
            window.clearTimeout(timeout);
            handleApiError(response.status, data, text, image);
            return;
          }

          setActivity("typing");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let raw = "";
          let meta: { ms?: number; model?: string; memory?: string | null } | undefined;

          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            raw += decoder.decode(value, { stream: true });
            const metaIndex = raw.indexOf(META_MARK);
            const errorIndex = raw.indexOf(ERR_MARK);
            if (errorIndex !== -1) {
              raw = raw.slice(0, errorIndex);
              throw new Error("stream-error");
            }
            const visible = metaIndex === -1 ? raw : raw.slice(0, metaIndex);
            setTypingText(stripMemoryTag(visible));
          }

          const metaIndex = raw.indexOf(META_MARK);
          if (metaIndex !== -1) {
            try {
              meta = JSON.parse(raw.slice(metaIndex + META_MARK.length));
            } catch {
              meta = undefined;
            }
            raw = raw.slice(0, metaIndex);
          }

          window.clearInterval(timer);
          window.clearTimeout(timeout);
          setTypingText("");
          setActivity("idle");
          const clean = stripMemoryTag(raw).trim();
          finishAnswer(promptId, clean || "…", meta);
          playSound("receive");
          return;
        }

        /* non-streaming path — used for compare mode and when streaming is off */
        const response = await fetch("/api/playground", {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            messages: apiMessages,
            lang: settings.answerLang || lang,
            persona: settings.persona,
            style: settings.style,
            effort: settings.effort,
            dual: compare,
            context: contextBlock(),
            guest: auth.isGuest ? auth.guestKey : undefined,
            imageBase64: image?.b64,
            imageMediaType: image?.media,
            temporary: temporary || !memoryEnabled,
          }),
        });
        window.clearInterval(timer);
        window.clearTimeout(timeout);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          handleApiError(response.status, data, text, image);
          return;
        }
        setActivity("idle");
        if (data.dual && Array.isArray(data.replies) && data.replies.length >= 2) {
          const answerId = newId("m");
          setDualPick((prev) => ({ ...prev, [answerId]: data.replies }));
          setMessages((prev) => [
            ...prev,
            {
              id: answerId,
              role: "assistant",
              content: data.replies[0].body,
              ts: Date.now(),
              promptId,
              model: "compare",
            },
          ]);
        } else {
          finishAnswer(promptId, data.reply || "…", { memory: data.memory });
        }
        playSound("receive");
      } catch (error) {
        window.clearInterval(timer);
        window.clearTimeout(timeout);
        setTypingText("");
        const aborted = error instanceof Error && error.name === "AbortError";
        pushError(
          aborted
            ? isSv
              ? "Stoppat. Du kan fortsätta där du var."
              : "Stopped. You can pick it back up."
            : isSv
              ? "Nätverksfel — kontrollera anslutningen och försök igen."
              : "Network error — check your connection and try again.",
          text,
          image
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      busy,
      imageGenEnabled,
      genMode,
      checkQuota,
      attach,
      auth,
      ensureConversation,
      messages,
      bumpServer,
      authHeaders,
      settings,
      contextBlock,
      temporary,
      memoryEnabled,
      lang,
      isSv,
      finishAnswer,
    ]
  );

  const handleApiError = useCallback(
    (status: number, data: { error?: string; code?: string }, prompt: string, image?: AttachmentDraft | null) => {
      setActivity("idle");
      setTypingText("");
      if (status === 503) {
        pushError(
          isSv
            ? "Playground-motorn är inte kopplad i den här miljön (ANTHROPIC_API_KEY saknas). Gränssnittet fungerar — lägg till nyckeln för riktiga svar."
            : "The Playground engine isn't wired up in this environment (ANTHROPIC_API_KEY missing). The interface works — add the key for live answers.",
          prompt,
          image
        );
        return;
      }
      if (status === 429 || data.code === "limit") {
        pushError(data.error || (isSv ? "Gräns nådd." : "Limit reached."), prompt, image);
        auth.openAuth();
        return;
      }
      if (status === 403 || status === 401) {
        pushError(data.error || (isSv ? "Kräver konto." : "Needs an account."), prompt, image);
        auth.openAuth(data.error);
        return;
      }
      pushError(data.error || (isSv ? "Något gick fel. Försök igen." : "Something went wrong. Try again."), prompt, image);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth, isSv]
  );

  const pushError = useCallback((text: string, prompt: string, image?: AttachmentDraft | null) => {
    setActivity("idle");
    setMessages((prev) => [
      ...prev,
      { id: newId("e"), role: "assistant", content: text, ts: Date.now(), error: true },
    ]);
    setLastFailed({ prompt, image });
    playSound("error");
  }, []);

  /* image generation */
  const runImageGen = useCallback(
    async (prompt: string) => {
      const text = prompt.trim();
      if (!text || busy) return;
      if (!imageGenEnabled) {
        showToast(
          "warn",
          isSv
            ? "Bildgenerering är inte aktiverad här — bifoga en bild för analys i stället."
            : "Image generation isn't enabled here — attach an image to analyse instead."
        );
        setGenMode(false);
        return;
      }
      if (auth.isGuest) {
        auth.openAuth(isSv ? "Bildgenerering kräver ett konto" : "Image generation needs an account");
        return;
      }
      if (!checkQuota("generations")) return;

      const id = await ensureConversation();
      if (!id) return;

      setMessages((prev) => [
        ...prev,
        { id: newId("p"), role: "user", content: text, ts: Date.now() },
      ]);
      setInput("");
      setGenMode(false);
      setActivity("generating_image");
      void bumpServer("generations");

      try {
        const headers = await authHeaders();
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers,
          body: JSON.stringify({ prompt: text }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 501) {
          pushError(
            isSv
              ? "Bildgenerering är inte aktiverad ännu i den här förhandsvisningen. Textchatten fungerar."
              : "Image generation isn't enabled in this preview yet. Text chat still works.",
            text
          );
          return;
        }
        if (!response.ok) {
          pushError(data.error || (isSv ? "Kunde inte skapa bilden." : "Could not create the image."), text);
          if (data.code === "auth") auth.openAuth();
          return;
        }
        const url = data.imageUrl || (data.imageBase64 ? `data:image/png;base64,${data.imageBase64}` : null);
        if (!url) {
          pushError(isSv ? "Ingen bild returnerades." : "No image came back.", text);
          return;
        }
        setActivity("idle");
        setMessages((prev) => [
          ...prev,
          {
            id: newId("m"),
            role: "assistant",
            content: isSv
              ? "Här är bilden. Vill du ha en variation eller en annan vinkel?"
              : "Here's the image. Want a variation or another angle?",
            ts: Date.now(),
            imageUrl: url,
            generated: true,
          },
        ]);
        playSound("success");
      } catch {
        pushError(isSv ? "Nätverksfel vid bildgenerering." : "Network error while generating.", text);
      }
    },
    [auth, authHeaders, bumpServer, busy, checkQuota, ensureConversation, imageGenEnabled, isSv, pushError, showToast]
  );
  const runImageGenRef = useRef(runImageGen);
  useEffect(() => {
    runImageGenRef.current = runImageGen;
  }, [runImageGen]);

  /* ── prompt improvement (one-shot rewrite of the draft) ── */
  const improvePrompt = useCallback(async () => {
    const draft = input.trim();
    if (!draft || improving) return;
    setImproving(true);
    try {
      const headers = await authHeaders();
      const instruction = isSv
        ? `Förbättra följande prompt så att den blir tydligare och mer användbar för en AI-assistent. Lägg till relevant kontext, mål och önskat format. Svara med ENDAST den förbättrade prompten, ingen förklaring.\n\nPrompt: ${draft}`
        : `Improve the following prompt so it is clearer and more useful for an AI assistant. Add relevant context, the goal, and the desired format. Reply with ONLY the improved prompt, no explanation.\n\nPrompt: ${draft}`;
      const response = await fetch("/api/playground", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: instruction }],
          lang: settings.answerLang || lang,
          persona: "core",
          style: "concise",
          effort: "quick",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reply) {
        showToast(
          "warn",
          isSv ? "Kunde inte förbättra just nu — försök igen." : "Couldn't improve it right now — try again."
        );
        return;
      }
      setInput(String(data.reply).replace(/^["'`\s]+|["'`\s]+$/g, "").slice(0, 1200));
      showToast("ok", isSv ? "Prompten är vässad — granska och skicka" : "Prompt sharpened — review and send");
    } catch {
      showToast("err", isSv ? "Nätverksfel." : "Network error.");
    } finally {
      setImproving(false);
    }
  }, [authHeaders, improving, input, isSv, lang, settings.answerLang, showToast]);

  /* ── files ── */
  const ingestFile = useCallback(
    async (file: File) => {
      if (file.type.startsWith("image/")) {
        if (file.size > 4 * 1024 * 1024) {
          showToast("warn", isSv ? "Max 4 MB för bilder" : "4 MB max for images");
          return;
        }
        if (auth.isGuest) {
          auth.openAuth(isSv ? "Bifoga bilder med ett konto" : "Attach images with an account");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          const match = result.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
          if (!match) {
            showToast("err", isSv ? "Kunde inte läsa bilden" : "Could not read the image");
            return;
          }
          if (attach?.preview?.startsWith("blob:")) URL.revokeObjectURL(attach.preview);
          setAttach({
            id: newId("a"),
            kind: "image",
            preview: URL.createObjectURL(file),
            b64: match[2],
            media: match[1],
            name: file.name,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      const textLike = /\.(txt|md|markdown|json|csv|tsv|log|yml|yaml|ts|tsx|js|jsx|py|css|html|sql|sh)$/i.test(file.name);
      if (!textLike) {
        showToast("warn", isSv ? "Bilder eller textfiler (txt, md, json, csv, kod)" : "Images or text files (txt, md, json, csv, code)");
        return;
      }
      if (file.size > 512 * 1024) {
        showToast("warn", isSv ? "Max 512 KB för textfiler" : "512 KB max for text files");
        return;
      }
      const text = await file.text();
      setAttach({
        id: newId("a"),
        kind: "file",
        preview: "",
        b64: "",
        media: "text/plain",
        name: file.name,
        size: file.size,
        text,
      });
      showToast("ok", isSv ? `${file.name} tillagd i kontexten` : `${file.name} added to context`);
    },
    [attach, auth, isSv, showToast]
  );

  const onFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await ingestFile(file);
  };

  /* voice input */
  const toggleMic = useCallback(() => {
    type SRInstance = {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: ((event: { error?: string }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    const w = window as unknown as {
      SpeechRecognition?: new () => SRInstance;
      webkitSpeechRecognition?: new () => SRInstance;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      showToast("warn", isSv ? "Röst stöds inte i den här webbläsaren (prova Chrome)." : "Voice isn't supported in this browser (try Chrome).");
      return;
    }
    if (listening && recogRef.current) {
      recogRef.current.stop();
      setListening(false);
      setActivity("idle");
      return;
    }
    try {
      const recognition = new Ctor();
      recognition.lang = lang === "sv" ? "sv-SE" : "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          const row = event.results[i];
          if (row?.[0]?.transcript) transcript += row[0].transcript;
        }
        setInput(transcript);
      };
      recognition.onerror = (event) => {
        setListening(false);
        setActivity("idle");
        if (event?.error === "not-allowed") {
          showToast("err", isSv ? "Mikrofon nekad i webbläsaren." : "Microphone permission denied.");
        }
      };
      recognition.onend = () => {
        setListening(false);
        setActivity("idle");
      };
      recogRef.current = recognition;
      setListening(true);
      setActivity("listening");
      playSound("open");
      recognition.start();
    } catch {
      showToast("err", isSv ? "Kunde inte starta mikrofonen." : "Could not start the microphone.");
    }
  }, [isSv, lang, listening, showToast]);

  /* text to speech */
  const speak = useCallback(
    (message: ChatMessage) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        showToast("warn", isSv ? "Uppläsning stöds inte här." : "Read-aloud isn't supported here.");
        return;
      }
      if (speakingId === message.id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content.replace(/```[\s\S]*?```/g, "").slice(0, 3000));
      utterance.lang = lang === "sv" ? "sv-SE" : "en-US";
      utterance.rate = 1.02;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(message.id);
      window.speechSynthesis.speak(utterance);
    },
    [isSv, lang, showToast, speakingId]
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  /* ── message actions ── */
  const regenerate = useCallback(
    (message: ChatMessage) => {
      const index = messages.findIndex((m) => m.id === message.id);
      const promptMessage = [...messages.slice(0, index)].reverse().find((m) => m.role === "user");
      if (!promptMessage) return;
      const trimmed = messages.slice(0, index);
      setMessages(trimmed);
      void runPrompt(promptMessage.content, { history: trimmed.slice(0, -1) });
    },
    [messages, runPrompt]
  );

  const editMessage = useCallback(
    (message: ChatMessage) => {
      const index = messages.findIndex((m) => m.id === message.id);
      const trimmed = messages.slice(0, index);
      setMessages(trimmed);
      setInput(message.content);
      showToast("ok", isSv ? "Redigera och skicka igen" : "Edit and send again");
    },
    [isSv, messages, showToast]
  );

  const branchFrom = useCallback(
    async (message: ChatMessage) => {
      const index = messages.findIndex((m) => m.id === message.id);
      const slice = messages.slice(0, index + 1);
      if (auth.isMember) {
        const id = await cloud.createConversation(titleFromMessages(slice));
        if (!id) return;
        await cloud.syncMessages(id, slice);
        setConvoId(id);
      } else {
        const id = newId("local");
        persistLocalMessages(id, slice);
        setConvoId(id);
      }
      setMessages(slice);
      void reloadHistory();
      showToast("ok", isSv ? "Ny gren skapad" : "New branch created");
    },
    [auth.isMember, isSv, messages, reloadHistory, showToast]
  );

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  /** Regenerate keeps the old answers as switchable variants. */
  const regenerateVariant = useCallback(
    (message: ChatMessage) => {
      const index = messages.findIndex((m) => m.id === message.id);
      const promptMessage = [...messages.slice(0, index)].reverse().find((m) => m.role === "user");
      if (!promptMessage) return;
      const existing = message.variants?.length ? message.variants : [message.content];
      pendingVariants.current = { id: message.id, variants: existing };
      const trimmed = [...messages.slice(0, index), message];
      setMessages(trimmed);
      void runPrompt(promptMessage.content, { history: trimmed.slice(0, -1) });
    },
    [messages, runPrompt]
  );

  const switchVariant = useCallback((message: ChatMessage, index: number) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== message.id || !m.variants) return m;
        const clamped = Math.max(0, Math.min(m.variants.length - 1, index));
        return { ...m, variantIndex: clamped, content: m.variants[clamped] };
      })
    );
  }, []);

  const applyTransform = useCallback(
    (message: ChatMessage, transform: Transform) => {
      void runPrompt(transform.build(message.content, lang));
    },
    [lang, runPrompt]
  );

  const exportThread = useCallback(
    (format: "md" | "json" = "md") => {
      if (!messages.length) {
        showToast("err", isSv ? "Inget att exportera ännu" : "Nothing to export yet");
        return;
      }
      const title = history.find((c) => c.id === convoId)?.title || (isSv ? "chatt" : "chat");
      const safe = title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "chat";
      const payload =
        format === "md"
          ? `# BudAI · ${title}\n\n${messages
              .map((m) => `## ${m.role === "user" ? "Du" : "BudAI"} · ${new Date(m.ts).toLocaleString()}\n\n${m.content}\n`)
              .join("\n")}`
          : JSON.stringify({ title, exportedAt: new Date().toISOString(), messages }, null, 2);
      const blob = new Blob([payload], { type: format === "md" ? "text/markdown;charset=utf-8" : "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budai-${safe}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("ok", isSv ? "Konversation exporterad" : "Conversation exported");
    },
    [convoId, history, isSv, messages, showToast]
  );

  const addNote = useCallback(
    (text: string, source?: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      saveNote(trimmed, source);
      setNotes(loadNotes());
      showToast("ok", isSv ? "Sparat i anteckningar" : "Saved to notes");
      playSound("success");
    },
    [isSv, showToast]
  );

  const copyText = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast("ok", isSv ? "Kopierat" : "Copied");
      } catch {
        showToast("err", isSv ? "Kunde inte kopiera" : "Could not copy");
      }
    },
    [isSv, showToast]
  );

  /* ── keyboard ── */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inField = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      const mod = event.metaKey || event.ctrlKey;

      if (event.key === "Escape") {
        if (lightbox) return setLightbox(null);
        if (paletteOpen) return setPaletteOpen(false);
        if (shortcutsOpen) return setShortcutsOpen(false);
        if (libraryOpen) return setLibraryOpen(false);
        if (expanded) return setExpanded(false);
        if (drawerOpen) return setDrawerOpen(false);
        return;
      }
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (inField) return;
      if (mod && event.key.toLowerCase() === "n") {
        event.preventDefault();
        void newChat();
        return;
      }
      if (mod && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setInspector((prev) => {
          if (prev) return null;
          const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content.length > 200);
          return last ? { title: last.content.slice(0, 48), body: last.content } : null;
        });
        return;
      }
      if (mod && event.key.toLowerCase() === "e") {
        event.preventDefault();
        exportThread("md");
        return;
      }
      if (mod && event.key === "/") {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (mod && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setExpanded((v) => !v);
        return;
      }
      if (event.key === "?" ) {
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, expanded, exportThread, libraryOpen, lightbox, messages, newChat, paletteOpen, shortcutsOpen]);

  /* ── derived ── */
  const grouped = useMemo(() => groupHistory(history, lang), [history, lang]);

  /* search also inside message content — locally we can read the full thread list */
  const snippets = useMemo(() => {
    const query = search.trim().toLowerCase();
    const found: Record<string, string> = {};
    if (!query) return found;
    const scan = (id: string, list: ChatMessage[] | undefined) => {
      if (!list || found[id]) return;
      const hit = list.find((m) => m.content.toLowerCase().includes(query));
      if (hit) {
        const index = hit.content.toLowerCase().indexOf(query);
        const start = Math.max(0, index - 28);
        found[id] = `…${hit.content.slice(start, start + 82).replace(/\s+/g, " ")}…`;
      }
    };
    if (!auth.isMember) {
      loadLocalConversations().forEach((convo) => scan(convo.id, convo.messages));
    } else {
      scan(convoId || "", messages);
    }
    return found;
  }, [auth.isMember, convoId, messages, search]);

  const contextTokens = useMemo(
    () => messages.reduce((sum, m) => sum + estimateTokens(m.content), 0),
    [messages]
  );
  const contextWindow = 200_000;
  const contextRatio = Math.min(1, contextTokens / contextWindow);
  const lastAnswerMs = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant" && m.ms)?.ms,
    [messages]
  );
  const paletteActions: PaletteAction[] = useMemo(
    () => [
      { id: "new", group: isSv ? "Chatt" : "Chat", label: isSv ? "Ny chatt" : "New chat", hint: "⌘N", icon: <MessageSquarePlus className="h-3.5 w-3.5" />, run: () => void newChat() },
      { id: "library", group: isSv ? "Chatt" : "Chat", label: isSv ? "Promptbibliotek" : "Prompt library", icon: <SquareLibrary className="h-3.5 w-3.5" />, run: () => setLibraryOpen(true) },
      { id: "export-md", group: isSv ? "Chatt" : "Chat", label: isSv ? "Exportera som Markdown" : "Export as Markdown", hint: "⌘E", icon: <Download className="h-3.5 w-3.5" />, run: () => exportThread("md") },
      { id: "export-json", group: isSv ? "Chatt" : "Chat", label: isSv ? "Exportera som JSON" : "Export as JSON", icon: <Download className="h-3.5 w-3.5" />, run: () => exportThread("json") },
      {
        id: "voice",
        group: isSv ? "Chatt" : "Chat",
        label: isSv ? "Röstläge" : "Voice mode",
        hint: isSv ? "Prata fritt med BudAI" : "Talk hands-free with BudAI",
        icon: <AudioLines className="h-3.5 w-3.5" />,
        run: () => setVoiceOpen(true),
      },
      {
        id: "compare",
        group: isSv ? "Chatt" : "Chat",
        label: isSv ? (compare ? "Stäng av jämförelse" : "Jämför två svar") : compare ? "Turn off compare" : "Compare two answers",
        hint: isSv ? "Två förslag sida vid sida" : "Two options side by side",
        icon: <SplitSquareHorizontal className="h-3.5 w-3.5" />,
        run: () => setCompare((v) => !v),
      },
      {
        id: "notes",
        group: isSv ? "Visa" : "View",
        label: isSv ? "Anteckningar" : "Notes",
        hint: isSv ? "Sparade utdrag från svar" : "Snippets saved from answers",
        icon: <StickyNote className="h-3.5 w-3.5" />,
        run: () => setNotesOpen(true),
      },
      { id: "gallery", group: isSv ? "Visa" : "View", label: isSv ? "Galleri" : "Gallery", icon: <GalleryHorizontalEnd className="h-3.5 w-3.5" />, run: () => setGalleryOpen(true) },
      { id: "stats", group: isSv ? "Visa" : "View", label: isSv ? "Insikter" : "Insights", icon: <BarChart3 className="h-3.5 w-3.5" />, run: () => setStatsOpen(true) },
      { id: "panel", group: isSv ? "Visa" : "View", label: isSv ? "Växla panel" : "Toggle panel", hint: "⌘B", icon: <PanelRight className="h-3.5 w-3.5" />, run: () => setInspector((prev) => prev || { title: "Panel", body: messages.at(-1)?.content || "" }) },
      { id: "expand", group: isSv ? "Visa" : "View", label: isSv ? "Helskärm" : "Full screen", hint: "⌘J", icon: <Maximize2 className="h-3.5 w-3.5" />, run: () => setExpanded((v) => !v) },
      { id: "memory", group: isSv ? "Inställningar" : "Settings", label: isSv ? "Minne" : "Memory", icon: <BrainCircuit className="h-3.5 w-3.5" />, run: () => setMemoryOpen(true) },
      { id: "settings", group: isSv ? "Inställningar" : "Settings", label: isSv ? "Inställningar" : "Preferences", icon: <Settings2 className="h-3.5 w-3.5" />, run: () => setSettingsOpen(true) },
      { id: "shortcuts", group: isSv ? "Inställningar" : "Settings", label: isSv ? "Tangentbord" : "Keyboard shortcuts", hint: "⌘/", icon: <Keyboard className="h-3.5 w-3.5" />, run: () => setShortcutsOpen(true) },
      ...(auth.isMember
        ? [{ id: "temp", group: isSv ? "Chatt" : "Chat", label: isSv ? "Tillfällig chatt" : "Temporary chat", icon: <Command className="h-3.5 w-3.5" />, run: () => void newChat({ temporary: true }) }]
        : [{ id: "signin", group: isSv ? "Konto" : "Account", label: isSv ? "Logga in" : "Sign in", icon: <LogIn className="h-3.5 w-3.5" />, run: () => auth.openAuth() }]),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth, compare, exportThread, isSv, messages, newChat]
  );

  const libraryPrompts = useMemo(
    () => LIBRARY_PROMPTS.slice(0, 6).map((p) => ({ id: p.id, title: p.title[lang], body: p.body[lang], icon: p.icon })),
    [lang]
  );

  const surprise = useCallback(() => {
    const spark = SPARKS[lang][Math.floor(Math.random() * SPARKS[lang].length)];
    setInput(spark);
  }, [lang]);

  return (
    <div
      className={`pgx-shell ${expanded ? "is-expanded" : ""} ${settings.reduceEffects ? "is-calm" : ""}`}
      data-accent={settings.accent || "aurora"}
      onDragOver={(event) => {
        if (event.dataTransfer?.types?.includes("Files")) {
          event.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer?.files?.[0];
        if (file) void ingestFile(file);
      }}
    >
      <input ref={fileRef} type="file" accept="image/*,.txt,.md,.markdown,.json,.csv,.tsv,.log,.yml,.yaml,.ts,.tsx,.js,.jsx,.py,.css,.html,.sql,.sh" className="hidden" onChange={onFileInput} />

      {/* header */}
      <div className="pgx-header">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) setDrawerOpen(true);
              else setSidebarOpen((v) => !v);
            }}
            className="pgx-icon-btn"
            aria-label={isSv ? "Visa chattar" : "Show chats"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <BudAILogo size="sm" animated motion={busy ? "thinking" : "idle"} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold tracking-tight text-white">
                Bud<span className="text-accent-cyan">AI</span>
              </span>
              {temporary && <span className="pgx-tag pgx-tag--warn">{isSv ? "Tillfällig" : "Temporary"}</span>}
            </div>
            {renamingTitle ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (convoId && titleDraft.trim()) void renameConversation(convoId, titleDraft.trim());
                  setRenamingTitle(false);
                }}
              >
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={() => setRenamingTitle(false)}
                  className="pgx-title-input"
                  maxLength={80}
                />
              </form>
            ) : (
              <button
                type="button"
                className="pgx-title-button"
                disabled={!convoId}
                onClick={() => {
                  const current = history.find((c) => c.id === convoId)?.title || "";
                  setTitleDraft(current);
                  setRenamingTitle(true);
                }}
                title={isSv ? "Byt namn på chatten" : "Rename this chat"}
              >
                <span className="truncate">
                  {history.find((c) => c.id === convoId)?.title ||
                    (isSv ? "Ny chatt" : "New chat")}
                </span>
                <Pencil className="h-3 w-3 shrink-0 opacity-50" />
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="pgx-command-hint hidden md:inline-flex"
            title={isSv ? "Kommandopalett" : "Command palette"}
          >
            <Command className="h-3.5 w-3.5" />
            <span>{isSv ? "Kommandon" : "Commands"}</span>
            <kbd>⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => void newChat()}
            className="pgx-icon-btn"
            title={isSv ? "Ny chatt" : "New chat"}
            aria-label={isSv ? "Ny chatt" : "New chat"}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setInspector((prev) => (prev ? null : { title: isSv ? "Senaste svaret" : "Latest answer", body: [...messages].reverse().find((m) => m.role === "assistant")?.content || "" }))}
            className={`pgx-icon-btn hidden sm:inline-flex ${inspector ? "is-active" : ""}`}
            title={isSv ? "Panel" : "Panel"}
            aria-label={isSv ? "Växla panel" : "Toggle panel"}
          >
            <PanelRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setVoiceOpen(true);
              playSound("open");
            }}
            className="pgx-icon-btn hidden sm:inline-flex"
            title={isSv ? "Röstläge" : "Voice mode"}
            aria-label={isSv ? "Röstläge" : "Voice mode"}
          >
            <AudioLines className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="pgx-icon-btn hidden sm:inline-flex"
            title={isSv ? "Galleri" : "Gallery"}
            aria-label={isSv ? "Galleri" : "Gallery"}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exportThread("md")}
            disabled={!messages.length}
            className="pgx-icon-btn hidden sm:inline-flex"
            title={isSv ? "Exportera konversation (⌘E)" : "Export conversation (⌘E)"}
            aria-label={isSv ? "Exportera konversation" : "Export conversation"}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="pgx-icon-btn hidden sm:inline-flex"
            title={expanded ? (isSv ? "Stäng helskärm" : "Exit full screen") : isSv ? "Helskärm" : "Full screen"}
            aria-label={isSv ? "Helskärm" : "Full screen"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {auth.isMember ? (
            <button type="button" onClick={() => void auth.signOut()} className="pgx-icon-btn" title={isSv ? "Logga ut" : "Sign out"}>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={() => auth.openAuth()} className="pgx-signin-chip">
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isSv ? "Logga in" : "Sign in"}</span>
            </button>
          )}
        </div>
      </div>

      {/* live status rail */}
      <div className="pgx-status-rail">
        <span className={`pgx-status-item ${busy ? "pgx-status-live" : ""}`}>
          {busy ? <span className="pgx-status-dot" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/25" />}
          {busy
            ? activity === "typing"
              ? isSv
                ? "Strömmar svar…"
                : "Streaming…"
              : isSv
                ? "Arbetar…"
                : "Working…"
            : isSv
              ? "Redo"
              : "Ready"}
        </span>
        <span className="pgx-status-item">
          <Sparkles className="h-3 w-3" />
          {PERSONAS.find((p) => p.id === (settings.persona || "core"))?.label[lang]}
        </span>
        <span className="pgx-status-item">
          {isSv ? "Djup" : "Depth"}: {EFFORT_OPTIONS.find((e) => e.id === (settings.effort || "balanced"))?.label[lang]}
        </span>
        <span className="pgx-status-item">
          {isSv ? "Stil" : "Style"}: {STYLE_OPTIONS.find((x) => x.id === (settings.style || "balanced"))?.label[lang]}
        </span>
        <span className="pgx-status-item">
          {estimateTokens(messages.map((m) => m.content).join(" "))} tok
        </span>
        <span className="pgx-status-item">
          <span>{isSv ? "Kontext" : "Context"}</span>
          <span className="pgx-status-meter" aria-hidden>
            <span style={{ width: `${Math.max(2, contextRatio * 100)}%` }} />
          </span>
        </span>
        {lastAnswerMs ? (
          <span className="pgx-status-item">
            {(lastAnswerMs / 1000).toFixed(1)}s {isSv ? "senaste svar" : "last reply"}
          </span>
        ) : null}
        <span className="pgx-status-item ml-auto">
          {auth.isMember ? (isSv ? "Konto" : "Account") : isSv ? "Gäst" : "Guest"}
        </span>
      </div>

      {/* body */}
      <div className="pgx-body">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 268, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pgx-sidebar-wrap hidden lg:block"
            >
              <Sidebar
                lang={lang}
                history={history}
                grouped={grouped}
                activeId={convoId}
                search={search}
                onSearch={setSearch}
                onNew={() => void newChat()}
                onTemporary={() => void newChat({ temporary: true })}
                onLoad={(id) => void loadConversation(id)}
                onRename={(id, title) => void renameConversation(id, title)}
                onDelete={(id) => void removeConversation(id)}
                onTogglePin={togglePin}
                creating={creating}
                isMember={auth.isMember}
                isGuest={auth.isGuest}
                remaining={auth.remaining.messages}
                limit={auth.limits.messagesPerDay}
                memoryCount={memory.length}
                memoryEnabled={memoryEnabled}
                onOpenMemory={() => setMemoryOpen(true)}
                onOpenStats={() => setStatsOpen(true)}
                onOpenSettings={() => setSettingsOpen(true)}
                onSignIn={() => auth.openAuth()}
                onSignOut={() => void auth.signOut()}
                userName={auth.displayName}
                snippets={snippets}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="pgx-main">
          <div id="pgx-input-anchor" />
          <AnimatePresence>
            {tipOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pgx-tips-wrap"
              >
                <div className="pgx-tips">
                  <span className="pgx-tips-mark">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="pgx-tips-copy">
                    <strong>{isSv ? "Snabbtips" : "Quick tips"}</strong>
                    <span>
                      {isSv
                        ? "⌘K öppnar kommandon · / i fältet ger genvägar · bifoga en fil eller bild · ⌘N startar en ny chatt"
                        : "⌘K opens commands · / in the field gives shortcuts · attach a file or image · ⌘N starts a new chat"}
                    </span>
                  </div>
                  <button type="button" onClick={dismissTips} className="pgx-mini-btn" aria-label={isSv ? "Stäng tips" : "Dismiss tips"}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <MessageList
            lang={lang}
            messages={messages}
            dualPick={dualPick}
            onPickOption={(messageId, option) => {
              setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: option.body } : m)));
              setDualPick((prev) => {
                const next = { ...prev };
                delete next[messageId];
                return next;
              });
              if (option.body.length > 380) setInspector({ title: option.title, body: option.body });
              playSound("tick");
            }}
            onRegenerate={regenerateVariant}
            onTransform={applyTransform}
            onVariant={switchVariant}
            onSaveNote={addNote}
            onEdit={editMessage}
            onBranch={(message) => void branchFrom(message)}
            onCopy={(text) => void copyText(text)}
            onSpeak={speak}
            onRate={(id, rating) => {
              setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, rating } : m)));
              showToast("ok", rating === "up" ? (isSv ? "Tack — bra svar" : "Thanks — good answer") : isSv ? "Tack — vi tar det vidare" : "Thanks — noted");
            }}
            onDeleteMessage={deleteMessage}
            onOpenWorkspace={(message) => setInspector({ title: titleFromMessages([message]), body: message.content })}
            onLightbox={setLightbox}
            onImageVariation={(message) => {
              const prompt = [...messages].reverse().find((m) => m.role === "user")?.content || message.content;
              void runImageGen(isSv ? `Variation av: ${prompt}` : `Variation of: ${prompt}`);
            }}
            onSuggestion={(text) => void runPrompt(text)}
            onSurprise={surprise}
            onOpenLibrary={() => setLibraryOpen(true)}
            greeting={greeting}
            userInitial={(auth.displayName || "Du").slice(0, 1).toUpperCase()}
            prompts={libraryPrompts}
            busy={busy}
            activity={activity}
            typingText={typingText}
            thinkingStep={thinkingStep}
            elapsedMs={elapsedMs}
            speakingId={speakingId}
            showTimestamps={settings.showTimestamps !== false}
            reduceEffects={settings.reduceEffects === true}
          />

          {lastFailed && (
            <div className="pgx-retry">
              <span className="min-w-0 flex-1 truncate text-[12px] text-white/60">
                {isSv ? "Det gick inte att slutföra." : "That didn't complete."}
              </span>
              <button
                type="button"
                className="pgx-text-btn"
                onClick={() => {
                  const failed = lastFailed;
                  setLastFailed(null);
                  setMessages((prev) => prev.filter((m) => !m.error));
                  if (failed) void runPrompt(failed.prompt, { image: failed.image });
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isSv ? "Försök igen" : "Try again"}
              </button>
              <button type="button" className="pgx-text-btn" onClick={() => setLastFailed(null)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <Composer
            lang={lang}
            value={input}
            onChange={setInput}
            onSubmit={() => void runPrompt(input)}
            onStop={stopAll}
            busy={busy}
            attach={attach}
            onPickFile={() => fileRef.current?.click()}
            onClearAttach={() => setAttach(null)}
            listening={listening}
            onToggleMic={toggleMic}
            genMode={genMode}
            onToggleGen={() => setGenMode((v) => !v)}
            compare={compare}
            onImprove={() => void improvePrompt()}
            improving={improving}
            onToggleCompare={() => {
              setCompare((v) => !v);
              showToast(
                "ok",
                compare
                  ? isSv
                    ? "Jämförelse av — en kolumn igen"
                    : "Compare off — single column again"
                  : isSv
                    ? "Jämförelse på — du får två förslag att välja mellan"
                    : "Compare on — you'll get two options to pick from"
              );
            }}
            imageGenEnabled={imageGenEnabled}
            placeholder={placeholder}
            persona={settings.persona || "core"}
            style={settings.style || "balanced"}
            effort={settings.effort || "balanced"}
            onPersona={(persona: PersonaId) => patch({ persona })}
            onStyle={(style: StyleId) => patch({ style })}
            onEffort={(effort: EffortId) => patch({ effort })}
            onOpenLibrary={() => setLibraryOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
            dragOver={dragOver}
            onRecall={() => lastPromptRef.current}
            onOpenVoice={() => {
              setVoiceOpen(true);
              playSound("open");
            }}
          />
        </div>

        <InspectorPanel
          open={Boolean(inspector)}
          lang={lang}
          title={inspector?.title || ""}
          body={inspector?.body || ""}
          onClose={() => setInspector(null)}
        />
      </div>

      {/* mobile drawer */}
      <Portal>
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pgx-drawer-layer">
            <button type="button" className="pgx-modal-backdrop" onClick={() => setDrawerOpen(false)} aria-label="close" />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="pgx-drawer"
            >
              <Sidebar
                lang={lang}
                history={history}
                grouped={grouped}
                activeId={convoId}
                search={search}
                onSearch={setSearch}
                onNew={() => void newChat()}
                onTemporary={() => void newChat({ temporary: true })}
                onLoad={(id) => void loadConversation(id)}
                onRename={(id, title) => void renameConversation(id, title)}
                onDelete={(id) => void removeConversation(id)}
                onTogglePin={togglePin}
                creating={creating}
                isMember={auth.isMember}
                isGuest={auth.isGuest}
                remaining={auth.remaining.messages}
                limit={auth.limits.messagesPerDay}
                memoryCount={memory.length}
                memoryEnabled={memoryEnabled}
                onOpenMemory={() => {
                  setMemoryOpen(true);
                  setDrawerOpen(false);
                }}
                onOpenStats={() => {
                  setStatsOpen(true);
                  setDrawerOpen(false);
                }}
                onOpenSettings={() => {
                  setSettingsOpen(true);
                  setDrawerOpen(false);
                }}
                onSignIn={() => auth.openAuth()}
                onSignOut={() => void auth.signOut()}
                onClose={() => setDrawerOpen(false)}
                userName={auth.displayName}
                snippets={snippets}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      {/* modals */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} lang={lang} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} lang={lang} />
      <PromptLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onUse={(text) => {
          setInput(text);
          setLibraryOpen(false);
        }}
        lang={lang}
      />
      <MemoryPanel
        open={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        lang={lang}
        items={memory}
        enabled={memoryEnabled}
        onToggle={(value) => {
          setMemoryEnabled(value);
          if (auth.isMember) void cloud.setMemoryEnabled(value);
        }}
        onAdd={(text) => {
          if (!auth.isMember) {
            auth.openAuth(isSv ? "Minne kräver ett konto" : "Memory needs an account");
            return;
          }
          void cloud.addManualMemory(text).then(() => void reloadHistory());
        }}
        onUpdate={(id, text) => void cloud.updateMemory(id, text).then(() => void reloadHistory())}
        onDelete={(id) => void cloud.deleteMemory(id).then(() => void reloadHistory())}
        onClear={() => void cloud.clearMemories().then(() => void reloadHistory())}
      />
      <StatsPanel open={statsOpen} onClose={() => setStatsOpen(false)} lang={lang} messages={messages} />
      <NotesPanel
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        lang={lang}
        notes={notes}
        onDelete={(id) => {
          deleteNote(id);
          setNotes(loadNotes());
        }}
        onClear={() => {
          clearNotes();
          setNotes([]);
        }}
      />
      <GalleryPanel open={galleryOpen} onClose={() => setGalleryOpen(false)} lang={lang} messages={messages} onLightbox={setLightbox} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
        accent={(settings.accent || "aurora") as AccentId}
        sound={settings.sound !== false}
        stream={settings.stream !== false}
        showTimestamps={settings.showTimestamps !== false}
        reduceEffects={settings.reduceEffects === true}
        persona={settings.persona || "core"}
        style={settings.style || "balanced"}
        effort={settings.effort || "balanced"}
        answerLang={(settings.answerLang || lang) as Lang}
        onAccent={(accent) => patch({ accent })}
        onSound={(sound) => patch({ sound })}
        onStream={(stream) => patch({ stream })}
        onTimestamps={(showTimestamps) => patch({ showTimestamps })}
        onReduceEffects={(reduceEffects) => patch({ reduceEffects })}
        onPersona={(persona) => patch({ persona: persona as PersonaId })}
        onStyle={(style) => patch({ style: style as StyleId })}
        onEffort={(effort) => patch({ effort: effort as EffortId })}
        onAnswerLang={(answerLang) => patch({ answerLang })}
        customInstructions={settings.customInstructions || ""}
        onCustomInstructions={(customInstructions) => patch({ customInstructions })}
      />

      {/* lightbox */}
      <Portal>
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pgx-lightbox"
            onClick={() => setLightbox(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="" />
            <a href={lightbox} download="budai-image.png" className="pgx-lightbox-download" onClick={(e) => e.stopPropagation()}>
              <Download className="h-4 w-4" />
              {isSv ? "Ladda ner" : "Download"}
            </a>
            <button type="button" className="pgx-lightbox-close" aria-label="close">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className={`pgx-toast is-${toast.kind}`}
            role="status"
          >
            <span className="pgx-toast-dot" />
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceMode
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        lang={lang}
        persona={PERSONAS.find((p) => p.id === (settings.persona || "core")) || PERSONAS[0]}
        onAsk={(text) => {
          setVoiceReply(null);
          void runPrompt(text);
        }}
        reply={voiceReply}
        thinking={busy}
        onSpoken={() => setVoiceReply(null)}
        ttsEnabled={voiceTts}
        onToggleTts={() => setVoiceTts((v) => !v)}
      />

      {/* persona ribbon — quick switch, always visible */}
      <div className="pgx-persona-bar">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            type="button"
            onClick={() => patch({ persona: persona.id })}
            className={`pgx-persona-chip ${settings.persona === persona.id ? "is-active" : ""}`}
            style={{ ["--persona-accent" as string]: persona.accent }}
            title={persona.blurb[lang]}
          >
            <span className="pgx-persona-glyph">{persona.glyph}</span>
            <span className="hidden sm:inline">{persona.label[lang]}</span>
          </button>
        ))}
        <span className="pgx-persona-spacer" />
        <button
          type="button"
          onClick={() => setNotesOpen(true)}
          className="pgx-persona-chip is-ghost"
          title={isSv ? "Anteckningar" : "Notes"}
        >
          <StickyNote className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => setShortcutsOpen(true)} className="pgx-persona-chip is-ghost" title={isSv ? "Tangentbord" : "Keyboard"}>
          <Keyboard className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => setLibraryOpen(true)} className="pgx-persona-chip is-ghost" title={isSv ? "Promptbibliotek" : "Prompt library"}>
          <Layers className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
