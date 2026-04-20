import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    await prisma.parkingSpot.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const data = await req.json();
    
    const updated = await prisma.parkingSpot.update({
      where: { id },
      data: {
        title:        data.title        !== undefined ? data.title                 : spot.title,
        pricePerHour: data.price        !== undefined ? parseFloat(data.price)    : spot.pricePerHour,
        spotType:     data.type         !== undefined ? data.type                 : spot.spotType,
        description:  data.description  !== undefined ? data.description          : spot.description,
        hasCCTV:      data.hasCCTV      !== undefined ? !!data.hasCCTV            : spot.hasCCTV,
        hasEVCharger: data.hasEVCharger !== undefined ? !!data.hasEVCharger       : spot.hasEVCharger,
        isHandicapped:data.isHandicapped!== undefined ? !!data.isHandicapped      : spot.isHandicapped,
      }
    });

    return NextResponse.json({ success: true, spot: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
