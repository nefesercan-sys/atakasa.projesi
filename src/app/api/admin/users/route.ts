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

// 🔥 DELETE: Ajanı Veritabanından ve Listeden Tamamen Sil
export async function DELETE(req: Request) {
  try {
    await connectMongoDB();
    
    // URL'den email ve adminEmail bilgilerini alıyoruz
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const adminEmail = searchParams.get("adminEmail");

    // 🚨 MASTER GÜVENLİK KONTROLÜ
    if (adminEmail !== "nefesercan@gmail.com") {
      return NextResponse.json({ error: "SİBER İHLAL: Erişim Reddedildi!" }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: "Silinecek ajan belirtilmedi." }, { status: 400 });
    }

    // Kullanıcıyı bul ve tamamen yok et
    const silinenKullanici = await User.findOneAndDelete({ email });
    
    if (!silinenKullanici) {
      return NextResponse.json({ error: "Ajan zaten silinmiş veya bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ message: "Ajan siber ağdan tamamen silindi." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "İmha işlemi başarısız." }, { status: 500 });
  }
}
