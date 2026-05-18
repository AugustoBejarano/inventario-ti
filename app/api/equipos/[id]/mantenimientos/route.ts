import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  const mantenimiento = await prisma.mantenimiento.create({
    data: {
      equipoId: id,
      tipo: body.tipo,
      descripcion: body.descripcion,
      tecnico: body.tecnico || null,
      costo: body.costo ? parseFloat(body.costo) : null,
      fecha: body.fecha ? new Date(body.fecha) : new Date(),
    },
  });

  return NextResponse.json(mantenimiento, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id: equipoId } = await params;
  const { searchParams } = new URL(request.url);
  const mantenimientoId = searchParams.get("mid");
  if (!mantenimientoId) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  await prisma.mantenimiento.delete({ where: { id: mantenimientoId, equipoId } });
  return NextResponse.json({ ok: true });
}
