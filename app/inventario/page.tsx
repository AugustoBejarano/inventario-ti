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
  { value: "ACTIVO", label: "Activo" },
  { value: "EN_REPARACION", label: "En reparación" },
  { value: "DADO_DE_BAJA", label: "Dado de baja" },
];
const SUCURSALES = [
  { value: "", label: "Todas las sucursales" },
  { value: "CORDOBA", label: "Córdoba" },
  { value: "MONTE_MAIZ", label: "Monte Maíz" },
  { value: "BUENOS_AIRES", label: "Buenos Aires" },
];

export default function InventarioPage() {
  const { data: session } = useSession();
  const esAdmin = session?.user?.role === "ADMIN";

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSucursal, setFiltroSucursal] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  const cargarEquipos = useCallback(async () => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (filtroEstado) params.set("estado", filtroEstado);
    if (filtroSucursal) params.set("sucursal", filtroSucursal);
    if (busqueda) params.set("busqueda", busqueda);
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
    if (filtroEstado) params.set("estado", filtroEstado);
    const res = await fetch(`/api/equipos/export?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventario-ti-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExportando(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Inventario</h1>
          <p className="text-slate-400 mt-1">{equipos.length} equipo{equipos.length !== 1 ? "s" : ""} encontrado{equipos.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportar} disabled={exportando} className="btn-secondary">
            {exportando ? "Exportando..." : "↓ Excel"}
          </button>
          {esAdmin && <Link href="/inventario/nuevo" className="btn-primary">+ Agregar equipo</Link>}
        </div>
      </div>

      <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Buscar por marca, modelo, serie, usuario..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} className="input-field flex-1" />
          <select value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)} className="input-field sm:w-48">
            {SUCURSALES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="input-field sm:w-36">
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="input-field sm:w-44">
            {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-16 text-slate-500">Cargando...</div>
      ) : equipos.length === 0 ? (
        <div className="text-center py-16 bg-[#1A2D47] rounded-xl border border-[#243D5E]">
          <p className="text-slate-400 text-lg">No se encontraron equipos</p>
          {esAdmin && <Link href="/inventario/nuevo" className="btn-primary mt-4 inline-block">Agregar el primero</Link>}
        </div>
      ) : (
        <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0F1E32] border-b border-[#243D5E]">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Marca / Modelo</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">N° Serie</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Sucursal</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243D5E]">
                {equipos.map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-[#1E3A5F]/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{equipo.tipo}</td>
                    <td className="px-4 py-3 text-slate-300">{[equipo.marca, equipo.modelo].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{equipo.numeroSerie || "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{equipo.usuarioAsignado || "—"}</td>
                    <td className="px-4 py-3"><SucursalBadge sucursal={equipo.sucursal} /></td>
                    <td className="px-4 py-3"><EstadoBadge estado={equipo.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/inventario/${equipo.id}`} className="text-slate-400 hover:text-slate-200 text-xs font-medium">Ver</Link>
                        {esAdmin && (
                          <>
                            <Link href={`/inventario/${equipo.id}/editar`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Editar</Link>
                            <button onClick={() => eliminar(equipo.id)} disabled={eliminando === equipo.id}
                              className="text-red-400 hover:text-red-300 text-xs font-medium disabled:opacity-50">
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
