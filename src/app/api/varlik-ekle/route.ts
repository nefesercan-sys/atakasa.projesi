import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";
import User from "../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth options yolunu kontrol et

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ message: "SİBER ENGEL: Önce giriş yapmalısın." }, { status: 401 });
    }

    const { baslik, fiyat, kategori, ulke, sehir, ilce, aciklama, resimler } = await req.json();

    await connectMongoDB();

    // 🛡️ KRİTİK DÜZELTME: Kullanıcıyı bulup ID'sini alıyoruz
    const user = await User.findOne({ email: session.user?.email?.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: "Kullanıcı kaydı bulunamadı." }, { status: 404 });
    }

    const yeniVarlik = await Varlik.create({
      baslik,
      fiyat: Number(fiyat),
      kategori,
      ulke,
      sehir,
      ilce,
      aciklama,
      resimler, // Artık buraya Cloudinary'den gelen uzun video/resim linkleri düşecek
      satici: user._id 
    });

    return NextResponse.json({ message: "Varlık mühürlendi.", id: yeniVarlik._id }, { status: 201 });
  } catch (error: any) {
    console.error("İlan ekleme hatası:", error);
    return NextResponse.json({ message: "Sistem Hatası: Varlık yüklenemedi.", error: error.message }, { status: 500 });
  }
}
