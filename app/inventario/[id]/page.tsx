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

export default function FichaEquipoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const esAdmin = session?.user?.role === "ADMIN";

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormMant, setMostrarFormMant] = useState(false);
  const [eliminando, setEliminando] = useState(false);

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

  if (cargando) return <div className="text-center py-16 text-slate-500">Cargando...</div>;
  if (!equipo) return <div className="text-center py-16 text-slate-400">Equipo no encontrado</div>;

  const nombre = [equipo.marca, equipo.modelo].filter(Boolean).join(" ") || equipo.tipo;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/inventario" className="hover:text-slate-300">Inventario</Link>
            <span>/</span>
            <span className="text-slate-400">{nombre}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{nombre}</h1>
          <div className="flex items-center gap-2 mt-2">
            <EstadoBadge estado={equipo.estado} />
            <SucursalBadge sucursal={equipo.sucursal} />
          </div>
        </div>
        {esAdmin && (
          <div className="flex gap-2 shrink-0">
            <Link href={`/inventario/${id}/editar`} className="btn-secondary">Editar</Link>
            <button onClick={eliminar} disabled={eliminando}
              className="inline-flex items-center justify-center rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 transition-colors disabled:opacity-50">
              Eliminar
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Datos del equipo</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Tipo", valor: equipo.tipo },
            { label: "Marca", valor: equipo.marca },
            { label: "Modelo", valor: equipo.modelo },
            { label: "N° de serie", valor: equipo.numeroSerie },
            { label: "Usuario asignado", valor: equipo.usuarioAsignado },
            { label: "Ubicación", valor: equipo.ubicacion },
          ].map(({ label, valor }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-sm text-slate-200">{valor || <span className="text-slate-600">—</span>}</dd>
            </div>
          ))}
        </dl>
        {equipo.notas && (
          <div className="mt-4 pt-4 border-t border-[#243D5E]">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notas</dt>
            <dd className="mt-1 text-sm text-slate-300">{equipo.notas}</dd>
          </div>
        )}
        <p className="mt-4 pt-4 border-t border-[#243D5E] text-xs text-slate-600">
          Cargado el {new Date(equipo.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Mantenimientos ({equipo.mantenimientos.length})</h2>
          {esAdmin && !mostrarFormMant && (
            <button onClick={() => setMostrarFormMant(true)} className="btn-primary text-xs px-3 py-1.5">+ Registrar</button>
          )}
        </div>
        {mostrarFormMant && (
          <div className="mb-4">
            <MantenimientoForm equipoId={id} onGuardado={() => { setMostrarFormMant(false); cargar(); }} onCancelar={() => setMostrarFormMant(false)} />
          </div>
        )}
        {equipo.mantenimientos.length === 0 ? (
          <p className="text-slate-500 text-sm">Sin mantenimientos registrados.</p>
        ) : (
          <div className="space-y-3">
            {equipo.mantenimientos.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-4 p-3 bg-[#162035] rounded-lg border border-[#243D5E]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full">{m.tipo}</span>
                    <span className="text-xs text-slate-500">{new Date(m.fecha).toLocaleDateString("es-AR")}</span>
                    {m.tecnico && <span className="text-xs text-slate-500">· {m.tecnico}</span>}
                    {m.costo != null && <span className="text-xs text-slate-500">· ${m.costo.toLocaleString("es-AR")}</span>}
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{m.descripcion}</p>
                </div>
                {esAdmin && (
                  <button onClick={() => eliminarMantenimiento(m.id)} className="text-red-400 hover:text-red-300 text-xs shrink-0">Eliminar</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {equipo.historial.length > 0 && (
        <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Historial de cambios</h2>
          <div className="space-y-2">
            {equipo.historial.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <span className="text-slate-600 text-xs shrink-0 mt-0.5">
                  {new Date(h.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <p className="text-slate-400">
                  <span className="font-medium text-slate-300">{h.campo}</span>
                  {h.valorAnterior && <> cambió de <span className="text-red-400">{h.valorAnterior || "vacío"}</span></>}
                  {" "}a <span className="text-emerald-400">{h.valorNuevo || "vacío"}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
