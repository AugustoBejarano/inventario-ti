import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, activos, enReparacion, dadosDeBaja, porTipo] = await Promise.all([
    prisma.equipo.count(),
    prisma.equipo.count({ where: { estado: "ACTIVO" } }),
    prisma.equipo.count({ where: { estado: "EN_REPARACION" } }),
    prisma.equipo.count({ where: { estado: "DADO_DE_BAJA" } }),
    prisma.equipo.groupBy({ by: ["tipo"], _count: { tipo: true }, orderBy: { _count: { tipo: "desc" } } }),
  ]);

  return NextResponse.json({ total, activos, enReparacion, dadosDeBaja, porTipo });
}
