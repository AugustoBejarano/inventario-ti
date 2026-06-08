"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Email o contraseña incorrectos"); setCargando(false); }
    else { router.push("/"); router.refresh(); }
  };

  return (
    <div className="min-h-screen bg-[#06101C] flex items-center justify-center px-4 relative">
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, #06101C 100%)" }}
      />

      <div className="relative w-full max-w-sm z-10 animate-in">

        {/* Logo row */}
        <div className="flex items-center gap-3 mb-8 px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-boiero.png" alt="Boiero" className="h-8 w-auto brightness-0 invert opacity-70" />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #2A4A68, transparent)" }} />
        </div>

        {/* Card */}
        <div
          className="p-8"
          style={{
            background: "#0A1628",
            border: "1px solid #1D344E",
            borderRadius: "3px",
            boxShadow: "inset 0 1px 0 rgba(232,151,28,0.12), 0 25px 60px -12px rgba(0,0,0,0.8)",
          }}
        >
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"
              style={{ animation: "pulse 2s ease infinite" }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.625rem",
                color: "#2A4A68",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Sistema activo
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#E8F4FF] tracking-wide">
              Inventario TI
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "#3D6080",
                marginTop: "0.25rem",
                letterSpacing: "0.08em",
              }}
            >
              <span style={{ color: "#E8971C" }}>//</span> Ingresá tus credenciales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  color: "#3D6080",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="usuario@boiero.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  color: "#3D6080",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#EF4444" }}>
                  {error}
                </p>
              </div>
            )}

            <button type="submit" disabled={cargando} className="btn-primary w-full justify-center mt-2">
              {cargando ? "Autenticando..." : "→ Ingresar"}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.5625rem",
            color: "#1D344E",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Boiero Construcciones · Sistemas TI
        </p>
      </div>
    </div>
  );
}
