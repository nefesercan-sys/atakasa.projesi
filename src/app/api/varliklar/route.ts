import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const dynamic = "force-dynamic";

// ─── GET ───────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    await connectMongoDB();

    const searchParams = new URL(req.url).searchParams;
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const kategori = searchParams.get("kategori") || searchParams.get("sektor");
    const sehir = searchParams.get("sehir");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const q = searchParams.get("q"); // arama

    let query: any = {};

    if (slug) {
      query.slug = slug;
    } else if (id) {
      query._id = id;
    } else {
      if (kategori) query.kategori = { $regex: new RegExp(kategori, "i") };
      if (sehir) query.sehir = { $regex: new RegExp(sehir, "i") };
      if (q) {
        query.$or = [
          { baslik: { $regex: new RegExp(q, "i") } },
          { aciklama: { $regex: new RegExp(q, "i") } },
        ];
      }
    }

    const ilanlar = await Varlik.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(slug || id ? 1 : limit)
      .lean();

    const borsaVarlıkları = ilanlar.map((ilan: any) => {
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }
      return {
        ...ilan,
        _id: ilan._id.toString(),
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(3)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });

    return NextResponse.json(borsaVarlıkları, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("GET Hatası:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// ─── PUT (Güncelleme) ───────────────────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID Eksik" }, { status: 400 });

    const mevcutVarlik = await Varlik.findById(data.id);
    if (!mevcutVarlik) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    // Fiyat değiştiyse eskiFiyat güncelle
    if (data.fiyat !== undefined && Number(data.fiyat) !== mevcutVarlik.fiyat) {
      mevcutVarlik.eskiFiyat = mevcutVarlik.fiyat;
      mevcutVarlik.fiyat = Number(data.fiyat);
    }

    // Güncellenebilir alanlar
    const alanlar = ["baslik", "aciklama", "kategori", "sehir", "resimler", "takasIstegi"];
    alanlar.forEach((alan) => {
      if (data[alan] !== undefined) mevcutVarlik[alan] = data[alan];
    });

    mevcutVarlik.updatedAt = new Date();
    await mevcutVarlik.save();

    return NextResponse.json({ message: "Güncellendi", slug: mevcutVarlik.slug }, { status: 200 });
  } catch (error) {
    console.error("PUT Hatası:", error);
    return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
  }
}

// ─── DELETE (Silme) ─────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    await connectMongoDB();
    const searchParams = new URL(req.url).searchParams;
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID Eksik" }, { status: 400 });

    const silinen = await Varlik.findByIdAndDelete(id);
    if (!silinen) return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });

    return NextResponse.json({ message: "İlan silindi" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Hatası:", error);
    return NextResponse.json({ error: "Silme hatası" }, { status: 500 });
  }
}
