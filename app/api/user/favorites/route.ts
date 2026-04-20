import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET — Kullanıcının favorilerini getir
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json([], { status: 200 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      spot: {
        select: {
          id: true, title: true, address: true, pricePerHour: true,
          photos: true, isActive: true, rating: true, reviewCount: true,
          hasCCTV: true, hasEVCharger: true, spotType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

// POST — Favori ekle / çıkar (toggle)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const { spotId } = await req.json();
  if (!spotId) return NextResponse.json({ error: "spotId gerekli" }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_spotId: { userId: user.id, spotId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, spotId } });
    return NextResponse.json({ favorited: true });
  }
}
