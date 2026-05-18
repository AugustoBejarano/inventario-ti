"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Usuario { id: string; name: string; email: string; role: "ADMIN" | "LECTOR"; creadoEn: string; }

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
    if (status === "authenticated" && session.user.role !== "ADMIN") router.replace("/");
  }, [status, session, router]);

  const cargar = async () => {
    setCargando(true);
    const res = await fetch("/api/usuarios");
    if (res.ok) setUsuarios(await res.json());
    setCargando(false);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") cargar();
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
      setNombre(""); setEmail(""); setPassword(""); setRol("LECTOR");
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

  if (status === "loading") return <div className="text-center py-16 text-slate-500">Cargando...</div>;

  const label = "block text-sm font-medium text-slate-400 mb-1";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Usuarios</h1>
          <p className="text-slate-400 mt-1">{usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}</p>
        </div>
        {!mostrarForm && <button onClick={() => setMostrarForm(true)} className="btn-primary">+ Nuevo usuario</button>}
      </div>

      {mostrarForm && (
        <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
          <h2 className="text-base font-semibold text-slate-100 mb-4">Nuevo usuario</h2>
          <form onSubmit={crearUsuario} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={label}>Nombre</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field w-full" placeholder="Nombre completo" required autoFocus /></div>
              <div><label className={label}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full" placeholder="usuario@boiero.com" required /></div>
              <div><label className={label}>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full" placeholder="Mínimo 8 caracteres" minLength={8} required /></div>
              <div>
                <label className={label}>Rol</label>
                <select value={rol} onChange={(e) => setRol(e.target.value as "ADMIN" | "LECTOR")} className="input-field w-full">
                  <option value="LECTOR">Lector (solo lectura)</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Crear usuario"}</button>
              <button type="button" onClick={() => { setMostrarForm(false); setError(""); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <div className="text-center py-16 text-slate-500">Cargando...</div>
      ) : (
        <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0F1E32] border-b border-[#243D5E]">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Creado</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243D5E]">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-[#1E3A5F]/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">
                    {u.name}{u.id === session?.user?.id && <span className="ml-2 text-xs text-slate-500">(vos)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "ADMIN" ? "bg-blue-900/50 text-blue-300 border border-blue-700/50" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                      {u.role === "ADMIN" ? "Admin" : "Lector"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.creadoEn).toLocaleDateString("es-AR")}</td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== session?.user?.id
                      ? <button onClick={() => eliminar(u.id, u.name)} disabled={eliminando === u.id} className="text-red-400 hover:text-red-300 text-xs font-medium disabled:opacity-50">Eliminar</button>
                      : <span className="text-slate-700 text-xs">—</span>}
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
