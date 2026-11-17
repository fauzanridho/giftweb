"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic import GameCanvas - SSR off (Kaplay needs browser APIs)
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
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const sb = getSupabase();

      const {
        data: { session },
      } = await sb.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setAuthenticated(true);
      setChecking(false);

      // Listen for auth changes
      const {
        data: { subscription },
      } = sb.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          router.push("/login");
        }
      });

      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
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
        }}
      >
        Memeriksa akun... 🔑
      </div>
    );
  }

  if (!authenticated) return null;

  return <GameCanvas />;
}
