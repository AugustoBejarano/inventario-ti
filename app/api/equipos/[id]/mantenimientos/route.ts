import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { registrarAuditoria } from "@/lib/auditoria";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  const costoRaw = body.costo ? parseFloat(body.costo) : null;
  const costo = costoRaw !== null && !isNaN(costoRaw) && costoRaw >= 0 ? costoRaw : null;

  const fechaRaw = body.fecha ? new Date(body.fecha) : new Date();
  const fecha = isNaN(fechaRaw.getTime()) ? new Date() : fechaRaw;

  const mantenimiento = await prisma.mantenimiento.create({
    data: {
      equipoId: id,
      tipo: body.tipo,
      descripcion: body.descripcion,
      tecnico: body.tecnico || null,
      costo,
      fecha,
    },
  });

  const equipo = await prisma.equipo.findUnique({ where: { id }, select: { marca: true, modelo: true, tipo: true } });

  await registrarAuditoria({
    accion: "CREAR",
    entidad: "Mantenimiento",
    entidadId: mantenimiento.id,
    entidadNombre: `${body.tipo} en ${[equipo?.marca, equipo?.modelo, equipo?.tipo].filter(Boolean).join(" ")}`,
    detalle: { descripcion: body.descripcion, tecnico: body.tecnico, costo: body.costo },
    usuarioId: session!.user.id,
    usuarioNombre: session!.user.name,
  });

  return NextResponse.json(mantenimiento, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id: equipoId } = await params;
  const { searchParams } = new URL(request.url);
  const mantenimientoId = searchParams.get("mid");
  if (!mantenimientoId) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const mantenimiento = await prisma.mantenimiento.findUnique({ where: { id: mantenimientoId } });

  await prisma.mantenimiento.delete({ where: { id: mantenimientoId, equipoId } });

  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId }, select: { marca: true, modelo: true, tipo: true } });

  await registrarAuditoria({
    accion: "ELIMINAR",
    entidad: "Mantenimiento",
    entidadId: mantenimientoId,
    entidadNombre: `${mantenimiento?.tipo ?? "Mantenimiento"} en ${[equipo?.marca, equipo?.modelo, equipo?.tipo].filter(Boolean).join(" ")}`,
    usuarioId: session!.user.id,
    usuarioNombre: session!.user.name,
  });

  return NextResponse.json({ ok: true });
}
