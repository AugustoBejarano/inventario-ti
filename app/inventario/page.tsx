"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import EstadoBadge from "../components/EstadoBadge";
import SucursalBadge from "../components/SucursalBadge";

interface Equipo {
  id: string; tipo: string; marca: string | null; modelo: string | null;
  numeroSerie: string | null; usuarioAsignado: string | null;
  ubicacion: string | null; sucursal: string | null; estado: string;
}

const TIPOS = ["PC", "Laptop", "Monitor", "Impresora", "Switch", "Router", "Servidor", "Teclado", "Mouse", "UPS", "Otro"];
const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "ACTIVO",        label: "Activo" },
  { value: "EN_REPARACION", label: "En reparación" },
  { value: "DADO_DE_BAJA",  label: "Dado de baja" },
];
const SUCURSALES = [
  { value: "", label: "Todas las sucursales" },
  { value: "CORDOBA",       label: "Córdoba" },
  { value: "MONTE_MAIZ",    label: "Monte Maíz" },
  { value: "BUENOS_AIRES",  label: "Buenos Aires" },
];

export default function InventarioPage() {
  const { data: session } = useSession();
  const esAdmin = session?.user?.role === "ADMIN";

  const [equipos,        setEquipos]        = useState<Equipo[]>([]);
  const [cargando,       setCargando]       = useState(true);
  const [busqueda,       setBusqueda]       = useState("");
  const [filtroTipo,     setFiltroTipo]     = useState("");
  const [filtroEstado,   setFiltroEstado]   = useState("");
  const [filtroSucursal, setFiltroSucursal] = useState("");
  const [eliminando,     setEliminando]     = useState<string | null>(null);
  const [exportando,     setExportando]     = useState(false);

  const cargarEquipos = useCallback(async () => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroTipo)     params.set("tipo",     filtroTipo);
    if (filtroEstado)   params.set("estado",   filtroEstado);
    if (filtroSucursal) params.set("sucursal", filtroSucursal);
    if (busqueda)       params.set("busqueda", busqueda);
    const res = await fetch(`/api/equipos?${params}`);
    if (res.ok) setEquipos(await res.json());
    setCargando(false);
  }, [filtroTipo, filtroEstado, filtroSucursal, busqueda]);

  useEffect(() => {
    const t = setTimeout(cargarEquipos, 300);
    return () => clearTimeout(t);
  }, [cargarEquipos]);

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este equipo?")) return;
    setEliminando(id);
    await fetch(`/api/equipos/${id}`, { method: "DELETE" });
    setEquipos((prev) => prev.filter((e) => e.id !== id));
    setEliminando(null);
  };

  const exportar = async () => {
    setExportando(true);
    const params = new URLSearchParams();
    if (filtroSucursal) params.set("sucursal", filtroSucursal);
    if (filtroEstado)   params.set("estado",   filtroEstado);
    const res = await fetch(`/api/equipos/export?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `inventario-ti-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExportando(false);
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

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#3D6080", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.25rem" }}
          >
            ◆ Inventario de hardware
          </div>
          <h1 className="text-2xl font-bold text-[#E8F4FF] tracking-tight">Inventario</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080", marginTop: "0.2rem" }}>
            {equipos.length} equipo{equipos.length !== 1 ? "s" : ""} encontrado{equipos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={exportar} disabled={exportando} className="btn-secondary">
            {exportando ? "Exportando..." : "↓ Excel"}
          </button>
          {esAdmin && <Link href="/inventario/nuevo" className="btn-primary">+ Agregar equipo</Link>}
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#0C1D33",
          border: "1px solid #1D344E",
          borderRadius: "3px",
          padding: "0.875rem 1rem",
        }}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Buscar por marca, modelo, serie, usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-field flex-1"
          />
          <select value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)} className="input-field sm:w-44">
            {SUCURSALES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="input-field sm:w-36">
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="input-field sm:w-40">
            {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {cargando ? (
        <div className="space-y-2 py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      ) : equipos.length === 0 ? (
        <div
          className="py-16 text-center"
          style={{ background: "#0C1D33", border: "1px solid #1D344E", borderRadius: "3px" }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3D6080", letterSpacing: "0.1em" }}>
            // sin resultados
          </p>
          <p className="text-[#6A9AB8] mt-1 text-sm">No se encontraron equipos con esos filtros</p>
          {esAdmin && (
            <Link href="/inventario/nuevo" className="btn-primary mt-5 inline-flex">
              Agregar el primero
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "#0C1D33",
            border: "1px solid #1D344E",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#06101C" }}>
                <tr>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Marca / Modelo</th>
                  <th style={thStyle}>N° Serie</th>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Sucursal</th>
                  <th style={thStyle}>Estado</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((equipo, i) => (
                  <tr
                    key={equipo.id}
                    className="group transition-colors"
                    style={{
                      borderBottom: "1px solid #1D344E",
                      animation: `slideUp 0.25s ease both`,
                      animationDelay: `${i * 0.03}s`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,151,28,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#E8F4FF] text-sm">{equipo.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-[#A0C2D8]">
                      {[equipo.marca, equipo.modelo].filter(Boolean).join(" ") || (
                        <span style={{ color: "#2A4A68" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {equipo.numeroSerie
                        ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#6A9AB8", letterSpacing: "0.04em" }}>{equipo.numeroSerie}</span>
                        : <span style={{ color: "#2A4A68", fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-[#A0C2D8] text-sm">
                      {equipo.usuarioAsignado || <span style={{ color: "#2A4A68" }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <SucursalBadge sucursal={equipo.sucursal} />
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={equipo.estado} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/inventario/${equipo.id}`}
                          style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080", letterSpacing: "0.05em" }}
                          className="hover:text-[#A0C2D8] transition-colors"
                        >
                          Ver
                        </Link>
                        {esAdmin && (
                          <>
                            <Link
                              href={`/inventario/${equipo.id}/editar`}
                              style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#00BADB", letterSpacing: "0.05em" }}
                              className="hover:text-[#E8F4FF] transition-colors"
                            >
                              Editar
                            </Link>
                            <button
                              onClick={() => eliminar(equipo.id)}
                              disabled={eliminando === equipo.id}
                              style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#EF4444", letterSpacing: "0.05em", background: "none", border: "none", cursor: "pointer", opacity: eliminando === equipo.id ? 0.4 : 1 }}
                              className="hover:text-[#FCA5A5] transition-colors"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
