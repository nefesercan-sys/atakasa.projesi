export const dynamic = 'force-dynamic'; // 🚀 BUZUL KIRICI

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";

export async function GET() {
  try {
    await connectMongoDB();
    
    // 🚀 SİBER BİRLEŞTİRME (AGGREGATION) MOTORU
    // varliks tablosundaki satici (ObjectId) ile users tablosundaki _id'yi anında eşleştirir.
    const ilanlar = await Varlik.aggregate([
      {
        $lookup: {
          from: "users", // Veritabanındaki kullanıcılar tablosu
          localField: "satici",
          foreignField: "_id",
          as: "satici_bilgisi"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Front-end'in okuyabilmesi için veriyi deşifre ediyoruz
    const formatliIlanlar = ilanlar.map(ilan => {
       // Kullanıcı bulunduysa gerçek e-postasını al
       const gercekEmail = ilan.satici_bilgisi && ilan.satici_bilgisi.length > 0 
                           ? ilan.satici_bilgisi[0].email 
                           : ilan.satici;
                           
       return {
         ...ilan,
         satici: gercekEmail, // 🛡️ Artık ObjectId değil, gerçek email dönecek!
         _id: ilan._id.toString() // ID'yi yazıya çevir ki Next.js hata vermesin
       };
    });

    return NextResponse.json(formatliIlanlar, { status: 200 });
  } catch (error) {
    console.error("Varlıklar Ağ Hatası:", error);
    return NextResponse.json({ message: "Sinyal kesildi." }, { status: 500 });
  }
}
