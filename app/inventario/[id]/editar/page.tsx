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
        <h1 className="text-2xl font-bold text-slate-100">Editar equipo</h1>
        <p className="text-slate-400 mt-1">{equipo.tipo} — {[equipo.marca, equipo.modelo].filter(Boolean).join(" ") || "Sin nombre"}</p>
      </div>
      <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
        <EquipoForm equipo={{ ...equipo, marca: equipo.marca ?? "", modelo: equipo.modelo ?? "", numeroSerie: equipo.numeroSerie ?? "", usuarioAsignado: equipo.usuarioAsignado ?? "", ubicacion: equipo.ubicacion ?? "", notas: equipo.notas ?? "", sucursal: equipo.sucursal ?? "" }} />
      </div>
    </div>
  );
}
