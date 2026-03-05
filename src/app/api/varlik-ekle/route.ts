import { NextResponse } from "next/server";
// 3 Adım Geri: api -> app -> src -> lib
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    // 🛡️ Oturum kontrolü
    if (!session) {
      return NextResponse.json({ message: "SİBER ENGEL: Önce giriş yapmalısın." }, { status: 401 });
    }

    const { baslik, fiyat, kategori, ulke, sehir, ilce, aciklama, resimler } = await req.json();
    
    await connectMongoDB();

    const yeniVarlik = await Varlik.create({
      baslik,
      fiyat: Number(fiyat),
      kategori,
      ulke,
      sehir,
      ilce,
      aciklama,
      resimler,
      satici: session.user?.email 
    });

    return NextResponse.json({ message: "Varlık mühürlendi.", id: yeniVarlik._id }, { status: 201 });
  } catch (error) {
    console.error("İlan ekleme hatası:", error);
    return NextResponse.json({ message: "Sistem Hatası: Varlık yüklenemedi." }, { status: 500 });
  }
}
