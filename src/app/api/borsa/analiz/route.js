import { NextResponse } from "next/server";
// 🛰️ Siber Pusula: Doğru klasör yolları ayarlandı
import { connectMongoDB } from "../../../../lib/mongodb";
import Varlik from "../../../../models/Varlik";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongoDB();

    const enCokDusenler = await Varlik.find({ 
      aktif: true, 
      eskiFiyat: { $gt: 0 },
      $expr: { $lt: ["$fiyat", "$eskiFiyat"] } 
    }).sort({ fiyat: 1 }).limit(10);

    const enCokArtanler = await Varlik.find({ 
      aktif: true, 
      eskiFiyat: { $gt: 0 },
      $expr: { $gt: ["$fiyat", "$eskiFiyat"] } 
    }).sort({ fiyat: -1 }).limit(10);

    const sektorAnalizi = await Varlik.aggregate([
      { $match: { aktif: true } },
      {
        $group: {
          _id: "$kategori",
          toplamVarlik: { $sum: 1 },
          ortalamaFiyat: { $avg: "$fiyat" },
          toplamHacim: { $sum: "$fiyat" }
        }
      },
      { $sort: { toplamHacim: -1 } }
    ]);

    return NextResponse.json({
      enCokDusenler: enCokDusenler.map(v => formatBorsaVerisi(v)),
      enCokArtanler: enCokArtanler.map(v => formatBorsaVerisi(v)),
      sektorEndeksleri: sektorAnalizi
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Analiz motoru durduruldu." }, { status: 500 });
  }
}

function formatBorsaVerisi(v) {
  let degisim = 0;
  if (v.eskiFiyat > 0) {
    degisim = ((v.fiyat - v.eskiFiyat) / v.eskiFiyat) * 100;
  }
  return {
    ...v._doc,
    _id: v._id.toString(),
    degisimYuzdesi: degisim.toFixed(1),
    durum: degisim < 0 ? "DÜŞÜŞ" : degisim > 0 ? "YÜKSELİŞ" : "STABİL"
  };
}
