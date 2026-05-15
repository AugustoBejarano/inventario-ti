"use client";

import { useState } from "react";

const TIPOS_MANTENIMIENTO = ["Preventivo", "Correctivo", "Limpieza", "Actualización", "Reemplazo de pieza", "Otro"];

interface Props {
  equipoId: string;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function MantenimientoForm({ equipoId, onGuardado, onCancelar }: Props) {
  const [form, setForm] = useState({
    tipo: "",
    descripcion: "",
    tecnico: "",
    costo: "",
    fecha: new Date().toISOString().slice(0, 10),
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo || !form.descripcion) { setError("Tipo y descripción son obligatorios"); return; }
    setGuardando(true);
    setError("");

    const res = await fetch(`/api/equipos/${equipoId}/mantenimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onGuardado();
    } else {
      setError("Error al guardar");
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-900">Registrar mantenimiento</h3>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="input-field">
            <option value="">Seleccioná un tipo</option>
            {TIPOS_MANTENIMIENTO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
          <input name="tecnico" value={form.tecnico} onChange={handleChange} placeholder="Nombre del técnico" className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Costo ($)</label>
          <input type="number" name="costo" value={form.costo} onChange={handleChange} placeholder="0.00" className="input-field" min="0" step="0.01" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} placeholder="Describí el trabajo realizado..." className="input-field resize-none" />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Guardar"}</button>
        <button type="button" onClick={onCancelar} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}
