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

const ACCION_STYLE: Record<string, string> = {
  CREAR: "bg-green-100 text-green-700",
  EDITAR: "bg-blue-100 text-blue-700",
  ELIMINAR: "bg-red-100 text-red-700",
};

const ACCION_LABEL: Record<string, string> = {
  CREAR: "Crear",
  EDITAR: "Editar",
  ELIMINAR: "Eliminar",
};

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
    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
    setCargando(true);
    fetch(`/api/auditoria?pagina=${pagina}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs);
        setTotal(data.total);
        setPaginas(data.paginas);
        setCargando(false);
      });
  }, [pagina, status, session]);

  if (status === "loading") {
    return <div className="text-center py-16 text-gray-400">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
        <p className="text-gray-500 mt-1">{total} registro{total !== 1 ? "s" : ""} en total</p>
      </div>

      {cargando ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Sin registros de auditoría aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Fecha y hora</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Acción</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Entidad</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const detalle = log.detalle ? JSON.parse(log.detalle) : null;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.creadoEn).toLocaleDateString("es-AR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                        })}{" "}
                        {new Date(log.creadoEn).toLocaleTimeString("es-AR", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACCION_STYLE[log.accion]}`}>
                          {ACCION_LABEL[log.accion]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{log.entidad}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{log.entidadNombre || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{log.usuarioNombre || "—"}</td>
                      <td className="px-4 py-3">
                        {detalle ? (
                          <button
                            onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            {expandido === log.id ? "Ocultar" : "Ver cambios"}
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                        {expandido === log.id && detalle && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 space-y-1 max-w-xs">
                            {detalle.cambios
                              ? detalle.cambios.map((c: string, i: number) => (
                                  <p key={i}>{c}</p>
                                ))
                              : Object.entries(detalle).map(([k, v]) => (
                                  <p key={k}><span className="font-medium">{k}:</span> {String(v)}</p>
                                ))}
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
          <p className="text-sm text-gray-500">
            Página {pagina} de {paginas}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina((p) => p - 1)}
              disabled={pagina === 1}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPagina((p) => p + 1)}
              disabled={pagina === paginas}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
