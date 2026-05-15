import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const equipo = await prisma.equipo.findUnique({ where: { id } });
  if (!equipo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(equipo);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const equipo = await prisma.equipo.update({
    where: { id },
    data: {
      tipo: body.tipo,
      marca: body.marca || null,
      modelo: body.modelo || null,
      numeroSerie: body.numeroSerie || null,
      usuarioAsignado: body.usuarioAsignado || null,
      ubicacion: body.ubicacion || null,
      estado: body.estado,
      notas: body.notas || null,
    },
  });

  return NextResponse.json(equipo);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.equipo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
