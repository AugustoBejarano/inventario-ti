"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LogEntry { id: string; accion: "CREAR" | "EDITAR" | "ELIMINAR"; entidad: string; entidadNombre: string | null; detalle: string | null; usuarioNombre: string | null; creadoEn: string; }

const ACCION_STYLE: Record<string, string> = {
  CREAR:    "bg-emerald-900/50 text-emerald-400 border border-emerald-700/50",
  EDITAR:   "bg-blue-900/50 text-blue-400 border border-blue-700/50",
  ELIMINAR: "bg-red-900/50 text-red-400 border border-red-700/50",
};
const ACCION_LABEL: Record<string, string> = { CREAR: "Crear", EDITAR: "Editar", ELIMINAR: "Eliminar" };

export default function AuditoriaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [paginas, setPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session.user.role !== "ADMIN") router.replace("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
    setCargando(true);
    fetch(`/api/auditoria?pagina=${pagina}`).then((r) => r.json()).then((data) => {
      setLogs(data.logs); setTotal(data.total); setPaginas(data.paginas); setCargando(false);
    });
  }, [pagina, status, session]);

  if (status === "loading") return <div className="text-center py-16 text-slate-500">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Auditoría</h1>
        <p className="text-slate-400 mt-1">{total} registro{total !== 1 ? "s" : ""} en total</p>
      </div>

      {cargando ? (
        <div className="text-center py-16 text-slate-500">Cargando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-[#1A2D47] rounded-xl border border-[#243D5E]">
          <p className="text-slate-400">Sin registros de auditoría aún.</p>
        </div>
      ) : (
        <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0F1E32] border-b border-[#243D5E]">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Fecha y hora</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Acción</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Entidad</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243D5E]">
                {logs.map((log) => {
                  const detalle = log.detalle ? JSON.parse(log.detalle) : null;
                  return (
                    <tr key={log.id} className="hover:bg-[#1E3A5F]/30 transition-colors">
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(log.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}{" "}
                        {new Date(log.creadoEn).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACCION_STYLE[log.accion]}`}>
                          {ACCION_LABEL[log.accion]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{log.entidad}</td>
                      <td className="px-4 py-3 text-slate-200 font-medium">{log.entidadNombre || "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{log.usuarioNombre || "—"}</td>
                      <td className="px-4 py-3">
                        {detalle ? (
                          <button onClick={() => setExpandido(expandido === log.id ? null : log.id)} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                            {expandido === log.id ? "Ocultar" : "Ver cambios"}
                          </button>
                        ) : <span className="text-slate-700 text-xs">—</span>}
                        {expandido === log.id && detalle && (
                          <div className="mt-2 text-xs text-slate-400 bg-[#162035] border border-[#243D5E] rounded p-2 space-y-1 max-w-xs">
                            {detalle.cambios
                              ? detalle.cambios.map((c: string, i: number) => <p key={i}>{c}</p>)
                              : Object.entries(detalle).map(([k, v]) => <p key={k}><span className="font-medium text-slate-300">{k}:</span> {String(v)}</p>)}
                          </div>
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
          <p className="text-sm text-slate-500">Página {pagina} de {paginas}</p>
          <div className="flex gap-2">
            <button onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1} className="btn-secondary text-xs px-3 py-1.5">← Anterior</button>
            <button onClick={() => setPagina((p) => p + 1)} disabled={pagina === paginas} className="btn-secondary text-xs px-3 py-1.5">Siguiente →</button>
          </div>
        </div>
      )}
    </div>
  );
}
