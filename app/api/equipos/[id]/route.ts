import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { registrarAuditoria } from "@/lib/auditoria";

const CAMPOS_LABEL: Record<string, string> = {
  tipo: "Tipo", marca: "Marca", modelo: "Modelo", numeroSerie: "N° Serie",
  usuarioAsignado: "Usuario", ubicacion: "Ubicación", sucursal: "Sucursal",
  estado: "Estado", notas: "Notas",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const equipo = await prisma.equipo.findUnique({
    where: { id },
    include: {
      mantenimientos: { orderBy: { fecha: "desc" } },
      historial: { orderBy: { creadoEn: "desc" } },
    },
  });
  if (!equipo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(equipo);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  const anterior = await prisma.equipo.findUnique({ where: { id } });
  if (!anterior) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const campos = ["tipo", "marca", "modelo", "numeroSerie", "usuarioAsignado", "ubicacion", "sucursal", "estado", "notas"];
  const cambios = campos
    .filter((c) => (body[c] || null) !== (anterior[c as keyof typeof anterior] || null))
    .map((c) => ({
      equipoId: id,
      campo: CAMPOS_LABEL[c] ?? c,
      valorAnterior: String(anterior[c as keyof typeof anterior] ?? ""),
      valorNuevo: String(body[c] ?? ""),
    }));

  const [equipo] = await prisma.$transaction([
    prisma.equipo.update({
      where: { id },
      data: {
        tipo: body.tipo,
        marca: body.marca || null,
        modelo: body.modelo || null,
        numeroSerie: body.numeroSerie || null,
        usuarioAsignado: body.usuarioAsignado || null,
        ubicacion: body.ubicacion || null,
        sucursal: body.sucursal || null,
        estado: body.estado,
        notas: body.notas || null,
      },
    }),
    ...(cambios.length > 0 ? [prisma.historialCambio.createMany({ data: cambios })] : []),
  ]);

  await registrarAuditoria({
    accion: "EDITAR",
    entidad: "Equipo",
    entidadId: id,
    entidadNombre: [body.marca, body.modelo, body.tipo].filter(Boolean).join(" "),
    detalle: cambios.length > 0 ? { cambios: cambios.map((c) => `${c.campo}: "${c.valorAnterior}" → "${c.valorNuevo}"`) } : undefined,
    usuarioId: session!.user.id,
    usuarioNombre: session!.user.name,
  });

  return NextResponse.json(equipo);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const equipo = await prisma.equipo.findUnique({ where: { id } });
  if (!equipo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.equipo.delete({ where: { id } });

  await registrarAuditoria({
    accion: "ELIMINAR",
    entidad: "Equipo",
    entidadId: id,
    entidadNombre: [equipo.marca, equipo.modelo, equipo.tipo].filter(Boolean).join(" "),
    usuarioId: session!.user.id,
    usuarioNombre: session!.user.name,
  });

  return NextResponse.json({ ok: true });
}
