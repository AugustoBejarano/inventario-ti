"use client";

const colores: Record<string, string> = {
  ACTIVO: "bg-green-100 text-green-800",
  EN_REPARACION: "bg-yellow-100 text-yellow-800",
  DADO_DE_BAJA: "bg-red-100 text-red-800",
};

const etiquetas: Record<string, string> = {
  ACTIVO: "Activo",
  EN_REPARACION: "En reparación",
  DADO_DE_BAJA: "Dado de baja",
};

export default function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colores[estado] ?? "bg-gray-100 text-gray-800"}`}>
      {etiquetas[estado] ?? estado}
    </span>
  );
}
