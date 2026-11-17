// Synthesizer Efek Suara Prosedural via Web Audio API
// 100% dari kode, zero external audio asset.

let audioCtx: AudioContext | null = null;
let isMuted = false;
let isPoliteMode = false; // Mode sopan (tanpa bunyi toot)
let masterVolume = 0.8;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundSettings = {
  setMute(mute: boolean) {
    isMuted = mute;
  },
  setPoliteMode(polite: boolean) {
    isPoliteMode = polite;
  },
  setVolume(vol: number) {
    masterVolume = Math.max(0, Math.min(1, vol));
  },
  isPolite: () => isPoliteMode,
  isMuted: () => isMuted,
};

// 1. Langkah Kaki (Soft noise thud)
export function playStep() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = "sine";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

  gain.gain.setValueAtTime(0.08 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.07);
}

// 2. Klik UI (Bright chirp)
export function playClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = "triangle";
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

  gain.gain.setValueAtTime(0.15 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

// 3. Dialog Blip (Typewriter text tick)
export function playDialogBlip() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = "square";
  // Frekuensi sedikit diacak agar bervariasi ala Animal Crossing
  const pitch = 320 + Math.random() * 80;
  osc.frequency.setValueAtTime(pitch, now);

  gain.gain.setValueAtTime(0.05 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

// 4. Koin / Pentol Didapat (Retro coin chime)
export function playCoin() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc2.type = "sine";

  // Nada B5 lalu E6
  osc1.frequency.setValueAtTime(987.77, now);
  osc1.frequency.setValueAtTime(1318.51, now + 0.08);

  gain.gain.setValueAtTime(0.2 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.36);
}

// 5. Sistem Suara Toot (3 Varian Lucu & Imut)
export function playToot(variant: 1 | 2 | 3 = 1) {
  if (isMuted || isPoliteMode) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (variant === 1) {
    // Varian 1: "Squeak" melengking lucu
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(190, now + 0.15);
    osc.frequency.linearRampToValueAtTime(310, now + 0.25);

    gain.gain.setValueAtTime(0.15 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  } else if (variant === 2) {
    // Varian 2: "Poof" pendek empuk
    osc.type = "triangle";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.18);

    gain.gain.setValueAtTime(0.25 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  } else {
    // Varian 3: "Bassy flutter" geter beruntun
    osc.type = "square";
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.setValueAtTime(80, now + 0.08);
    osc.frequency.setValueAtTime(110, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.32);

    gain.gain.setValueAtTime(0.12 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }
}

// 6. Sukses Puzzle / Romantis Chime (Arpeggio lembut)
export function playSuccess() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime + idx * 0.09;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.15 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  });
}

