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
          vehiclePlate: true,
          createdAt: true,
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

  return NextResponse.json({
    metrics: {
      totalRevenue,
      thisMonthRevenue,
      activeSpotsCount,
      pendingIncoming,
    },
    recentReservations: recentReservations.slice(0, 5),
  }, { status: 200 });
}
