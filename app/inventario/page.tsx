"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import EstadoBadge from "../components/EstadoBadge";

interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  usuarioAsignado: string | null;
  ubicacion: string | null;
  estado: string;
  notas: string | null;
  creadoEn: string;
}

const TIPOS = ["", "PC", "Laptop", "Monitor", "Impresora", "Switch", "Router", "Servidor", "Teclado", "Mouse", "UPS", "Otro"];
const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "ACTIVO", label: "Activo" },
  { value: "EN_REPARACION", label: "En reparación" },
  { value: "DADO_DE_BAJA", label: "Dado de baja" },
];

export default function InventarioPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);

  const cargarEquipos = useCallback(async () => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (filtroEstado) params.set("estado", filtroEstado);
    if (busqueda) params.set("busqueda", busqueda);

    const res = await fetch(`/api/equipos?${params}`);
    if (res.ok) setEquipos(await res.json());
    setCargando(false);
  }, [filtroTipo, filtroEstado, busqueda]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 mt-1">{equipos.length} equipo{equipos.length !== 1 ? "s" : ""} encontrado{equipos.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/inventario/nuevo" className="btn-primary">+ Agregar equipo</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por marca, modelo, serie, usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-field flex-1"
          />
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="input-field sm:w-40">
            <option value="">Todos los tipos</option>
            {TIPOS.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="input-field sm:w-48">
            {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : equipos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No se encontraron equipos</p>
          <Link href="/inventario/nuevo" className="btn-primary mt-4 inline-block">Agregar el primero</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Marca / Modelo</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">N° Serie</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Ubicación</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {equipos.map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{equipo.tipo}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {[equipo.marca, equipo.modelo].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{equipo.numeroSerie || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{equipo.usuarioAsignado || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{equipo.ubicacion || "—"}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={equipo.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/inventario/${equipo.id}/editar`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Editar
                        </Link>
                        <button
                          onClick={() => eliminar(equipo.id)}
                          disabled={eliminando === equipo.id}
                          className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                        >
                          Eliminar
                        </button>
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
