import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvitationPage } from "./invitation-page";

export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { order: "asc" } },
      bankAccounts: true,
      wishMessages: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!invitation) notFound();

  return <InvitationPage invitation={JSON.parse(JSON.stringify(invitation))} />;
}
