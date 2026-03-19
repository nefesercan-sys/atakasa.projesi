import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    await connectMongoDB();

    // Tüm ilanları puanla
    const ilanlar = await Varlik.find({
      aiAnaliz: { $exists: true },
    }).lean();

    const guncellenenler = [];

    for (const ilan of ilanlar) {
      const goruntulenme = (ilan as any).goruntulenme || 0;
      const takasTeklifi = (ilan as any).takasTeklifiSayisi || 0;
      const evrimVersiyon = (ilan as any).evrimVersiyon || 1;
      const guncellik = Math.max(0, 30 - Math.floor(
        (Date.now() - new Date(ilan.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ));

      // Evrim puanı hesapla
      const evrimPuani = Math.round(
        goruntulenme * 0.3 +
        takasTeklifi * 40 +
        evrimVersiyon * 10 +
        guncellik * 2
      );

      await Varlik.findByIdAndUpdate(ilan._id, {
        $set: { evrimPuani },
      });

      guncellenenler.push({ id: ilan._id, puan: evrimPuani });
    }

    // En yüksek puanlıları bul
    const topIlanlar = guncellenenler
      .sort((a, b) => b.puan - a.puan)
      .slice(0, 10);

    return NextResponse.json({
      toplam: guncellenenler.length,
      topIlanlar,
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
