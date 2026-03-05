export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Favori from "../../../models/Favori";
import Varlik from "../../../models/Varlik"; // İlişki için gerekli
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });

    await connectMongoDB();
    // 🛡️ Kullanıcının favorilerini bul ve Varlık detaylarıyla (resim, fiyat vb.) birleştir (populate)
    const favoriler = await Favori.find({ kullaniciEmail: session.user?.email }).populate('ilanId');
    
    return NextResponse.json(favoriler, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Favoriler çekilemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });

    const { ilanId } = await req.json();
    await connectMongoDB();

    // Varlık zaten favorilerde var mı?
    const mevcut = await Favori.findOne({ kullaniciEmail: session.user?.email, ilanId });
    
    if (mevcut) {
      // Varsa favorilerden çıkar (Toggle mantığı)
      await Favori.findByIdAndDelete(mevcut._id);
      return NextResponse.json({ message: "Sinyal kesildi", durum: false }, { status: 200 });
    }

    // Yoksa favorilere ekle
    await Favori.create({ kullaniciEmail: session.user?.email, ilanId });
    return NextResponse.json({ message: "Sinyal mühürlendi", durum: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "İşlem başarısız" }, { status: 500 });
  }
}
