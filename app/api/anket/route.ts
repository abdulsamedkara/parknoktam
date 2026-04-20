import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const body = await req.json();
  const { 
    reservationId, overallRating, hadSunExposure, 
    hadDustIssue, hadMoistureIssue, easyAccess, feltSafe, comment 
  } = body;

  if (!reservationId) {
    return NextResponse.json({ error: "reservationId gerekli" }, { status: 400 });
  }

  // İlk olarak rezervasyonu kontrol edelim
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Rezervasyon bulunamadı" }, { status: 404 });
  }

  // Kullanıcı zaten bu rezervasyon için 'tenant' olarak anket doldurmuş mu?
  const existingSurvey = await prisma.survey.findFirst({
    where: {
      reservationId,
      filledBy: "tenant",
    }
  });

  if (existingSurvey) {
    return NextResponse.json({ error: "Bu rezervasyon için zaten anket doldurulmuş" }, { status: 400 });
  }

  // Transaction ile hem Survey oluştur, hem Kredi ekle, hem de user kredi bakiyesini artır
  const REWARD_AMOUNT = 20;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Survey kaydı ekle
    const survey = await tx.survey.create({
      data: {
        reservationId,
        filledBy: "tenant",
        userId: user.id,
        overallRating,
        hadSunExposure,
        hadDustIssue,
        hadMoistureIssue,
        easyAccess,
        feltSafe,
        comment,
        creditAwarded: true,
        creditAmount: REWARD_AMOUNT,
      }
    });

    // 2. Kredi geçimişine log at
    await tx.credit.create({
      data: {
        userId: user.id,
        amount: REWARD_AMOUNT,
        reason: "survey_reward",
        reservationId,
      }
    });

    // 3. Kullanıcı bakiyesini güncelle
    await tx.user.update({
      where: { id: user.id },
      data: { creditBalance: { increment: REWARD_AMOUNT } }
    });

    // 4. ParkingSpot kalite skorlarını tüm anketlerden yeniden hesapla
    const allSurveys = await tx.survey.findMany({
      where: { reservation: { spotId: reservation.spotId }, filledBy: "tenant" },
    });

    const count = allSurveys.length;
    if (count > 0) {
      const avg = (arr: (number | boolean | null | undefined)[]) => {
        const nums = arr.filter((x): x is number => typeof x === "number" && !isNaN(x));
        return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      };
      const boolAvg = (arr: (boolean | null | undefined)[]) => {
        const vals = arr.filter((x): x is boolean => typeof x === "boolean");
        return vals.length ? vals.filter(Boolean).length / vals.length : 0;
      };

      await tx.parkingSpot.update({
        where: { id: reservation.spotId },
        data: {
          rating:           avg(allSurveys.map(s => s.overallRating)),
          reviewCount:      count,
          sunExposureScore: boolAvg(allSurveys.map(s => s.hadSunExposure)),
          dustScore:        boolAvg(allSurveys.map(s => s.hadDustIssue)),
          moistureScore:    boolAvg(allSurveys.map(s => s.hadMoistureIssue)),
          accessEaseScore:  boolAvg(allSurveys.map(s => s.easyAccess)),
          occupancyRate:    0, // Ayrıca hesaplanabilir
        },
      });
    }

    return survey;
  });

  return NextResponse.json({ success: true, survey: result, rewardedCredit: REWARD_AMOUNT }, { status: 201 });
}
