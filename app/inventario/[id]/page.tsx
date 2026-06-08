"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import EstadoBadge from "../../components/EstadoBadge";
import SucursalBadge from "../../components/SucursalBadge";
import MantenimientoForm from "../../components/MantenimientoForm";

interface Mantenimiento { id: string; tipo: string; descripcion: string; tecnico: string | null; costo: number | null; fecha: string; }
interface HistorialCambio { id: string; campo: string; valorAnterior: string | null; valorNuevo: string | null; creadoEn: string; }
interface Equipo {
  id: string; tipo: string; marca: string | null; modelo: string | null;
  numeroSerie: string | null; usuarioAsignado: string | null; ubicacion: string | null;
  sucursal: string | null; estado: string; notas: string | null; creadoEn: string;
  mantenimientos: Mantenimiento[]; historial: HistorialCambio[];
}

const sectionStyle: React.CSSProperties = {
  background: "#0C1D33",
  border: "1px solid #1D344E",
  borderRadius: "3px",
  padding: "1.5rem",
  boxShadow: "inset 0 1px 0 rgba(232,151,28,0.08)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.5625rem",
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#3D6080",
  marginBottom: "0.25rem",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.5625rem",
  color: "#3D6080",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  marginBottom: "1rem",
};

export default function FichaEquipoPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { data: session } = useSession();
  const esAdmin   = session?.user?.role === "ADMIN";

  const [equipo,          setEquipo]          = useState<Equipo | null>(null);
  const [cargando,        setCargando]        = useState(true);
  const [mostrarFormMant, setMostrarFormMant] = useState(false);
  const [eliminando,      setEliminando]      = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/equipos/${id}`);
    if (res.ok) setEquipo(await res.json());
    setCargando(false);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const eliminar = async () => {
    if (!confirm("¿Eliminar este equipo? Esta acción no se puede deshacer.")) return;
    setEliminando(true);
    await fetch(`/api/equipos/${id}`, { method: "DELETE" });
    router.push("/inventario");
  };

  const eliminarMantenimiento = async (mid: string) => {
    if (!confirm("¿Eliminar este mantenimiento?")) return;
    await fetch(`/api/equipos/${id}/mantenimientos?mid=${mid}`, { method: "DELETE" });
    cargar();
  };

  if (cargando) {
    return (
      <div className="space-y-3 max-w-4xl pt-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 w-full" />)}
      </div>
    );
  }
  if (!equipo) return (
    <div className="text-center py-16" style={{ fontFamily: "var(--font-mono)", color: "#3D6080" }}>
      // equipo no encontrado
    </div>
  );

  const nombre = [equipo.marca, equipo.modelo].filter(Boolean).join(" ") || equipo.tipo;

  return (
    <div className="max-w-4xl space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>
            <Link href="/inventario" className="text-[#3D6080] hover:text-[#6A9AB8] transition-colors">
              Inventario
            </Link>
            <span style={{ color: "#1D344E" }}>/</span>
            <span style={{ color: "#6A9AB8" }}>{nombre}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#E8F4FF] tracking-tight">{nombre}</h1>
          <div className="flex items-center gap-2 mt-2">
            <EstadoBadge estado={equipo.estado} />
            <SucursalBadge sucursal={equipo.sucursal} />
          </div>
        </div>
        {esAdmin && (
          <div className="flex gap-2 shrink-0">
            <Link href={`/inventario/${id}/editar`} className="btn-secondary">Editar</Link>
            <button
              onClick={eliminar}
              disabled={eliminando}
              className="btn-secondary"
              style={{ borderColor: "rgba(239,68,68,0.35)", color: "#EF4444" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Datos del equipo */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>▸ Datos del equipo</div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Tipo",            valor: equipo.tipo },
            { label: "Marca",           valor: equipo.marca },
            { label: "Modelo",          valor: equipo.modelo },
            { label: "N° de serie",     valor: equipo.numeroSerie, mono: true },
            { label: "Usuario asignado",valor: equipo.usuarioAsignado },
            { label: "Ubicación",       valor: equipo.ubicacion },
          ].map(({ label, valor, mono }) => (
            <div key={label}>
              <dt style={labelStyle}>{label}</dt>
              <dd
                style={{
                  fontSize: "0.875rem",
                  color: valor ? "#A0C2D8" : "#2A4A68",
                  fontFamily: mono ? "var(--font-mono)" : undefined,
                  letterSpacing: mono ? "0.04em" : undefined,
                }}
              >
                {valor || "—"}
              </dd>
            </div>
          ))}
        </dl>
        {equipo.notas && (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #1D344E" }}>
            <dt style={labelStyle}>Notas</dt>
            <dd className="text-sm text-[#A0C2D8] mt-0.5">{equipo.notas}</dd>
          </div>
        )}
        <p
          style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #1D344E", fontFamily: "var(--font-mono)", fontSize: "0.5625rem", color: "#2A4A68", letterSpacing: "0.08em" }}
        >
          Cargado el {new Date(equipo.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Mantenimientos */}
      <div style={sectionStyle}>
        <div className="flex items-center justify-between mb-4">
          <div style={sectionTitleStyle} className="mb-0">
            ▸ Mantenimientos ({equipo.mantenimientos.length})
          </div>
          {esAdmin && !mostrarFormMant && (
            <button onClick={() => setMostrarFormMant(true)} className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.625rem" }}>
              + Registrar
            </button>
          )}
        </div>

        {mostrarFormMant && (
          <div className="mb-4">
            <MantenimientoForm
              equipoId={id}
              onGuardado={() => { setMostrarFormMant(false); cargar(); }}
              onCancelar={() => setMostrarFormMant(false)}
            />
          </div>
        )}

        {equipo.mantenimientos.length === 0 ? (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#2A4A68", letterSpacing: "0.08em" }}>
            // sin mantenimientos registrados
          </p>
        ) : (
          <div className="space-y-2">
            {equipo.mantenimientos.map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-4 p-3"
                style={{ background: "#06101C", border: "1px solid #1D344E", borderRadius: "2px" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.125rem 0.5rem",
                        background: "rgba(0,186,219,0.08)",
                        border: "1px solid rgba(0,186,219,0.20)",
                        borderRadius: "2px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.5625rem",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#00BADB",
                      }}
                    >
                      {m.tipo}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080" }}>
                      {new Date(m.fecha).toLocaleDateString("es-AR")}
                    </span>
                    {m.tecnico && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080" }}>
                        · {m.tecnico}
                      </span>
                    )}
                    {m.costo != null && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#E8971C" }}>
                        · ${m.costo.toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#A0C2D8] mt-1">{m.descripcion}</p>
                </div>
                {esAdmin && (
                  <button
                    onClick={() => eliminarMantenimiento(m.id)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#EF4444", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
                    className="hover:text-[#FCA5A5] transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      {equipo.historial.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>▸ Historial de cambios</div>
          <div className="space-y-2">
            {equipo.historial.map((h) => (
              <div key={h.id} className="flex items-start gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5625rem",
                    color: "#2A4A68",
                    flexShrink: 0,
                    marginTop: "0.125rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  {new Date(h.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <p className="text-sm text-[#6A9AB8]">
                  <span className="font-semibold text-[#A0C2D8]">{h.campo}</span>
                  {h.valorAnterior && (
                    <> cambió de{" "}
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8em", color: "#EF4444" }}>
                        {h.valorAnterior || "vacío"}
                      </span>
                    </>
                  )}
                  {" "}a{" "}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8em", color: "#22C55E" }}>
                    {h.valorNuevo || "vacío"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
