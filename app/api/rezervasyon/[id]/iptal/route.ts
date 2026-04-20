import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.userId !== user.id) {
      return NextResponse.json({ error: "Rezervasyon bulunamadı veya yetkiniz yok." }, { status: 403 });
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json({ error: "Rezervasyon zaten iptal edilmiş." }, { status: 400 });
    }

    // Gerçek bir senaryoda saate bakarak iade oranı hesaplanır ve bakiyeye eklenir vs.
    // Şimdilik sadece statüyü güncelliyoruz.
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    return NextResponse.json({ success: true, reservation: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
