import type { KAPLAYCtx } from "kaplay";

export function bootScene(k: KAPLAYCtx) {
  k.scene("boot", () => {
    // Background gradient effect - warm peach
    k.add([
      k.rect(320, 240),
      k.pos(0, 0),
      k.color(252, 228, 214), // peach
    ]);

    // Decorative pixel border
    k.add([
      k.rect(300, 220),
      k.pos(10, 10),
      k.color(244, 166, 142), // darker peach
      k.outline(2, k.Color.fromHex("#c47a6a")),
    ]);

    // Inner background
    k.add([
      k.rect(296, 216),
      k.pos(12, 12),
      k.color(255, 245, 235), // cream
    ]);

    // Title text
    k.add([
      k.text("Pulau Kita", { size: 24 }),
      k.pos(160, 80),
      k.anchor("center"),
      k.color(196, 122, 106), // warm brown
    ]);

    // Island emoji as pixel decoration - colored square
    k.add([
      k.rect(24, 16),
      k.pos(160, 115),
      k.anchor("center"),
      k.color(200, 216, 185), // sage green
    ]);

    // Small water below island
    k.add([
      k.rect(40, 8),
      k.pos(160, 128),
      k.anchor("center"),
      k.color(135, 206, 235), // sky blue
    ]);

    // Subtitle
    k.add([
      k.text("Game untuk kita berdua", { size: 10 }),
      k.pos(160, 155),
      k.anchor("center"),
      k.color(139, 122, 107), // muted brown
    ]);

    // Blinking "tap to start" text
    const tapText = k.add([
      k.text("Ketuk untuk mulai", { size: 12 }),
      k.pos(160, 200),
      k.anchor("center"),
      k.color(196, 122, 106),
      k.opacity(1),
    ]);

    // Blink animation
    let visible = true;
    k.loop(0.6, () => {
      visible = !visible;
      tapText.opacity = visible ? 1 : 0.3;
    });

    // Test colored boxes to prove rendering
    const colors = [
      [244, 166, 142], // peach
      [200, 216, 185], // sage
      [135, 206, 235], // sky blue
      [255, 230, 180], // cream
      [196, 122, 106], // warm brown
    ] as const;

    colors.forEach(([r, g, b], i) => {
      k.add([
        k.rect(16, 16),
        k.pos(100 + i * 24, 170),
        k.anchor("center"),
        k.color(r, g, b),
      ]);
    });

    // Handle tap/click to proceed ke Hub
    k.onClick(() => {
      k.go("hub");
    });
  });
}

