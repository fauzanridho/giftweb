"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Login dengan Google OAuth
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const { getSupabase } = await import("@/lib/supabaseClient");
      const sb = getSupabase();

      const { error: oauthError } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/play`,
        },
      });

      if (oauthError) {
        if (oauthError.message?.includes("provider is not enabled")) {
          throw new Error("Google Provider belum diaktifkan di Dashboard Supabase (Authentication -> Providers -> Google)");
        }
        throw oauthError;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal masuk dengan Google");
      setLoading(false);
    }
  };

  // 2. Login Tamu (Anonymous Auth)
  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const { getSupabase } = await import("@/lib/supabaseClient");
      const sb = getSupabase();

      const { error: guestError } = await sb.auth.signInAnonymously();
      if (guestError) {
        if (guestError.message?.includes("provider is not enabled")) {
          throw new Error("Anonymous Sign-ins belum aktif di Supabase Dashboard (Authentication -> Providers -> Anonymous)");
        }
        throw guestError;
      }

      router.push("/play");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal masuk sebagai tamu");
      setLoading(false);
    }
  };

  // 3. Login Email OTP / Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError("");
      setInfo("");
      const { getSupabase } = await import("@/lib/supabaseClient");
      const sb = getSupabase();

      const { error: otpError } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/play`,
        },
      });

      if (otpError) throw otpError;
      setInfo("Tautan masuk telah dikirim ke email kamu! 💌");
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim tautan");
      setLoading(false);
    }
  };

  // 4. Login Email & Password biasa
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const { getSupabase } = await import("@/lib/supabaseClient");
      const sb = getSupabase();

      const { error: authError } = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      router.push("/play");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email atau password keliru");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        width: "100dvw",
        background: "linear-gradient(135deg, #fce4d6 0%, #f4a68e 50%, #c8d8b9 100%)",
        fontFamily: "monospace",
        padding: "1rem",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "1.75rem",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          border: "3px solid #f4a68e",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#c47a6a", fontSize: "1.75rem", margin: "0 0 0.25rem 0" }}>
          🏝️ Pulau Kita
        </h1>
        <p style={{ color: "#8b7a6b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          Dunia pixel hangat untuk kita berdua & sahabat ✨
        </p>

        {error && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "8px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {info && (
          <div
            style={{
              background: "#e8f5e9",
              color: "#2e7d32",
              padding: "8px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            {info}
          </div>
        )}

        {/* Tombol Login Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "2px solid #e0d0c0",
            background: "#fff",
            color: "#444",
            fontSize: "0.95rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "0.75rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Masuk dengan Google
        </button>

        {/* Tombol Login Tamu */}
        <button
          onClick={handleGuestLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#c8d8b9",
            color: "#3a532d",
            fontSize: "0.95rem",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1rem",
          }}
        >
          🏃 Langsung Main sebagai Tamu
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#e0d0c0" }} />
          <span style={{ padding: "0 10px", color: "#a09080", fontSize: "0.75rem" }}>
            atau pakai email
          </span>
          <div style={{ flex: 1, height: "1px", background: "#e0d0c0" }} />
        </div>

        {/* Toggle Mode: Password atau Magic Link OTP */}
        {isOtpMode ? (
          <form onSubmit={handleMagicLink}>
            <input
              type="email"
              placeholder="Masukkan email kamu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e0d0c0",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                marginBottom: "0.75rem",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #f4a68e, #c47a6a)",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "0.5rem",
              }}
            >
              Kirim Link Masuk 💌
            </button>
            <button
              type="button"
              onClick={() => setIsOtpMode(false)}
              style={{ background: "none", border: "none", color: "#8b7a6b", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Punya password? Masuk di sini
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e0d0c0",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                marginBottom: "0.5rem",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e0d0c0",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                marginBottom: "0.75rem",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #f4a68e, #c47a6a)",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "0.5rem",
              }}
            >
              Masuk 🌴
            </button>
            <button
              type="button"
              onClick={() => setIsOtpMode(true)}
              style={{ background: "none", border: "none", color: "#8b7a6b", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Masuk tanpa password (Magic Link)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
