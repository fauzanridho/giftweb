import kaplay, { type KAPLAYCtx } from "kaplay";

let kInstance: KAPLAYCtx | null = null;

export function initKaplay(canvas: HTMLCanvasElement): KAPLAYCtx {
  if (kInstance) return kInstance;

  const k = kaplay({
    canvas,
    width: 320,
    height: 240,
    letterbox: true,
    crisp: true,
    background: [30, 25, 35],
    global: false,
    touchToMouse: true,
    maxFPS: 60,
  });

  kInstance = k;
  return k;
}

export function cleanupKaplay() {
  if (kInstance) {
    try {
      kInstance.quit();
    } catch {
      // ignore
    }
    kInstance = null;
  }
}

export function getKaplay(): KAPLAYCtx | null {
  return kInstance;
}

