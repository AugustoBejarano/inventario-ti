import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EquipoForm from "../../../components/EquipoForm";

export default async function EditarEquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let equipo;
  try {
    equipo = await prisma.equipo.findUnique({ where: { id } });
  } catch {
    equipo = null;
  }

  if (!equipo) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar equipo</h1>
        <p className="text-gray-500 mt-1">{equipo.tipo} — {[equipo.marca, equipo.modelo].filter(Boolean).join(" ") || "Sin nombre"}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EquipoForm equipo={{ ...equipo, marca: equipo.marca ?? "", modelo: equipo.modelo ?? "", numeroSerie: equipo.numeroSerie ?? "", usuarioAsignado: equipo.usuarioAsignado ?? "", ubicacion: equipo.ubicacion ?? "", notas: equipo.notas ?? "", sucursal: equipo.sucursal ?? "" }} />
      </div>
    </div>
  );
}
