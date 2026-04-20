import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

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
      return NextResponse.json({ error: "Bu rezervasyon zaten tamamlanmış veya iptal edilmiş." }, { status: 400 });
    }

    const now = new Date();
    if (now <= new Date(reservation.startDateTime)) {
      return NextResponse.json({ error: "Rezervasyon henüz başlamadı. Erken çıkış yapamazsınız." }, { status: 400 });
    }

    // Fiili kullanım süresi üzerinden yeni fiyat hesapla
    const actualMs = now.getTime() - new Date(reservation.startDateTime).getTime();
    const actualHours = actualMs / (1000 * 60 * 60);
    const newPrice = Math.round(actualHours * reservation.spot.pricePerHour * 100) / 100;

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        endDateTime: now,
        totalPrice: newPrice,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({ success: true, newEndDateTime: now, newPrice, reservation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
