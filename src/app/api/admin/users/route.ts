import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

export const dynamic = "force-dynamic";

// 🔍 GET: Tüm Ajanları (Kullanıcıları) Getir
export async function GET() {
  try {
    await connectMongoDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }
}

// 🛡️ PUT: Ajanı Banla / Banını Kaldır
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const { email, durum, adminEmail } = await req.json();

    // 🚨 MASTER GÜVENLİK KONTROLÜ
    if (adminEmail !== "nefesercan@gmail.com") {
      return NextResponse.json({ error: "SİBER İHLAL: Erişim Reddedildi!" }, { status: 403 });
    }

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "Ajan bulunamadı." }, { status: 404 });

    // Kullanıcının sistem durumunu güncelle (banli veya aktif)
    user.durum = durum; 
    await user.save();

    return NextResponse.json({ message: "Siber kalkan başarıyla uygulandı." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
