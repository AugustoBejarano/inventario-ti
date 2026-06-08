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

  const nombre = [equipo.marca, equipo.modelo].filter(Boolean).join(" ") || equipo.tipo;

  return (
    <div className="max-w-2xl animate-in">
      <div className="mb-6">
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            color: "#3D6080",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "0.25rem",
          }}
        >
          ◆ Edición de equipo
        </div>
        <h1 className="text-2xl font-bold text-[#E8F4FF] tracking-tight">Editar equipo</h1>
        <p className="text-[#6A9AB8] mt-1 text-sm">{equipo.tipo} — {nombre}</p>
      </div>
      <div
        style={{
          background: "#0C1D33",
          border: "1px solid #1D344E",
          borderRadius: "3px",
          padding: "1.5rem",
          boxShadow: "inset 0 1px 0 rgba(232,151,28,0.08)",
        }}
      >
        <EquipoForm
          equipo={{
            ...equipo,
            marca:           equipo.marca           ?? "",
            modelo:          equipo.modelo          ?? "",
            numeroSerie:     equipo.numeroSerie      ?? "",
            usuarioAsignado: equipo.usuarioAsignado  ?? "",
            ubicacion:       equipo.ubicacion        ?? "",
            notas:           equipo.notas            ?? "",
            sucursal:        equipo.sucursal         ?? "",
          }}
        />
      </div>
    </div>
  );
}
