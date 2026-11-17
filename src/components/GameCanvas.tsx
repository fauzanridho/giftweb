"use client";

import { useEffect, useRef, useCallback } from "react";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);

  const initGame = useCallback(async () => {
    if (initializedRef.current || !canvasRef.current) return;
    initializedRef.current = true;

    const { initKaplay } = await import("@/game/kaplayInit");
    const { loadAllGameAssets } = await import("@/game/assets/loadAll");

    // Impor semua scene Phase 0 - Phase 4
    const { bootScene } = await import("@/game/scenes/boot");
    const { titleScene } = await import("@/game/scenes/title");
    const { introScene } = await import("@/game/scenes/intro");
    const { creatorScene } = await import("@/game/scenes/creator");
    const { hubScene } = await import("@/game/scenes/hub");
    const { schoolScene } = await import("@/game/scenes/school");
    const { baksoScene } = await import("@/game/scenes/bakso");
    const { beachScene } = await import("@/game/scenes/beach");
    const { hillScene } = await import("@/game/scenes/hill");
    const { assetGalleryScene } = await import("@/game/scenes/assetGallery");

    const k = initKaplay(canvasRef.current);

    // 1. Muat semua sprite, tile, karakter, dan props
    loadAllGameAssets(k);

    // 2. Daftarkan alur scenes
    bootScene(k);
    titleScene(k);
    introScene(k);
    creatorScene(k);
    hubScene(k);
    schoolScene(k);
    baksoScene(k);
    beachScene(k);
    hillScene(k);
    assetGalleryScene(k);

    // 3. Mulai petualangan dari Title Screen!
    k.go("title");
  }, []);

  useEffect(() => {
    initGame();

    return () => {
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
