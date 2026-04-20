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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles, { status: 200 });
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
    const { plate, model, isDefault, brand, color, type } = body;

    if (!plate || !model) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi" }, { status: 400 });
    }

    // Eğer isDefault true geldiyse, diğer araçların isDefault değerini false yapabiliriz
    // Ama MVP için çok kritik değilse, direkt the user wants we can set it.
    if (isDefault) {
      await prisma.vehicle.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    // Eğer kullanıcının hiç aracı yoksa ilk araç otomatik varsayılan olabilir
    const existingCount = await prisma.vehicle.count({ where: { userId: user.id } });
    const shouldBeDefault = isDefault || existingCount === 0;

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: user.id,
        plate: plate.toUpperCase(),
        model,
        brand,
        color,
        type,
        isDefault: shouldBeDefault,
      }
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
