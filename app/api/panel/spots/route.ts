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

  // Sahibin olduğu otoparkları çek, bağlı rezervasyonları ciro için topla
  const spots = await prisma.parkingSpot.findMany({
    where: { ownerId: user.id },
    orderBy: { id: "desc" }, // En yeni eklenenler başta
    include: {
      reservations: {
        select: {
          totalPrice: true,
          status: true,
        }
      }
    }
  });

  const enrichedSpots = spots.map(spot => {
    let revenue = 0;
    let rscount = 0;
    spot.reservations.forEach(r => {
      if (r.status === "COMPLETED" || r.status === "CONFIRMED") {
        revenue += r.totalPrice;
        rscount++;
      }
    });

    return {
      id: spot.id,
      title: spot.title,
      address: spot.address,
      isActive: spot.isActive,
      pricePerHour: spot.pricePerHour,
      photos: spot.photos,
      stats: {
        revenue,
        reservationCount: rscount
      }
    };
  });

  return NextResponse.json(enrichedSpots, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      address,
      lat,
      lng,
      category,
      spotType,
      pricePerHour,
      hasCCTV,
      hasEVCharger,
      isHandicapped,
      totalCapacity,
      photos, // Formdan gelen base64 JSON string (opsiyonel)
    } = body;

    if (!title || !address || !lat || !lng || !pricePerHour) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi" }, { status: 400 });
    }

    // Eğer formdan fotoğraf geldiyse onu kullan, gelmemişse varsayılan görseli ata
    const defaultPhoto = JSON.stringify([
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800"
    ]);
    const photosData = photos && photos !== "[]" ? photos : defaultPhoto;

    const spot = await prisma.parkingSpot.create({
      data: {
        ownerId: user.id,
        title,
        description: description || "",
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        category: category || "bireysel",
        spotType: spotType || "acik",
        pricePerHour: parseFloat(pricePerHour),
        hasCCTV: !!hasCCTV,
        hasEVCharger: !!hasEVCharger,
        isHandicapped: !!isHandicapped,
        totalCapacity: parseInt(totalCapacity) || 1,
        photos: photosData,
        isActive: true,
      }
    });

    return NextResponse.json({ success: true, spot }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
