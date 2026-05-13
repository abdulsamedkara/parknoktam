import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const surveys = await prisma.survey.findMany({
    where: {
      reservation: { spotId: id },
      filledBy: "tenant",
      comment: { not: null },
    },
    include: {
      reservation: {
        select: {
          user: { select: { name: true } },
          startDateTime: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const reviews = surveys.map(s => ({
    id: s.id,
    rating: s.overallRating ?? 0,
    comment: s.comment,
    feltSafe: s.feltSafe,
    easyAccess: s.easyAccess,
    createdAt: s.createdAt,
    // Gizlilik: "Ahmet Y." formatı
    userName: (() => {
      const parts = s.reservation.user.name.trim().split(" ");
      return parts[0] + (parts.length > 1 ? " " + parts[parts.length - 1][0] + "." : "");
    })(),
  }));

  return NextResponse.json(reviews);
}
