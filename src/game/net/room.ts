import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabaseClient";

export interface PlayerState {
  userId: string;
  displayName: string;
  x: number;
  y: number;
  dir: "down" | "up" | "left" | "right";
  anim: string;
  scene: string;
  updatedAt: number;
}

export interface EmotePayload {
  userId: string;
  emote: string; // "heart", "laugh", "wave", "toot", "surprised"
}

export interface TootPayload {
  userId: string;
  x: number;
  y: number;
  variant: 1 | 2 | 3;
}

export type PresenceListener = (onlinePlayers: PlayerState[]) => void;
export type PosListener = (state: PlayerState) => void;
export type EmoteListener = (payload: EmotePayload) => void;
export type TootListener = (payload: TootPayload) => void;

export class IslandRoom {
  private channel: RealtimeChannel | null = null;
  private islandId: string;
  private currentUserId = "";
  private currentDisplayName = "";
  private currentScene = "hub";

  private lastSentPos = { x: 0, y: 0, anim: "" };
  private lastSendTime = 0;
  private throttleIntervalMs = 95; // ~10 Hz

  // Listeners
  private onPresenceCallbacks: PresenceListener[] = [];
  private onPosCallbacks: PosListener[] = [];
  private onEmoteCallbacks: EmoteListener[] = [];
  private onTootCallbacks: TootListener[] = [];

  private isConnected = false;
  private activePlayers: Map<string, PlayerState> = new Map();

  constructor(islandId: string) {
    this.islandId = islandId;
    this.setupVisibilityHandler();
  }

  async connect(userId: string, displayName: string, scene = "hub") {
    this.currentUserId = userId;
    this.currentDisplayName = displayName;
    this.currentScene = scene;

    const sb = getSupabase();
    const channelName = `island:${this.islandId}`;

    if (this.channel) {
      sb.removeChannel(this.channel);
    }

    this.channel = sb.channel(channelName, {
      config: {
        presence: { key: userId },
        broadcast: { ack: false, self: false },
      },
    });

    // 1. Presence: Melacak siapa saja yang online di pulau
    this.channel
      .on("presence", { event: "sync" }, () => {
        const state = this.channel?.presenceState() || {};
        this.activePlayers.clear();

        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          if (presences && presences.length > 0) {
            const latest = presences[presences.length - 1];
            if (latest.userId !== this.currentUserId) {
              this.activePlayers.set(latest.userId, latest);
            }
          }
        });

        this.notifyPresence();
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach((p: any) => {
          if (p.userId !== this.currentUserId) {
            this.activePlayers.set(p.userId, p);
          }
        });
        this.notifyPresence();
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach((p: any) => {
          this.activePlayers.delete(p.userId);
        });
        this.notifyPresence();
      });

    // 2. Broadcast: Koordinat posisi partner (~10 Hz)
    this.channel.on("broadcast", { event: "pos" }, ({ payload }) => {
      if (payload && payload.userId !== this.currentUserId) {
        this.onPosCallbacks.forEach((cb) => cb(payload));
      }
    });

    // 3. Broadcast: Emote Balon
    this.channel.on("broadcast", { event: "emote" }, ({ payload }) => {
      if (payload && payload.userId !== this.currentUserId) {
        this.onEmoteCallbacks.forEach((cb) => cb(payload));
      }
    });

    // 4. Broadcast: Toot Bersama
    this.channel.on("broadcast", { event: "toot" }, ({ payload }) => {
      if (payload && payload.userId !== this.currentUserId) {
        this.onTootCallbacks.forEach((cb) => cb(payload));
      }
    });

    // Jalankan langganan channel
    this.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        this.isConnected = true;
        await this.channel?.track({
          userId: this.currentUserId,
          displayName: this.currentDisplayName,
          scene: this.currentScene,
          x: 0,
          y: 0,
          onlineAt: Date.now(),
        });
      }
    });
  }

  // Kirim posisi pemain (Dibatasi ~10 Hz dan hanya jika ada pergerakan)
  sendPosition(x: number, y: number, dir: "down" | "up" | "left" | "right", anim: string) {
    if (!this.isConnected || !this.channel) return;

    const now = Date.now();
    const hasMoved =
      Math.abs(this.lastSentPos.x - x) > 0.5 ||
      Math.abs(this.lastSentPos.y - y) > 0.5 ||
      this.lastSentPos.anim !== anim;

    if (hasMoved && now - this.lastSendTime >= this.throttleIntervalMs) {
      this.lastSendTime = now;
      this.lastSentPos = { x, y, anim };

      const payload: PlayerState = {
        userId: this.currentUserId,
        displayName: this.currentDisplayName,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        dir,
        anim,
        scene: this.currentScene,
        updatedAt: now,
      };

      this.channel.send({
        type: "broadcast",
        event: "pos",
        payload,
      });
    }
  }

  // Kirim Emote
  sendEmote(emote: string) {
    if (!this.channel) return;
    this.channel.send({
      type: "broadcast",
      event: "emote",
      payload: {
        userId: this.currentUserId,
        emote,
      },
    });
  }

  // Kirim Toot Realtime
  sendToot(x: number, y: number, variant: 1 | 2 | 3) {
    if (!this.channel) return;
    this.channel.send({
      type: "broadcast",
      event: "toot",
      payload: {
        userId: this.currentUserId,
        x,
        y,
        variant,
      },
    });
  }

  // Event Listeners
  onPresence(cb: PresenceListener) {
    this.onPresenceCallbacks.push(cb);
  }

  onPos(cb: PosListener) {
    this.onPosCallbacks.push(cb);
  }

  onEmote(cb: EmoteListener) {
    this.onEmoteCallbacks.push(cb);
  }

  onToot(cb: TootListener) {
    this.onTootCallbacks.push(cb);
  }

  private notifyPresence() {
    const list = Array.from(this.activePlayers.values());
    this.onPresenceCallbacks.forEach((cb) => cb(list));
  }

  private setupVisibilityHandler() {
    if (typeof document === "undefined") return;

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.currentUserId) {
        // Tab aktif kembali (misal iPad dibuka setelah sleep): Segarkan presence
        this.channel?.track({
          userId: this.currentUserId,
          displayName: this.currentDisplayName,
          scene: this.currentScene,
          onlineAt: Date.now(),
        });
      }
    });
  }

  disconnect() {
    if (this.channel) {
      const sb = getSupabase();
      sb.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
    }
  }
}

