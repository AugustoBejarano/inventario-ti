import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ tieneUsuarios: count > 0 });
}

export async function POST(request: NextRequest) {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ error: "Ya existe al menos un usuario" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      name: body.name,
      password: hashedPassword,
      role: "ADMIN",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json(user, { status: 201 });
}
