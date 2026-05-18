import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, creadoEn: true },
    orderBy: { creadoEn: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        password: hashedPassword,
        role: body.role === "ADMIN" ? "ADMIN" : "LECTOR",
      },
      select: { id: true, email: true, name: true, role: true, creadoEn: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "El email ya está en uso" }, { status: 409 });
  }
}
