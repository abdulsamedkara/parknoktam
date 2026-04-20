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
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cards = await prisma.savedCard.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const { cardName, last4, expiry, isDefault } = await req.json();

    if (!cardName || !last4 || !expiry) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    if (isDefault) {
      await prisma.savedCard.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    const card = await prisma.savedCard.create({
      data: {
        userId: user.id,
        cardName,
        last4,
        expiry,
        isDefault: !!isDefault
      }
    });

    return NextResponse.json({ success: true, card }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
