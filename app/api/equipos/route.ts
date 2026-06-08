import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Estado, Sucursal } from "@prisma/client";
import { requireAdmin, requireAuth } from "@/lib/session";
import { registrarAuditoria } from "@/lib/auditoria";

const ESTADOS_VALIDOS    = ["ACTIVO", "EN_REPARACION", "DADO_DE_BAJA"] as const;
const SUCURSALES_VALIDAS = ["CORDOBA", "MONTE_MAIZ", "BUENOS_AIRES"]   as const;
const MAX_RESULTS        = 2000;

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const tipo     = searchParams.get("tipo");
  const estado   = searchParams.get("estado");
  const sucursal = searchParams.get("sucursal");
  const busqueda = searchParams.get("busqueda");

  const equipos = await prisma.equipo.findMany({
    where: {
      ...(tipo && { tipo }),
      ...(estado   && ESTADOS_VALIDOS.includes(estado as Estado)       && { estado:   estado   as Estado   }),
      ...(sucursal && SUCURSALES_VALIDAS.includes(sucursal as Sucursal) && { sucursal: sucursal as Sucursal }),
      ...(busqueda && {
        OR: [
          { marca:           { contains: busqueda, mode: "insensitive" } },
          { modelo:          { contains: busqueda, mode: "insensitive" } },
          { numeroSerie:     { contains: busqueda, mode: "insensitive" } },
          { usuarioAsignado: { contains: busqueda, mode: "insensitive" } },
          { ubicacion:       { contains: busqueda, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { creadoEn: "desc" },
    take: MAX_RESULTS,
  });

  return NextResponse.json(equipos);
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await request.json();

  if (!body.tipo) {
    return NextResponse.json({ error: "El tipo es obligatorio" }, { status: 400 });
  }
  if (body.estado && !ESTADOS_VALIDOS.includes(body.estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  if (body.sucursal && !SUCURSALES_VALIDAS.includes(body.sucursal)) {
    return NextResponse.json({ error: "Sucursal inválida" }, { status: 400 });
  }

  const equipo = await prisma.equipo.create({
    data: {
      tipo:            body.tipo,
      marca:           body.marca           || null,
      modelo:          body.modelo          || null,
      numeroSerie:     body.numeroSerie      || null,
      usuarioAsignado: body.usuarioAsignado  || null,
      ubicacion:       body.ubicacion        || null,
      sucursal:        body.sucursal         || null,
      estado:          body.estado           || "ACTIVO",
      notas:           body.notas            || null,
    },
  });

  await registrarAuditoria({
    accion: "CREAR",
    entidad: "Equipo",
    entidadId: equipo.id,
    entidadNombre: [equipo.marca, equipo.modelo, equipo.tipo].filter(Boolean).join(" "),
    usuarioId:   session!.user.id,
    usuarioNombre: session!.user.name,
  });

  return NextResponse.json(equipo, { status: 201 });
}
