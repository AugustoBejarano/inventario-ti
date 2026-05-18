import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const POR_PAGINA = 50;

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const pagina = Math.max(1, parseInt(searchParams.get("pagina") || "1"));

  const [total, logs] = await prisma.$transaction([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { creadoEn: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
  ]);

  return NextResponse.json({ logs, total, paginas: Math.ceil(total / POR_PAGINA) });
}
