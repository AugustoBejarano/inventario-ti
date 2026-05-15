import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { Estado, Sucursal } from "@prisma/client";

const ESTADO_LABEL: Record<string, string> = {
  ACTIVO: "Activo", EN_REPARACION: "En reparación", DADO_DE_BAJA: "Dado de baja",
};
const SUCURSAL_LABEL: Record<string, string> = {
  CORDOBA: "Córdoba", MONTE_MAIZ: "Monte Maíz", BUENOS_AIRES: "Buenos Aires",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sucursal = searchParams.get("sucursal");
  const estado = searchParams.get("estado");

  const equipos = await prisma.equipo.findMany({
    where: {
      ...(sucursal && { sucursal: sucursal as Sucursal }),
      ...(estado && { estado: estado as Estado }),
    },
    orderBy: [{ sucursal: "asc" }, { tipo: "asc" }],
  });

  const filas = equipos.map((e) => ({
    Tipo: e.tipo,
    Marca: e.marca ?? "",
    Modelo: e.modelo ?? "",
    "N° Serie": e.numeroSerie ?? "",
    Usuario: e.usuarioAsignado ?? "",
    Ubicación: e.ubicacion ?? "",
    Sucursal: e.sucursal ? (SUCURSAL_LABEL[e.sucursal] ?? e.sucursal) : "",
    Estado: ESTADO_LABEL[e.estado] ?? e.estado,
    Notas: e.notas ?? "",
    "Fecha de carga": new Date(e.creadoEn).toLocaleDateString("es-AR"),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(filas);
  ws["!cols"] = [10, 12, 15, 18, 18, 18, 14, 14, 20, 14].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="inventario-ti-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
