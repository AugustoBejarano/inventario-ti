"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LogEntry {
  id: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR";
  entidad: string;
  entidadNombre: string | null;
  detalle: string | null;
  usuarioNombre: string | null;
  creadoEn: string;
}

const ACCION_CONFIG: Record<string, { bg: string; color: string; border: string; label: string }> = {
  CREAR:    { bg: "rgba(34,197,94,0.08)",  color: "#22C55E", border: "rgba(34,197,94,0.25)",  label: "Crear"    },
  EDITAR:   { bg: "rgba(0,186,219,0.08)",  color: "#00BADB", border: "rgba(0,186,219,0.25)",  label: "Editar"   },
  ELIMINAR: { bg: "rgba(239,68,68,0.08)",  color: "#EF4444", border: "rgba(239,68,68,0.25)",  label: "Eliminar" },
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

export default function AuditoriaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs,       setLogs]       = useState<LogEntry[]>([]);
  const [total,      setTotal]      = useState(0);
  const [paginas,    setPaginas]    = useState(1);
  const [pagina,     setPagina]     = useState(1);
  const [cargando,   setCargando]   = useState(true);
  const [expandido,  setExpandido]  = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session.user.role !== "ADMIN") router.replace("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
    setCargando(true);
    fetch(`/api/auditoria?pagina=${pagina}`)
      .then((r) => r.json())
      .then((data) => { setLogs(data.logs); setTotal(data.total); setPaginas(data.paginas); setCargando(false); });
  }, [pagina, status, session]);

  if (status === "loading") {
    return (
      <div className="space-y-2 pt-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#3D6080", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
          ◆ Registro de actividad
        </div>
        <h1 className="text-2xl font-bold text-[#E8F4FF] tracking-tight">Auditoría</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080", marginTop: "0.2rem" }}>
          {total} registro{total !== 1 ? "s" : ""} en total
        </p>
      </div>

      {cargando ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.06}s` }} />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center" style={{ background: "#0C1D33", border: "1px solid #1D344E", borderRadius: "3px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3D6080", letterSpacing: "0.1em" }}>
            // sin registros de auditoría aún
          </p>
        </div>
      ) : (
        <div style={{ background: "#0C1D33", border: "1px solid #1D344E", borderRadius: "3px", overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#06101C" }}>
                <tr>
                  <th style={thStyle}>Fecha / Hora</th>
                  <th style={thStyle}>Acción</th>
                  <th style={thStyle}>Entidad</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const detalle = log.detalle ? JSON.parse(log.detalle) : null;
                  const ac = ACCION_CONFIG[log.accion];
                  return (
                    <tr
                      key={log.id}
                      style={{ borderBottom: "1px solid #1D344E" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,151,28,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#3D6080", letterSpacing: "0.04em" }}>
                        {new Date(log.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}{" "}
                        <span style={{ color: "#2A4A68" }}>
                          {new Date(log.creadoEn).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.125rem 0.5rem",
                            background: ac.bg,
                            border: `1px solid ${ac.border}`,
                            borderRadius: "2px",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.5625rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: ac.color,
                          }}
                        >
                          {ac.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6A9AB8] text-sm">{log.entidad}</td>
                      <td className="px-4 py-3 font-semibold text-[#A0C2D8] text-sm">{log.entidadNombre || "—"}</td>
                      <td className="px-4 py-3 text-[#6A9AB8] text-sm">{log.usuarioNombre || "—"}</td>
                      <td className="px-4 py-3">
                        {detalle ? (
                          <>
                            <button
                              onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                              style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#00BADB", background: "none", border: "none", cursor: "pointer" }}
                              className="hover:text-[#E8F4FF] transition-colors"
                            >
                              {expandido === log.id ? "Ocultar" : "Ver cambios"}
                            </button>
                            {expandido === log.id && (
                              <div
                                className="mt-2 p-2 space-y-1 max-w-xs"
                                style={{
                                  background: "#06101C",
                                  border: "1px solid #1D344E",
                                  borderRadius: "2px",
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.625rem",
                                  color: "#6A9AB8",
                                }}
                              >
                                {detalle.cambios
                                  ? detalle.cambios.map((c: string, i: number) => <p key={i}>{c}</p>)
                                  : Object.entries(detalle).map(([k, v]) => (
                                    <p key={k}>
                                      <span style={{ color: "#A0C2D8" }}>{k}:</span> {String(v)}
                                    </p>
                                  ))
                                }
                              </div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: "#1D344E", fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {paginas > 1 && (
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080" }}>
            Página {pagina} de {paginas}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1} className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.625rem" }}>
              ← Anterior
            </button>
            <button onClick={() => setPagina((p) => p + 1)} disabled={pagina === paginas} className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.625rem" }}>
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
