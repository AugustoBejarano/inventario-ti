"use client";

const colores: Record<string, string> = {
  ACTIVO:        "bg-emerald-900/50 text-emerald-400 border border-emerald-700/50",
  EN_REPARACION: "bg-amber-900/50 text-amber-400 border border-amber-700/50",
  DADO_DE_BAJA:  "bg-red-900/50 text-red-400 border border-red-700/50",
};

const etiquetas: Record<string, string> = {
  ACTIVO: "Activo",
  EN_REPARACION: "En reparación",
  DADO_DE_BAJA: "Dado de baja",
};

export default function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colores[estado] ?? "bg-slate-800 text-slate-400"}`}>
      {etiquetas[estado] ?? estado}
    </span>
  );
}
