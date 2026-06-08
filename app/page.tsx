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

const STAT_CARDS = [
  {
    key: "total",
    label: "Total",
    sublabel: "equipos registrados",
    accentColor: "#E8971C",
    borderColor: "rgba(232,151,28,0.20)",
  },
  {
    key: "activos",
    label: "Activos",
    sublabel: "en operación",
    accentColor: "#22C55E",
    borderColor: "rgba(34,197,94,0.20)",
  },
  {
    key: "enReparacion",
    label: "Reparación",
    sublabel: "en servicio técnico",
    accentColor: "#F59E0B",
    borderColor: "rgba(245,158,11,0.20)",
  },
  {
    key: "dadosDeBaja",
    label: "Baja",
    sublabel: "dados de baja",
    accentColor: "#EF4444",
    borderColor: "rgba(239,68,68,0.20)",
  },
];

export default async function Dashboard() {
  const stats = await getStats();

  const valores: Record<string, number> = {
    total:        stats?.total        ?? 0,
    activos:      stats?.activos      ?? 0,
    enReparacion: stats?.enReparacion ?? 0,
    dadosDeBaja:  stats?.dadosDeBaja  ?? 0,
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className="mb-1"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#3D6080", letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            ◆ Panel de control
          </div>
          <h1 className="text-2xl font-bold text-[#E8F4FF] tracking-tight">Dashboard</h1>
        </div>
        <Link href="/inventario/nuevo" className="btn-primary">+ Agregar equipo</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            style={{
              background: "#0C1D33",
              border: `1px solid ${card.borderColor}`,
              borderRadius: "3px",
              padding: "1.25rem",
              boxShadow: `inset 0 1px 0 ${card.accentColor}20`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent stripe */}
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, ${card.accentColor} 0%, transparent 70%)`,
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.5625rem",
                color: "#3D6080",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "2.5rem",
                fontWeight: 600,
                color: card.accentColor,
                lineHeight: 1,
                marginBottom: "0.375rem",
              }}
            >
              {valores[card.key]}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#3D6080" }}>
              {card.sublabel}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {stats.porTipo.length > 0 && (
            <div
              style={{
                background: "#0C1D33",
                border: "1px solid #1D344E",
                borderRadius: "3px",
                padding: "1.5rem",
                boxShadow: "inset 0 1px 0 rgba(232,151,28,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.5625rem",
                  color: "#3D6080",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                ▸ Distribución por tipo
              </div>
              <div className="space-y-3">
                {stats.porTipo.map((item: { tipo: string; _count: { tipo: number } }) => {
                  const pct = stats.total > 0 ? Math.round((item._count.tipo / stats.total) * 100) : 0;
                  return (
                    <div key={item.tipo}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm text-[#A0C2D8] font-medium">{item.tipo}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080" }}>
                          {item._count.tipo} <span style={{ opacity: 0.5 }}>/ {pct}%</span>
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "3px",
                          background: "#1D344E",
                          borderRadius: "1px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, #E8971C, #F5B941)",
                            borderRadius: "1px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stats.porSucursal.filter((s: { sucursal: string | null }) => s.sucursal).length > 0 && (
            <div
              style={{
                background: "#0C1D33",
                border: "1px solid #1D344E",
                borderRadius: "3px",
                padding: "1.5rem",
                boxShadow: "inset 0 1px 0 rgba(0,186,219,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.5625rem",
                  color: "#3D6080",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                ▸ Distribución por sucursal
              </div>
              <div className="space-y-3">
                {stats.porSucursal
                  .filter((s: { sucursal: string | null }) => s.sucursal)
                  .map((item: { sucursal: string | null; _count: { sucursal: number } }) => {
                    const pct = stats.total > 0 ? Math.round((item._count.sucursal / stats.total) * 100) : 0;
                    const colors: Record<string, string> = {
                      CORDOBA: "#E8971C", MONTE_MAIZ: "#00BADB", BUENOS_AIRES: "#818CF8",
                    };
                    const color = colors[item.sucursal!] ?? "#6A9AB8";
                    return (
                      <div key={item.sucursal}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-sm text-[#A0C2D8] font-medium">
                            {SUCURSAL_LABEL[item.sucursal!] ?? item.sucursal}
                          </span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#3D6080" }}>
                            {item._count.sucursal} <span style={{ opacity: 0.5 }}>/ {pct}%</span>
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "3px",
                            background: "#1D344E",
                            borderRadius: "1px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: color,
                              borderRadius: "1px",
                            }}
                          />
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
        <div
          className="p-6 text-center rounded-sm"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.20)",
          }}
        >
          <p className="font-semibold text-[#F59E0B]">Base de datos no conectada</p>
          <p
            className="mt-1"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#C97B12" }}
          >
            Configurá la variable <code>DATABASE_URL</code> para ver los datos.
          </p>
        </div>
      )}
    </div>
  );
}
