import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  try {
    // 🛡️ GÜVENLİK: Sadece giriş yapmış kullanıcılar ilan verebilir
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "SİBER HATA: Önce giriş yapmalısın." }, { status: 401 });
    }

    const { baslik, fiyat, kategori, ulke, sehir, ilce, aciklama, takasIstegi, resimler } = await req.json();
    
    await connectMongoDB();

    // Veritabanına yeni varlığı mühürle
    const yeniVarlik = await Varlik.create({
      baslik,
      fiyat: Number(fiyat),
      kategori,
      ulke,
      sehir,
      ilce,
      aciklama,
      takasIstegi,
      resimler,
      satici: session.user?.email // İlanı verenin e-postasıyla bağla
    });

    return NextResponse.json({ message: "Varlık başarıyla piyasaya sürüldü.", id: yeniVarlik._id }, { status: 201 });
  } catch (error) {
    console.error("İlan ekleme hatası:", error);
    return NextResponse.json({ message: "Sistem Hatası: Varlık yüklenemedi." }, { status: 500 });
  }
}
