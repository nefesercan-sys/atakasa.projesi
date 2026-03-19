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

    const ilanlar = await Varlik.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      evrimIslendi: { $ne: true },
    }).limit(20).lean();

    const sonuclar = [];

    for (const ilan of ilanlar) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `
Sen bir piyasa analisti ve içerik uzmanısın.
Aşağıdaki takas/satış ilanı için SEO dostu, benzersiz ve bilgi dolu içerik üret.

İlan:
- Başlık: ${ilan.baslik}
- Kategori: ${ilan.kategori}
- Şehir: ${ilan.sehir}
- Fiyat: ${ilan.fiyat} TL
- Takas: ${ilan.takasIstegi ? "Evet" : "Hayır"}

JSON formatında üret (başka hiçbir şey yazma):
{
  "piyasaAnalizi": "Bu ürün kategorisinde piyasa durumu (150 kelime)",
  "takasDegeri": "Bu ürünün takas değeri ve nelerle takaslanabilir (80 kelime)",
  "fiyatTrendi": "Bu kategoride fiyat trendi (80 kelime)",
  "benzerUrunler": ["benzer ürün 1", "benzer ürün 2", "benzer ürün 3"],
  "seoMetin": "SEO dostu açıklama (120 kelime)",
  "longTailKeywords": ["kelime 1", "kelime 2", "kelime 3", "kelime 4", "kelime 5"],
  "yatirimPotansiyeli": "Yatırım ve değer artış potansiyeli (60 kelime)",
  "bolgeselAnaliz": "Bu şehirde bu kategorinin durumu (80 kelime)",
  "sikSorulanlar": [
    {"soru": "Soru 1", "cevap": "Cevap 1"},
    {"soru": "Soru 2", "cevap": "Cevap 2"}
  ]
}`,
          }],
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        const analiz = JSON.parse(text.replace(/```json|```/g, "").trim());

        await Varlik.findByIdAndUpdate(ilan._id, {
          $set: {
            aiAnaliz: analiz,
            evrimIslendi: true,
            evrimTarihi: new Date(),
            evrimVersiyon: 1,
          },
        });

        sonuclar.push({ id: ilan._id, durum: "başarılı" });
      } catch {
        sonuclar.push({ id: ilan._id, durum: "hata" });
      }
    }

    return NextResponse.json({ islenen: sonuclar.length, sonuclar });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
