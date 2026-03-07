import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const dynamic = "force-dynamic"; // 📡 CANLI VERİ ZORUNLULUĞU

// 🔍 GET: GELİŞMİŞ BORSA VE FİLTRELEME MOTORU
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);

    // 📡 Filtre Parametrelerini Yakala
    const sektor = searchParams.get("sektor");
    const kategori = searchParams.get("kategori");
    const sirala = searchParams.get("sirala"); // ucuz, pahali, yeni, degisim

    // 🛡️ SORGULAMA RADARI
    let matchStage = { aktif: true };
    if (sektor) matchStage.kategori = sektor; // Senin sisteminde kategori sektör olarak kullanılıyor
    if (kategori) matchStage.kategori = kategori;

    // 📈 SIRALAMA ALGORİTMASI
    let sortStage = { createdAt: -1 };
    if (sirala === "ucuz") sortStage = { fiyat: 1 };
    if (sirala === "pahali") sortStage = { fiyat: -1 };
    if (sirala === "degisim") sortStage = { eskiFiyat: 1 }; // Fiyatı düşenleri başa çek

    // 🌪️ AGGREGATION (BİRLEŞTİRME) İŞLEMİ
    const ilanlar = await Varlik.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users", // Veritabanındaki kullanıcılar tablosu
          localField: "satici",
          foreignField: "_id",
          as: "satici_bilgisi",
        },
      },
      { $sort: sortStage },
    ]);

    // 🧬 BORSA VERİSİNE DÖNÜŞTÜRME (Yüzdesel Değişim Analizi)
    const borsaVeriliIlanlar = ilanlar.map((ilan) => {
      // 📈 Fiyat Değişim Yüzdesi Hesaplama
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat > 0 && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }

      return {
        ...ilan,
        _id: ilan._id.toString(),
        satici: ilan.satici_bilgisi?.[0]?.email || ilan.satici,
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(1)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });

    return NextResponse.json(borsaVeriliIlanlar, { status: 200 });

  } catch (error) {
    console.error("Varlıklar Borsa Hatası:", error);
    return NextResponse.json({ message: "Sinyal kesildi." }, { status: 500 });
  }
}

// 🛡️ PUT: FİYAT GÜNCELLEME VE ESKİ FİYAT MÜHÜRLEME
export async function PUT(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    const mevcutVarlik = await Varlik.findById(data.id);
    if (!mevcutVarlik) return NextResponse.json({ error: "Varlık bulunamadı" }, { status: 404 });

    // 💸 Fiyat Değişimi Tespit Edilirse Eski Fiyatı Arşive Al
    if (data.fiyat && Number(data.fiyat) !== mevcutVarlik.fiyat) {
      mevcutVarlik.eskiFiyat = mevcutVarlik.fiyat;
      mevcutVarlik.fiyat = Number(data.fiyat);
      mevcutVarlik.fiyatGuncellemeTarihi = Date.now();
    }

    // Diğer güncellemeleri yap
    Object.assign(mevcutVarlik, data);
    await mevcutVarlik.save();

    return NextResponse.json({ message: "Borsa verisi güncellendi" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
