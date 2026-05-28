import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditForm } from "./edit-form";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { id: Number(id) },
    include: {
      photos: { orderBy: { order: "asc" } },
      bankAccounts: true,
    },
  });

  if (!invitation) notFound();

  return <EditForm invitation={invitation} />;
}
