import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST /api/odeme — ödeme oluştur ve rezervasyonu CONFIRMED yap
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { rezervasyonId, cardLast4, method } = body;

  if (!rezervasyonId) {
    return NextResponse.json({ error: "rezervasyonId gerekli" }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: rezervasyonId },
    include: { user: true },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Rezervasyon bulunamadı" }, { status: 404 });
  }

  // Ödemeyi oluştur (simülasyon — her zaman SUCCESS)
  const payment = await prisma.payment.create({
    data: {
      reservationId: rezervasyonId,
      amount: reservation.totalPrice,
      method: method ?? "CARD_CREDIT",
      cardLast4: cardLast4 ?? "0000",
      status: "SUCCESS",
    },
  });

  // Rezervasyonu CONFIRMED yap
  await prisma.reservation.update({
    where: { id: rezervasyonId },
    data: { status: "CONFIRMED" },
  });

  return NextResponse.json({ success: true, payment }, { status: 201 });
}
