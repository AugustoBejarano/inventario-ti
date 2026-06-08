"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIPOS   = ["PC", "Laptop", "Monitor", "Impresora", "Switch", "Router", "Servidor", "Teclado", "Mouse", "UPS", "Otro"];
const ESTADOS = [
  { value: "ACTIVO",        label: "Activo" },
  { value: "EN_REPARACION", label: "En reparación" },
  { value: "DADO_DE_BAJA",  label: "Dado de baja" },
];
const SUCURSALES = [
  { value: "CORDOBA",      label: "Córdoba" },
  { value: "MONTE_MAIZ",   label: "Monte Maíz" },
  { value: "BUENOS_AIRES", label: "Buenos Aires" },
];

interface Equipo {
  id?: string;
  tipo: string; marca: string; modelo: string; numeroSerie: string;
  usuarioAsignado: string; ubicacion: string; sucursal: string;
  estado: string; notas: string;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "0.5625rem",
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#3D6080",
  marginBottom: "0.375rem",
};

export default function EquipoForm({ equipo }: { equipo?: Equipo }) {
  const router = useRouter();
  const isEdit = !!equipo?.id;

  const [form, setForm] = useState<Equipo>({
    tipo:            equipo?.tipo            ?? "",
    marca:           equipo?.marca           ?? "",
    modelo:          equipo?.modelo          ?? "",
    numeroSerie:     equipo?.numeroSerie     ?? "",
    usuarioAsignado: equipo?.usuarioAsignado ?? "",
    ubicacion:       equipo?.ubicacion       ?? "",
    sucursal:        equipo?.sucursal        ?? "",
    estado:          equipo?.estado          ?? "ACTIVO",
    notas:           equipo?.notas           ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo) { setError("El tipo es obligatorio"); return; }
    setGuardando(true);
    setError("");

    const url    = isEdit ? `/api/equipos/${equipo!.id}` : "/api/equipos";
    const method = isEdit ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      if (isEdit) router.push(`/inventario/${equipo!.id}`);
      else router.push("/inventario");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "2px",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#EF4444" }}>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Tipo *</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="input-field">
            <option value="">Seleccioná un tipo</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} className="input-field">
            {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Marca</label>
          <input name="marca" value={form.marca} onChange={handleChange} placeholder="ej. HP, Dell, Lenovo" className="input-field" />
        </div>
        <div>
          <label style={labelStyle}>Modelo</label>
          <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="ej. EliteBook 840" className="input-field" />
        </div>
        <div>
          <label style={labelStyle}>Número de serie</label>
          <input name="numeroSerie" value={form.numeroSerie} onChange={handleChange} placeholder="ej. CZC12345678" className="input-field" />
        </div>
        <div>
          <label style={labelStyle}>Usuario asignado</label>
          <input name="usuarioAsignado" value={form.usuarioAsignado} onChange={handleChange} placeholder="ej. Juan Pérez" className="input-field" />
        </div>
        <div>
          <label style={labelStyle}>Sucursal</label>
          <select name="sucursal" value={form.sucursal} onChange={handleChange} className="input-field">
            <option value="">Sin sucursal</option>
            {SUCURSALES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ubicación</label>
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="ej. Oficina 3 - Piso 2" className="input-field" />
        </div>
        <div className="md:col-span-2">
          <label style={labelStyle}>Notas</label>
          <textarea
            name="notas"
            value={form.notas}
            onChange={handleChange}
            rows={3}
            placeholder="Observaciones adicionales..."
            className="input-field resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={guardando} className="btn-primary">
          {guardando ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar equipo"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
