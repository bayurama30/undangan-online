import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const wishes = await prisma.wishMessage.findMany({
    where: { invitationId: Number(id) },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(wishes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const wish = await prisma.wishMessage.create({
    data: {
      invitationId: Number(id),
      name: body.name,
      message: body.message,
      attendance: body.attendance,
    },
  });

  return Response.json(wish);
}
