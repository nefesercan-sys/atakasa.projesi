import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const dynamic = "force-dynamic"; // 📡 CANLI ANALİZ ZORUNLULUĞU

export async function GET() {
  try {
    await connectMongoDB();

    // 📉 1. EN ÇOK FİYATI DÜŞENLER (Borsa Fırsatları)
    // Fiyatı eski fiyatından düşük olanları, düşüş miktarına göre sıralar
    const enCokDusenler = await Varlik.find({ 
      aktif: true, 
      eskiFiyat: { $gt: 0 },
      $expr: { $lt: ["$fiyat", "$eskiFiyat"] } 
    })
    .sort({ fiyat: 1 }) 
    .limit(10);

    // 📈 2. EN ÇOK FİYATI ARTANLAR (Değer Kazananlar)
    const enCokArtanler = await Varlik.find({ 
      aktif: true, 
      eskiFiyat: { $gt: 0 },
      $expr: { $gt: ["$fiyat", "$eskiFiyat"] } 
    })
    .sort({ fiyat: -1 })
    .limit(10);

    // 🔄 3. EN ÇOK TAKAS EDİLENLER (Piyasa Hareketliliği)
    const enCokTakasEdilenler = await Varlik.find({ aktif: true })
      .sort({ takasTeklifiSayisi: -1 })
      .limit(10);

    // ✨ 4. EN YENİ İLANLAR (Taze Kan)
    const enYeniIlanlar = await Varlik.find({ aktif: true })
      .sort({ createdAt: -1 })
      .limit(10);

    // 🏢 5. SEKTÖR ANALİZİ (Sektörel Hacim ve Ortalama Fiyat Değişimi)
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

    // 🧬 BORSA VERİ PAKETLEME
    const borsaRaporu = {
      enCokDusenler: enCokDusenler.map(v => formatBorsaVerisi(v)),
      enCokArtanler: enCokArtanler.map(v => formatBorsaVerisi(v)),
      enCokTakasEdilenler: enCokTakasEdilenler.map(v => formatBorsaVerisi(v)),
      enYeniIlanlar: enYeniIlanlar.map(v => formatBorsaVerisi(v)),
      sektorEndeksleri: sektorAnalizi
    };

    return NextResponse.json(borsaRaporu, { status: 200 });

  } catch (error) {
    console.error("Borsa Analiz Hatası:", error);
    return NextResponse.json({ message: "Analiz motoru durduruldu." }, { status: 500 });
  }
}

// 🧬 Yardımcı Fonksiyon: Veriyi Borsa Formatına Sokar
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
