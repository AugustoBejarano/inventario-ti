"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
    <div className="min-h-screen bg-[#0B1829] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-boiero.png" alt="Boiero" className="h-12 w-auto brightness-0 invert" />
        </div>
        <div className="bg-[#1A2D47] rounded-2xl border border-[#243D5E] p-8 shadow-xl shadow-black/40">
          <h1 className="text-lg font-semibold text-slate-100 mb-1">Inventario TI</h1>
          <p className="text-sm text-slate-400 mb-6">Ingresá con tu cuenta</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full" placeholder="ejemplo@boiero.com" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full" placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={cargando} className="btn-primary w-full justify-center">
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
