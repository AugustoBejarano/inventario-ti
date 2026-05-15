import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const estado = searchParams.get("estado");
  const busqueda = searchParams.get("busqueda");

  const equipos = await prisma.equipo.findMany({
    where: {
      ...(tipo && { tipo }),
      ...(estado && { estado: estado as "ACTIVO" | "EN_REPARACION" | "DADO_DE_BAJA" }),
      ...(busqueda && {
        OR: [
          { marca: { contains: busqueda, mode: "insensitive" } },
          { modelo: { contains: busqueda, mode: "insensitive" } },
          { numeroSerie: { contains: busqueda, mode: "insensitive" } },
          { usuarioAsignado: { contains: busqueda, mode: "insensitive" } },
          { ubicacion: { contains: busqueda, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json(equipos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const equipo = await prisma.equipo.create({
    data: {
      tipo: body.tipo,
      marca: body.marca || null,
      modelo: body.modelo || null,
      numeroSerie: body.numeroSerie || null,
      usuarioAsignado: body.usuarioAsignado || null,
      ubicacion: body.ubicacion || null,
      estado: body.estado || "ACTIVO",
      notas: body.notas || null,
    },
  });

  return NextResponse.json(equipo, { status: 201 });
}
