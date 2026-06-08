"use client";

const config: Record<string, { bg: string; color: string; border: string; label: string }> = {
  CORDOBA: {
    bg: "rgba(232,151,28,0.08)", color: "#E8971C", border: "rgba(232,151,28,0.25)",
    label: "Córdoba",
  },
  MONTE_MAIZ: {
    bg: "rgba(0,186,219,0.08)", color: "#00BADB", border: "rgba(0,186,219,0.25)",
    label: "Monte Maíz",
  },
  BUENOS_AIRES: {
    bg: "rgba(129,140,248,0.08)", color: "#818CF8", border: "rgba(129,140,248,0.25)",
    label: "Bs. Aires",
  },
};

export default function SucursalBadge({ sucursal }: { sucursal: string | null }) {
  if (!sucursal) {
    return (
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#2A4A68" }}>
        —
      </span>
    );
  }
  const c = config[sucursal] ?? { bg: "rgba(106,154,184,0.08)", color: "#6A9AB8", border: "rgba(106,154,184,0.25)", label: sucursal };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.1875rem 0.5rem",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "2px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.625rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: c.color,
      }}
    >
      {c.label}
    </span>
  );
}
