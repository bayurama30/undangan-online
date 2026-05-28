import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { orders } = body;

  if (!Array.isArray(orders)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.$transaction(
    orders.map((item: { id: number; order: number }) =>
      prisma.photo.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  return Response.json({ success: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const photo = await prisma.photo.create({
    data: {
      invitationId: Number(id),
      url: body.url,
      caption: body.caption || null,
      order: body.order || 0,
    },
  });

  return Response.json(photo);
}
