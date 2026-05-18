import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SUCURSAL_LABEL: Record<string, string> = {
  CORDOBA: "Córdoba", MONTE_MAIZ: "Monte Maíz", BUENOS_AIRES: "Buenos Aires",
};

async function getStats() {
  try {
    const [total, activos, enReparacion, dadosDeBaja, porTipo, porSucursal] = await Promise.all([
      prisma.equipo.count(),
      prisma.equipo.count({ where: { estado: "ACTIVO" } }),
      prisma.equipo.count({ where: { estado: "EN_REPARACION" } }),
      prisma.equipo.count({ where: { estado: "DADO_DE_BAJA" } }),
      prisma.equipo.groupBy({ by: ["tipo"], _count: { tipo: true }, orderBy: { _count: { tipo: "desc" } } }),
      prisma.equipo.groupBy({ by: ["sucursal"], _count: { sucursal: true }, orderBy: { _count: { sucursal: "desc" } } }),
    ]);
    return { total, activos, enReparacion, dadosDeBaja, porTipo, porSucursal };
  } catch {
    return null;
  }
}

export default async function Dashboard() {
  const stats = await getStats();

  const tarjetas = [
    { label: "Total equipos",  valor: stats?.total ?? 0,         color: "bg-[#1E3A5F] border-[#2A6399]",  icono: "🖥️" },
    { label: "Activos",        valor: stats?.activos ?? 0,       color: "bg-emerald-900/60 border-emerald-700/50", icono: "✅" },
    { label: "En reparación",  valor: stats?.enReparacion ?? 0,  color: "bg-amber-900/60 border-amber-700/50",    icono: "🔧" },
    { label: "Dados de baja",  valor: stats?.dadosDeBaja ?? 0,   color: "bg-red-900/60 border-red-700/50",        icono: "❌" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 mt-1">Resumen del inventario de hardware</p>
        </div>
        <Link href="/inventario/nuevo" className="btn-primary">+ Agregar equipo</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((t) => (
          <div key={t.label} className={`rounded-xl border p-6 flex items-center gap-4 ${t.color}`}>
            <div className="w-12 h-12 rounded-lg bg-black/20 flex items-center justify-center text-xl">
              {t.icono}
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-100">{t.valor}</p>
              <p className="text-sm text-slate-400">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.porTipo.length > 0 && (
            <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Por tipo</h2>
              <div className="space-y-3">
                {stats.porTipo.map((item: { tipo: string; _count: { tipo: number } }) => {
                  const pct = stats.total > 0 ? Math.round((item._count.tipo / stats.total) * 100) : 0;
                  return (
                    <div key={item.tipo}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300 font-medium">{item.tipo}</span>
                        <span className="text-slate-500">{item._count.tipo} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#243D5E] rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stats.porSucursal.filter((s: { sucursal: string | null }) => s.sucursal).length > 0 && (
            <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Por sucursal</h2>
              <div className="space-y-3">
                {stats.porSucursal
                  .filter((s: { sucursal: string | null }) => s.sucursal)
                  .map((item: { sucursal: string | null; _count: { sucursal: number } }) => {
                    const pct = stats.total > 0 ? Math.round((item._count.sucursal / stats.total) * 100) : 0;
                    return (
                      <div key={item.sucursal}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300 font-medium">{SUCURSAL_LABEL[item.sucursal!] ?? item.sucursal}</span>
                          <span className="text-slate-500">{item._count.sucursal} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-[#243D5E] rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {!stats && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-6 text-center text-amber-400">
          <p className="font-medium">Base de datos no conectada</p>
          <p className="text-sm mt-1 text-amber-500">Configurá la variable <code>DATABASE_URL</code> para ver los datos.</p>
        </div>
      )}
    </div>
  );
}
