import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    await connectMongoDB();

    const zayifIlanlar = await Varlik.find({
      createdAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      goruntulenme: { $lt: 10 },
      evrimVersiyon: { $lt: 3 },
      aiAnaliz: { $exists: true },
    }).limit(10).lean();

    const sonuclar = [];

    for (const ilan of zayifIlanlar) {
      const mevcutVersiyon = (ilan as any).evrimVersiyon || 1;

      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `
Bu ilan düşük ilgi görüyor. Tamamen farklı bir açıdan yeniden analiz et.

İlan:
- Başlık: ${ilan.baslik}
- Kategori: ${ilan.kategori}
- Şehir: ${ilan.sehir}
- Fiyat: ${ilan.fiyat} TL
- Mevcut Versiyon: ${mevcutVersiyon}

Versiyon ${mevcutVersiyon + 1} için yeni JSON üret (başka hiçbir şey yazma):
{
  "piyasaAnalizi": "Yeni açıdan piyasa analizi",
  "takasDegeri": "Güncellenmiş takas değeri",
  "fiyatTrendi": "Güncel fiyat trend analizi",
  "benzerUrunler": ["yeni benzer 1", "yeni benzer 2", "yeni benzer 3"],
  "seoMetin": "Yeni SEO metni farklı anahtar kelimelerle",
  "longTailKeywords": ["yeni 1", "yeni 2", "yeni 3", "yeni 4", "yeni 5"],
  "yatirimPotansiyeli": "Yeni yatırım perspektifi",
  "bolgeselAnaliz": "Güncel bölgesel analiz",
  "mutasyonNedeni": "Bu varyasyonun öncekinden temel farkı",
  "sikSorulanlar": [
    {"soru": "Yeni soru 1", "cevap": "Yeni cevap 1"},
    {"soru": "Yeni soru 2", "cevap": "Yeni cevap 2"}
  ]
}`,
          }],
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        const yeniAnaliz = JSON.parse(text.replace(/```json|```/g, "").trim());

        await Varlik.findByIdAndUpdate(ilan._id, {
          $set: {
            aiAnaliz: yeniAnaliz,
            evrimVersiyon: mevcutVersiyon + 1,
            evrimTarihi: new Date(),
          },
          $push: {
            evrimGecmisi: {
              versiyon: mevcutVersiyon,
              tarih: new Date(),
              ozet: (ilan as any).aiAnaliz?.mutasyonNedeni || "İlk versiyon",
            },
          } as any,
        });

        sonuclar.push({ id: ilan._id, yeniVersiyon: mevcutVersiyon + 1, durum: "evrimlesti" });
      } catch {
        sonuclar.push({ id: ilan._id, durum: "hata" });
      }
    }

    return NextResponse.json({ islenen: sonuclar.length, sonuclar });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
