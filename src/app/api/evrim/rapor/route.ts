import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Anthropic from "@anthropic-ai/sdk";
import mongoose from "mongoose";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const dynamic = "force-dynamic";

const RaporSchema = new mongoose.Schema({
  tarih: Date,
  tip: String,
  veriler: Object,
  rapor: Object,
});
const Rapor = mongoose.models.Rapor || mongoose.model("Rapor", RaporSchema);

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    await connectMongoDB();

    const gecenHafta = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [toplamIlan, yeniIlanlar, kategoriStats, sehirStats, takasStats, fiyatStats] =
      await Promise.all([
        Varlik.countDocuments(),
        Varlik.countDocuments({ createdAt: { $gte: gecenHafta } }),
        Varlik.aggregate([
          { $group: { _id: "$kategori", sayi: { $sum: 1 }, ortalama: { $avg: "$fiyat" } } },
          { $sort: { sayi: -1 } },
          { $limit: 8 },
        ]),
        Varlik.aggregate([
          { $group: { _id: "$sehir", sayi: { $sum: 1 } } },
          { $sort: { sayi: -1 } },
          { $limit: 8 },
        ]),
        Varlik.countDocuments({ takasIstegi: true }),
        Varlik.aggregate([
          {
            $group: {
              _id: "$kategori",
              ortalamaFiyat: { $avg: "$fiyat" },
              maxFiyat: { $max: "$fiyat" },
              minFiyat: { $min: "$fiyat" },
            },
          },
          { $sort: { ortalamaFiyat: -1 } },
          { $limit: 5 },
        ]),
      ]);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `
Sen Türkiye'nin önde gelen piyasa analisti ve ekonomi yorumcususun.
A-TAKASA takas platformunun haftalık verilerini analiz et.

Platform Verileri:
- Toplam İlan: ${toplamIlan}
- Bu Hafta Yeni: ${yeniIlanlar}
- Takaslık İlan: ${takasStats}
- En Popüler Kategoriler: ${JSON.stringify(kategoriStats)}
- En Aktif Şehirler: ${JSON.stringify(sehirStats)}
- Fiyat İstatistikleri: ${JSON.stringify(fiyatStats)}

JSON formatında rapor üret (başka hiçbir şey yazma):
{
  "baslik": "Çarpıcı rapor başlığı",
  "ozet": "3 cümlelik özet",
  "anaHaber": "Bu haftanın en önemli trendi (100 kelime)",
  "kategoriAnalizi": "Kategori bazlı analiz (100 kelime)",
  "sehirAnalizi": "Şehir bazlı analiz (100 kelime)",
  "takasTrendi": "Takas ekonomisinin durumu (80 kelime)",
  "fiyatAnalizi": "Fiyat hareketleri (80 kelime)",
  "gelecekTahmin": "Önümüzdeki haftaya tahmin (80 kelime)",
  "yatirimciNotu": "Yatırımcılar için not (60 kelime)",
  "tweetMetni": "Twitter için 280 karakterlik metin",
  "haberMetni": "Basın bülteni (200 kelime)"
}`,
      }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const rapor = JSON.parse(text.replace(/```json|```/g, "").trim());

    await Rapor.create({
      tarih: new Date(),
      tip: "haftalik",
      veriler: { toplamIlan, yeniIlanlar, kategoriStats, sehirStats, takasStats },
      rapor,
    });

    return NextResponse.json({ basarili: true, rapor });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
