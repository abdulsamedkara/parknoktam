import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      creditBalance: true,
      eDevletVerified: true,
      vehicles: {
        orderBy: { createdAt: "desc" },
      },
      spots: {
        orderBy: { id: "desc" },
        select: {
          id: true,
          title: true,
          address: true,
          isActive: true,
          pricePerHour: true,
          photos: true,
          reservations: {
            select: { totalPrice: true, status: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const spots = user.spots.map((spot) => {
    let revenue = 0;
    let reservationCount = 0;
    spot.reservations.forEach((r) => {
      if (r.status === "COMPLETED" || r.status === "CONFIRMED") {
        revenue += r.totalPrice;
        reservationCount++;
      }
    });
    return {
      id: spot.id,
      title: spot.title,
      address: spot.address,
      isActive: spot.isActive,
      pricePerHour: spot.pricePerHour,
      photos: spot.photos,
      stats: { revenue, reservationCount },
    };
  });

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      creditBalance: user.creditBalance,
      eDevletVerified: user.eDevletVerified,
    },
    vehicles: user.vehicles,
    spots,
  });
}
