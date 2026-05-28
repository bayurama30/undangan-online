import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accountId: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId } = await params;
  const body = await request.json();

  const account = await prisma.bankAccount.update({
    where: { id: Number(accountId) },
    data: {
      type: body.type,
      bankName: body.bankName,
      accountName: body.accountName,
      accountNumber: body.accountNumber,
      provider: body.provider,
    },
  });

  return Response.json(account);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; accountId: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId } = await params;
  await prisma.bankAccount.delete({ where: { id: Number(accountId) } });

  return Response.json({ success: true });
}
