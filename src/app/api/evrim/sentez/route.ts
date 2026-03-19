import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Anthropic from "@anthropic-ai/sdk";
import mongoose from "mongoose";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const dynamic = "force-dynamic";

const SentezSayfaSchema = new mongoose.Schema({
  sehir: String,
  kategori: String,
  sentez: Object,
  olusturmaTarihi: { type: Date, default: Date.now },
  guncellenmeTarihi: { type: Date, default: Date.now },
  goruntulenme: { type: Number, default: 0 },
  versiyon: { type: Number, default: 1 },
});

const SentezSayfa = mongoose.models.SentezSayfa ||
  mongoose.model("SentezSayfa", SentezSayfaSchema);

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    await connectMongoDB();

    const kombinasyonlar = await Varlik.aggregate([
      { $match: { aiAnaliz: { $exists: true } } },
      {
        $group: {
          _id: { kategori: "$kategori", sehir: "$sehir" },
          sayi: { $sum: 1 },
          ortalama: { $avg: "$fiyat" },
          takasOrani: { $avg: { $cond: ["$takasIstegi", 1, 0] } },
        },
      },
      { $sort: { sayi: -1 } },
      { $limit: 10 },
    ]);

    const sentezler = [];

    for (const kombo of kombinasyonlar) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `
A-TAKASA takas platformu için benzersiz içerik üret.

Veri:
- Şehir: ${kombo._id.sehir}
- Kategori: ${kombo._id.kategori}
- İlan Sayısı: ${kombo.sayi}
- Ortalama Fiyat: ${Math.round(kombo.ortalama)} TL
- Takas Oranı: %${Math.round(kombo.takasOrani * 100)}

Daha önce hiç yazılmamış, orijinal içerik üret.
JSON formatında (başka hiçbir şey yazma):
{
  "sayfaBasligi": "SEO optimized benzersiz başlık",
  "metaDescription": "160 karakterlik meta açıklama",
  "icerik": {
    "giris": "Giriş paragrafı (100 kelime)",
    "piyasaDurumu": "Piyasa durumu (120 kelime)",
    "fiyatRehberi": "Fiyat rehberi (100 kelime)",
    "takasRehberi": "Takas rehberi (100 kelime)",
    "ipuclari": ["ipucu 1", "ipucu 2", "ipucu 3", "ipucu 4", "ipucu 5"],
    "sikSorulanlar": [
      {"soru": "Soru 1", "cevap": "Cevap 1"},
      {"soru": "Soru 2", "cevap": "Cevap 2"},
      {"soru": "Soru 3", "cevap": "Cevap 3"}
    ],
    "sonuc": "Sonuç paragrafı (60 kelime)"
  },
  "longTailKeywords": ["kelime 1", "kelime 2", "kelime 3", "kelime 4", "kelime 5", "kelime 6"],
  "istatistikler": {
    "ilanSayisi": ${kombo.sayi},
    "ortalamaFiyat": ${Math.round(kombo.ortalama)},
    "takasOrani": ${Math.round(kombo.takasOrani * 100)}
  }
}`,
          }],
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        const sentez = JSON.parse(text.replace(/```json|```/g, "").trim());

        await SentezSayfa.findOneAndUpdate(
          { sehir: kombo._id.sehir, kategori: kombo._id.kategori },
          {
            $set: { sentez, guncellenmeTarihi: new Date() },
            $setOnInsert: { olusturmaTarihi: new Date(), goruntulenme: 0 },
            $inc: { versiyon: 1 },
          },
          { upsert: true }
        );

        sentezler.push({
          sehir: kombo._id.sehir,
          kategori: kombo._id.kategori,
          durum: "üretildi",
        });
      } catch {
        sentezler.push({
          sehir: kombo._id.sehir,
          kategori: kombo._id.kategori,
          durum: "hata",
        });
      }
    }

    return NextResponse.json({ islenen: sentezler.length, sentezler });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
