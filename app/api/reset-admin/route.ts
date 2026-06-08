import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SECRET = "boiero-reset-2026";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.secret !== SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ error: "Faltan campos: name, email, password" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.upsert({
    where: { email: body.email.toLowerCase() },
    update: { password: hashedPassword, role: "ADMIN", name: body.name },
    create: {
      email: body.email.toLowerCase(),
      name: body.name,
      password: hashedPassword,
      role: "ADMIN",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
