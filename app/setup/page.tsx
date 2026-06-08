"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [error,       setError]       = useState("");
  const [cargando,    setCargando]    = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    fetch("/api/setup").then((r) => r.json()).then((data) => {
      if (data.tieneUsuarios) router.replace("/login");
      else setVerificando(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) router.push("/login");
    else {
      const data = await res.json();
      setError(data.error || "Error al crear el usuario");
      setCargando(false);
    }
  };

  if (verificando) {
    return (
      <div className="min-h-screen bg-[#06101C] flex items-center justify-center" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#2A4A68", letterSpacing: "0.1em" }}>
        Verificando...
      </div>
    );
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "0.5625rem",
    fontWeight: 600,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#3D6080",
    marginBottom: "0.375rem",
  };

  return (
    <div className="min-h-screen bg-[#06101C] flex items-center justify-center px-4 relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, #06101C 100%)" }}
      />

      <div className="relative w-full max-w-sm z-10 animate-in">
        <div className="flex items-center gap-3 mb-8 px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-boiero.png" alt="Boiero" className="h-8 w-auto brightness-0 invert opacity-70" />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #2A4A68, transparent)" }} />
        </div>

        <div
          className="p-8"
          style={{
            background: "#0A1628",
            border: "1px solid #1D344E",
            borderRadius: "3px",
            boxShadow: "inset 0 1px 0 rgba(232,151,28,0.12), 0 25px 60px -12px rgba(0,0,0,0.8)",
          }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8971C]" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#2A4A68", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Primera ejecución
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#E8F4FF] tracking-wide">Configuración inicial</h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080", marginTop: "0.25rem", letterSpacing: "0.08em" }}>
              <span style={{ color: "#E8971C" }}>//</span> Creá el primer usuario administrador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={labelStyle}>Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Tu nombre" required autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="admin@boiero.com" required />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Mínimo 8 caracteres" minLength={8} required />
            </div>
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-sm"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#EF4444" }}>{error}</p>
              </div>
            )}
            <button type="submit" disabled={cargando} className="btn-primary w-full justify-center mt-2">
              {cargando ? "Creando..." : "→ Crear administrador"}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-4"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", color: "#1D344E", letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          Boiero Construcciones · Sistemas TI
        </p>
      </div>
    </div>
  );
}
