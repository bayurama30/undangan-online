import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { id: Number(id) },
    include: {
      photos: { orderBy: { order: "asc" } },
      bankAccounts: true,
    },
  });

  if (!invitation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(invitation);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const invitation = await prisma.invitation.update({
    where: { id: Number(id) },
    data: {
      slug: body.slug,
      title: body.title,
      groomName: body.groomName,
      groomFullName: body.groomFullName,
      groomParent: body.groomParent,
      groomChild: body.groomChild,
      groomPhoto: body.groomPhoto,
      brideName: body.brideName,
      brideFullName: body.brideFullName,
      brideParent: body.brideParent,
      brideChild: body.brideChild,
      bridePhoto: body.bridePhoto,
      eventDate: body.eventDate,
      eventTime: body.eventTime,
      eventTitle: body.eventTitle,
      address: body.address,
      mapsUrl: body.mapsUrl,
      mapsEmbedUrl: body.mapsEmbedUrl,
      story: body.story,
      quoteText: body.quoteText,
      quoteAuthor: body.quoteAuthor,
      colorPrimary: body.colorPrimary,
      colorSecondary: body.colorSecondary,
      colorAccent: body.colorAccent,
      bgMusicType: body.bgMusicType,
      bgMusicFile: body.bgMusicFile,
      bgMusicUrl: body.bgMusicUrl,
      bgMusicAuto: body.bgMusicAuto,
      themeStyle: body.themeStyle,
      fontStyle: body.fontStyle,
      instagramUrl: body.instagramUrl,
      invitationType: body.invitationType,
      coverPhoto: body.coverPhoto,
      dressCode1: body.dressCode1 || null,
      dressCode2: body.dressCode2 || null,
      dressCode3: body.dressCode3 || null,
    },
  });

  return Response.json(invitation);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.invitation.delete({ where: { id: Number(id) } });

  return Response.json({ success: true });
}
