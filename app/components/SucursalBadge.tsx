"use client";

const colores: Record<string, string> = {
  CORDOBA:       "bg-purple-900/50 text-purple-400 border border-purple-700/50",
  MONTE_MAIZ:    "bg-sky-900/50 text-sky-400 border border-sky-700/50",
  BUENOS_AIRES:  "bg-indigo-900/50 text-indigo-400 border border-indigo-700/50",
};

const etiquetas: Record<string, string> = {
  CORDOBA:      "Córdoba",
  MONTE_MAIZ:   "Monte Maíz",
  BUENOS_AIRES: "Buenos Aires",
};

export default function SucursalBadge({ sucursal }: { sucursal: string | null }) {
  if (!sucursal) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colores[sucursal] ?? "bg-slate-800 text-slate-400"}`}>
      {etiquetas[sucursal] ?? sucursal}
    </span>
  );
}
