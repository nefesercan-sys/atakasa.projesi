import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";

// 🚀 VERCEL'İN EN SEVDİĞİ HIZ AYARI
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 🛡️ VERİTABANINA DİREKT BAĞLANTI
    await connectMongoDB();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const kategori = searchParams.get("kategori") || searchParams.get("sektor");
    const limitParam = parseInt(searchParams.get("limit") || "50");

    let query: any = {};
    if (id) {
      query._id = id;
    } else if (kategori) {
      query.kategori = kategori;
    }

    // ⚡ SİBER HIZLI ÇEKİM (Lean & Select)
    const ilanlar = await Varlik.find(query)
      .sort({ createdAt: -1 })
      .limit(id ? 1 : limitParam)
      .select("baslik fiyat eskiFiyat kategori sehir resimler images image aciklama takasIstegi satici createdAt")
      .lean();

    // 📊 BORSA HESAPLAMASI (En sade haliyle)
    const borsaVeriliIlanlar = ilanlar.map((ilan: any) => {
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat > 0 && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }
      return {
        ...ilan,
        _id: ilan._id.toString(),
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(1)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });

    return NextResponse.json(borsaVeriliIlanlar, { status: 200 });

  } catch (error) {
    console.error("API Sinyal Hatası:", error);
    // 📡 BOŞ LİSTE DÖN Kİ YÜKLEME EKRANI DONMASIN!
    return NextResponse.json([], { status: 200 });
  }
}

// 🛠️ GÜNCELLEME MOTORU (PUT)
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const data = await req.json();

    if (!data.id) return NextResponse.json({ error: "ID Eksik" }, { status: 400 });

    const mevcutVarlik = await Varlik.findById(data.id);
    if (!mevcutVarlik) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    if (data.fiyat && Number(data.fiyat) !== mevcutVarlik.fiyat) {
      mevcutVarlik.eskiFiyat = mevcutVarlik.fiyat;
      mevcutVarlik.fiyat = Number(data.fiyat);
    }

    const alanlar = ["baslik", "aciklama", "kategori", "sehir", "resimler"];
    alanlar.forEach((alan) => {
      if (data[alan] !== undefined) mevcutVarlik[alan] = data[alan];
    });

    await mevcutVarlik.save();
    return NextResponse.json({ message: "Güncellendi" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}
