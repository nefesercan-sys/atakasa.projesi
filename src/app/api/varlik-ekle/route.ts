import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";
import User from "../../../models/User";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  try {
    // 🛡️ KRİTİK DEĞİŞİKLİK: authOptions bağımlılığını kaldırdık, 
    // getServerSession() parametresiz de session'ı yakalayabilir.
    const session = await getServerSession(); 
    
    if (!session) {
      return NextResponse.json({ message: "SİBER ENGEL: Önce giriş yapmalısın." }, { status: 401 });
    }

    const { baslik, fiyat, kategori, ulke, sehir, ilce, aciklama, resimler } = await req.json();

    await connectMongoDB();

    // Kullanıcıyı email üzerinden MongoDB'deki gerçek ID'si ile buluyoruz
    const user = await User.findOne({ email: session.user?.email?.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ message: "Kullanıcı kaydı bulunamadı." }, { status: 404 });
    }

    // Artık resimler dizisinde Cloudinary'den gelen uzun video/resim linkleri var
    const yeniVarlik = await Varlik.create({
      baslik,
      fiyat: Number(fiyat),
      kategori,
      ulke: ulke || "Türkiye",
      sehir,
      ilce,
      aciklama,
      resimler, 
      satici: user._id // Mail adresi değil, veritabanı ID'sini mühürlüyoruz
    });

    return NextResponse.json({ message: "Varlık mühürlendi.", id: yeniVarlik._id }, { status: 201 });
  } catch (error: any) {
    console.error("İlan ekleme hatası:", error);
    return NextResponse.json({ 
      message: "Sistem Hatası: Varlık yüklenemedi.", 
      error: error.message 
    }, { status: 500 });
  }
}
