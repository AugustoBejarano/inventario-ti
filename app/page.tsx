import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [total, activos, enReparacion, dadosDeBaja, porTipo] = await Promise.all([
      prisma.equipo.count(),
      prisma.equipo.count({ where: { estado: "ACTIVO" } }),
      prisma.equipo.count({ where: { estado: "EN_REPARACION" } }),
      prisma.equipo.count({ where: { estado: "DADO_DE_BAJA" } }),
      prisma.equipo.groupBy({ by: ["tipo"], _count: { tipo: true }, orderBy: { _count: { tipo: "desc" } } }),
    ]);
    return { total, activos, enReparacion, dadosDeBaja, porTipo };
  } catch {
    return null;
  }
}

export default async function Dashboard() {
  const stats = await getStats();

  const tarjetas = [
    { label: "Total equipos", valor: stats?.total ?? 0, color: "bg-blue-600", icono: "🖥️" },
    { label: "Activos", valor: stats?.activos ?? 0, color: "bg-green-600", icono: "✅" },
    { label: "En reparación", valor: stats?.enReparacion ?? 0, color: "bg-yellow-500", icono: "🔧" },
    { label: "Dados de baja", valor: stats?.dadosDeBaja ?? 0, color: "bg-red-500", icono: "❌" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen del inventario de hardware</p>
        </div>
        <Link href="/inventario/nuevo" className="btn-primary">
          + Agregar equipo
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((t) => (
          <div key={t.label} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
            <div className={`${t.color} rounded-lg w-12 h-12 flex items-center justify-center text-xl`}>
              {t.icono}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{t.valor}</p>
              <p className="text-sm text-gray-500">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {stats?.porTipo && stats.porTipo.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipos por tipo</h2>
          <div className="space-y-3">
            {stats.porTipo.map((item: { tipo: string; _count: { tipo: number } }) => {
              const pct = stats.total > 0 ? Math.round((item._count.tipo / stats.total) * 100) : 0;
              return (
                <div key={item.tipo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{item.tipo}</span>
                    <span className="text-gray-500">{item._count.tipo} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!stats && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center text-yellow-800">
          <p className="font-medium">Base de datos no conectada</p>
          <p className="text-sm mt-1">Configurá la variable <code>DATABASE_URL</code> para ver los datos.</p>
        </div>
      )}
    </div>
  );
}
