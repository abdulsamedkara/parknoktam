import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const spot = await prisma.parkingSpot.findUnique({ where: { id } });
    if (!spot || spot.ownerId !== user.id) {
      return NextResponse.json({ error: "İlan bulunamadı veya yetkiniz yok." }, { status: 403 });
    }

    // Eğer ilan aktiftiyse ve pasife alınmak isteniyorsa, aktif rezervasyon kontrolü
    if (spot.isActive) {
      const upcomingReservations = await prisma.reservation.count({
        where: {
          spotId: id,
          status: { in: ["ACTIVE", "CONFIRMED"] },
          endDateTime: { gt: new Date() } // Henüz süresi bitmemiş
        }
      });

      if (upcomingReservations > 0) {
        return NextResponse.json(
          { error: `Pasife alınamaz! Bu alanın aktif veya onaylanmış ${upcomingReservations} rezervasyonu var.` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.parkingSpot.update({
      where: { id },
      data: { isActive: !spot.isActive }
    });

    return NextResponse.json({ success: true, isActive: updated.isActive }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
