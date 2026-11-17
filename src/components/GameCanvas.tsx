"use client";

import { useEffect, useRef, useCallback } from "react";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);

  const initGame = useCallback(async () => {
    if (initializedRef.current || !canvasRef.current) return;
    initializedRef.current = true;

    const { initKaplay } = await import("@/game/kaplayInit");
    const { bootScene } = await import("@/game/scenes/boot");

    const k = initKaplay(canvasRef.current);
    bootScene(k);
    k.go("boot");
  }, []);

  useEffect(() => {
    initGame();

    return () => {
      // Cleanup on unmount
      import("@/game/kaplayInit").then(({ cleanupKaplay }) => {
        cleanupKaplay();
        initializedRef.current = false;
      });
    };
  }, [initGame]);

  return (
    <canvas
      ref={canvasRef}
      id="game-canvas"
      style={{
        width: "100dvw",
        height: "100dvh",
        display: "block",
        imageRendering: "pixelated",
        touchAction: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    />
  );
}

