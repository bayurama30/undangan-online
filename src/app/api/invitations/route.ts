import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { wishMessages: true } } },
  });

  return Response.json(invitations);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const invitation = await prisma.invitation.create({
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
      colorPrimary: body.colorPrimary || "#d4a574",
      colorSecondary: body.colorSecondary || "#f5e6d3",
      colorAccent: body.colorAccent || "#8b6914",
      bgMusicType: body.bgMusicType || "youtube",
      bgMusicUrl: body.bgMusicUrl,
      bgMusicAuto: body.bgMusicAuto !== false,
      themeStyle: body.themeStyle || "elegant",
      fontStyle: body.fontStyle || "modern",
      instagramUrl: body.instagramUrl,
      invitationType: body.invitationType || "pernikahan",
      coverPhoto: body.coverPhoto,
    },
  });

  return Response.json(invitation);
}
