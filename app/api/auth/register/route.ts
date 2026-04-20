import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, tcKimlik, birthDate, gender } = await req.json();

    if (!name || !email || !password || !tcKimlik) {
      return NextResponse.json({ error: "Lütfen gerekli alanları doldurun." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanımda." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        tcKimlik,
        birthDate: new Date(birthDate),
        gender,
      },
    });

    return NextResponse.json(
      { message: "Kayıt başarılı", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ error: "Kayıt işlemi sırasında bir hata oluştu." }, { status: 500 });
  }
}
