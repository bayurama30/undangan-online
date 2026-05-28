import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

  const account = await prisma.bankAccount.create({
    data: {
      invitationId: Number(id),
      type: body.type || "bank",
      bankName: body.bankName || null,
      accountName: body.accountName || "",
      accountNumber: body.accountNumber || "",
      provider: body.provider || null,
    },
  });

  return Response.json(account);
}
