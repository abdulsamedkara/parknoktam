import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  // Sahibin olduğu otoparkları çek
  const spots = await prisma.parkingSpot.findMany({
    where: { ownerId: user.id },
    include: {
      reservations: {
        select: {
          id: true,
          totalPrice: true,
          status: true,
          startDateTime: true,
          endDateTime: true,
          vehiclePlate: true,
          createdAt: true,
          surveys: {
            select: { id: true, filledBy: true }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  const activeSpotsCount = spots.filter(s => s.isActive).length;
  let totalRevenue = 0;
  let thisMonthRevenue = 0;
  let pendingIncoming = 0;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const recentReservations: any[] = [];

  spots.forEach(spot => {
    spot.reservations.forEach(res => {
      // Sedece tamamlanmış ödemelerden kazanç toplanır
      if (res.status === "COMPLETED" || res.status === "CONFIRMED") {
        totalRevenue += res.totalPrice;
        
        const resDate = new Date(res.createdAt);
        if (resDate.getMonth() === currentMonth && resDate.getFullYear() === currentYear) {
          thisMonthRevenue += res.totalPrice;
        }
      }

      // Gelecek / Bekleyen
      if ((res.status === "CONFIRMED" || res.status === "PENDING") && new Date(res.startDateTime) > now) {
        pendingIncoming += 1;
      }

      // Son 5 listesi için
      if (recentReservations.length < 5) {
        recentReservations.push({
          ...res,
          spotTitle: spot.title,
        });
      }
    });
  });

  // Sırala (bütün spotlardan alınan ortak liste)
  recentReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // ── Son 6 ay gelir grafiği ─────────────────────────────────────────────────
  const MONTHS_TR = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTHS_TR[d.getMonth()];
    let rev = 0;
    spots.forEach(spot => {
      spot.reservations.forEach(res => {
        if (res.status === "COMPLETED" || res.status === "CONFIRMED") {
          const rd = new Date(res.createdAt);
          if (rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()) {
            rev += res.totalPrice;
          }
        }
      });
    });
    monthlyRevenue.push({ month: label, revenue: Math.round(rev) });
  }

  // ── Anket özeti ───────────────────────────────────────────────────────────
  const allSurveys = await prisma.survey.findMany({
    where: {
      reservation: { spot: { ownerId: user.id } },
      filledBy: "tenant",
    },
    select: { overallRating: true, feltSafe: true, easyAccess: true },
  });
  const surveyStats = {
    totalReviews: allSurveys.length,
    avgRating: allSurveys.length
      ? Math.round((allSurveys.reduce((s, r) => s + (r.overallRating ?? 0), 0) / allSurveys.length) * 10) / 10
      : 0,
    safePercent: allSurveys.length
      ? Math.round((allSurveys.filter(r => r.feltSafe).length / allSurveys.length) * 100)
      : 0,
  };

  // ── Spot doluluk listesi ──────────────────────────────────────────────────
  const spotOccupancy = spots.map(s => ({
    id: s.id,
    title: s.title,
    occupancyRate: s.occupancyRate,
    isActive: s.isActive,
    totalCapacity: s.totalCapacity,
  }));
  // ─────────────────────────────────────────────────────────────────────────

  return NextResponse.json({
    metrics: {
      totalRevenue,
      thisMonthRevenue,
      activeSpotsCount,
      pendingIncoming,
    },
    recentReservations: recentReservations.slice(0, 5),
    monthlyRevenue,
    surveyStats,
    spotOccupancy,
  }, { status: 200 });
}
