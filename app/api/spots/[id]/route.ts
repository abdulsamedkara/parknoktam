import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const spot = await prisma.parkingSpot.findUnique({ where: { id } });
  if (!spot) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  return NextResponse.json(spot);
}
