import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const spots = await prisma.parkingSpot.findMany({
      where: { isActive: true },
      orderBy: { rating: "desc" },
      select: {
        id: true,
        title: true,
        address: true,
        lat: true,
        lng: true,
        pricePerHour: true,
        category: true,
        spotType: true,
        rating: true,
        reviewCount: true,
        hasCCTV: true,
        hasEVCharger: true,
        isHandicapped: true,
        photos: true,
        occupancyRate: true,
      },
    });

    return NextResponse.json(spots);
  } catch (error) {
    console.error("[SPOTS_GET]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
