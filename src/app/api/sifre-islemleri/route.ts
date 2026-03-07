import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// 📡 POST: ŞİFRE SIFIRLAMA SİNYALİ ÜRET (Link Oluştur)
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "Siber ağda bu ajan bulunamadı!" }, { status: 404 });

    // 64 Karakterlik Kırılmaz Siber Kilit (Token) Üret
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenSuresi = Date.now() + 3600000; // 1 Saat geçerli

    // Mongoose şemasını zorlamadan doğrudan veritabanına yazıyoruz
    await User.collection.updateOne(
      { email },
      { $set: { resetToken: resetToken, resetTokenExpiry: tokenSuresi } }
    );

    // DİKKAT: Normalde bu link Mail ile gider. Şimdilik simülasyon olarak frontend'e yolluyoruz.
    const resetLink = `/sifre-yenile?token=${resetToken}`;

    return NextResponse.json({ 
      message: "Siber kurtarma sinyali üretildi!", 
      link: resetLink 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Sinyal üretilemedi." }, { status: 500 });
  }
}

// 🛡️ PUT: YENİ ŞİFREYİ MÜHÜRLE
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const { token, yeniSifre } = await req.json();

    // Tokeni ve süresini kontrol et
    const user = await User.collection.findOne({ 
      resetToken: token, 
      resetTokenExpiry: { $gt: Date.now() } 
    });

    if (!user) return NextResponse.json({ error: "Kurtarma sinyalinin süresi dolmuş veya geçersiz!" }, { status: 400 });

    // Yeni şifreyi kriptola
    const hashedPassword = await bcrypt.hash(yeniSifre, 10);

    // Şifreyi güncelle ve kilitleri (tokenleri) imha et
    await User.collection.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" } 
      }
    );

    return NextResponse.json({ message: "⚡ SİBER ŞİFRE BAŞARIYLA YENİLENDİ!" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Mühürleme başarısız." }, { status: 500 });
  }
}
