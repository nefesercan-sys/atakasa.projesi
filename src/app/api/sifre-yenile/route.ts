import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { token, email, yeniSifre } = await req.json();

    if (!token || !email || !yeniSifre) {
      return NextResponse.json(
        { message: "Eksik bilgi gönderildi." },
        { status: 400 }
      );
    }

    if (yeniSifre.length < 6) {
      return NextResponse.json(
        { message: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();

    // Token doğrula
    const resetRecord = await db
      .collection("password_resets")
      .findOne({ email, token });

    if (!resetRecord) {
      return NextResponse.json(
        { message: "Geçersiz veya süresi dolmuş bağlantı." },
        { status: 400 }
      );
    }

    // Süre kontrolü
    if (new Date() > new Date(resetRecord.expires)) {
      await db.collection("password_resets").deleteOne({ token });
      return NextResponse.json(
        { message: "Bağlantının süresi dolmuş. Lütfen tekrar isteyin." },
        { status: 400 }
      );
    }

    // Şifreyi hashle ve güncelle
    const hashedPassword = await bcrypt.hash(yeniSifre, 12);
    await db.collection("users").updateOne(
      { email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    // Token'ı sil (tek kullanımlık)
    await db.collection("password_resets").deleteOne({ token });

    return NextResponse.json({
      message: "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Sifre yenileme hatasi:", error);
    return NextResponse.json(
      { message: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
