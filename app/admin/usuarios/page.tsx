"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Usuario { id: string; name: string; email: string; role: "ADMIN" | "LECTOR"; creadoEn: string; }

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

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.625rem 1rem",
  fontFamily: "var(--font-mono)",
  fontSize: "0.5625rem",
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#3D6080",
  borderBottom: "1px solid #1D344E",
  whiteSpace: "nowrap",
};

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usuarios,    setUsuarios]   = useState<Usuario[]>([]);
  const [cargando,    setCargando]   = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [eliminando,  setEliminando] = useState<string | null>(null);
  const [guardando,   setGuardando]  = useState(false);
  const [error,       setError]      = useState("");
  const [nombre,      setNombre]     = useState("");
  const [email,       setEmail]      = useState("");
  const [password,    setPassword]   = useState("");
  const [rol,         setRol]        = useState<"ADMIN" | "LECTOR">("LECTOR");

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

  if (status === "loading") {
    return (
      <div className="space-y-2 max-w-3xl pt-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl animate-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#3D6080", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
            ◆ Gestión de accesos
          </div>
          <h1 className="text-2xl font-bold text-[#E8F4FF] tracking-tight">Usuarios</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080", marginTop: "0.2rem" }}>
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} className="btn-primary shrink-0">
            + Nuevo usuario
          </button>
        )}
      </div>

      {mostrarForm && (
        <div
          style={{
            background: "#0C1D33",
            border: "1px solid #1D344E",
            borderRadius: "3px",
            padding: "1.5rem",
            boxShadow: "inset 0 1px 0 rgba(232,151,28,0.08)",
          }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", color: "#3D6080", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>
            ▸ Nuevo usuario
          </div>
          <form onSubmit={crearUsuario} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Nombre</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field" placeholder="Nombre completo" required autoFocus />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="usuario@boiero.com" required />
              </div>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Mínimo 8 caracteres" minLength={8} required />
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select value={rol} onChange={(e) => setRol(e.target.value as "ADMIN" | "LECTOR")} className="input-field">
                  <option value="LECTOR">Lector (solo lectura)</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "2px" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#EF4444" }}>{error}</p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? "Guardando..." : "Crear usuario"}
              </button>
              <button type="button" onClick={() => { setMostrarForm(false); setError(""); }} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
        </div>
      ) : (
        <div style={{ background: "#0C1D33", border: "1px solid #1D344E", borderRadius: "3px", overflow: "hidden" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "#06101C" }}>
              <tr>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Rol</th>
                <th style={thStyle}>Creado</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid #1D344E" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,151,28,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#E8F4FF] text-sm">{u.name}</span>
                    {u.id === session?.user?.id && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", color: "#2A4A68", marginLeft: "0.5rem", letterSpacing: "0.08em" }}>
                        (vos)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#6A9AB8] text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.125rem 0.5rem",
                        background: u.role === "ADMIN" ? "rgba(232,151,28,0.08)" : "rgba(106,154,184,0.08)",
                        border: `1px solid ${u.role === "ADMIN" ? "rgba(232,151,28,0.25)" : "rgba(106,154,184,0.20)"}`,
                        borderRadius: "2px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.5625rem",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: u.role === "ADMIN" ? "#E8971C" : "#6A9AB8",
                      }}
                    >
                      {u.role === "ADMIN" ? "Admin" : "Lector"}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080" }}>
                    {new Date(u.creadoEn).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== session?.user?.id
                      ? (
                        <button
                          onClick={() => eliminar(u.id, u.name)}
                          disabled={eliminando === u.id}
                          style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#EF4444", background: "none", border: "none", cursor: "pointer", opacity: eliminando === u.id ? 0.4 : 1 }}
                          className="hover:text-[#FCA5A5] transition-colors"
                        >
                          Eliminar
                        </button>
                      )
                      : <span style={{ color: "#1D344E", fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>—</span>
                    }
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
