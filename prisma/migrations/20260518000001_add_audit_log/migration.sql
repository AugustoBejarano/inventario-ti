-- CreateEnum
CREATE TYPE "Accion" AS ENUM ('CREAR', 'EDITAR', 'ELIMINAR');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "accion" "Accion" NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "entidadNombre" TEXT,
    "detalle" TEXT,
    "usuarioId" TEXT,
    "usuarioNombre" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
