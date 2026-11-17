"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Lazy import supabase to avoid build-time error
    const { getSupabase } = await import("@/lib/supabaseClient");
    const sb = getSupabase();

    const { error: authError } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah 😢");
      setLoading(false);
      return;
    }

    router.push("/play");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        width: "100dvw",
        background: "linear-gradient(135deg, #fce4d6 0%, #f4a68e 50%, #c8d8b9 100%)",
        fontFamily: "monospace",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "360px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          border: "3px solid #f4a68e",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#c47a6a",
            fontSize: "1.8rem",
            marginBottom: "0.5rem",
          }}
        >
          🏝️ Pulau Kita
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#8b7a6b",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          Masuk untuk bermain, Ay~ 💕
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #e0d0c0",
                fontSize: "1rem",
                fontFamily: "monospace",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #e0d0c0",
                fontSize: "1rem",
                fontFamily: "monospace",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#e06060",
                textAlign: "center",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: loading
                ? "#ccc"
                : "linear-gradient(135deg, #f4a68e, #c47a6a)",
              color: "#fff",
              fontSize: "1.1rem",
              fontFamily: "monospace",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Memuat..." : "Masuk 🌴"}
          </button>
        </form>
      </div>
    </div>
  );
}
