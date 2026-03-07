import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const { email, eskiSifre, yeniSifre } = await req.json();

    if (!email || !eskiSifre || !yeniSifre) {
      return NextResponse.json({ error: "Eksik sinyal verisi!" }, { status: 400 });
    }

    // 1. Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Siber kimlik bulunamadı!" }, { status: 404 });
    }

    // 2. Eski şifrenin doğruluğunu (bcrypt ile) kontrol et
    const sifreDogruMu = await bcrypt.compare(eskiSifre, user.password);
    if (!sifreDogruMu) {
      return NextResponse.json({ error: "Eski şifreniz hatalı! Kalkanlar devrede." }, { status: 401 });
    }

    // 3. Yeni şifreyi kriptola ve kaydet
    const hashedPassword = await bcrypt.hash(yeniSifre, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "⚡ SİBER ŞİFRE BAŞARIYLA DEĞİŞTİRİLDİ!" }, { status: 200 });

  } catch (error) {
    console.error("Şifre Değişim Hatası:", error);
    return NextResponse.json({ error: "Sistem motoru yanıt vermiyor." }, { status: 500 });
  }
}
