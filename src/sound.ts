let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem("candy-muted") === "1";
} catch {
  /* ignore */
}

export function isMuted() {
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem("candy-muted", v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* ignore */
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.05, delay = 0, endFreq?: number) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export type SfxName = "coin" | "pop" | "error" | "angry" | "night" | "buy" | "arrive";

export function sfx(name: SfxName) {
  switch (name) {
    case "coin":
      tone(784, 0.09, "square", 0.05);
      tone(1175, 0.18, "square", 0.05, 0.08);
      break;
    case "pop":
      tone(520, 0.08, "triangle", 0.08, 0, 880);
      break;
    case "error":
      tone(160, 0.18, "sawtooth", 0.05, 0, 90);
      break;
    case "angry":
      tone(330, 0.25, "sawtooth", 0.045, 0, 110);
      break;
    case "buy":
      tone(440, 0.07, "square", 0.04);
      tone(660, 0.07, "square", 0.04, 0.07);
      tone(880, 0.12, "square", 0.04, 0.14);
      break;
    case "arrive":
      tone(300, 0.06, "triangle", 0.04);
      tone(380, 0.08, "triangle", 0.04, 0.06);
      break;
    case "night":
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, "triangle", 0.07, i * 0.16));
      break;
  }
}
