import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// POST /api/rezervasyon — yeni rezervasyon oluştur
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { spotId, startDateTime, endDateTime, vehiclePlate, vehicleModel } = body;

  if (!spotId || !startDateTime || !endDateTime || !vehiclePlate || !vehicleModel) {
    return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const spot = await prisma.parkingSpot.findUnique({ where: { id: spotId } });
  if (!spot) return NextResponse.json({ error: "Park yeri bulunamadı" }, { status: 404 });
  if (!spot.isActive) return NextResponse.json({ error: "Bu park alanı şu an aktif değil." }, { status: 400 });

  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  // ── Kapasite Kontrolü ──────────────────────────────────────────────────────
  // Seçilen zaman aralığıyla çakışan, iptal edilmemiş rezervasyon sayısını bul
  const overlappingCount = await prisma.reservation.count({
    where: {
      spotId,
      status: { notIn: ["CANCELLED"] },
      // Yeni rezervasyonun [start, end) aralığı mevcut rezervasyonla kesişiyor mu?
      AND: [
        { startDateTime: { lt: end } },
        { endDateTime:   { gt: start } },
      ],
    },
  });

  if (overlappingCount >= spot.totalCapacity) {
    return NextResponse.json(
      { error: `Bu park alanı seçilen saatler için dolmuştur. (Kapasite: ${spot.totalCapacity})` },
      { status: 409 }
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  let totalPrice = Math.round(diffHours * spot.pricePerHour * 100) / 100;

  // Kredi Uygulama Mantığı
  let usedCredit = 0;
  if (user.creditBalance > 0) {
    if (user.creditBalance >= totalPrice) {
      usedCredit = totalPrice;
      totalPrice = 0;
    } else {
      usedCredit = user.creditBalance;
      totalPrice = totalPrice - usedCredit;
    }
  }

  const reservation = await prisma.$transaction(async (tx) => {
    const res = await tx.reservation.create({
      data: {
        spotId,
        userId: user.id,
        vehiclePlate: vehiclePlate.toUpperCase(),
        vehicleModel,
        startDateTime: start,
        endDateTime: end,
        totalPrice,
        status: "PENDING",
        qrCode: randomUUID(),
      },
    });

    // Eğer kredi kullanıldıysa bakiyeden düş ve log at
    if (usedCredit > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: { creditBalance: { decrement: usedCredit } }
      });

      await tx.credit.create({
        data: {
          userId: user.id,
          amount: -usedCredit,
          reason: "used_in_reservation",
          reservationId: res.id,
        }
      });
    }

    return res;
  });

  return NextResponse.json(reservation, { status: 201 });
}

// GET /api/rezervasyon — kullanıcının rezervasyonlarını listele
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json([], { status: 200 });

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    include: {
      spot: {
        select: {
          id: true,
          title: true,
          address: true,
          photos: true,
          pricePerHour: true,
        },
      },
      payment: true,
      surveys: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
