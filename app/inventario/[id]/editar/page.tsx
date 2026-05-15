import { notFound } from "next/navigation";
import EquipoForm from "../../../components/EquipoForm";

async function getEquipo(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/equipos/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EditarEquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const equipo = await getEquipo(id);
  if (!equipo) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar equipo</h1>
        <p className="text-gray-500 mt-1">{equipo.tipo} — {[equipo.marca, equipo.modelo].filter(Boolean).join(" ") || "Sin nombre"}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EquipoForm equipo={equipo} />
      </div>
    </div>
  );
}
