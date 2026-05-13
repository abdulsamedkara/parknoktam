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
    select: { name: true, email: true, creditBalance: true, eDevletVerified: true, credits: { orderBy: { createdAt: 'desc' } } }
  });

  return NextResponse.json(user);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, action } = await req.json(); // action: "deposit" | "withdraw"
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Geçersiz tutar" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (action === "withdraw" && user.creditBalance < amount) {
      return NextResponse.json({ error: "Yetersiz bakiye" }, { status: 400 });
    }

    const newBalance = action === "deposit" ? user.creditBalance + amount : user.creditBalance - amount;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { creditBalance: newBalance }
    });

    return NextResponse.json({ success: true, balance: updated.creditBalance }, { status: 200 });
  } catch(err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
