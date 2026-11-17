"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IslandProfile, getOrCreateCurrentIsland } from "@/game/systems/islandManager";

// Dynamic import GameCanvas - SSR off (Kaplay butuh browser context)
const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100dvw",
        height: "100dvh",
        background: "#1e1923",
        color: "#f4a68e",
        fontFamily: "monospace",
        fontSize: "1.2rem",
      }}
    >
      Memuat Pulau Kita... 🏝️
    </div>
  ),
});

export default function PlayPage() {
  const [profile, setProfile] = useState<IslandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const setupSession = async () => {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const sb = getSupabase();

      const { data: { session } } = await sb.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Ambil atau buatkan profil pulau untuk user
      const islandProfile = await getOrCreateCurrentIsland();
      if (isMounted) {
        setProfile(islandProfile);
        setLoading(false);
      }

      const { data: { subscription } } = sb.auth.onAuthStateChange((_event, currentSession) => {
        if (!currentSession) {
          router.push("/login");
        }
      });

      return () => subscription.unsubscribe();
    };

    setupSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100dvw",
          height: "100dvh",
          background: "#1e1923",
          color: "#f4a68e",
          fontFamily: "monospace",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "2rem" }}>🌴</div>
        <div>Menyiapkan pulau kamu... ✨</div>
      </div>
    );
  }

  return (
    <main style={{ position: "relative", width: "100dvw", height: "100dvh", overflow: "hidden" }}>
      {/* Top Bar Info (Pulau, Pentol, Kode Undang) */}
      {profile && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 100,
            background: "rgba(30, 25, 35, 0.8)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(244, 166, 142, 0.4)",
            backdropFilter: "blur(4px)",
            pointerEvents: "auto",
          }}
        >
          <span>🏝️ {profile.islandName}</span>
          <span>🍢 {profile.pentolBalance}</span>
          <span style={{ color: "#c8d8b9" }}>Kode: {profile.inviteCode}</span>
        </div>
      )}

      {/* Canvas Game */}
      <GameCanvas />
    </main>
  );
}
