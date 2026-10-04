"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { VOICE_STATES, VOICE_TIPS, type Persona } from "@/lib/playground/prompts";

type Lang = "sv" | "en";

type Phase = "idle" | "listening" | "thinking" | "speaking";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
        resultIndex: number;
      }) => void)
    | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  persona: Persona;
  onAsk: (text: string) => void;
  reply: { id: string; text: string } | null;
  thinking: boolean;
  onSpoken: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
};

/**
 * Hands-free conversation mode.
 * Speech recognition stays open, so you can interrupt BudAI simply by talking.
 */
export default function VoiceMode({
  open,
  onClose,
  lang,
  persona,
  onAsk,
  reply,
  thinking,
  onSpoken,
  ttsEnabled,
  onToggleTts,
}: Props) {
  const isSv = lang === "sv";
  const [phase, setPhase] = useState<Phase>("idle");
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenRef = useRef<string | null>(null);
  const levelRef = useRef(0);
  const [level, setLevel] = useState(0);

  /* keep a live mic level so the orb reacts to the voice */
  useEffect(() => {
    if (!open || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let ctx: AudioContext | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        ctx = new Ctor();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const next = Math.min(1, sum / data.length / 90);
          levelRef.current = levelRef.current * 0.7 + next * 0.3;
          setLevel(levelRef.current);
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        /* mic denied — the recognition flow will surface it */
      }
    };
    void start();

    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
      void ctx?.close();
    };
  }, [open]);

  /* speech recognition loop */
  useEffect(() => {
    if (!open) return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setError(
        isSv
          ? "Röstläge kräver en webbläsare med taligenkänning (Chrome eller Edge)."
          : "Voice mode needs a browser with speech recognition (Chrome or Edge)."
      );
      return;
    }

    let stop = false;
    const recognition = new Ctor();
    recognition.lang = lang === "sv" ? "sv-SE" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setPhase((current) => (current === "speaking" ? current : "listening"));
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const row = event.results[i];
        const text = row?.[0]?.transcript || "";
        if (row?.isFinal) finalText += text;
        else interim += text;
      }
      setPartial(interim || finalText);
      if (finalText.trim().length > 1) {
        if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
        setPartial("");
        setPhase("thinking");
        onAsk(finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        setError(
          isSv ? "Mikrofonen nekades. Tillåt mikrofon och försök igen." : "Microphone was blocked. Allow it and try again."
        );
      } else if (event?.error && event.error !== "no-speech" && event.error !== "aborted") {
        setError(isSv ? "Röstigenkänningen tappade kontakten — lyssnar igen." : "Speech recognition dropped — listening again.");
      }
    };

    recognition.onend = () => {
      if (stop) return;
      try {
        recognition.start();
      } catch {
        /* restarting too fast is fine to skip */
      }
    };

    try {
      recognition.start();
      recogRef.current = recognition;
    } catch {
      setError(isSv ? "Kunde inte starta mikrofonen." : "Could not start the microphone.");
    }

    return () => {
      stop = true;
      try {
        recognition.stop();
      } catch {
        /* */
      }
      recogRef.current = null;
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [open, lang, isSv, onAsk]);

  /* thinking → speaking handoff */
  useEffect(() => {
    if (!open) return;
    if (thinking) setPhase("thinking");
  }, [open, thinking]);

  /* speak new replies */
  useEffect(() => {
    if (!open || !reply) return;
    if (spokenRef.current === reply.id) return;
    spokenRef.current = reply.id;
    if (!ttsEnabled) {
      setPhase("listening");
      onSpoken();
      return;
    }
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setPhase("listening");
      onSpoken();
      return;
    }
    window.speechSynthesis.cancel();
    const clean = reply.text.replace(/```[\s\S]*?```/g, " ").replace(/[#*_`>]/g, "").slice(0, 1200);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang === "sv" ? "sv-SE" : "en-US";
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.onstart = () => setPhase("speaking");
    utterance.onend = () => {
      setPhase("listening");
      onSpoken();
    };
    utterance.onerror = () => {
      setPhase("listening");
      onSpoken();
    };
    window.speechSynthesis.speak(utterance);
  }, [open, reply, ttsEnabled, lang, onSpoken]);

  useEffect(() => {
    if (open) return;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setPhase("idle");
    setPartial("");
  }, [open]);

  const stateLabel = VOICE_STATES[lang][phase];
  const tip = VOICE_TIPS[lang][0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pgv-layer"
          role="dialog"
          aria-modal="true"
          aria-label={isSv ? "Röstläge" : "Voice mode"}
        >
          <div className="pgv-backdrop" aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pgv-panel"
          >
            <div className="pgv-head">
              <span className="pgv-head-title">
                <Sparkles className="h-3.5 w-3.5" />
                {isSv ? "Röstläge" : "Voice mode"}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onToggleTts}
                  className={`pgv-toggle ${ttsEnabled ? "is-on" : ""}`}
                  title={isSv ? "Läs upp svar automatiskt" : "Read replies aloud automatically"}
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span>{isSv ? "Röst ut" : "Speak replies"}</span>
                </button>
                <button type="button" onClick={onClose} className="pgx-icon-btn" aria-label={isSv ? "Stäng" : "Close"}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="pgv-stage">
              <div
                className={`pgv-orb is-${phase}`}
                style={{ ["--pgv-level" as string]: level.toFixed(3) }}
                aria-hidden
              >
                <span className="pgv-orb-ring pgv-orb-ring--a" />
                <span className="pgv-orb-ring pgv-orb-ring--b" />
                <span className="pgv-orb-ring pgv-orb-ring--c" />
                <span className="pgv-orb-core">
                  <BudAILogo size="lg" motion={phase === "thinking" ? "thinking" : "idle"} animated />
                </span>
              </div>

              <div className="pgv-status" aria-live="polite">
                <span className="pgv-state">
                  {phase === "listening" && (
                    <span className="pgv-mic-bars" aria-hidden>
                      <i style={{ height: `${10 + level * 26}px` }} />
                      <i style={{ height: `${16 + level * 34}px` }} />
                      <i style={{ height: `${8 + level * 22}px` }} />
                      <i style={{ height: `${14 + level * 30}px` }} />
                    </span>
                  )}
                  {phase === "listening" ? <Mic className="h-3.5 w-3.5" /> : null}
                  {phase === "thinking" ? <Sparkles className="h-3.5 w-3.5" /> : null}
                  {phase === "speaking" ? <Volume2 className="h-3.5 w-3.5" /> : null}
                  {stateLabel}
                </span>
                <p className="pgv-persona">
                  {persona.glyph} {persona.label[lang]} · {persona.blurb[lang]}
                </p>
              </div>

              <div className="pgv-transcript">
                {partial ? (
                  <p className="pgv-partial">{partial}</p>
                ) : reply ? (
                  <p className="pgv-reply">{reply.text.slice(0, 320)}{reply.text.length > 320 ? "…" : ""}</p>
                ) : (
                  <p className="pgv-hint">{tip}</p>
                )}
              </div>

              {error && (
                <p className="pgv-error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="pgv-foot">
              <button
                type="button"
                onClick={() => {
                  const recognition = recogRef.current;
                  if (!recognition) return;
                  try {
                    recognition.stop();
                  } catch {
                    /* */
                  }
                  setPhase("idle");
                  onClose();
                }}
                className="pgv-stop"
              >
                <MicOff className="h-4 w-4" />
                {isSv ? "Avsluta röstläget" : "End voice mode"}
              </button>
              <span className="pgv-note">
                {isSv ? "Röst bearbetas av webbläsaren — inget spelas in av oss." : "Speech is handled by your browser — we record nothing."}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
