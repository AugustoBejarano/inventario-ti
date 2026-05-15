import EquipoForm from "../../components/EquipoForm";

export default function NuevoEquipoPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agregar equipo</h1>
        <p className="text-gray-500 mt-1">Completá los datos del nuevo equipo de hardware</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EquipoForm />
      </div>
    </div>
  );
}
