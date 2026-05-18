"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
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

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear el usuario");
      setCargando(false);
    }
  };

  if (verificando) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Verificando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-boiero.png" alt="Boiero" className="h-12 w-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Configuración inicial</h1>
          <p className="text-sm text-gray-500 mb-6">Creá el primer usuario administrador.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full"
                placeholder="Tu nombre"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="admin@boiero.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button type="submit" disabled={cargando} className="btn-primary w-full justify-center">
              {cargando ? "Creando..." : "Crear administrador"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
