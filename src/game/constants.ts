// Konstanta game Pulau Kita
export const TILE = 16;
export const VIRTUAL_W = 320;
export const VIRTUAL_H = 240;

// Depth layers
export const DEPTH = {
  BG: 0,
  GROUND: 10,
  WATER: 15,
  SHADOW: 20,
  PROP: 50,
  PLAYER: 100,
  NPC: 100,
  EFFECT: 150,
  UI: 200,
  DIALOG: 300,
  OVERLAY: 400,
} as const;

// Event names
export const EVENTS = {
  TOOT: "toot",
  EMOTE: "emote",
  INTERACT: "interact",
  DIALOG_START: "dialog_start",
  DIALOG_END: "dialog_end",
  MEMORY_UNLOCK: "memory_unlock",
  SCENE_CHANGE: "scene_change",
} as const;

