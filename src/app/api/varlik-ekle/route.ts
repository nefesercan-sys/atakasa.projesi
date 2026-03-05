import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";
import User from "../../../models/User"; // 🛡️ Kullanıcıyı bulmak için eklendi
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "SİBER ENGEL: Önce giriş yapmalısın." }, { status: 401 });
    }

    const { baslik, fiyat, kategori, ulke, sehir, ilce, aciklama, resimler } = await req.json();
    
    await connectMongoDB();

    // 🛡️ KRİTİK DÜZELTME: Email ile kullanıcıyı bulup _id'sini alıyoruz
    const user = await User.findOne({ email: session.user?.email });
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
      resimler,
      satici: user._id // 🛡️ Email değil, gerçek DB ID'sini mühürlüyoruz
    });

    return NextResponse.json({ message: "Varlık mühürlendi.", id: yeniVarlik._id }, { status: 201 });
  } catch (error) {
    console.error("İlan ekleme hatası:", error);
    return NextResponse.json({ message: "Sistem Hatası: Varlık yüklenemedi." }, { status: 500 });
  }
}
