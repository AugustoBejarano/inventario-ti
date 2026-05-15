"use client";

const colores: Record<string, string> = {
  CORDOBA: "bg-purple-100 text-purple-800",
  MONTE_MAIZ: "bg-blue-100 text-blue-800",
  BUENOS_AIRES: "bg-indigo-100 text-indigo-800",
};

const etiquetas: Record<string, string> = {
  CORDOBA: "Córdoba",
  MONTE_MAIZ: "Monte Maíz",
  BUENOS_AIRES: "Buenos Aires",
};

export default function SucursalBadge({ sucursal }: { sucursal: string | null }) {
  if (!sucursal) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colores[sucursal] ?? "bg-gray-100 text-gray-800"}`}>
      {etiquetas[sucursal] ?? sucursal}
    </span>
  );
}
