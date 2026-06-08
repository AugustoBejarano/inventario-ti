import EquipoForm from "../../components/EquipoForm";

export default function NuevoEquipoPage() {
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
          ◆ Alta de equipo
        </div>
        <h1 className="text-2xl font-bold text-[#E8F4FF] tracking-tight">Agregar equipo</h1>
        <p className="text-[#6A9AB8] mt-1 text-sm">Completá los datos del nuevo equipo de hardware</p>
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
        <EquipoForm />
      </div>
    </div>
  );
}
