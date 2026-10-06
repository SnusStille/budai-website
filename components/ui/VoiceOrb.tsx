"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type Rec = {
  start(): void;
  abort(): void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type State = "listening" | "thinking" | "speaking" | "unsupported";

const clean = (t: string) => t.replace(/```[\s\S]*?```/g, " ").replace(/[*_#>`~|]+/g, " ").replace(/\s+/g, " ").trim();

/** Voice mode: speak, BudAI answers out loud. The orb reacts to your mic level and to the reply. */
export default function VoiceOrb({ open, sv, busy, reply, onSend, onClose }: {
  open: boolean; sv: boolean; busy: boolean; reply: string; onSend: (t: string) => void; onClose: () => void;
}) {
  const [state, setState] = useState<State>("listening");
  const orb = useRef<HTMLDivElement>(null);
  const rec = useRef<Rec | null>(null);
  const live = useRef(false);
  const awaiting = useRef(false);
  const spoken = useRef(reply);
  const st = useRef<State>("listening");
  const latest = useRef({ sv, onSend, reply });
  latest.current = { sv, onSend, reply };
  st.current = state;

  const listen = () => {
    if (!live.current) return;
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setState("unsupported");
      return;
    }
    const r = new Ctor();
    r.lang = latest.current.sv ? "sv-SE" : "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript?.trim();
      if (t) {
        awaiting.current = true;
        setState("thinking");
        latest.current.onSend(t);
      }
    };
    r.onend = () => {
      if (live.current && !awaiting.current && !window.speechSynthesis.speaking) window.setTimeout(listen, 250);
    };
    r.onerror = () => {};
    rec.current = r;
    try {
      r.start();
      setState("listening");
    } catch {
      /* already started */
    }
  };

  useEffect(() => {
    if (!open) return;
    live.current = true;
    awaiting.current = false;
    spoken.current = latest.current.reply;
    listen();
    let raf = 0;
    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((s) => {
        if (!live.current) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        ctx = new AudioContext();
        const an = ctx.createAnalyser();
        an.fftSize = 256;
        ctx.createMediaStreamSource(s).connect(an);
        const buf = new Uint8Array(an.frequencyBinCount);
        const loop = () => {
          an.getByteFrequencyData(buf);
          const lvl = st.current === "listening" ? buf.reduce((a, b) => a + b, 0) / buf.length / 140 : 0;
          orb.current?.style.setProperty("--lvl", Math.min(1, lvl).toFixed(3));
          raf = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch(() => {});
    return () => {
      live.current = false;
      cancelAnimationFrame(raf);
      rec.current?.abort();
      window.speechSynthesis?.cancel();
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close().catch(() => {});
    };
  }, [open]);

  useEffect(() => {
    if (!open || !awaiting.current || busy || !reply || reply === spoken.current) return;
    const u = new SpeechSynthesisUtterance(clean(reply));
    u.lang = sv ? "sv-SE" : "en-US";
    const done = () => {
      awaiting.current = false;
      spoken.current = reply;
      listen();
    };
    u.onend = done;
    u.onerror = done;
    setState("speaking");
    window.speechSynthesis.speak(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply, busy, open]);

  if (!open) return null;
  const label =
    state === "listening" ? (sv ? "Lyssnar…" : "Listening…")
    : state === "thinking" ? (sv ? "Tänker…" : "Thinking…")
    : state === "speaking" ? (sv ? "Svarar…" : "Speaking…")
    : sv ? "Röstläge kräver Chrome, Edge eller Safari" : "Voice mode needs Chrome, Edge or Safari";

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#020205]/95 backdrop-blur-xl" role="dialog" aria-label="Voice mode">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 rounded-full border border-white/10 p-2.5 text-white/70 hover:text-white">
        <X className="h-5 w-5" />
      </button>
      <div className="relative flex h-72 w-72 items-center justify-center">
        {state !== "unsupported" && <span className="absolute h-56 w-56 animate-ping rounded-full border border-accent-cyan/20" style={{ animationDuration: "2.8s" }} />}
        <div ref={orb} onClick={() => window.speechSynthesis.cancel()} className={`bud-orb ${state}`} />
      </div>
      <p className="mt-6 text-lg text-white/80">{label}</p>
      <p className="mt-2 text-xs text-white/35">{sv ? "Tryck på kulan för att avbryta svaret" : "Tap the orb to interrupt the reply"}</p>
    </div>
  );
}
