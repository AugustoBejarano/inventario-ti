"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "LECTOR";
  creadoEn: string;
}

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"ADMIN" | "LECTOR">("LECTOR");

  useEffect(() => {
    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, session, router]);

  const cargar = async () => {
    setCargando(true);
    const res = await fetch("/api/usuarios");
    if (res.ok) setUsuarios(await res.json());
    setCargando(false);
  };

  useEffect(() => {
    if (status === "authenticated" && session.user.role === "ADMIN") {
      cargar();
    }
  }, [status, session]);

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nombre, email, password, role: rol }),
    });

    if (res.ok) {
      setMostrarForm(false);
      setNombre("");
      setEmail("");
      setPassword("");
      setRol("LECTOR");
      cargar();
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear el usuario");
    }
    setGuardando(false);
  };

  const eliminar = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al usuario "${name}"?`)) return;
    setEliminando(id);
    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    setEliminando(null);
  };

  if (status === "loading" || (status === "authenticated" && session.user.role !== "ADMIN")) {
    return <div className="text-center py-16 text-gray-400">Cargando...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 mt-1">{usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}</p>
        </div>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} className="btn-primary">
            + Nuevo usuario
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Nuevo usuario</h2>
          <form onSubmit={crearUsuario} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field w-full"
                  placeholder="Nombre completo"
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
                  placeholder="usuario@empresa.com"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as "ADMIN" | "LECTOR")}
                  className="input-field w-full"
                >
                  <option value="LECTOR">Lector (solo lectura)</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? "Guardando..." : "Crear usuario"}
              </button>
              <button
                type="button"
                onClick={() => { setMostrarForm(false); setError(""); }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Creado</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.name}
                    {u.id === session?.user?.id && (
                      <span className="ml-2 text-xs text-gray-400">(vos)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.role === "ADMIN" ? "Admin" : "Lector"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.creadoEn).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== session?.user?.id ? (
                      <button
                        onClick={() => eliminar(u.id, u.name)}
                        disabled={eliminando === u.id}
                        className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
