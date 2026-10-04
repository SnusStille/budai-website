/** Tiny WebAudio UI sounds — no assets, no autoplay issues (created on demand). */

type Kind = "send" | "receive" | "tick" | "error" | "open" | "success";

let ctx: AudioContext | null = null;
let enabled = true;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function playSound(kind: Kind) {
  if (!enabled) return;
  const ac = audio();
  if (!ac) return;

  const notes: Record<Kind, { f: number[]; dur: number; type: OscillatorType; gain: number }> = {
    send: { f: [523.25, 783.99], dur: 0.12, type: "sine", gain: 0.045 },
    receive: { f: [659.25, 987.77], dur: 0.16, type: "sine", gain: 0.05 },
    tick: { f: [1318.5], dur: 0.03, type: "triangle", gain: 0.012 },
    error: { f: [329.63, 246.94], dur: 0.18, type: "sawtooth", gain: 0.03 },
    open: { f: [440, 587.33], dur: 0.09, type: "sine", gain: 0.03 },
    success: { f: [587.33, 880], dur: 0.2, type: "sine", gain: 0.05 },
  };

  const spec = notes[kind];
  const now = ac.currentTime;

  spec.f.forEach((freq, index) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(freq, now + index * 0.05);
    gain.gain.setValueAtTime(0.0001, now + index * 0.05);
    gain.gain.exponentialRampToValueAtTime(spec.gain, now + index * 0.05 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + spec.dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now + index * 0.05);
    osc.stop(now + index * 0.05 + spec.dur + 0.02);
  });
}
