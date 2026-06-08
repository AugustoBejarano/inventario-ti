"use client";

const config: Record<string, { bg: string; color: string; border: string; label: string }> = {
  ACTIVO: {
    bg: "rgba(34,197,94,0.08)", color: "#22C55E", border: "rgba(34,197,94,0.25)",
    label: "Activo",
  },
  EN_REPARACION: {
    bg: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "rgba(245,158,11,0.25)",
    label: "En reparación",
  },
  DADO_DE_BAJA: {
    bg: "rgba(239,68,68,0.08)", color: "#EF4444", border: "rgba(239,68,68,0.25)",
    label: "Baja",
  },
};

export default function EstadoBadge({ estado }: { estado: string }) {
  const c = config[estado] ?? { bg: "rgba(106,154,184,0.08)", color: "#6A9AB8", border: "rgba(106,154,184,0.25)", label: estado };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.1875rem 0.5rem",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "2px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.625rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: c.color,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, flexShrink: 0, display: "inline-block" }} />
      {c.label}
    </span>
  );
}
