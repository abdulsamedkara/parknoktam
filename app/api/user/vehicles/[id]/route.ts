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

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle || vehicle.userId !== user.id) {
      return NextResponse.json({ error: "Araç bulunamadı veya yetkiniz yok." }, { status: 403 });
    }

    await prisma.vehicle.delete({ where: { id } });

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

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle || vehicle.userId !== user.id) {
      return NextResponse.json({ error: "Araç bulunamadı veya yetkiniz yok." }, { status: 403 });
    }

    const body = await req.json();
    const { plate, model, isDefault, brand, color, type } = body;

    if (isDefault) {
      await prisma.vehicle.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        plate: plate ? plate.toUpperCase() : vehicle.plate,
        model: model !== undefined ? model : vehicle.model,
        brand: brand !== undefined ? brand : vehicle.brand,
        color: color !== undefined ? color : vehicle.color,
        type: type !== undefined ? type : vehicle.type,
        isDefault: isDefault !== undefined ? isDefault : vehicle.isDefault
      }
    });

    return NextResponse.json({ success: true, vehicle: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
