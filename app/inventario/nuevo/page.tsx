import EquipoForm from "../../components/EquipoForm";

export default function NuevoEquipoPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Agregar equipo</h1>
        <p className="text-slate-400 mt-1">Completá los datos del nuevo equipo de hardware</p>
      </div>
      <div className="bg-[#1A2D47] rounded-xl border border-[#243D5E] p-6">
        <EquipoForm />
      </div>
    </div>
  );
}
