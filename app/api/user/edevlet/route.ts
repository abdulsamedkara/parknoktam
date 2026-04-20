import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { eDevletVerified: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("E-Devlet verification error:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
