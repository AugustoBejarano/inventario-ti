import { prisma } from "@/lib/prisma";

export async function registrarAuditoria({
  accion,
  entidad,
  entidadId,
  entidadNombre,
  detalle,
  usuarioId,
  usuarioNombre,
}: {
  accion: "CREAR" | "EDITAR" | "ELIMINAR";
  entidad: string;
  entidadId: string;
  entidadNombre?: string;
  detalle?: object;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      accion,
      entidad,
      entidadId,
      entidadNombre: entidadNombre ?? null,
      detalle: detalle ? JSON.stringify(detalle) : null,
      usuarioId: usuarioId ?? null,
      usuarioNombre: usuarioNombre ?? null,
    },
  });
}
