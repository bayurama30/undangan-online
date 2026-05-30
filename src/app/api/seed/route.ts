import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const existing = await prisma.admin.findUnique({ where: { username: "admin" } });
    if (existing) {
      return NextResponse.json({ message: "Admin user already exists" });
    }

    const password = bcrypt.hashSync("admin123", 10);
    await prisma.admin.create({
      data: { username: "admin", password },
    });

    return NextResponse.json({ message: "Admin user created: admin / admin123" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
