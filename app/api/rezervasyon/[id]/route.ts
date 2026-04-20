import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/rezervasyon/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      spot: true,
      payment: true,
      surveys: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Rezervasyon bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(reservation);
}
