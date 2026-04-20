import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const extraHours: number = parseFloat(body.extraHours) || 1;

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { spot: true },
    });

    if (!reservation || reservation.userId !== user.id) {
      return NextResponse.json({ error: "Rezervasyon bulunamadı veya yetkiniz yok." }, { status: 403 });
    }

    if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED") {
      return NextResponse.json({ error: "Bu rezervasyon uzatılamaz." }, { status: 400 });
    }

    const newEnd = new Date(reservation.endDateTime.getTime() + extraHours * 60 * 60 * 1000);
    const extraPrice = Math.round(extraHours * reservation.spot.pricePerHour * 100) / 100;

    // Yeni aralık için kapasite kontrolü (uzatma da üst üste binebilir)
    const overlappingCount = await prisma.reservation.count({
      where: {
        spotId: reservation.spotId,
        id: { not: id }, // Kendisini sayma
        status: { notIn: ["CANCELLED"] },
        AND: [
          { startDateTime: { lt: newEnd } },
          { endDateTime:   { gt: reservation.endDateTime } },
        ],
      },
    });

    if (overlappingCount >= reservation.spot.totalCapacity) {
      return NextResponse.json(
        { error: "Seçilen uzatma saatleri için alan dolu, farklı bir süre deneyin." },
        { status: 409 }
      );
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        endDateTime: newEnd,
        totalPrice: { increment: extraPrice },
      },
    });

    return NextResponse.json({ success: true, newEndDateTime: newEnd, extraPrice, reservation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
